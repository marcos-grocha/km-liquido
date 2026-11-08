import { describe, expect, it } from 'vitest'
import {
  completarCasas,
  formatarDigitacao,
  formatarEntrada,
  formatarHoras,
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  FORMATO_DECIMAL,
  FORMATO_INTEIRO,
  FORMATO_KM,
  FORMATO_PRECO_UNITARIO,
  FORMATO_REAIS,
  lerDigitacao,
  separarHoras,
  type FormatoNumero,
} from './numero'

/** Digita o texto inteiro, como se fosse colado de uma vez. */
function digitar(texto: string, formato: FormatoNumero): string {
  return formatarDigitacao(texto, formato).texto
}

describe('digitação em reais', () => {
  it.each([
    ['1500', '1.500'],
    ['1.500', '1.500'],
    ['1.500,00', '1.500,00'],
    ['1500,5', '1.500,5'],
    ['12000', '12.000'],
    ['1234567', '1.234.567'],
    ['R$ 4.800', '4.800'],
    [',5', '0,5'],
    ['0', '0'],
    ['00012', '12'],
    ['12,5,', '12,5'],
    ['1,999', '1,99'],
    ['-3', '3'],
    ['abc', ''],
    ['1234567890', '123.456.789'],
  ])('"%s" fica "%s"', (texto, esperado) => {
    expect(digitar(texto, FORMATO_REAIS)).toBe(esperado)
  })

  it.each([
    ['1500', 1500],
    ['1.500', 1500],
    ['4.800', 4800],
    ['12.000', 12000],
    ['1.500,00', 1500],
    ['1.500,5', 1500.5],
    ['0,', 0],
  ])('lê "%s" como %d', (texto, esperado) => {
    expect(lerDigitacao(texto, FORMATO_REAIS)).toBe(esperado)
  })

  it.each(['', '   ', 'R$'])('devolve null para "%s"', (texto) => {
    expect(lerDigitacao(texto, FORMATO_REAIS)).toBeNull()
  })
})

describe('digitação de preço por unidade', () => {
  it.each([
    ['6.959', '6,959', 6.959],
    ['6,959', '6,959', 6.959],
    ['6.95', '6,95', 6.95],
    ['1.7', '1,7', 1.7],
    ['6,9599', '6,959', 6.959],
    ['6.9.5', '6,95', 6.95],
    ['1500', '1500', 1500],
  ])('"%s" fica "%s" (%d)', (texto, esperado, valor) => {
    expect(digitar(texto, FORMATO_PRECO_UNITARIO)).toBe(esperado)
    expect(lerDigitacao(texto, FORMATO_PRECO_UNITARIO)).toBe(valor)
  })
})

describe('digitação de outros formatos', () => {
  it('lê o ponto como decimal nas medidas com fração', () => {
    expect(digitar('12.5', FORMATO_DECIMAL)).toBe('12,5')
    expect(digitar('12,555', FORMATO_DECIMAL)).toBe('12,55')
  })

  it('lê o ponto como milhar no km', () => {
    expect(digitar('1.200', FORMATO_KM)).toBe('1.200')
    expect(lerDigitacao('1.200', FORMATO_KM)).toBe(1200)
    expect(digitar('85,55', FORMATO_KM)).toBe('85,5')
  })

  it('aceita só dígitos nos inteiros', () => {
    expect(digitar('5,5', FORMATO_INTEIRO)).toBe('55')
    expect(digitar('4.', FORMATO_INTEIRO)).toBe('4')
    expect(digitar('20 a 25', FORMATO_INTEIRO)).toBe('2.025')
  })
})

