import { ArrowRight, RotateCcw } from 'lucide-react'

interface RestaurarPadraoProps {
  /** Pergunta feita antes de restaurar, dizendo o que será substituído. */
  confirmacao: string
  onRestaurar: () => void
  /** Próxima aba, num botão pequeno ao lado: o nome dela e como ir até lá. */
  proxima?: { nome: string; onIr: () => void }
}

/**
 * Fim de uma tela de ajustes: o botão que volta os valores dela ao padrão e,
 * ao lado, o atalho para a próxima aba.
 */
export function RestaurarPadrao({
  confirmacao,
  onRestaurar,
  proxima,
}: RestaurarPadraoProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {/* O atalho fica no canto direito, fora do fluxo, para o Restaurar seguir centralizado. */}
      <div className="relative flex w-full justify-center">
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
        {proxima && (
          <button
            type="button"
            onClick={proxima.onIr}
            aria-label={`Ir para ${proxima.nome}`}
            title={`Ir para ${proxima.nome}`}
            className="absolute top-1/2 right-0 inline-flex size-7 -translate-y-1/2 items-center justify-center gap-1 rounded-full bg-white text-xs font-medium text-slate-900 shadow-sm largo:size-auto largo:bg-slate-100/60 largo:px-2.5 largo:py-1 largo:text-slate-500/80 largo:shadow-none largo:hover:text-slate-700 dark:bg-slate-700 dark:text-white dark:largo:bg-slate-800/60 dark:largo:text-slate-400/80 dark:largo:hover:text-slate-200"
          >
            {/*
              Cores do seletor (Principal/Secundário): no celular, como a opção
              escolhida; em tela larga, como a não escolhida, mais transparente.
              No celular, só a seta; em tela larga, o nome da aba também.
            */}
            <span className="hidden largo:inline">{proxima.nome}</span>
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Os dados ficam salvos só neste aparelho.
      </p>
    </div>
  )
}
