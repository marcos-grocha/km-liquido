import { describe, expect, it } from 'vitest'
import {
  calcularAvulsa,
  calcularProjecao,
  PERIODOS,
  type Periodo,
  type ResultadoPeriodo,
} from './calculo'
import type { Parametros } from './parametros'

// Casos de referência: docs/regras-de-calculo.md, §4 e §5.

/** Exemplo da planilha original (docs/regras-de-calculo.md, §1). */
const exemplo: Parametros = {
  carro: 'Argo',
  kmPorHora: 20,
  valorPorKm: 1.5,
  horasPorMes: 66,
  diasPorSemana: 5,
  precoCombustivel: 6.95,
  consumoKmPorLitro: 14,
  manutencaoPorKm: 0.1,
  seguroAnual: 0,
  ipvaAnual: 1700,
  pagamentoDoCarro: 'financiamento',
  financiamentoMensal: 0,
  aluguelSemanal: 0,
}
/** R$ 7,00 a 14 km/L dá R$ 0,50/km, o custo arredondado que a planilha usa. */
const comCustoDaPlanilha: Parametros = { ...exemplo, precoCombustivel: 7 }

/** Confere cada valor esperado com duas casas decimais (centavos). */
function esperarValores<T extends object>(
  resultado: T,
  esperado: Partial<Record<keyof T, number>>,
) {
  for (const [campo, valor] of Object.entries(esperado)) {
    expect(resultado[campo as keyof T], campo).toBeCloseTo(valor as number, 2)
  }
}

