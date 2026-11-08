import { PARAMETROS_PADRAO, type CampoNumerico } from '../core/parametros'
import {
  completarCasas,
  formatarEntrada,
  FORMATO_DECIMAL,
  FORMATO_INTEIRO,
  FORMATO_PRECO_UNITARIO,
  FORMATO_REAIS,
  type FormatoNumero,
} from '../lib/numero'

/** Como cada parâmetro é digitado e mostrado. */
export const FORMATOS: Record<CampoNumerico, FormatoNumero> = {
  kmPorHora: FORMATO_DECIMAL,
  valorPorKm: FORMATO_PRECO_UNITARIO,
  // Na tela, vai em horas e minutos inteiros (CampoHoras).
  horasPorSemana: FORMATO_DECIMAL,
  diasPorSemana: FORMATO_INTEIRO,
  precoCombustivel: FORMATO_PRECO_UNITARIO,
  consumoKmPorLitro: FORMATO_DECIMAL,
  manutencaoPorKm: FORMATO_PRECO_UNITARIO,
  seguroAnual: FORMATO_REAIS,
  ipvaAnual: FORMATO_REAIS,
  financiamentoMensal: FORMATO_REAIS,
  aluguelSemanal: FORMATO_REAIS,
}

/** Como um parâmetro numérico aparece na tela de ajustes. */
export interface DefinicaoCampo {
  campo: CampoNumerico
  rotulo: string
  prefixo?: string
  sufixo?: string
  /** Aparece quando o campo está vazio. */
  placeholder?: string
  /** Campos com dica ocupam a linha inteira. */
  dica?: string
  /** Esconde o rótulo na tela quando o contexto já identifica o campo. */
  ocultarRotulo?: boolean
}

/** Placeholder com o valor padrão do campo como sugestão. */
export function sugestao(campo: CampoNumerico): string {
  const formato = FORMATOS[campo]
  const valor = formatarEntrada(PARAMETROS_PADRAO[campo], formato)
  return `${completarCasas(valor, formato)} é uma sugestão realista`
}
