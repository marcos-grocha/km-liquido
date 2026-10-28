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
  financiamento: number
  /** Faturamento responsável menos financiamento: o que sobra no bolso. */
  lucro: number
}

export interface Projecao {
  custoCombustivelPorKm: number
  faturamentoPorHora: number
  periodos: Record<Periodo, ResultadoPeriodo>
  /** Lucro de cada km rodado. */
  kmLiquido: number
}

export function custoCombustivelPorKm(p: Parametros): number {
  return p.precoCombustivel / p.consumoKmPorLitro
}

function horasPorPeriodo(p: Parametros): Record<Periodo, number> {
  const ano = p.horasPorMes * MESES_POR_ANO
  const semana = ano / SEMANAS_POR_ANO
  return {
    hora: 1,
    dia: semana / p.diasPorSemana,
    semana,
    mes: p.horasPorMes,
    ano,
  }
}

function calcularPeriodo(
  p: Parametros,
  custoPorKm: number,
  horas: number,
): ResultadoPeriodo {
  // Os custos mensais são rateados pelas horas trabalhadas no período.
  const fracaoDoMes = horas / p.horasPorMes
  const km = p.kmPorHora * horas
  const faturamentoBruto = km * p.valorPorKm
  const combustivel = km * custoPorKm
  const faturamentoLiquido = faturamentoBruto - combustivel
  const manutencao = km * p.manutencaoPorKm
  const seguro = (p.seguroAnual / MESES_POR_ANO) * fracaoDoMes
  const ipva = (p.ipvaAnual / MESES_POR_ANO) * fracaoDoMes
  const totalCustos = manutencao + seguro + ipva
  const faturamentoResponsavel = faturamentoLiquido - totalCustos
  const financiamento = p.financiamentoMensal * fracaoDoMes
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
    financiamento,
    lucro: faturamentoResponsavel - financiamento,
  }
}

export function calcularProjecao(p: Parametros): Projecao {
  const custoPorKm = custoCombustivelPorKm(p)
  const horas = horasPorPeriodo(p)
  const periodo = (h: number) => calcularPeriodo(p, custoPorKm, h)
  const periodos: Record<Periodo, ResultadoPeriodo> = {
    hora: periodo(horas.hora),
    dia: periodo(horas.dia),
    semana: periodo(horas.semana),
    mes: periodo(horas.mes),
    ano: periodo(horas.ano),
  }
  return {
    custoCombustivelPorKm: custoPorKm,
    faturamentoPorHora: p.kmPorHora * p.valorPorKm,
    periodos,
    kmLiquido: periodos.mes.lucro / periodos.mes.km,
  }
}

export interface EntradaAvulsa {
  faturamentoBruto: number
  /** Km realmente rodados; sem ele, a distância é estimada pelo valor por km. */
  km?: number
}

export interface ResultadoAvulsa {
  km: number
  kmEstimado: boolean
  faturamentoBruto: number
  combustivel: number
  faturamentoLiquido: number
  manutencao: number
  /** O que sobra depois de separar combustível e manutenção. */
  faturamentoResponsavel: number
}

/** "Fiz R$ X hoje, quanto sobrou?" — seguro, IPVA e financiamento não entram. */
export function calcularAvulsa(
  p: Parametros,
  entrada: EntradaAvulsa,
): ResultadoAvulsa {
  const kmEstimado = entrada.km === undefined
  const km = entrada.km ?? entrada.faturamentoBruto / p.valorPorKm
  const combustivel = km * custoCombustivelPorKm(p)
  const faturamentoLiquido = entrada.faturamentoBruto - combustivel
  const manutencao = km * p.manutencaoPorKm
  return {
    km,
    kmEstimado,
    faturamentoBruto: entrada.faturamentoBruto,
    combustivel,
    faturamentoLiquido,
    manutencao,
    faturamentoResponsavel: faturamentoLiquido - manutencao,
  }
}
