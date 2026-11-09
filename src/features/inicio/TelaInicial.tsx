interface TelaInicialProps {
  /** "Comece por aqui": vai para Meu carro. */
  onComecar: () => void
  /** "Ir para os resultados": vai para o Painel. */
  onResultados: () => void
}

/** Primeira tela a cada abertura do app, sem cabeçalho nem navegação. */
export function TelaInicial({ onComecar, onResultados }: TelaInicialProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-12 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-4">
        <img src="/favicon.svg" alt="" className="size-20" />
        <h1 className="text-4xl font-bold tracking-tight">km líquido</h1>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={onComecar}
          className="rounded-2xl bg-emerald-700 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          Comece por aqui
        </button>
        <button
          type="button"
          onClick={onResultados}
          className="rounded-2xl bg-white py-3.5 text-base font-semibold text-emerald-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-emerald-300 dark:ring-slate-800 dark:hover:bg-slate-800"
        >
          Ir para os resultados
        </button>
      </div>
    </main>
  )
}
