import { PARAMETROS_PADRAO, type CampoNumerico } from '../core/parametros'
import { formatarParaEdicao } from '../lib/numero'

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
  return `${formatarParaEdicao(PARAMETROS_PADRAO[campo])} é uma sugestão realista`
}
