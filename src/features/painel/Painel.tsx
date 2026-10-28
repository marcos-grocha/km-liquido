import { useState } from 'react'
import {
  PERIODOS,
  type Periodo,
  type Projecao,
  type ResultadoPeriodo,
} from '../../core/calculo'
import type { Parametros } from '../../core/parametros'
import { formatarHoras, formatarMoeda, formatarNumero } from '../../lib/numero'

const ROTULOS: Record<Periodo, string> = {
  hora: 'Hora',
  dia: 'Dia',
  semana: 'Semana',
  mes: 'Mês',
  ano: 'Ano',
}

interface PainelProps {
  projecao: Projecao
  parametros: Parametros
}

export function Painel({ projecao, parametros }: PainelProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const { hora, mes, ano } = projecao.periodos

  return (
    <div className="space-y-4">
      <section
        className={`rounded-3xl p-5 text-white shadow-lg ${mes.lucro < 0 ? 'bg-rose-600' : 'bg-emerald-700'}`}
      >
        <h2 className="text-sm font-medium text-white/80">
          Lucro real por mês
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
          {formatarMoeda(mes.lucro)}
        </p>
        <p className="mt-2 text-sm text-white/80">
          {formatarMoeda(ano.lucro)} por ano ·{' '}
          {formatarHoras(parametros.horasPorMes)} por mês
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Indicador
          titulo="Hora líquida"
          valor={hora.lucro}
          bruto={projecao.faturamentoPorHora}
        />
        <Indicador
          titulo="KM líquido"
          valor={projecao.kmLiquido}
          bruto={parametros.valorPorKm}
        />
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
        <Demonstrativo resultado={projecao.periodos[periodo]} />
      </section>
    </div>
  )
}

interface IndicadorProps {
  titulo: string
  valor: number
  bruto: number
}

function Indicador({ titulo, valor, bruto }: IndicadorProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{titulo}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${valor < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}
      >
        {formatarMoeda(valor)}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        de {formatarMoeda(bruto)} bruto
      </p>
    </div>
  )
}

interface SeletorPeriodoProps {
  valor: Periodo
  onChange: (periodo: Periodo) => void
}

function SeletorPeriodo({ valor, onChange }: SeletorPeriodoProps) {
  return (
    <div
      role="group"
      aria-label="Período"
      className="grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
    >
      {PERIODOS.map((periodo) => (
        <button
          key={periodo}
          type="button"
          aria-pressed={periodo === valor}
          onClick={() => onChange(periodo)}
          className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${periodo === valor ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          {ROTULOS[periodo]}
        </button>
      ))}
    </div>
  )
}

function Demonstrativo({ resultado: r }: { resultado: ResultadoPeriodo }) {
  return (
    <>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {formatarHoras(r.horas)} de trabalho · {formatarNumero(r.km)} km rodados
      </p>
      <dl className="mt-2 text-sm">
        <Linha rotulo="Faturamento bruto" valor={r.faturamentoBruto} />
        <Linha rotulo="Combustível" valor={r.combustivel} tipo="custo" />
        <Linha
          rotulo="Faturamento líquido"
          valor={r.faturamentoLiquido}
          tipo="subtotal"
        />
        <Linha rotulo="Manutenção" valor={r.manutencao} tipo="custo" />
        <Linha rotulo="Seguro" valor={r.seguro} tipo="custo" />
        <Linha rotulo="IPVA" valor={r.ipva} tipo="custo" />
        <Linha
          rotulo="Faturamento responsável"
          valor={r.faturamentoResponsavel}
          tipo="subtotal"
        />
        <Linha rotulo="Financiamento" valor={r.financiamento} tipo="custo" />
        <Linha rotulo="Lucro real" valor={r.lucro} tipo="total" />
      </dl>
    </>
  )
}

interface LinhaProps {
  rotulo: string
  valor: number
  tipo?: 'receita' | 'custo' | 'subtotal' | 'total'
}

function Linha({ rotulo, valor, tipo = 'receita' }: LinhaProps) {
  const estilos = {
    receita: 'py-2 font-medium',
    custo: 'py-1.5 text-slate-500 dark:text-slate-400',
    subtotal:
      'mt-1 border-t border-slate-200 py-2 font-semibold dark:border-slate-700',
    total: `mt-1 border-t-2 border-slate-900 pt-3 text-base font-bold dark:border-slate-100 ${valor < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`,
  }
  const sinal = tipo === 'custo' ? '− ' : ''

  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${estilos[tipo]}`}
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
