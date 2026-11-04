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

/** Posição do carro no app: 0 é o Carro 01 e 1 é o Carro 02. */
export type IndiceCarro = 0 | 1

export const ROTULOS_CARRO: Record<IndiceCarro, string> = {
  0: 'Carro 01',
  1: 'Carro 02',
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

/** O Carro 02 já vem preenchido com o Dolphin GS; o pagamento segue o padrão do app. */
export const CARRO_2_PADRAO: DadosDoCarro = {
  ...PADRAO.carro,
  carro: 'Dolphin GS',
  consumoKmPorLitro: 7,
  precoCombustivel: 2,
  manutencaoPorKm: 0.03,
  seguroAnual: 4800,
  ipvaAnual: 3600,
}

/** Ajustes com que o app vem: o carro padrão como Carro 01, em uso. */
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

/** Guarda o carro em uso na posição escolhida, que passa a ser a do carro em uso. */
export function salvarCarroComo(
  ajustes: Ajustes,
  destino: IndiceCarro,
): Ajustes {
  const carros: Ajustes['carros'] = [...ajustes.carros]
  carros[destino] = ajustes.carros[ajustes.carroAtivo]
  return { ...ajustes, carros, carroAtivo: destino }
}
