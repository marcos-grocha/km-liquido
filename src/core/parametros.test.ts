import { describe, expect, it } from 'vitest'
import {
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
    'horasPorMes',
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
  ])('aceita %s zerado, mas não negativo', (campo) => {
    expect(validarCampo(campo, 0)).toBeNull()
    expect(validarCampo(campo, -1)).toBe('Não pode ser negativo.')
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