describe('cursor na digitação', () => {
  it.each([
    // [texto no campo depois da tecla, cursor, texto formatado, cursor esperado]
    ['1500', 4, '1.500', 5],
    ['15000', 2, '15.000', 2],
    ['12.500', 2, '12.500', 2],
    ['1.5000', 6, '15.000', 6],
    ['1.500,', 6, '1.500,', 6],
    [',', 1, '0,', 2],
    ['1.500,507', 9, '1.500,50', 8],
    ['1.500,750', 7, '1.500,75', 7],
    ['1500', 0, '1.500', 0],
  ])('"%s" com o cursor em %d', (texto, cursor, esperado, cursorEsperado) => {
    expect(formatarDigitacao(texto, FORMATO_REAIS, cursor)).toEqual({
      texto: esperado,
      cursor: cursorEsperado,
    })
  })

  it('apagar o ponto de milhar só move o cursor', () => {
    // "1.|500" e Backspace: o ponto volta e o cursor fica depois do 1.
    expect(formatarDigitacao('1500', FORMATO_REAIS, 1)).toEqual({
      texto: '1.500',
      cursor: 1,
    })
  })
})

describe('texto do campo', () => {
  it.each([
    [1500, FORMATO_REAIS, '1.500'],
    [1500.5, FORMATO_REAIS, '1.500,50'],
    [0, FORMATO_REAIS, '0'],
    [6.95, FORMATO_PRECO_UNITARIO, '6,95'],
    [6.959, FORMATO_PRECO_UNITARIO, '6,959'],
    [1.7, FORMATO_PRECO_UNITARIO, '1,70'],
    [2, FORMATO_PRECO_UNITARIO, '2'],
    [12.5, FORMATO_DECIMAL, '12,5'],
    [0.125, FORMATO_REAIS, '0,13'],
  ])('mostra %d como "%s" para edição', (valor, formato, esperado) => {
    expect(formatarEntrada(valor, formato)).toBe(esperado)
  })

  it('volta a ser lido como o mesmo número', () => {
    for (const valor of [1500, 1500.5, 4800, 123456.78]) {
      const texto = formatarEntrada(valor, FORMATO_REAIS)
      expect(lerDigitacao(texto, FORMATO_REAIS)).toBe(valor)
    }
  })

  it.each([
    ['1.500', '1.500,00'],
    ['1.500,5', '1.500,50'],
    ['1.500,', '1.500,00'],
    ['0', '0,00'],
    ['', ''],
  ])('completa "%s" como "%s" fora da edição', (texto, esperado) => {
    expect(completarCasas(texto, FORMATO_REAIS)).toBe(esperado)
  })

  it('completa só até as casas fixas', () => {
    expect(completarCasas('6,959', FORMATO_PRECO_UNITARIO)).toBe('6,959')
    expect(completarCasas('2', FORMATO_PRECO_UNITARIO)).toBe('2,00')
    expect(completarCasas('12', FORMATO_DECIMAL)).toBe('12')
  })
})

describe('formatação', () => {
  it('formata moeda em reais', () => {
    expect(formatarMoeda(1051.047619)).toBe('R$ 1.051,05')
    expect(formatarMoeda(-12.5)).toBe('-R$ 12,50')
  })

  it('não mostra sinal em valores que arredondam para zero', () => {
    expect(formatarMoeda(-0.001)).toBe('R$ 0,00')
  })

  it.each([
    [7.75, '7h45min'],
    [7.384615, '7h23min'],
    [3.046154, '3h03min'],
    [0.75, '45min'],
    [1.9999, '2h'],
    [192, '192h'],
    [2304, '2.304h'],
    [0, '0h'],
  ])('formata %d horas como "%s"', (horas, esperado) => {
    expect(formatarHoras(horas)).toBe(esperado)
  })

  it('formata percentuais sem casas decimais', () => {
    expect(formatarPercentual(0.331)).toBe('33%')
  })

  it('formata números com separador de milhar e poucas casas', () => {
    expect(formatarNumero(1320)).toBe('1.320')
    expect(formatarNumero(60.923)).toBe('60,9')
    expect(formatarNumero(0.4964, 2)).toBe('0,5')
  })
})

describe('separarHoras', () => {
  it.each([
    [44, 44, 0],
    [190 + 40 / 60, 190, 40],
    [(150 * 12) / 52, 34, 37],
    [1.9999, 2, 0],
  ])('separa %d horas em %dh e %dmin', (duracao, horas, minutos) => {
    expect(separarHoras(duracao)).toEqual({ horas, minutos })
  })
})
