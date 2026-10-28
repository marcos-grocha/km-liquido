const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  signDisplay: 'negative',
})

/** "R$ 1.051,05" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

/** Número com até `casas` decimais: "1.320", "60,9". */
export function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    maximumFractionDigits: casas,
    signDisplay: 'negative',
  })
}

/** Texto para um campo editável: sem separador de milhar ("1700", "6,95"). */
export function formatarParaEdicao(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    useGrouping: false,
    maximumFractionDigits: 4,
  })
}

/**
 * Converte o texto digitado em número, ignorando unidades ("R$", "km").
 * Vírgula ou ponto valem como separador decimal; com os dois presentes, o
 * último é o decimal ("1.700,50" ou "1,700.50"), e um separador repetido é de
 * milhar ("1.000.000").
 */
export function lerNumero(texto: string): number | null {
  const limpo = texto.replace(/[^\d.,-]/g, '')
  if (!/\d/.test(limpo)) return null

  const posicaoDecimal = Math.max(
    limpo.lastIndexOf(','),
    limpo.lastIndexOf('.'),
  )
  let normalizado = limpo
  if (posicaoDecimal >= 0) {
    const decimal = limpo[posicaoDecimal]
    const repetido = limpo.indexOf(decimal) !== posicaoDecimal
    const inteiro = limpo.slice(0, posicaoDecimal).replace(/[.,]/g, '')
    const fracao = limpo.slice(posicaoDecimal + 1)
    const outroSeparador = /[.,]/.test(
      limpo.slice(0, posicaoDecimal).replaceAll(decimal, ''),
    )
    normalizado =
      repetido && !outroSeparador ? inteiro + fracao : `${inteiro}.${fracao}`
  }

  const valor = Number(normalizado)
  return Number.isFinite(valor) ? valor : null
}
