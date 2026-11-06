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

/** Valor calculado a partir dos campos, em destaque. */
export function Resumo({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <p
      className={`rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 tabular-nums dark:bg-emerald-950/60 dark:text-emerald-300 ${className}`}
    >
      {children}
    </p>
  )
}
