import { describe, expect, it } from 'vitest'
import {
  AJUSTES_PADRAO,
  CARRO_2_PADRAO,
  alterarParametro,
  parametrosDe,
  restaurarCarros,
  restaurarRotina,
  salvarCarroComo,
  type Ajustes,
} from './ajustes'
import { CAMPOS_NUMERICOS, PARAMETROS_PADRAO, validarCampo } from './parametros'

describe('parametrosDe', () => {
  it('com os ajustes padrão, dá os parâmetros padrão do app', () => {
    expect(parametrosDe(AJUSTES_PADRAO)).toEqual(PARAMETROS_PADRAO)
  })

  it('usa os dados do carro em uso com a mesma rotina', () => {
    const parametros = parametrosDe({ ...AJUSTES_PADRAO, carroAtivo: 1 })
    expect(parametros).toMatchObject(CARRO_2_PADRAO)
    expect(parametros.kmPorHora).toBe(PARAMETROS_PADRAO.kmPorHora)
    expect(parametros.horasPorMes).toBe(PARAMETROS_PADRAO.horasPorMes)
  })
})

describe('CARRO_2_PADRAO', () => {
  it('vem como o Dolphin GS', () => {
    expect(CARRO_2_PADRAO).toMatchObject({
      carro: 'Dolphin GS',
      consumoKmPorLitro: 7,
      precoCombustivel: 2,
      manutencaoPorKm: 0.05,
      seguroAnual: 4800,
      ipvaAnual: 3600,
    })
  })

  it('tem só valores válidos', () => {
    const parametros = parametrosDe({ ...AJUSTES_PADRAO, carroAtivo: 1 })
    for (const campo of CAMPOS_NUMERICOS) {
      expect(validarCampo(campo, parametros[campo]), campo).toBeNull()
    }
  })
})

describe('alterarParametro', () => {
  const comCarro2: Ajustes = { ...AJUSTES_PADRAO, carroAtivo: 1 }

  it('muda um campo do carro só no carro em uso', () => {
    const ajustes = alterarParametro(comCarro2, 'ipvaAnual', 1000)
    expect(ajustes.carros[1].ipvaAnual).toBe(1000)
    expect(ajustes.carros[0]).toBe(AJUSTES_PADRAO.carros[0])
  })

  it('muda um campo da rotina para os dois carros', () => {
    const ajustes = alterarParametro(comCarro2, 'horasPorMes', 100)
    expect(parametrosDe(ajustes).horasPorMes).toBe(100)
    expect(parametrosDe({ ...ajustes, carroAtivo: 0 }).horasPorMes).toBe(100)
  })
})

describe('salvarCarroComo', () => {
  it('copia o carro em uso para a outra posição e passa a usá-la', () => {
    const editado = alterarParametro(AJUSTES_PADRAO, 'carro', 'Onix')
    const ajustes = salvarCarroComo(editado, 1)
    expect(ajustes.carroAtivo).toBe(1)
    expect(ajustes.carros[1]).toEqual(editado.carros[0])
    expect(ajustes.carros[0].carro).toBe('Onix')
  })

  it('na própria posição, mantém tudo como está', () => {
    const ajustes = salvarCarroComo(AJUSTES_PADRAO, 0)
    expect(ajustes).toEqual(AJUSTES_PADRAO)
  })
})

describe('restaurarCarros e restaurarRotina', () => {
  const editado: Ajustes = alterarParametro(
    alterarParametro({ ...AJUSTES_PADRAO, carroAtivo: 1 }, 'ipvaAnual', 1000),
    'horasPorMes',
    100,
  )

  it('restaurar os carros mantém a rotina', () => {
    const ajustes = restaurarCarros(editado)
    expect(ajustes.carros).toBe(AJUSTES_PADRAO.carros)
    expect(ajustes.carroAtivo).toBe(0)
    expect(ajustes.rotina.horasPorMes).toBe(100)
  })

  it('restaurar a rotina mantém os carros', () => {
    const ajustes = restaurarRotina(editado)
    expect(ajustes.rotina).toBe(AJUSTES_PADRAO.rotina)
    expect(ajustes.carroAtivo).toBe(1)
    expect(ajustes.carros[1].ipvaAnual).toBe(1000)
  })

  it('restaurando os dois, volta ao próprio padrão, sem nada para salvar', () => {
    expect(restaurarRotina(restaurarCarros(editado))).toBe(AJUSTES_PADRAO)
    expect(restaurarCarros(restaurarRotina(editado))).toBe(AJUSTES_PADRAO)
  })
})
