import { useId } from 'react'

interface CampoProps {
  rotulo: string
  /** Esconde o rótulo na tela, mas o mantém para leitores de tela. */
  ocultarRotulo?: boolean
  valor: string
  /** Sem ele, o campo precisa ser `somenteLeitura`. */
  onChange?: (valor: string) => void
  onBlur?: () => void
  /** Valor calculado pelo app: aparece em verde, como os resumos, e não recebe toque nem digitação. */
  somenteLeitura?: boolean
  inputMode?: 'decimal' | 'text'
  prefixo?: string
  sufixo?: string
  dica?: string
  erro?: string | null
  /**
   * Id da mensagem de erro de quem agrupa vários campos: o campo marca o erro na
   * borda e aponta para essa mensagem, sem mostrar a dele.
   */
  idMensagem?: string
  /** Menos espaço em volta do número, para campos estreitos. */
  compacto?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function Campo({
  rotulo,
  ocultarRotulo,
  valor,
  onChange,
  onBlur,
  somenteLeitura,
  inputMode = 'decimal',
  prefixo,
  sufixo,
  dica,
  erro,
  idMensagem,
  compacto,
  placeholder,
  maxLength,
  className,
}: CampoProps) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  const ajuda = idMensagem ? undefined : (erro ?? dica)
  const descritoPor =
    idMensagem && erro ? idMensagem : ajuda ? idAjuda : undefined
  const moldura = somenteLeitura
    ? 'border-transparent bg-emerald-50 dark:bg-emerald-950/60'
    : `bg-white transition-shadow focus-within:ring-2 dark:bg-slate-950 ${erro ? 'border-rose-500 focus-within:ring-rose-500/25' : 'border-slate-300 focus-within:border-emerald-600 focus-within:ring-emerald-600/20 dark:border-slate-700'}`

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={
          ocultarRotulo
            ? 'sr-only'
            : 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200'
        }
      >
        {rotulo}
      </label>
      <div
        className={`flex items-center rounded-xl border ${compacto ? 'gap-1 px-2.5' : 'gap-1.5 px-3'} ${moldura}`}
      >
        {prefixo && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {prefixo}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={valor}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(evento) => onChange?.(evento.target.value)}
          onBlur={onBlur}
          readOnly={somenteLeitura}
          tabIndex={somenteLeitura ? -1 : undefined}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor}
          className={`w-full min-w-0 bg-transparent py-2.5 text-base tabular-nums outline-none placeholder:text-sm placeholder:text-slate-400 ${somenteLeitura ? 'pointer-events-none font-medium text-emerald-800 select-none dark:text-emerald-300' : ''}`}
        />
        {sufixo && (
          <span
            className={`shrink-0 text-sm ${somenteLeitura ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {sufixo}
          </span>
        )}
      </div>
      {ajuda && (
        <p
          id={idAjuda}
          className={`mt-1 text-xs ${erro ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {ajuda}
        </p>
      )}
    </div>
  )
}
