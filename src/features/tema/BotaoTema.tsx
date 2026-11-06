import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTema } from './useTema'

/** Botão redondo do cabeçalho, do tamanho do coração, que troca entre o tema claro e o escuro. */
export function BotaoTema() {
  const [tema, alternar] = useTema()
  // Muda a cada clique para remontar o ícone e a onda e repetir a animação.
  const [cliques, setCliques] = useState(0)
  const rotulo = tema === 'escuro' ? 'Usar o tema claro' : 'Usar o tema escuro'
  const Icone = tema === 'escuro' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={() => {
        alternar()
        setCliques((n) => n + 1)
      }}
      aria-label={rotulo}
      title={rotulo}
      className="relative grid size-8 shrink-0 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition-transform duration-100 hover:bg-slate-50 active:scale-[0.88] motion-reduce:transition-none dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {cliques > 0 && (
        <span
          key={`onda-${cliques}`}
          aria-hidden
          className="animate-tema-onda pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-500 opacity-0 motion-reduce:hidden"
        />
      )}
      <Icone
        key={cliques}
        aria-hidden
        className={`size-4 ${cliques > 0 ? 'animate-tema-girar motion-reduce:animate-none' : ''}`}
      />
    </button>
  )
}
