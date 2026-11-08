import type { ReactNode } from 'react'

interface SecaoProps {
  titulo: string
  /** Controle que fica ao lado do título. */
  acao?: ReactNode
  /** Classes extras da grade de campos. */
  classeGrade?: string
  children: ReactNode
}

/** Card de uma tela de ajustes: título e campos em duas colunas, com os resumos entre eles. */
export function Secao({
  titulo,
  acao,
  classeGrade = '',
  children,
}: SecaoProps) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{titulo}</h2>
        {acao}
      </div>
      <div className={`mt-3 grid grid-cols-2 gap-3 ${classeGrade}`}>
        {children}
      </div>
    </section>
  )
}

/** Mensagem ao lado do valor de um resumo, que pinta o balão de amarelo ou vermelho. */
export interface AlertaResumo {
  nivel: 'atencao' | 'erro'
  mensagem: string
}

const CORES_RESUMO = {
  normal:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  atencao:
    'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  erro: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
}

/** Valor calculado a partir dos campos, em destaque. */
export function Resumo({
  className,
  alerta,
  children,
}: {
  className: string
  alerta?: AlertaResumo | null
  children: ReactNode
}) {
  // A mensagem fica na mesma linha, encostada à direita; em tela estreita, ela
  // quebra em duas linhas ali mesmo, sem descer para baixo do valor.
  return (
    <p
      className={`flex items-center justify-between gap-x-2 rounded-xl px-3 py-2 text-sm font-medium tabular-nums ${CORES_RESUMO[alerta?.nivel ?? 'normal']} ${className}`}
    >
      <span className={alerta ? 'shrink-0' : undefined}>{children}</span>
      {alerta && (
        <span
          role={alerta.nivel === 'erro' ? 'alert' : 'status'}
          className="min-w-0 text-right text-xs leading-tight font-normal text-balance"
        >
          {alerta.mensagem}
        </span>
      )}
    </p>
  )
}
