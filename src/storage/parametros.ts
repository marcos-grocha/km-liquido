import {
  CAMPOS_NUMERICOS,
  PARAMETROS_PADRAO,
  validarCampo,
  type Parametros,
} from '../core/parametros'

const CHAVE = 'km-liquido:parametros:v1'

/** Lê os parâmetros salvos no aparelho; campos ausentes ou inválidos voltam ao padrão. */
export function carregarParametros(): Parametros {
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
    if (typeof salvo !== 'object' || salvo === null) return PARAMETROS_PADRAO

    const dados = salvo as Record<string, unknown>
    const parametros = { ...PARAMETROS_PADRAO }
    if (typeof dados.carro === 'string') parametros.carro = dados.carro
    for (const campo of CAMPOS_NUMERICOS) {
      const valor = dados[campo]
      if (typeof valor === 'number' && validarCampo(campo, valor) === null) {
        parametros[campo] = valor
      }
    }
    return parametros
  } catch {
    return PARAMETROS_PADRAO
  }
}

export function salvarParametros(parametros: Parametros): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(parametros))
  } catch {
    // Sem armazenamento disponível (modo privado, cota cheia): segue só em memória.
  }
}

export function apagarParametros(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento disponível: não há o que apagar.
  }
}
