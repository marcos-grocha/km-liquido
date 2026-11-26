import { Eraser } from 'lucide-react'

interface BotaoZerarProps {
  /** Nome do campo, para o leitor de tela: "Zerar Faturamento bruto". */
  rotulo: string
  /** Campo já em branco: o botão fica apagado e não recebe clique. */
  desativado: boolean
  onClick: () => void
}

/** Botão quadrado com a borracha, ao lado do campo, da altura dele. */
export function BotaoZerar({ rotulo, desativado, onClick }: BotaoZerarProps) {
  return (
    <button
      type="button"
      aria-label={`Zerar ${rotulo}`}
      title="Zerar"
      disabled={desativado}
      onClick={onClick}
      className="grid w-[46px] shrink-0 place-items-center rounded-xl border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:text-slate-600"
    >
      <Eraser className="size-5" aria-hidden />
    </button>
  )
}
