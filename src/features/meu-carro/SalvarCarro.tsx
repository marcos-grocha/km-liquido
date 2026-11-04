import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ROTULOS_CARRO, type IndiceCarro } from '../../core/ajustes'

interface SalvarCarroProps {
  aberto: boolean
  /** Nome do carro guardado hoje em cada posição. */
  nomes: [string, string]
  carroAtivo: IndiceCarro
  onEscolher: (destino: IndiceCarro) => void
  onFechar: () => void
}

/** Pop-up que pergunta em qual posição, Principal ou Secundário, guardar o carro. */
export function SalvarCarro({
  aberto,
  nomes,
  carroAtivo,
  onEscolher,
  onFechar,
}: SalvarCarroProps) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (aberto && !el.open) el.showModal()
    if (!aberto && el.open) el.close()
  }, [aberto])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="salvar-carro-titulo"
      onClose={onFechar}
      // Um toque no fundo escurecido, fora do cartão, também fecha.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-xs rounded-3xl bg-white text-slate-900 shadow-xl backdrop:bg-slate-950/75 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="relative p-5">
        <h2
          id="salvar-carro-titulo"
          className="pr-8 text-lg font-bold tracking-tight"
        >
          Salvar como
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Escolha onde guardar este carro.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {([0, 1] as const).map((indice) => (
            <button
              key={indice}
              type="button"
              onClick={() => onEscolher(indice)}
              className="rounded-2xl border border-slate-300 p-3 text-left hover:border-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-950/60"
            >
              <span className="block font-semibold">
                {ROTULOS_CARRO[indice]}
              </span>
              <span className="block text-xs break-words text-slate-500 dark:text-slate-400">
                {indice === carroAtivo
                  ? 'Em uso'
                  : `Substitui ${nomes[indice].trim() || 'o carro sem nome'}`}
              </span>
            </button>
          ))}
        </div>

        {/* Fica por último no DOM para o pop-up abrir com o foco no Principal, não no X. */}
        <button
          type="button"
          onClick={() => dialogo.current?.close()}
          aria-label="Fechar"
          className="absolute top-4.5 right-3.5 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
    </dialog>
  )
}
