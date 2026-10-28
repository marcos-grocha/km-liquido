/** Dados do carro e da rotina de trabalho informados pelo motorista. */
export interface Parametros {
  carro: string
  /** Média de km rodados por hora trabalhada, com e sem passageiro. */
  kmPorHora: number
  /** Faturamento bruto ÷ km total rodado (com e sem passageiro), em R$/km. */
  valorPorKm: number
  horasPorMes: number
  diasPorSemana: number
  /** Em R$/L. */
  precoCombustivel: number
  /** Economia do veículo, em km/L. */
  consumoKmPorLitro: number
  manutencaoPorKm: number
  seguroAnual: number
  ipvaAnual: number
  financiamentoMensal: number
}

export type CampoNumerico = Exclude<keyof Parametros, 'carro'>

/** Exemplo da planilha original. */
export const PARAMETROS_PADRAO: Parametros = {
  carro: 'Argo',
  kmPorHora: 20,
  valorPorKm: 1.5,
  horasPorMes: 66,
  diasPorSemana: 5,
  precoCombustivel: 6.95,
  consumoKmPorLitro: 14,
  manutencaoPorKm: 0.1,
  seguroAnual: 0,
  ipvaAnual: 1700,
  financiamentoMensal: 0,
}

interface Restricao {
  min: number
  /** O próprio mínimo não vale: o campo é usado como divisor. */
  minExclusivo?: boolean
  max?: number
}

const RESTRICOES: Record<CampoNumerico, Restricao> = {
  kmPorHora: { min: 0, minExclusivo: true },
  valorPorKm: { min: 0, minExclusivo: true },
  horasPorMes: { min: 0, minExclusivo: true },
  diasPorSemana: { min: 1, max: 7 },
  precoCombustivel: { min: 0 },
  consumoKmPorLitro: { min: 0, minExclusivo: true },
  manutencaoPorKm: { min: 0 },
  seguroAnual: { min: 0 },
  ipvaAnual: { min: 0 },
  financiamentoMensal: { min: 0 },
}

export const CAMPOS_NUMERICOS = Object.keys(RESTRICOES) as CampoNumerico[]

/** Devolve a mensagem de erro do campo, ou `null` se o valor é válido. */
export function validarCampo(
  campo: CampoNumerico,
  valor: number,
): string | null {
  const { min, minExclusivo, max } = RESTRICOES[campo]
  if (!Number.isFinite(valor)) return 'Informe um número.'
  if (max !== undefined && (valor < min || valor > max)) {
    return `Use um valor entre ${min} e ${max}.`
  }
  if (minExclusivo && valor <= min) return 'Precisa ser maior que zero.'
  if (valor < min) return 'Não pode ser negativo.'
  return null
}
