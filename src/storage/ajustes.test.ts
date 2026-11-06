import { describe, expect, it } from 'vitest'
import { AJUSTES_PADRAO, CARRO_2_PADRAO } from '../core/ajustes'
import { interpretarAjustes } from './ajustes'

describe('interpretarAjustes', () => {
  it('sem nada salvo, devolve o próprio padrão', () => {
    expect(interpretarAjustes(null, null)).toBe(AJUSTES_PADRAO)
  })

  it('lê o formato atual, com os dois carros e o carro em uso', () => {
    const salvo = {
      carros: [{ carro: 'Onix', ipvaAnual: 900 }, { carro: 'Kwid' }],
      carroAtivo: 1,
      rotina: { horasPorSemana: 40 },
    }
    const ajustes = interpretarAjustes(salvo, null)
    expect(ajustes.carroAtivo).toBe(1)
    expect(ajustes.carros[0]).toMatchObject({ carro: 'Onix', ipvaAnual: 900 })
    expect(ajustes.carros[1]).toEqual({ ...CARRO_2_PADRAO, carro: 'Kwid' })
    expect(ajustes.rotina.horasPorSemana).toBe(40)
  })

  it('traz o carro do formato antigo como Principal, com o Dolphin como Secundário', () => {
    const antigo = { carro: 'HB20', consumoKmPorLitro: 12, horasPorMes: 180 }
    const ajustes = interpretarAjustes(null, antigo)
    expect(ajustes.carroAtivo).toBe(0)
    expect(ajustes.carros[0]).toMatchObject({
      carro: 'HB20',
      consumoKmPorLitro: 12,
    })
    expect(ajustes.carros[1]).toBe(CARRO_2_PADRAO)
    expect(ajustes.rotina.horasPorSemana).toBeCloseTo((180 * 12) / 52, 10)
  })

  it('converte as horas por mês salvas antes em horas por semana', () => {
    const ajustes = interpretarAjustes({ rotina: { horasPorMes: 156 } }, null)
    expect(ajustes.rotina.horasPorSemana).toBe(36)
    expect(ajustes.rotina).not.toHaveProperty('horasPorMes')

    // O limite de 168 vale para a semana já convertida: 192 h/mês dão 44,31 h/semana.
    const comum = interpretarAjustes({ rotina: { horasPorMes: 192 } }, null)
    expect(comum.rotina.horasPorSemana).toBeCloseTo((192 * 12) / 52, 10)
  })

  it('volta ao padrão quando as horas por mês salvas passam de 168 por semana', () => {
    const ajustes = interpretarAjustes({ rotina: { horasPorMes: 800 } }, null)
    expect(ajustes.rotina.horasPorSemana).toBe(
      AJUSTES_PADRAO.rotina.horasPorSemana,
    )
  })

  it('com as horas por semana salvas, ignora as horas por mês', () => {
    const ajustes = interpretarAjustes(
      { rotina: { horasPorSemana: 40, horasPorMes: 156 } },
      null,
    )
    expect(ajustes.rotina.horasPorSemana).toBe(40)
  })

  it('prefere o formato atual quando há os dois', () => {
    const ajustes = interpretarAjustes(
      { carros: [{ carro: 'Novo' }] },
      { carro: 'Antigo' },
    )
    expect(ajustes.carros[0].carro).toBe('Novo')
  })

  it('volta ao padrão nos campos inválidos', () => {
    const ajustes = interpretarAjustes(
      {
        carros: [{ consumoKmPorLitro: 0, pagamentoDoCarro: 'leasing' }],
        carroAtivo: 5,
        rotina: { diasPorSemana: 9 },
      },
      null,
    )
    expect(ajustes.carroAtivo).toBe(0)
    expect(ajustes.carros[0]).toEqual(AJUSTES_PADRAO.carros[0])
    expect(ajustes.rotina).toEqual(AJUSTES_PADRAO.rotina)
  })
})
