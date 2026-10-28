import { Car } from 'lucide-react'

export function Cabecalho({ carro }: { carro: string }) {
  return (
    <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      <div className="flex items-center gap-2">
        <img src="/favicon.svg" alt="" className="size-8" />
        <h1 className="text-lg font-bold tracking-tight">km líquido</h1>
      </div>
      {carro.trim() && (
        <span className="flex max-w-[50%] items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <Car className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{carro}</span>
        </span>
      )}
    </header>
  )
}
