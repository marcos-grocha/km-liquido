import { Fuel, Wrench, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { AvisoCamposEmVermelho } from '../../components/AvisoCamposEmVermelho'
import { Campo } from '../../components/Campo'
import type {
  AbaComErro,
  CamposComErro,
} from '../../components/useCamposComErro'
import { calcularAvulsa, type ResultadoAvulsa } from '../../core/calculo'
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
  const bruto = interpretar(brutoTexto, FORMATO_REAIS, { min: 0 })
  const km = interpretar(kmTexto, FORMATO_KM, { min: 0, minExclusivo: true })
  const kmEstimado = km.valor === undefined
  // Sem o km, ele é estimado pelo valor por km da Rotina, que passa a contar.
  const abasComErro = camposComErro.abasComErro(
    ...CAMPOS_DA_CONTA,
    ...(kmEstimado ? (['valorPorKm'] as const) : []),
  )
  const resultado =
    bruto.valor === undefined || km.erro
      ? null
      : abasComErro.length > 0
        ? { ...RESULTADO_ZERADO, kmEstimado }
        : calcularAvulsa(parametros, {
            faturamentoBruto: bruto.valor,
            km: km.valor,
          })

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
            dica={`Em branco, o km é estimado pelo valor por km (${formatarMoeda(parametros.valorPorKm)}).`}
          />
        </div>
      </section>

      {resultado ? (
        <Resultado
          resultado={resultado}
          rotuloPagamento={ROTULOS_PAGAMENTO[parametros.pagamentoDoCarro]}
          abasComErro={abasComErro}
        />
      ) : (
        // Em tela larga, o aviso vira um card quase transparente no lugar do resultado.
        <p className="px-6 text-center text-sm text-slate-500 largo:flex largo:items-center largo:justify-center largo:self-stretch largo:rounded-3xl largo:bg-white/40 dark:text-slate-400 dark:largo:bg-slate-900/40">
          Digite o faturamento bruto para ver quanto separar.
        </p>
      )}
    </div>
  )
}

/** O resultado com algum campo da conta em vermelho: tudo zerado. */
const RESULTADO_ZERADO: ResultadoAvulsa = {
  km: 0,
  kmEstimado: false,
  faturamentoBruto: 0,
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
        <Reserva
          Icone={Wrench}
          rotulo="Separe para a manutenção"
          valor={r.manutencao}
          fracao={fracaoDoBruto(r.manutencao)}
          pendente={pendente}
        />
      </div>

      <div className={`mt-3 rounded-2xl p-4 text-white ${corDaSobra}`}>
        <p className="flex justify-between text-sm text-white/80">
          <span>Sobra</span>
          <span>{fracaoDoBruto(r.faturamentoResponsavel)}</span>
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {formatarMoeda(r.faturamentoResponsavel)}
        </p>
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

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        {formatarNumero(r.km)} km {r.kmEstimado ? 'estimados' : 'informados'} ·
        faturamento líquido de {formatarMoeda(r.faturamentoLiquido)}
      </p>
    </section>
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
