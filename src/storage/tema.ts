export type Tema = 'claro' | 'escuro'

/** Tema escolhido no botão do cabeçalho. Sem ele salvo, o app segue o tema do aparelho. */
const CHAVE = 'km-liquido:tema:v1'

export function validarTema(salvo: unknown): Tema | null {
  return salvo === 'claro' || salvo === 'escuro' ? salvo : null
}

/**
 * O que fica escolhido depois de um toque no botão: o outro tema, ou null quando
 * ele é o do aparelho, para o app voltar a seguir o aparelho.
 */
export function proximaEscolha(emUso: Tema, aparelho: Tema): Tema | null {
  const novo: Tema = emUso === 'escuro' ? 'claro' : 'escuro'
  return novo === aparelho ? null : novo
}

export function carregarTema(): Tema | null {
  try {
    return validarTema(localStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

/** Guarda a escolha; com null, apaga e o app volta a seguir o aparelho. */
export function salvarTema(escolhido: Tema | null): void {
  try {
    if (escolhido) localStorage.setItem(CHAVE, escolhido)
    else localStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento disponível: a escolha vale só até fechar o app.
  }
}
