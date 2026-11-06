import { PARAMETROS_PADRAO, type Parametros } from './parametros'

/** Campos que mudam de um carro para outro. O resto é a rotina, comum aos dois. */
export const CAMPOS_DO_CARRO = [
  'carro',
  'consumoKmPorLitro',
  'precoCombustivel',
  'manutencaoPorKm',
  'seguroAnual',
  'ipvaAnual',
  'pagamentoDoCarro',
  'financiamentoMensal',
  'aluguelSemanal',
] as const satisfies readonly (keyof Parametros)[]

export type CampoDoCarro = (typeof CAMPOS_DO_CARRO)[number]
export type DadosDoCarro = Pick<Parametros, CampoDoCarro>
export type Rotina = Omit<Parametros, CampoDoCarro>

/** Posição do carro no app: 0 é o Principal e 1 é o Secundário. */
export type IndiceCarro = 0 | 1

export const ROTULOS_CARRO: Record<IndiceCarro, string> = {
  0: 'Principal',
  1: 'Secundário',
}

/** Tudo o que o motorista configura: os dois carros, qual está em uso e a rotina. */
export interface Ajustes {
  carros: [DadosDoCarro, DadosDoCarro]
  carroAtivo: IndiceCarro
  rotina: Rotina
}

export function ehCampoDoCarro(campo: keyof Parametros): campo is CampoDoCarro {
  return (CAMPOS_DO_CARRO as readonly string[]).includes(campo)
}

/** Separa os parâmetros de um carro só nos dados do carro e na rotina. */
export function separar(parametros: Parametros): {
  carro: DadosDoCarro
  rotina: Rotina
} {
  const {
    carro,
    consumoKmPorLitro,
    precoCombustivel,
    manutencaoPorKm,
    seguroAnual,
    ipvaAnual,
    pagamentoDoCarro,
    financiamentoMensal,
    aluguelSemanal,
    ...rotina
  } = parametros
  return {
    carro: {
      carro,
      consumoKmPorLitro,
      precoCombustivel,
      manutencaoPorKm,
      seguroAnual,
      ipvaAnual,
      pagamentoDoCarro,
      financiamentoMensal,
      aluguelSemanal,
    },
    rotina,
  }
}

const PADRAO = separar(PARAMETROS_PADRAO)

/** O Secundário já vem preenchido com o Dolphin GS; o pagamento segue o padrão do app. */
export const CARRO_2_PADRAO: DadosDoCarro = {
  ...PADRAO.carro,
  carro: 'Dolphin GS',
  consumoKmPorLitro: 7,
  precoCombustivel: 2,
  manutencaoPorKm: 0.05,
  seguroAnual: 4800,
  ipvaAnual: 3600,
}

/** Ajustes com que o app vem: o carro padrão como Principal, em uso. */
export const AJUSTES_PADRAO: Ajustes = {
  carros: [PADRAO.carro, CARRO_2_PADRAO],
  carroAtivo: 0,
  rotina: PADRAO.rotina,
}

/** Parâmetros usados nas contas: a rotina com os dados do carro em uso. */
export function parametrosDe({
  carros,
  carroAtivo,
  rotina,
}: Ajustes): Parametros {
  return { ...rotina, ...carros[carroAtivo] }
}

/** Altera um campo: os do carro valem só para o carro em uso; os da rotina, para os dois. */
export function alterarParametro<C extends keyof Parametros>(
  ajustes: Ajustes,
  campo: C,
  valor: Parametros[C],
): Ajustes {
  if (!ehCampoDoCarro(campo)) {
    return { ...ajustes, rotina: { ...ajustes.rotina, [campo]: valor } }
  }
  const carros: Ajustes['carros'] = [...ajustes.carros]
  carros[ajustes.carroAtivo] = {
    ...carros[ajustes.carroAtivo],
    [campo]: valor,
  }
  return { ...ajustes, carros }
}

/** Volta os dois carros ao padrão, com o Principal em uso; a rotina fica como está. */
export function restaurarCarros(ajustes: Ajustes): Ajustes {
  return padraoSeTudoPadrao({
    ...ajustes,
    carros: AJUSTES_PADRAO.carros,
    carroAtivo: 0,
  })
}

/** Volta a rotina ao padrão; os carros ficam como estão. */
export function restaurarRotina(ajustes: Ajustes): Ajustes {
  return padraoSeTudoPadrao({ ...ajustes, rotina: AJUSTES_PADRAO.rotina })
}

/**
 * Com os carros e a rotina de volta ao padrão, devolve o próprio `AJUSTES_PADRAO`:
 * o app volta a não ter nada salvo, como antes da primeira edição.
 */
function padraoSeTudoPadrao(ajustes: Ajustes): Ajustes {
  const tudoPadrao =
    ajustes.carros === AJUSTES_PADRAO.carros &&
    ajustes.carroAtivo === AJUSTES_PADRAO.carroAtivo &&
    ajustes.rotina === AJUSTES_PADRAO.rotina
  return tudoPadrao ? AJUSTES_PADRAO : ajustes
}
