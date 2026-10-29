import { Car, Heart } from 'lucide-react'

interface CabecalhoProps {
  carro: string
  onApoiar: () => void
}

export function Cabecalho({ carro, onApoiar }: CabecalhoProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      <div className="flex shrink-0 items-center gap-2">
        <img src="/favicon.svg" alt="" className="size-8" />
        <h1 className="text-lg font-bold tracking-tight">km líquido</h1>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {carro.trim() && (
          <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            <Car className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{carro}</span>
          </span>
        )}
        <button
          type="button"
          onClick={onApoiar}
          aria-label="Apoiar o projeto"
          title="Apoiar o projeto"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-rose-500 shadow-sm hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-slate-800"
        >
          <Heart className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  )
}
