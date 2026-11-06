import { RotateCcw } from 'lucide-react'

interface RestaurarPadraoProps {
  /** Pergunta feita antes de restaurar, dizendo o que será substituído. */
  confirmacao: string
  onRestaurar: () => void
}

/** Botão do fim de uma tela de ajustes que volta os valores dela ao padrão. */
export function RestaurarPadrao({
  confirmacao,
  onRestaurar,
}: RestaurarPadraoProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <button
        type="button"
        onClick={() => {
          if (window.confirm(confirmacao)) onRestaurar()
        }}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <RotateCcw className="size-4" aria-hidden />
        Restaurar valores padrão
      </button>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Os dados ficam salvos só neste aparelho.
      </p>
    </div>
  )
}
