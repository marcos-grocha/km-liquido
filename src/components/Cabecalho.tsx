import { ArrowLeftRight, Car, Heart } from 'lucide-react'
import { useEffect, useRef, type RefObject } from 'react'
import { BotaoTema } from '../features/tema/BotaoTema'

interface CabecalhoProps {
  carro: string
  /** Posição do carro em uso: Principal ou Secundário. */
  posicaoCarro: string
  /** Quantas vezes o carro foi trocado pelo cabeçalho; cada troca dispara a animação. */
  trocas: number
  onTrocarCarro: () => void
  /** Pontinho de notificação no coração, chamando para o pop-up de doação. */
  pontinho: boolean
  coracao: RefObject<HTMLButtonElement | null>
  onApoiar: () => void
}

export function Cabecalho({
  carro,
  posicaoCarro,
  trocas,
  onTrocarCarro,
  pontinho,
  coracao,
  onApoiar,
}: CabecalhoProps) {
  const botaoCarro = useRef<HTMLButtonElement>(null)
  const nome = carro.trim() || posicaoCarro

  // A troca precisa ficar bem visível, para um toque sem querer não passar
  // despercebido: o nome novo vira como uma placa e o botão brilha em verde.
  useEffect(() => {
    const el = botaoCarro.current
    if (trocas === 0 || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate(
      [
        {
          transform: 'perspective(400px) rotateX(90deg)',
          boxShadow: '0 0 0 6px rgb(16 185 129 / 0.6)',
        },
        { transform: 'perspective(400px) rotateX(-20deg)', offset: 0.5 },
        { transform: 'none', boxShadow: '0 0 0 0 rgb(16 185 129 / 0)' },
      ],
      { duration: 700, easing: 'ease-out' },
    )
  }, [trocas])

  return (
    <header className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      <div className="flex shrink-0 items-center gap-2">
        <img src="/favicon.svg" alt="" className="size-8" />
        <h1 className="text-lg font-bold tracking-tight">km líquido</h1>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <button
          ref={botaoCarro}
          type="button"
          onClick={onTrocarCarro}
          aria-label={`${nome}, carro ${posicaoCarro.toLowerCase()}. Tocar troca de carro.`}
          title="Trocar de carro"
          className="flex min-w-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Car className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{nome}</span>
          <ArrowLeftRight
            className="size-3.5 shrink-0 text-slate-400"
            aria-hidden
          />
        </button>
        <BotaoTema />
        <button
          ref={coracao}
          type="button"
          onClick={onApoiar}
          aria-label="Apoiar o projeto"
          title="Apoiar o projeto"
          className="relative grid size-8 shrink-0 place-items-center rounded-full bg-white text-rose-500 shadow-sm hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-slate-800"
        >
          <Heart className="size-4" aria-hidden />
          {pontinho && (
            <span className="absolute top-0 right-0 size-2.5 rounded-full bg-rose-500 ring-2 ring-slate-100 dark:ring-slate-950" />
          )}
        </button>
      </div>

      {/* Aviso de qual carro entrou, que some sozinho. */}
      <p
        role="status"
        className="pointer-events-none fixed inset-x-0 top-[calc(max(1rem,env(safe-area-inset-top))+3rem)] z-20 flex justify-center px-4"
      >
        {trocas > 0 && (
          <span
            key={trocas}
            className="animate-aviso-troca rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-900"
          >
            Trocou para o {posicaoCarro}: {nome}
          </span>
        )}
      </p>
    </header>
  )
}
