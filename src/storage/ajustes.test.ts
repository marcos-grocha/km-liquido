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
      rotina: { horasPorMes: 150 },
    }
    const ajustes = interpretarAjustes(salvo, null)
    expect(ajustes.carroAtivo).toBe(1)
    expect(ajustes.carros[0]).toMatchObject({ carro: 'Onix', ipvaAnual: 900 })
    expect(ajustes.carros[1]).toEqual({ ...CARRO_2_PADRAO, carro: 'Kwid' })
    expect(ajustes.rotina.horasPorMes).toBe(150)
  })

  it('traz o carro do formato antigo como Carro 01, com o Dolphin como Carro 02', () => {
    const antigo = { carro: 'HB20', consumoKmPorLitro: 12, horasPorMes: 180 }
    const ajustes = interpretarAjustes(null, antigo)
    expect(ajustes.carroAtivo).toBe(0)
    expect(ajustes.carros[0]).toMatchObject({
      carro: 'HB20',
      consumoKmPorLitro: 12,
    })
    expect(ajustes.carros[1]).toBe(CARRO_2_PADRAO)
    expect(ajustes.rotina.horasPorMes).toBe(180)
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
