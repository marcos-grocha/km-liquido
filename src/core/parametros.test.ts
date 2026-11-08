import { describe, expect, it } from 'vitest'
import {
  avisoHorasPorDia,
  CAMPOS_NUMERICOS,
  PARAMETROS_PADRAO,
  validarCampo,
  type CampoNumerico,
} from './parametros'

describe('validarCampo', () => {
  it('aceita todos os valores padrão', () => {
    for (const campo of CAMPOS_NUMERICOS) {
      expect(validarCampo(campo, PARAMETROS_PADRAO[campo]), campo).toBeNull()
    }
  })

  it.each<CampoNumerico>([
    'kmPorHora',
    'valorPorKm',
    'horasPorSemana',
    'consumoKmPorLitro',
  ])('exige %s maior que zero, porque ele divide outros valores', (campo) => {
    expect(validarCampo(campo, 0)).toBe('Precisa ser maior que zero.')
    expect(validarCampo(campo, 0.5)).toBeNull()
  })

  it.each<CampoNumerico>([
    'precoCombustivel',
    'manutencaoPorKm',
    'seguroAnual',
    'ipvaAnual',
    'financiamentoMensal',
    'aluguelSemanal',
  ])('aceita %s zerado, mas não negativo', (campo) => {
    expect(validarCampo(campo, 0)).toBeNull()
    expect(validarCampo(campo, -1)).toBe('Não pode ser negativo.')
  })

  it('limita as horas por semana às 168 horas de uma semana', () => {
    expect(validarCampo('horasPorSemana', 168)).toBeNull()
    expect(validarCampo('horasPorSemana', 168.5)).toBe('Use um valor até 168.')
    expect(validarCampo('horasPorSemana', 0)).toBe(
      'Precisa ser maior que zero.',
    )
  })

  it('limita os dias por semana entre 1 e 7', () => {
    expect(validarCampo('diasPorSemana', 0)).toBe('Use um valor entre 1 e 7.')
    expect(validarCampo('diasPorSemana', 8)).toBe('Use um valor entre 1 e 7.')
    expect(validarCampo('diasPorSemana', 5.5)).toBeNull()
  })

  it('recusa valores que não são números', () => {
    expect(validarCampo('ipvaAnual', Number.NaN)).toBe('Informe um número.')
  })
})

describe('avisoHorasPorDia', () => {
  it.each([
    [44, 6],
    [12, 1],
    [72, 6],
    [72 + 1 / 120, 6],
  ])('não avisa com %dh em %d dias', (horasPorSemana, diasPorSemana) => {
    expect(avisoHorasPorDia({ horasPorSemana, diasPorSemana })).toBeNull()
  })

  it.each([
    [12 + 1 / 60, 1],
    [44, 2],
    [24, 1],
    [168, 7],
    [144 + 1 / 60, 6],
  ])('pede atenção com %dh em %d dias', (horasPorSemana, diasPorSemana) => {
    expect(avisoHorasPorDia({ horasPorSemana, diasPorSemana })).toEqual({
      nivel: 'atencao',
      mensagem: 'Não é indicado dirigir +12h/dia',
    })
  })

  it.each([
    [44, 1],
    [24 + 1 / 60, 1],
    [145, 6],
  ])('acusa erro com %dh em %d dias', (horasPorSemana, diasPorSemana) => {
    expect(avisoHorasPorDia({ horasPorSemana, diasPorSemana })).toEqual({
      nivel: 'erro',
      mensagem: 'Um dia tem só 24 horas',
    })
  })
})
