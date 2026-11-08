import { useState } from 'react'
import { AvisoCamposEmVermelho } from '../../components/AvisoCamposEmVermelho'
import { Segmentado } from '../../components/Segmentado'
import type { CamposComErro } from '../../components/useCamposComErro'
import {
  PERIODOS,
  type Periodo,
  type Projecao,
  type ResultadoPeriodo,
} from '../../core/calculo'
import {
  CAMPOS_NUMERICOS,
  ROTULOS_PAGAMENTO,
  type Parametros,
} from '../../core/parametros'
import { formatarHoras, formatarMoeda, formatarNumero } from '../../lib/numero'

const ROTULOS: Record<Periodo, string> = {
  hora: 'Hora',
  dia: 'Dia',
  semana: 'Semana',
  mes: 'Mês',
  ano: 'Ano',
}

const OPCOES_PERIODO = PERIODOS.map((periodo) => ({
  valor: periodo,
  rotulo: ROTULOS[periodo],
}))

/** O que o Painel mostra com algum campo em vermelho: tudo zerado, em cinza. */
const PERIODO_ZERADO: ResultadoPeriodo = {
  horas: 0,
  km: 0,
  faturamentoBruto: 0,
  combustivel: 0,
  faturamentoLiquido: 0,
  manutencao: 0,
  seguro: 0,
  ipva: 0,
  totalCustos: 0,
  faturamentoResponsavel: 0,
  financiamentoOuAluguel: 0,
  lucro: 0,
}

interface PainelProps {
  projecao: Projecao
  parametros: Parametros
  /** Qualquer campo em vermelho em Meu carro e Rotina deixa o Painel pendente. */
  camposComErro: CamposComErro
}

export function Painel({ projecao, parametros, camposComErro }: PainelProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const abasComErro = camposComErro.abasComErro(...CAMPOS_NUMERICOS)
  const pendente = abasComErro.length > 0
  const zerado = (valor: number) => (pendente ? 0 : valor)
  const resultado = (p: Periodo) =>
    pendente ? PERIODO_ZERADO : projecao.periodos[p]
  const [hora, mes, ano] = [
    resultado('hora'),
    resultado('mes'),
    resultado('ano'),
  ]
  const corDoLucro = pendente
    ? 'bg-slate-500 dark:bg-slate-700'
    : mes.lucro < 0
      ? 'bg-rose-600'
      : 'bg-emerald-700'

  // Em tela larga, os três cards de cima se empilham numa coluna estreita e o
  // demonstrativo vai para a direita.
  return (
    <div className="space-y-4 largo:grid largo:grid-cols-5 largo:items-start largo:gap-4 largo:space-y-0">
      <div className="space-y-4 largo:col-span-2">
        <section
          className={`rounded-3xl p-5 text-white shadow-lg ${corDoLucro}`}
        >
          <h2 className="text-sm font-medium text-white/80">
            Lucro real por mês
          </h2>
          <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
            {formatarMoeda(mes.lucro)}
          </p>
          <p
            className="mt-2 text-sm text-white/80"
            role={pendente ? 'status' : undefined}
          >
            {pendente ? (
              <AvisoCamposEmVermelho abas={abasComErro} />
            ) : (
              `${formatarMoeda(ano.lucro)} por ano · ${formatarHoras(mes.horas)} por mês`
            )}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 largo:grid-cols-1 largo:gap-4">
          <Indicador
            titulo="Hora líquida"
            valor={hora.lucro}
            bruto={zerado(projecao.faturamentoPorHora)}
            pendente={pendente}
          />
          <Indicador
            titulo="KM líquido"
            valor={zerado(projecao.kmLiquido)}
            bruto={zerado(parametros.valorPorKm)}
            pendente={pendente}
          />
        </div>
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-sm largo:col-span-3 dark:bg-slate-900">
        <Segmentado
          rotulo="Período"
          opcoes={OPCOES_PERIODO}
          valor={periodo}
          onChange={setPeriodo}
        />
        <Demonstrativo
          resultado={resultado(periodo)}
          rotuloPagamento={ROTULOS_PAGAMENTO[parametros.pagamentoDoCarro]}
          pendente={pendente}
        />
      </section>
    </div>
  )
}

