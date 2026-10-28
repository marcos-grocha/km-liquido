import { describe, expect, it } from 'vitest'
import {
  formatarMoeda,
  formatarNumero,
  formatarParaEdicao,
  formatarPercentual,
  lerNumero,
} from './numero'

describe('lerNumero', () => {
  it.each([
    ['1,5', 1.5],
    ['1.5', 1.5],
    [',5', 0.5],
    ['1700', 1700],
    ['1.700,50', 1700.5],
    ['1,700.50', 1700.5],
    ['1.000.000', 1000000],
    ['R$ 6,959', 6.959],
    [' 20 km/h ', 20],
    ['-3', -3],
  ])('lê "%s" como %d', (texto, esperado) => {
    expect(lerNumero(texto)).toBe(esperado)
  })

  it.each(['', '   ', 'abc', '-', ',', '1-2'])(
    'devolve null para "%s"',
    (texto) => {
      expect(lerNumero(texto)).toBeNull()
    },
  )
})

describe('formatação', () => {
  it('formata moeda em reais', () => {
    expect(formatarMoeda(1051.047619)).toBe('R$ 1.051,05')
    expect(formatarMoeda(-12.5)).toBe('-R$ 12,50')
  })

  it('não mostra sinal em valores que arredondam para zero', () => {
    expect(formatarMoeda(-0.001)).toBe('R$ 0,00')
  })

  it('formata percentuais sem casas decimais', () => {
    expect(formatarPercentual(0.331)).toBe('33%')
  })

  it('formata números com separador de milhar e poucas casas', () => {
    expect(formatarNumero(1320)).toBe('1.320')
    expect(formatarNumero(60.923)).toBe('60,9')
    expect(formatarNumero(0.4964, 2)).toBe('0,5')
  })

  it('prepara números para edição sem separador de milhar', () => {
    expect(formatarParaEdicao(1700)).toBe('1700')
    expect(formatarParaEdicao(6.95)).toBe('6,95')
    expect(formatarParaEdicao(0.1)).toBe('0,1')
  })
})
