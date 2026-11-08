const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  signDisplay: 'negative',
})

/** "R$ 1.051,05" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

const percentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

/** "33%" */
export function formatarPercentual(fracao: number): string {
  return percentual.format(fracao)
}

/** Número com até `casas` decimais: "1.320", "60,9". */
export function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    maximumFractionDigits: casas,
    signDisplay: 'negative',
  })
}

/** Separa uma duração em horas inteiras e minutos, arredondada ao minuto: 34,6154 h → 34h e 37min. */
export function separarHoras(duracao: number): {
  horas: number
  minutos: number
} {
  const totalMinutos = Math.round(duracao * 60)
  return { horas: Math.floor(totalMinutos / 60), minutos: totalMinutos % 60 }
}

/** Duração em horas e minutos, arredondada ao minuto: "7h23min", "192h", "45min". */
export function formatarHoras(duracao: number): string {
  const { horas: inteiras, minutos } = separarHoras(duracao)
  if (minutos === 0) return `${formatarNumero(inteiras, 0)}h`
  if (inteiras === 0) return `${minutos}min`
  return `${formatarNumero(inteiras, 0)}h${String(minutos).padStart(2, '0')}min`
}

/** Como um campo numérico aceita e mostra o valor. */
export interface FormatoNumero {
  /** Casas decimais aceitas na digitação; 0 aceita só inteiros. */
  casas: number
  /** Casas completadas com zeros fora da edição: 2 nos valores em reais ("1.500,00"). */
  casasFixas?: number
  /**
   * O ponto digitado vale como vírgula, nos campos de valores pequenos, como o
   * preço por litro ("6.959" é 6,959). Sem isso, o ponto é o separador de milhar,
   * que o próprio campo coloca enquanto a pessoa digita ("1.500,00").
   */
  pontoDecimal?: boolean
}

/** Valores em reais, como seguro, IPVA, parcela e aluguel: "1.500,00". */
export const FORMATO_REAIS: FormatoNumero = { casas: 2, casasFixas: 2 }

/** Preços por unidade, como R$/L e R$/km: "6,959", "1,70". */
export const FORMATO_PRECO_UNITARIO: FormatoNumero = {
  casas: 3,
  casasFixas: 2,
  pontoDecimal: true,
}

/** Medidas pequenas com fração, como km/h e km/L: "12,5". */
export const FORMATO_DECIMAL: FormatoNumero = { casas: 2, pontoDecimal: true }

/** Quilômetros rodados, que passam de mil: "1.200", "85,5". */
export const FORMATO_KM: FormatoNumero = { casas: 1 }

/** Só números inteiros, como dias, horas e minutos. */
export const FORMATO_INTEIRO: FormatoNumero = { casas: 0 }

/** Acima disso, os dígitos da parte inteira são descartados. */
const MAXIMO_DIGITOS_INTEIROS = 9

/** Texto inicial de um campo: "1.500", "1.500,50", "6,959". */
export function formatarEntrada(valor: number, formato: FormatoNumero): string {
  return valor.toLocaleString('pt-BR', {
    useGrouping: !formato.pontoDecimal,
    minimumFractionDigits: Number.isInteger(valor)
      ? 0
      : (formato.casasFixas ?? 0),
    maximumFractionDigits: formato.casas,
  })
}

/** Completa as casas fixas com zeros, para o campo fora de edição: "1.500" vira "1.500,00". */
export function completarCasas(texto: string, formato: FormatoNumero): string {
  const casas = formato.casasFixas
  if (!casas || !/\d/.test(texto)) return texto
  const [inteiro, fracao = ''] = texto.split(',')
  return `${inteiro || '0'},${fracao.padEnd(casas, '0')}`
}

/**
 * Reescreve o que foi digitado no formato do campo, a cada tecla: aceita só
 * dígitos e um separador decimal, coloca o ponto de milhar e corta as casas que
 * passam do limite. Também devolve onde o cursor deve ficar, na mesma posição
 * relativa aos dígitos ("1500" vira "1.500", com o cursor no fim).
 */
export function formatarDigitacao(
  texto: string,
  formato: FormatoNumero,
  cursor = texto.length,
): { texto: string; cursor: number } {
  const formatado = normalizar(texto, formato)
  const antesDoCursor = normalizar(texto.slice(0, cursor), formato)
  return {
    texto: formatado,
    cursor: posicaoApos(formatado, contarSignificativos(antesDoCursor)),
  }
}

/** Lê o texto de um campo no formato dele: "1.500,50" vira 1500,5. */
export function lerDigitacao(
  texto: string,
  formato: FormatoNumero,
): number | null {
  const normalizado = normalizar(texto, formato)
  if (normalizado === '') return null
  const valor = Number(normalizado.replaceAll('.', '').replace(',', '.'))
  return Number.isFinite(valor) ? valor : null
}

function normalizar(texto: string, formato: FormatoNumero): string {
  const separadorDecimal = formato.pontoDecimal ? /[.,]/ : /,/
  let inteiro = ''
  let fracao: string | null = null
  for (const caractere of texto) {
    if (/\d/.test(caractere)) {
      if (fracao === null) inteiro += caractere
      else fracao += caractere
    } else if (
      fracao === null &&
      formato.casas > 0 &&
      separadorDecimal.test(caractere)
    ) {
      fracao = ''
    }
  }

  inteiro = inteiro.replace(/^0+(?=\d)/, '').slice(0, MAXIMO_DIGITOS_INTEIROS)
  if (fracao === null) return agrupar(inteiro, formato)
  return `${agrupar(inteiro || '0', formato)},${fracao.slice(0, formato.casas)}`
}

function agrupar(inteiro: string, formato: FormatoNumero): string {
  return formato.pontoDecimal
    ? inteiro
    : inteiro.replace(/\B(?=(\d{3})+$)/g, '.')
}

/** Dígitos e vírgula: tudo menos o ponto de milhar, que o campo põe e tira sozinho. */
function contarSignificativos(texto: string): number {
  return texto.replaceAll('.', '').length
}

function posicaoApos(texto: string, significativos: number): number {
  let contados = 0
  for (let i = 0; i < texto.length && contados < significativos; i++) {
    if (texto[i] !== '.') contados++
    if (contados === significativos) return i + 1
  }
  return significativos === 0 ? 0 : texto.length
}