const COR_PENDENTE = 'text-slate-400 dark:text-slate-500'

interface IndicadorProps {
  titulo: string
  valor: number
  bruto: number
  pendente: boolean
}

function Indicador({ titulo, valor, bruto, pendente }: IndicadorProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{titulo}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${pendente ? COR_PENDENTE : valor < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}
      >
        {formatarMoeda(valor)}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        de {formatarMoeda(bruto)} bruto
      </p>
    </div>
  )
}

interface DemonstrativoProps {
  resultado: ResultadoPeriodo
  /** "Financiamento" ou "Aluguel", conforme o pagamento do carro. */
  rotuloPagamento: string
  /** Algum campo em vermelho: os valores vêm zerados e ficam em cinza. */
  pendente: boolean
}

function Demonstrativo({
  resultado: r,
  rotuloPagamento,
  pendente,
}: DemonstrativoProps) {
  return (
    <>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {formatarHoras(r.horas)} de trabalho · {formatarNumero(r.km)} km rodados
      </p>
      <dl className="mt-2 text-sm">
        <Linha
          pendente={pendente}
          rotulo="Faturamento bruto"
          valor={r.faturamentoBruto}
        />
        <Linha
          pendente={pendente}
          rotulo="Combustível"
          valor={r.combustivel}
          tipo="custo"
        />
        <Linha
          pendente={pendente}
          rotulo="Faturamento líquido"
          valor={r.faturamentoLiquido}
          tipo="subtotal"
        />
        <Linha
          pendente={pendente}
          rotulo="Manutenção"
          valor={r.manutencao}
          tipo="custo"
        />
        <Linha
          pendente={pendente}
          rotulo="Seguro"
          valor={r.seguro}
          tipo="custo"
        />
        <Linha pendente={pendente} rotulo="IPVA" valor={r.ipva} tipo="custo" />
        <Linha
          pendente={pendente}
          rotulo="Faturamento responsável"
          valor={r.faturamentoResponsavel}
          tipo="subtotal"
        />
        <Linha
          pendente={pendente}
          rotulo={rotuloPagamento}
          valor={r.financiamentoOuAluguel}
          tipo="custo"
        />
        <Linha
          pendente={pendente}
          rotulo="Lucro real"
          valor={r.lucro}
          tipo="total"
        />
      </dl>
    </>
  )
}

interface LinhaProps {
  rotulo: string
  valor: number
  tipo?: 'receita' | 'custo' | 'subtotal' | 'total'
  /** Algum campo em vermelho: a linha fica em cinza. */
  pendente: boolean
}

function Linha({ rotulo, valor, tipo = 'receita', pendente }: LinhaProps) {
  const estilos = {
    receita: 'py-2 font-medium',
    custo: 'py-1.5 text-slate-500 dark:text-slate-400',
    subtotal:
      'mt-1 border-t border-slate-200 py-2 font-semibold dark:border-slate-700',
    total: `mt-1 border-t-2 border-slate-900 pt-3 text-base font-bold dark:border-slate-100 ${valor < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`,
  }
  const pendentes = {
    receita: `py-2 font-medium ${COR_PENDENTE}`,
    custo: `py-1.5 ${COR_PENDENTE}`,
    subtotal: `mt-1 border-t border-slate-200 py-2 font-semibold dark:border-slate-700 ${COR_PENDENTE}`,
    total: `mt-1 border-t-2 border-slate-300 pt-3 text-base font-bold dark:border-slate-700 ${COR_PENDENTE}`,
  }
  const sinal = tipo === 'custo' ? '− ' : ''

  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${(pendente ? pendentes : estilos)[tipo]}`}
    >
      <dt>
        {sinal}
        {rotulo}
      </dt>
      <dd className="tabular-nums">
        {sinal}
        {formatarMoeda(valor)}
      </dd>
    </div>
  )
}
