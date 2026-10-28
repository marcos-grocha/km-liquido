import { Fuel, Wrench, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Campo } from '../../components/Campo'
import { calcularAvulsa, type ResultadoAvulsa } from '../../core/calculo'
import {
  validarValor,
  type Parametros,
  type Restricao,
} from '../../core/parametros'
import {
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
  lerNumero,
} from '../../lib/numero'

/** Lê um campo opcional: em branco vira `undefined`, sem erro. */
function interpretar(texto: string, restricao: Restricao) {
  if (texto.trim() === '') return { valor: undefined, erro: null }
  const valor = lerNumero(texto)
  const erro =
    valor === null ? 'Informe um número.' : validarValor(valor, restricao)
  return { valor: erro ? undefined : (valor ?? undefined), erro }
}

export function Avulsa({ parametros }: { parametros: Parametros }) {
  const [brutoTexto, setBrutoTexto] = useState('')
  const [kmTexto, setKmTexto] = useState('')
  const bruto = interpretar(brutoTexto, { min: 0 })
  const km = interpretar(kmTexto, { min: 0, minExclusivo: true })
  const resultado =
    bruto.valor === undefined || km.erro
      ? null
      : calcularAvulsa(parametros, {
          faturamentoBruto: bruto.valor,
          km: km.valor,
        })

  return (
    <div className="space-y-4">
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
            valor={kmTexto}
            onChange={setKmTexto}
            erro={km.erro}
            dica={`Em branco, o km é estimado pelo valor por km (${formatarMoeda(parametros.valorPorKm)}).`}
          />
        </div>
      </section>

      {resultado ? (
        <Resultado resultado={resultado} />
      ) : (
        <p className="px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Digite o faturamento bruto para ver quanto separar.
        </p>
      )}
    </div>
  )
}

function Resultado({ resultado: r }: { resultado: ResultadoAvulsa }) {
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
        />
        <Reserva
          Icone={Wrench}
          rotulo="Separe para a manutenção"
          valor={r.manutencao}
          fracao={fracaoDoBruto(r.manutencao)}
        />
      </div>

      <div
        className={`mt-3 rounded-2xl p-4 text-white ${r.faturamentoResponsavel < 0 ? 'bg-rose-600' : 'bg-emerald-700'}`}
      >
        <p className="flex justify-between text-sm text-white/80">
          <span>Sobra</span>
          <span>{fracaoDoBruto(r.faturamentoResponsavel)}</span>
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {formatarMoeda(r.faturamentoResponsavel)}
        </p>
        <p className="mt-1 text-xs text-white/80">
          Antes de seguro, IPVA e financiamento.
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
}

function Reserva({ Icone, rotulo, valor, fracao }: ReservaProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
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
      <p className="text-lg font-semibold tabular-nums">
        {formatarMoeda(valor)}
      </p>
    </div>
  )
}