describe('calcularProjecao', () => {
  it('reproduz o mês e o ano da planilha com o mesmo custo por km', () => {
    const { mes, ano } = calcularProjecao(comCustoDaPlanilha).periodos

    esperarValores(mes, {
      km: 1320,
      faturamentoBruto: 1980,
      combustivel: 660,
      faturamentoLiquido: 1320,
      manutencao: 132,
      seguro: 0,
      ipva: 141.67,
      totalCustos: 273.67,
      faturamentoResponsavel: 1046.33,
      lucro: 1046.33,
    })
    esperarValores(ano, {
      km: 15840,
      faturamentoBruto: 23760,
      combustivel: 7920,
      faturamentoLiquido: 15840,
      manutencao: 1584,
      seguro: 0,
      ipva: 1700,
      totalCustos: 3284,
      faturamentoResponsavel: 12556,
      lucro: 12556,
    })
  })

  const esperadoNoExemplo: Record<Periodo, Partial<ResultadoPeriodo>> = {
    hora: {
      km: 20,
      faturamentoBruto: 30,
      combustivel: 9.93,
      faturamentoLiquido: 20.07,
      manutencao: 2,
      ipva: 2.15,
      totalCustos: 4.15,
      lucro: 15.92,
    },
    dia: {
      km: 60.92,
      faturamentoBruto: 91.38,
      combustivel: 30.24,
      faturamentoLiquido: 61.14,
      manutencao: 6.09,
      ipva: 6.54,
      totalCustos: 12.63,
      lucro: 48.51,
    },
    semana: {
      km: 304.62,
      faturamentoBruto: 456.92,
      combustivel: 151.22,
      faturamentoLiquido: 305.7,
      manutencao: 30.46,
      ipva: 32.69,
      totalCustos: 63.15,
      lucro: 242.55,
    },
    mes: {
      km: 1320,
      faturamentoBruto: 1980,
      combustivel: 655.29,
      faturamentoLiquido: 1324.71,
      manutencao: 132,
      ipva: 141.67,
      totalCustos: 273.67,
      lucro: 1051.05,
    },
    ano: {
      km: 15840,
      faturamentoBruto: 23760,
      combustivel: 7863.43,
      faturamentoLiquido: 15896.57,
      manutencao: 1584,
      ipva: 1700,
      totalCustos: 3284,
      lucro: 12612.57,
    },
  }

  it.each(PERIODOS)('calcula o período "%s" sem arredondar no meio', (p) => {
    esperarValores(calcularProjecao(exemplo).periodos[p], esperadoNoExemplo[p])
  })

  it('destaca custo por km, faturamento por hora e km líquido', () => {
    const projecao = calcularProjecao(exemplo)

    expect(projecao.custoCombustivelPorKm).toBeCloseTo(0.4964, 4)
    expect(projecao.custoPorKm).toBeCloseTo(0.5964, 4)
    expect(projecao.faturamentoPorHora).toBe(30)
    expect(projecao.kmLiquido).toBeCloseTo(0.8, 2)
  })

  it('o custo por km de Meu carro soma o combustível e a manutenção de cada km', () => {
    const projecao = calcularProjecao(exemplo)
    const { mes } = projecao.periodos

    expect(projecao.custoPorKm * mes.km).toBeCloseTo(
      mes.combustivel + mes.manutencao,
      8,
    )
  })

  it('mantém o calendário consistente: 52 semanas e 12 meses por ano', () => {
    const { dia, semana, mes, ano } = calcularProjecao(exemplo).periodos

    expect(semana.horas * 52).toBeCloseTo(ano.horas, 10)
    expect(mes.horas * 12).toBeCloseTo(ano.horas, 10)
    expect(dia.horas * exemplo.diasPorSemana).toBeCloseTo(semana.horas, 10)
  })

  it('usa os dias por semana só para dividir a semana em dias', () => {
    const cincoDias = calcularProjecao(exemplo).periodos
    const seisDias = calcularProjecao({ ...exemplo, diasPorSemana: 6 }).periodos

    expect(seisDias.dia.km).toBeCloseTo(50.77, 2)
    expect(seisDias.semana).toEqual(cincoDias.semana)
    expect(seisDias.mes).toEqual(cincoDias.mes)
  })

  it('desconta o financiamento rateado pelas horas trabalhadas', () => {
    const { hora, mes, ano } = calcularProjecao({
      ...exemplo,
      financiamentoMensal: 500,
    }).periodos

    esperarValores(mes, {
      faturamentoResponsavel: 1051.05,
      financiamentoOuAluguel: 500,
      lucro: 551.05,
    })
    esperarValores(ano, { financiamentoOuAluguel: 6000, lucro: 6612.57 })
    esperarValores(hora, { financiamentoOuAluguel: 7.58, lucro: 8.35 })
  })

  it('converte o aluguel semanal para o mês e rateia pelas horas', () => {
    const { hora, dia, semana, mes, ano } = calcularProjecao({
      ...exemplo,
      pagamentoDoCarro: 'aluguel',
      aluguelSemanal: 500,
    }).periodos

    esperarValores(semana, { financiamentoOuAluguel: 500, lucro: -257.45 })
    esperarValores(mes, { financiamentoOuAluguel: 2166.67, lucro: -1115.62 })
    esperarValores(ano, { financiamentoOuAluguel: 26000, lucro: -13387.43 })
    esperarValores(dia, { financiamentoOuAluguel: 100, lucro: -51.49 })
    esperarValores(hora, { financiamentoOuAluguel: 32.83, lucro: -16.9 })
  })

  it('desconta só o pagamento escolhido: financiamento ou aluguel', () => {
    const comOsDois = {
      ...exemplo,
      financiamentoMensal: 1000,
      aluguelSemanal: 500,
    }
    const financiado = calcularProjecao({
      ...comOsDois,
      pagamentoDoCarro: 'financiamento',
    }).periodos.mes
    const alugado = calcularProjecao({
      ...comOsDois,
      pagamentoDoCarro: 'aluguel',
    }).periodos.mes

    expect(financiado.financiamentoOuAluguel).toBe(1000)
    expect(alugado.financiamentoOuAluguel).toBeCloseTo(2166.67, 2)
  })
})

describe('calcularAvulsa', () => {
  it('reproduz a planilha com o mesmo custo por km', () => {
    const resultado = calcularAvulsa(comCustoDaPlanilha, {
      faturamentoBruto: 94.29,
    })

    expect(resultado.kmEstimado).toBe(true)
    esperarValores(resultado, {
      km: 62.86,
      combustivel: 31.43,
      faturamentoLiquido: 62.86,
      manutencao: 6.29,
      faturamentoResponsavel: 56.57,
    })
  })

  it('estima o km pelo valor por km e usa o custo exato', () => {
    esperarValores(calcularAvulsa(exemplo, { faturamentoBruto: 94.29 }), {
      km: 62.86,
      combustivel: 31.21,
      faturamentoLiquido: 63.08,
      manutencao: 6.29,
      faturamentoResponsavel: 56.8,
    })
  })

  it('usa o km informado quando o motorista sabe quanto rodou', () => {
    const resultado = calcularAvulsa(exemplo, { faturamentoBruto: 100, km: 80 })

    expect(resultado.kmEstimado).toBe(false)
    esperarValores(resultado, {
      km: 80,
      combustivel: 39.71,
      faturamentoLiquido: 60.29,
      manutencao: 8,
      faturamentoResponsavel: 52.29,
    })
  })
})
