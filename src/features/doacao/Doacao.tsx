import { Check, Copy, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'

// A chave Pix é o celular do projeto, o mesmo número do WhatsApp.
const CHAVE_PIX = '79999630944'
const CHAVE_PIX_NA_TELA = '(79) 99963-0944'
const WHATSAPP = `https://wa.me/5579999630944?text=${encodeURIComponent('Olá! Sobre o km líquido: ')}`

interface DoacaoProps {
  aberta: boolean
  onFechar: () => void
  /** O coração do cabeçalho, para onde o pop-up volta ao fechar. */
  coracao: RefObject<HTMLButtonElement | null>
}

export function Doacao({ aberta, onFechar, coracao }: DoacaoProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const chave = useRef<HTMLParagraphElement>(null)
  const [copiada, setCopiada] = useState(false)

  // O <dialog> modal nativo cuida do foco, do Esc e de deixar o fundo inerte.
  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (aberta && !el.open) el.showModal()
    if (!aberta && el.open) el.close()
  }, [aberta])

  // Ao fechar, o cartão encolhe até o coração do cabeçalho, que pulsa ao recebê-lo:
  // assim a pessoa vê onde o pop-up fica guardado.
  function fechar() {
    const el = dialogo.current
    if (!el || el.hasAttribute('data-fechando')) return
    const destino = coracao.current
    if (
      !destino ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.close()
      return
    }

    const de = el.getBoundingClientRect()
    const para = destino.getBoundingClientRect()
    const dx = para.x + para.width / 2 - (de.x + de.width / 2)
    const dy = para.y + para.height / 2 - (de.y + de.height / 2)
    const escala = para.width / de.width

    el.toggleAttribute('data-fechando', true)
    const voo = el.animate(
      [
        { transform: 'none', opacity: 1 },
        { opacity: 1, offset: 0.7 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${escala})`,
          opacity: 0,
        },
      ],
      { duration: 400, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    )
    voo.onfinish = () => {
      el.close()
      voo.cancel()
      el.toggleAttribute('data-fechando', false)
      destino.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.3)' },
          { transform: 'scale(1)' },
        ],
        { duration: 300, easing: 'ease-out' },
      )
    }
  }

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX)
      setCopiada(true)
      setTimeout(() => setCopiada(false), 2000)
    } catch {
      // Sem acesso à área de transferência: deixa a chave selecionada para copiar à mão.
      if (chave.current) window.getSelection()?.selectAllChildren(chave.current)
    }
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="doacao-titulo"
      aria-describedby="doacao-texto"
      onClose={onFechar}
      // Esc ou o "voltar" do celular também fecham voltando para o coração, quando o
      // navegador deixa segurar o fechamento.
      onCancel={(e) => {
        if (!e.cancelable) return
        e.preventDefault()
        fechar()
      }}
      // Um toque no fundo escurecido, fora do cartão, também fecha.
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-white text-slate-900 shadow-xl backdrop:bg-slate-950/60 backdrop:transition-opacity backdrop:duration-400 data-fechando:backdrop:opacity-0 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="p-5">
        <div className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
          <Heart className="size-5" aria-hidden />
        </div>
        <h2
          id="doacao-titulo"
          className="mt-3 text-lg font-bold tracking-tight"
        >
          Esse app está te ajudando?
        </h2>
        <p
          id="doacao-texto"
          className="mt-1 text-sm text-slate-600 dark:text-slate-300"
        >
          Faça uma doação para ajudar a manter o projeto!
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chave Pix (celular)
            </p>
            <p ref={chave} className="font-semibold tabular-nums select-all">
              {CHAVE_PIX_NA_TELA}
            </p>
          </div>
          <button
            type="button"
            onClick={copiarChave}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            {copiada ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copiada ? 'Copiada!' : 'Copiar'}
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Para sugestões ou críticas, envie uma mensagem:
        </p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <MessageCircle className="size-4" aria-hidden />
          Mandar mensagem no WhatsApp
        </a>

        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={fechar}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Agora não
          </button>
        </div>
      </div>
    </dialog>
  )
}
