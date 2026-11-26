import { Fuel, Wrench, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { AvisoCamposEmVermelho } from '../../components/AvisoCamposEmVermelho'
import { Campo } from '../../components/Campo'
import {
  CampoHorasOpcional,
  type ErrosHoras,
  type TextoHoras,
} from '../../components/CampoHorasOpcional'
import type {
  AbaComErro,
  CamposComErro,
} from '../../components/useCamposComErro'
import {
  calcularAvulsa,
  faturamentoPorHora,
  type ResultadoAvulsa,
} from '../../core/calculo'
import {
  ROTULOS_PAGAMENTO,
  validarValor,
  type CampoNumerico,
  type Parametros,
  type Restricao,
} from '../../core/parametros'
import {
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  FORMATO_INTEIRO,
  FORMATO_KM,
  FORMATO_REAIS,
  lerDigitacao,
  type FormatoNumero,
} from '../../lib/numero'

/** Lê um campo opcional: em branco vira `undefined`, sem erro. */
function interpretar(
  texto: string,
  formato: FormatoNumero,
  restricao: Restricao,
) {
  if (texto.trim() === '') return { valor: undefined, erro: null }
  const valor = lerDigitacao(texto, formato)
  const erro =
    valor === null ? 'Informe um número.' : validarValor(valor, restricao)
  return { valor: erro ? undefined : (valor ?? undefined), erro }
}

const SEM_ERROS: ErrosHoras = { horas: null, minutos: null }

/**
 * Lê as horas trabalhadas, opcionais: as duas partes em branco viram `undefined`,
 * sem erro; com uma delas preenchida, a outra em branco vale zero.
 */
function interpretarHoras({ horas, minutos }: TextoHoras) {
  if (horas.trim() === '' && minutos.trim() === '')
    return { valor: undefined, erros: SEM_ERROS }
  const inteiras = lerDigitacao(horas, FORMATO_INTEIRO) ?? 0
  const minutosLidos = lerDigitacao(minutos, FORMATO_INTEIRO) ?? 0
  if (minutosLidos > 59)
    return {
      valor: undefined,
      erros: { horas: null, minutos: 'Use de 0 a 59 minutos.' },
    }
  const total = inteiras + minutosLidos / 60
  const erro = validarValor(total, { min: 0, minExclusivo: true })
  return {
    valor: erro ? undefined : total,
    erros: { horas: erro, minutos: null },
  }
}

/** Combustível e manutenção do carro em uso entram sempre na conta. */
const CAMPOS_DA_CONTA: CampoNumerico[] = [
  'consumoKmPorLitro',
  'precoCombustivel',
  'manutencaoPorKm',
]

interface AvulsaProps {
  parametros: Parametros
  /** Campo em vermelho que entra na conta deixa o resultado zerado, em cinza. */
  camposComErro: CamposComErro
}

export function Avulsa({ parametros, camposComErro }: AvulsaProps) {
  const [brutoTexto, setBrutoTexto] = useState('')
  const [kmTexto, setKmTexto] = useState('')
  const [horasTexto, setHorasTexto] = useState<TextoHoras>({
    horas: '',
    minutos: '',
  })
  const bruto = interpretar(brutoTexto, FORMATO_REAIS, { min: 0 })
  const km = interpretar(kmTexto, FORMATO_KM, { min: 0, minExclusivo: true })
  const horas = interpretarHoras(horasTexto)
  const kmEstimado = km.valor === undefined
  const horasEstimadas = horas.valor === undefined
  // Só em branco: com erro, a parte vazia vale zero e não mostra a estimativa.
  const horasEmBranco =
    horasEstimadas && !horas.erros.horas && !horas.erros.minutos
  // Sem o km, ele é estimado pelo valor por km da Rotina, que passa a contar.
  const abasComErro = camposComErro.abasComErro(
    ...CAMPOS_DA_CONTA,
    ...(kmEstimado ? (['valorPorKm'] as const) : []),
  )
  // As horas não entram na sobra: com erro nelas, o resultado segue com as estimadas.
  const calculado =
    bruto.valor === undefined || km.erro
      ? null
      : calcularAvulsa(parametros, {
          faturamentoBruto: bruto.valor,
          km: km.valor,
          horas: horas.valor,
        })
  const resultado =
    calculado && abasComErro.length > 0
      ? { ...RESULTADO_ZERADO, kmEstimado, horasEstimadas }
      : calculado
  // Sem as horas, elas são estimadas pelo faturamento por hora da Rotina.
  const horasPendentes = camposComErro.algumComErro('kmPorHora', 'valorPorKm')
  const mediaPorHora = faturamentoPorHora(parametros)
  // Com o km ou as horas informados, a dica mostra quanto o motorista fez por unidade.
  const dicaKm =
    calculado && !calculado.kmEstimado ? (
      <Rendimento
        feito={calculado.faturamentoPorKm}
        media={parametros.valorPorKm}
        unidade="km"
      />
    ) : (
      `Em branco, o km é estimado pelo valor por km (${formatarMoeda(parametros.valorPorKm)}).`
    )
  const dicaHoras =
    calculado && !calculado.horasEstimadas ? (
      <Rendimento
        feito={calculado.faturamentoPorHora}
        media={mediaPorHora}
        unidade="hora"
      />
    ) : (
      `Em branco, as horas são estimadas pelo faturamento por hora (${formatarMoeda(mediaPorHora)}).`
    )
  const rotuloPagamento = ROTULOS_PAGAMENTO[parametros.pagamentoDoCarro]
  const aluguel = parametros.pagamentoDoCarro === 'aluguel'
  // Os custos fixos aparecem cheios: o bruto pode ser de um dia, de uma semana ou do mês.
  const abasDosFixos = camposComErro.abasComErro(
    'seguroAnual',
    'ipvaAnual',
    aluguel ? 'aluguelSemanal' : 'financiamentoMensal',
  )

  // Em tela larga, o resultado aparece à direita do formulário.
  return (
    <div className="space-y-4 largo:grid largo:grid-cols-2 largo:items-start largo:gap-4 largo:space-y-0">
      <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h2 className="font-semibold">Quanto você fez?</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Veja quanto do bruto separar para o combustível e para a manutenção.
        </p>
        <div className="mt-4 space-y-3">
          <Campo
            rotulo="Faturamento bruto"
            prefixo="R$"
            placeholder="0,00"
            formato={FORMATO_REAIS}
            valor={brutoTexto}
            onChange={setBrutoTexto}
            erro={bruto.erro}
            zeravel
          />
          <Campo
            rotulo="Km rodados (opcional)"
            sufixo="km"
            placeholder={
              resultado?.kmEstimado ? formatarNumero(resultado.km) : undefined
            }
            formato={FORMATO_KM}
            valor={kmTexto}
            onChange={setKmTexto}
            erro={km.erro}
            dica={dicaKm}
            zeravel
          />
          <CampoHorasOpcional
            rotulo="Horas trabalhadas (opcional)"
            valor={horasTexto}
            onChange={setHorasTexto}
            estimativa={
              calculado && horasEmBranco
                ? horasPendentes
                  ? 0
                  : calculado.horas
                : undefined
            }
            erros={horas.erros}
            dica={dicaHoras}
          />
        </div>
      </section>

      {resultado ? (
        // Em tela larga, a coluna da direita termina na altura do formulário: o card
        // dos custos fixos ocupa o espaço que sobra abaixo do resultado.
        <div className="largo:flex largo:flex-col largo:gap-4 largo:self-stretch">
          <Resultado
            resultado={resultado}
            rotuloPagamento={rotuloPagamento}
            abasComErro={abasComErro}
          />
          <CustosFixos
            itens={[
              {
                rotulo: 'Seguro',
                valor: parametros.seguroAnual,
                periodo: 'ano',
              },
              { rotulo: 'IPVA', valor: parametros.ipvaAnual, periodo: 'ano' },
              aluguel
                ? {
                    rotulo: rotuloPagamento,
                    valor: parametros.aluguelSemanal,
                    periodo: 'semana',
                  }
                : {
                    rotulo: rotuloPagamento,
                    valor: parametros.financiamentoMensal,
                    periodo: 'mês',
                  },
            ]}
            abasComErro={abasDosFixos}
          />
        </div>
      ) : (
        // Em tela larga, o aviso vira um card quase transparente no lugar do resultado.
        <p className="px-6 text-center text-sm text-slate-500 largo:flex largo:items-center largo:justify-center largo:self-stretch largo:rounded-3xl largo:bg-white/40 dark:text-slate-400 dark:largo:bg-slate-900/40">
          Digite o faturamento bruto para ver quanto separar.
        </p>
      )}
    </div>
  )
}

/** Em centavos, para a cor seguir o que aparece na tela (R$ 1,699 e R$ 1,70 empatam). */
function emCentavos(valor: number): number {
  return Math.round(valor * 100)
}

interface RendimentoProps {
  /** Faturamento por km ou por hora alcançado com o que foi informado. */
  feito: number
  /** A mesma média, tirada da Rotina. */
  media: number
  unidade: 'km' | 'hora'
}

/** "Você fez R$ 1,88 por km; a média da Rotina é R$ 1,70.", com o valor em verde ou vermelho. */
function Rendimento({ feito, media, unidade }: RendimentoProps) {
  // Igual à média já conta como bom: verde.
  const abaixoDaMedia = emCentavos(feito) < emCentavos(media)
  return (
    <>
      Você fez{' '}
      <strong
        className={`font-semibold ${abaixoDaMedia ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}
      >
        {formatarMoeda(feito)}
      </strong>{' '}
      por {unidade}; a média da Rotina é {formatarMoeda(media)}.
    </>
  )
}

/** O resultado com algum campo da conta em vermelho: tudo zerado. */
const RESULTADO_ZERADO: ResultadoAvulsa = {
  km: 0,
  kmEstimado: false,
  horas: 0,
  horasEstimadas: false,
  faturamentoBruto: 0,
  faturamentoPorKm: 0,
  faturamentoPorHora: 0,
  combustivel: 0,
  faturamentoLiquido: 0,
  manutencao: 0,
  faturamentoResponsavel: 0,
}

const COR_PENDENTE = 'text-slate-400 dark:text-slate-500'

interface ResultadoProps {
  resultado: ResultadoAvulsa
  /** "Financiamento" ou "Aluguel", conforme o pagamento do carro. */
  rotuloPagamento: string
  /** Abas com campo da conta em vermelho: o resultado fica em cinza e aponta para elas. */
  abasComErro: AbaComErro[]
}

function Resultado({
  resultado: r,
  rotuloPagamento,
  abasComErro,
}: ResultadoProps) {
  const pendente = abasComErro.length > 0
  const corDaSobra = pendente
    ? 'bg-slate-500 dark:bg-slate-700'
    : r.faturamentoResponsavel < 0
      ? 'bg-rose-600'
      : 'bg-emerald-700'
  const fracaoDoBruto = (valor: number) =>
    r.faturamentoBruto > 0
      ? formatarPercentual(valor / r.faturamentoBruto)
      : null

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="space-y-2">
        <Reserva
          Icone={Fuel}
          rotulo="Separe para o combustível"
          valor={r.combustivel}
          fracao={fracaoDoBruto(r.combustivel)}
          pendente={pendente}
        />
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {formatarNumero(r.km)} km {r.kmEstimado ? 'estimados' : 'informados'}{' '}
          · faturamento líquido de{' '}
          {/* Sempre em verde, mesmo negativo; em cinza só com campo da conta em vermelho. */}
          <strong
            className={`font-semibold ${pendente ? COR_PENDENTE : 'text-emerald-700 dark:text-emerald-400'}`}
          >
            {formatarMoeda(r.faturamentoLiquido)}
          </strong>
        </p>
        <Reserva
          Icone={Wrench}
          rotulo="Separe para a manutenção"
          valor={r.manutencao}
          fracao={fracaoDoBruto(r.manutencao)}
          pendente={pendente}
        />
      </div>

      <div className={`mt-3 rounded-2xl p-4 text-white ${corDaSobra}`}>
        {/* No celular, tudo numa linha: Sobra, o valor e a porcentagem. Em tela larga,
            o valor desce para baixo do nome e da porcentagem. */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 largo:grid-cols-2">
          <span className="text-sm text-white/80">Sobra</span>
          <p className="text-center text-2xl font-bold tracking-tight tabular-nums largo:order-last largo:col-span-2 largo:mt-1 largo:text-left largo:text-3xl">
            {formatarMoeda(r.faturamentoResponsavel)}
          </p>
          <span className="text-right text-lg font-semibold text-white/90 tabular-nums largo:text-2xl">
            {fracaoDoBruto(r.faturamentoResponsavel)}
          </span>
        </div>
        <p
          className="mt-1 text-xs text-white/80"
          role={pendente ? 'status' : undefined}
        >
          {pendente ? (
            <AvisoCamposEmVermelho abas={abasComErro} />
          ) : (
            `Antes de seguro, IPVA e ${rotuloPagamento.toLowerCase()}.`
          )}
        </p>
      </div>
    </section>
  )
}

interface ItemDeCusto {
  rotulo: string
  valor: number
  periodo: 'semana' | 'mês' | 'ano'
}

interface CustosFixosProps {
  itens: ItemDeCusto[]
  /** Abas com campo dos custos em vermelho: o card aponta para elas no lugar dos valores. */
  abasComErro: AbaComErro[]
}

/**
 * Seguro, IPVA e financiamento ou aluguel, cheios, como estão em Meu carro: o bruto
 * pode ser de qualquer período, então não dá para saber quanto deles tirar. Só em
 * tela larga, num cinza quase transparente, no espaço entre o resultado e a altura do formulário;
 * por isso, linhas e margens justas, para caber nos 45 px que sobram.
 */
function CustosFixos({ itens, abasComErro }: CustosFixosProps) {
  const pendente = abasComErro.length > 0

  return (
    <div className="hidden rounded-3xl bg-slate-400/10 px-4 py-1.5 text-slate-700 largo:flex largo:flex-1 largo:flex-col largo:justify-center dark:bg-slate-400/10 dark:text-slate-200">
      {pendente ? (
        <p className="text-xs text-slate-500 dark:text-slate-400" role="status">
          <AvisoCamposEmVermelho abas={abasComErro} />
        </p>
      ) : (
        <dl className="grid grid-cols-3 gap-3">
          {itens.map((item) => (
            <div key={item.rotulo} className="min-w-0">
              <dt className="text-xs leading-4 text-slate-500 dark:text-slate-400">
                {item.rotulo}
              </dt>
              <dd className="text-sm leading-4 font-semibold whitespace-nowrap tabular-nums">
                {formatarMoeda(item.valor)}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  /{item.periodo}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

interface ReservaProps {
  Icone: LucideIcon
  rotulo: string
  valor: number
  fracao: string | null
  pendente: boolean
}

function Reserva({ Icone, rotulo, valor, fracao, pendente }: ReservaProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${pendente ? `bg-slate-200 dark:bg-slate-700/60 ${COR_PENDENTE}` : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}
      >
        <Icone className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700 dark:text-slate-200">{rotulo}</p>
        {fracao && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {fracao} do bruto
          </p>
        )}
      </div>
      <p
        className={`text-lg font-semibold tabular-nums ${pendente ? COR_PENDENTE : ''}`}
      >
        {formatarMoeda(valor)}
      </p>
    </div>
  )
}
