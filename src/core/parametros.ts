/** Dados do carro e da rotina de trabalho informados pelo motorista. */
export interface Parametros {
  carro: string
  /** Média de km rodados por hora trabalhada, com e sem passageiro. */
  kmPorHora: number
  /** Faturamento bruto ÷ km total rodado (com e sem passageiro), em R$/km. */
  valorPorKm: number
  /** Horas trabalhadas por semana; as horas por mês saem delas (52 semanas ÷ 12 meses). */
  horasPorSemana: number
  diasPorSemana: number
  /** Em R$/L. */
  precoCombustivel: number
  /** Economia do veículo, em km/L. */
  consumoKmPorLitro: number
  manutencaoPorKm: number
  seguroAnual: number
  ipvaAnual: number
  pagamentoDoCarro: PagamentoDoCarro
  financiamentoMensal: number
  aluguelSemanal: number
}

/** Como o motorista paga pelo carro: parcela mensal ou aluguel semanal. */
export type PagamentoDoCarro = 'financiamento' | 'aluguel'

export const ROTULOS_PAGAMENTO: Record<PagamentoDoCarro, string> = {
  financiamento: 'Financiamento',
  aluguel: 'Aluguel',
}

export type CampoNumerico = Exclude<
  keyof Parametros,
  'carro' | 'pagamentoDoCarro'
>

/** Valores com que o app vem preenchido. */
export const PARAMETROS_PADRAO: Parametros = {
  carro: 'Argo Drive',
  kmPorHora: 20,
  valorPorKm: 1.7,
  horasPorSemana: 44,
  diasPorSemana: 6,
  precoCombustivel: 6.95,
  consumoKmPorLitro: 13,
  manutencaoPorKm: 0.15,
  seguroAnual: 0,
  ipvaAnual: 1500,
  pagamentoDoCarro: 'financiamento',
  financiamentoMensal: 0,
  aluguelSemanal: 500,
}

export interface Restricao {
  min: number
  /** O próprio mínimo não vale: o campo é usado como divisor. */
  minExclusivo?: boolean
  max?: number
}

const RESTRICOES: Record<CampoNumerico, Restricao> = {
  kmPorHora: { min: 0, minExclusivo: true },
  valorPorKm: { min: 0, minExclusivo: true },
  // Uma semana tem 168 horas.
  horasPorSemana: { min: 0, minExclusivo: true, max: 168 },
  diasPorSemana: { min: 1, max: 7 },
  precoCombustivel: { min: 0 },
  consumoKmPorLitro: { min: 0, minExclusivo: true },
  manutencaoPorKm: { min: 0 },
  seguroAnual: { min: 0 },
  ipvaAnual: { min: 0 },
  financiamentoMensal: { min: 0 },
  aluguelSemanal: { min: 0 },
}

export const CAMPOS_NUMERICOS = Object.keys(RESTRICOES) as CampoNumerico[]

/** Devolve a mensagem de erro do campo, ou `null` se o valor é válido. */
export function validarCampo(
  campo: CampoNumerico,
  valor: number,
): string | null {
  return validarValor(valor, RESTRICOES[campo])
}

/** Devolve a mensagem de erro do valor, ou `null` se ele é válido. */
export function validarValor(
  valor: number,
  { min, minExclusivo, max }: Restricao,
): string | null {
  if (!Number.isFinite(valor)) return 'Informe um número.'
  if (minExclusivo && valor <= min) return 'Precisa ser maior que zero.'
  if (max !== undefined && (valor < min || valor > max)) {
    // Com o mínimo exclusivo, o "maior que zero" já foi conferido acima.
    return minExclusivo
      ? `Use um valor até ${max}.`
      : `Use um valor entre ${min} e ${max}.`
  }
  if (valor < min) return 'Não pode ser negativo.'
  return null
}

/** Um dia tem 24 horas. */
const HORAS_POR_DIA = 24
/** Acima disso, o dia de trabalho é longo demais para dirigir. */
const HORAS_INDICADAS_POR_DIA = 12

/** Aviso sobre as horas por dia: "atencao" passa de 12h; "erro" passa de 24h e não cabe no dia. */
export interface AvisoHorasPorDia {
  nivel: 'atencao' | 'erro'
  mensagem: string
}

/**
 * Confere as horas por dia que saem das horas e dos dias por semana; `null` até
 * 12h. Não bloqueia: as contas seguem com o que foi informado.
 */
export function avisoHorasPorDia({
  horasPorSemana,
  diasPorSemana,
}: Pick<
  Parametros,
  'horasPorSemana' | 'diasPorSemana'
>): AvisoHorasPorDia | null {
  // Compara em minutos, como as horas aparecem na tela (144h01 em 6 dias mostra "24h").
  const minutosPorDia = Math.round((horasPorSemana / diasPorSemana) * 60)
  if (minutosPorDia > HORAS_POR_DIA * 60) {
    return { nivel: 'erro', mensagem: 'Um dia tem só 24 horas' }
  }
  if (minutosPorDia > HORAS_INDICADAS_POR_DIA * 60) {
    return { nivel: 'atencao', mensagem: 'Não é indicado dirigir +12h/dia' }
  }
  return null
}
