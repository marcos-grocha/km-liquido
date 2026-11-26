import type { Parametros } from './parametros'

// Regras especificadas em docs/regras-de-calculo.md.

export const PERIODOS = ['hora', 'dia', 'semana', 'mes', 'ano'] as const
export type Periodo = (typeof PERIODOS)[number]

const MESES_POR_ANO = 12
const SEMANAS_POR_ANO = 52

export interface ResultadoPeriodo {
  horas: number
  km: number
  faturamentoBruto: number
  combustivel: number
  /** Faturamento bruto menos combustível. */
  faturamentoLiquido: number
  manutencao: number
  seguro: number
  ipva: number
  /** Manutenção + seguro + IPVA (o "TOTAL" da planilha). */
  totalCustos: number
  /** Faturamento líquido menos o total de custos (o "Conservador" da planilha). */
  faturamentoResponsavel: number
  /** Parcela do financiamento ou aluguel, conforme o pagamento do carro. */
  financiamentoOuAluguel: number
  /** Faturamento responsável menos financiamento ou aluguel: o que sobra no bolso. */
  lucro: number
}

export interface Projecao {
  custoCombustivelPorKm: number
  /**
   * Combustível + manutenção por km, mostrado em Meu carro. Só para exibição: os
   * períodos calculam o combustível e a manutenção separados.
   */
  custoPorKm: number
  faturamentoPorHora: number
  periodos: Record<Periodo, ResultadoPeriodo>
  /** Lucro de cada km rodado. */
  kmLiquido: number
}

export function custoCombustivelPorKm(p: Parametros): number {
  return p.precoCombustivel / p.consumoKmPorLitro
}

/** Faturamento bruto por hora trabalhada: km por hora × valor por km. */
export function faturamentoPorHora(p: Parametros): number {
  return p.kmPorHora * p.valorPorKm
}

/** Financiamento ou aluguel por mês; o aluguel semanal vale 52 semanas ÷ 12 meses. */
function pagamentoMensalDoCarro(p: Parametros): number {
  return p.pagamentoDoCarro === 'aluguel'
    ? (p.aluguelSemanal * SEMANAS_POR_ANO) / MESES_POR_ANO
    : p.financiamentoMensal
}

/** Horas trabalhadas por mês: as horas por semana × 52 semanas ÷ 12 meses. */
export function horasPorMes(p: Parametros): number {
  return (p.horasPorSemana * SEMANAS_POR_ANO) / MESES_POR_ANO
}

/**
 * Dias trabalhados por mês, no mesmo calendário, arredondados para baixo: só conta
 * o dia completo (5 dias por semana dão 21,67, que fica 21). Só para exibição.
 */
export function diasPorMes(p: Parametros): number {
  return Math.floor((p.diasPorSemana * SEMANAS_POR_ANO) / MESES_POR_ANO)
}

function horasPorPeriodo(p: Parametros): Record<Periodo, number> {
  const semana = p.horasPorSemana
  return {
    hora: 1,
    dia: semana / p.diasPorSemana,
    semana,
    mes: horasPorMes(p),
    ano: semana * SEMANAS_POR_ANO,
  }
}

function calcularPeriodo(
  p: Parametros,
  combustivelPorKm: number,
  horas: number,
): ResultadoPeriodo {
  // Os custos mensais são rateados pelas horas trabalhadas no período.
  const fracaoDoMes = horas / horasPorMes(p)
  const km = p.kmPorHora * horas
  const faturamentoBruto = km * p.valorPorKm
  const combustivel = km * combustivelPorKm
  const faturamentoLiquido = faturamentoBruto - combustivel
  const manutencao = km * p.manutencaoPorKm
  const seguro = (p.seguroAnual / MESES_POR_ANO) * fracaoDoMes
  const ipva = (p.ipvaAnual / MESES_POR_ANO) * fracaoDoMes
  const totalCustos = manutencao + seguro + ipva
  const faturamentoResponsavel = faturamentoLiquido - totalCustos
  const financiamentoOuAluguel = pagamentoMensalDoCarro(p) * fracaoDoMes
  return {
    horas,
    km,
    faturamentoBruto,
    combustivel,
    faturamentoLiquido,
    manutencao,
    seguro,
    ipva,
    totalCustos,
    faturamentoResponsavel,
    financiamentoOuAluguel,
    lucro: faturamentoResponsavel - financiamentoOuAluguel,
  }
}

export function calcularProjecao(p: Parametros): Projecao {
  const combustivelPorKm = custoCombustivelPorKm(p)
  const horas = horasPorPeriodo(p)
  const periodo = (h: number) => calcularPeriodo(p, combustivelPorKm, h)
  const periodos: Record<Periodo, ResultadoPeriodo> = {
    hora: periodo(horas.hora),
    dia: periodo(horas.dia),
    semana: periodo(horas.semana),
    mes: periodo(horas.mes),
    ano: periodo(horas.ano),
  }
  return {
    custoCombustivelPorKm: combustivelPorKm,
    custoPorKm: combustivelPorKm + p.manutencaoPorKm,
    faturamentoPorHora: faturamentoPorHora(p),
    periodos,
    kmLiquido: periodos.mes.lucro / periodos.mes.km,
  }
}

export interface EntradaAvulsa {
  faturamentoBruto: number
  /** Km realmente rodados; sem ele, a distância é estimada pelo valor por km. */
  km?: number
  /** Horas realmente trabalhadas; sem elas, são estimadas pelo faturamento por hora. */
  horas?: number
}

export interface ResultadoAvulsa {
  km: number
  kmEstimado: boolean
  horas: number
  horasEstimadas: boolean
  faturamentoBruto: number
  /** Bruto ÷ km: quanto o motorista fez por km rodado. */
  faturamentoPorKm: number
  /** Bruto ÷ horas: quanto o motorista fez por hora trabalhada. */
  faturamentoPorHora: number
  combustivel: number
  faturamentoLiquido: number
  manutencao: number
  /** O que sobra depois de separar combustível e manutenção. */
  faturamentoResponsavel: number
}

/** Divisão que dá zero quando não há o que dividir (bruto zero estima zero km). */
function porUnidade(valor: number, quantidade: number): number {
  return quantidade > 0 ? valor / quantidade : 0
}

/** "Fiz R$ X hoje, quanto sobrou?" — seguro, IPVA, financiamento e aluguel não entram. */
export function calcularAvulsa(
  p: Parametros,
  entrada: EntradaAvulsa,
): ResultadoAvulsa {
  const { faturamentoBruto } = entrada
  const kmEstimado = entrada.km === undefined
  const km = entrada.km ?? faturamentoBruto / p.valorPorKm
  const horasEstimadas = entrada.horas === undefined
  const horas = entrada.horas ?? faturamentoBruto / faturamentoPorHora(p)
  const combustivel = km * custoCombustivelPorKm(p)
  const faturamentoLiquido = faturamentoBruto - combustivel
  const manutencao = km * p.manutencaoPorKm
  return {
    km,
    kmEstimado,
    horas,
    horasEstimadas,
    faturamentoBruto,
    faturamentoPorKm: porUnidade(faturamentoBruto, km),
    faturamentoPorHora: porUnidade(faturamentoBruto, horas),
    combustivel,
    faturamentoLiquido,
    manutencao,
    faturamentoResponsavel: faturamentoLiquido - manutencao,
  }
}
