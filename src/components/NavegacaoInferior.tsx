import { Calculator, Car, LayoutDashboard, type LucideIcon } from 'lucide-react'

export type Aba = 'carro' | 'painel' | 'avulsa'

const ABAS: { id: Aba; rotulo: string; Icone: LucideIcon }[] = [
  { id: 'carro', rotulo: 'Meu carro', Icone: Car },
  { id: 'painel', rotulo: 'Painel', Icone: LayoutDashboard },
  { id: 'avulsa', rotulo: 'Quanto sobrou', Icone: Calculator },
]

interface NavegacaoInferiorProps {
  aba: Aba
  onChange: (aba: Aba) => void
}

export function NavegacaoInferior({ aba, onChange }: NavegacaoInferiorProps) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="mx-auto grid max-w-md auto-cols-fr grid-flow-col">
        {ABAS.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            aria-current={id === aba ? 'page' : undefined}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 pt-2.5 pb-2 text-xs font-medium transition-colors ${id === aba ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            <Icone className="size-6" aria-hidden />
            {rotulo}
          </button>
        ))}
      </div>
    </nav>
  )
}
