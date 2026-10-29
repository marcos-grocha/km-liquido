const CHAVE = 'km-liquido:doacao:v1'

/** Depois de fechado, o pedido de doação só volta a abrir sozinho passada uma semana. */
const INTERVALO_MS = 7 * 24 * 60 * 60 * 1000

/**
 * O pedido de doação só abre sozinho para quem já configurou o carro, ou seja, já usou o app.
 * Os tempos são em milissegundos desde 1970 (`Date.now()`).
 */
export function deveAbrirDoacao(
  carroConfigurado: boolean,
  ultimoFechamento: number | null,
  agora: number,
): boolean {
  if (!carroConfigurado) return false
  return ultimoFechamento === null || agora - ultimoFechamento >= INTERVALO_MS
}

/** Quando o pedido de doação foi fechado pela última vez, ou null se nunca foi. */
export function carregarFechamentoDoacao(): number | null {
  try {
    const salvo = localStorage.getItem(CHAVE)
    const quando = Number(salvo)
    return salvo !== null && Number.isFinite(quando) ? quando : null
  } catch {
    return null
  }
}

export function salvarFechamentoDoacao(quando: number): void {
  try {
    localStorage.setItem(CHAVE, String(quando))
  } catch {
    // Sem armazenamento disponível: o pedido volta a abrir na próxima visita.
  }
}
