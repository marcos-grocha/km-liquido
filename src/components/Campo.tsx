import { useId } from 'react'

interface CampoProps {
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  onBlur?: () => void
  inputMode?: 'decimal' | 'text'
  prefixo?: string
  sufixo?: string
  dica?: string
  erro?: string | null
  placeholder?: string
  maxLength?: number
  className?: string
}

export function Campo({
  rotulo,
  valor,
  onChange,
  onBlur,
  inputMode = 'decimal',
  prefixo,
  sufixo,
  dica,
  erro,
  placeholder,
  maxLength,
  className,
}: CampoProps) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  const ajuda = erro ?? dica

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {rotulo}
      </label>
      <div
        className={`mt-1 flex items-center gap-1.5 rounded-xl border bg-white px-3 transition-shadow focus-within:ring-2 dark:bg-slate-950 ${erro ? 'border-rose-500 focus-within:ring-rose-500/25' : 'border-slate-300 focus-within:border-emerald-600 focus-within:ring-emerald-600/20 dark:border-slate-700'}`}
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
          onChange={(evento) => onChange(evento.target.value)}
          onBlur={onBlur}
          aria-invalid={erro ? true : undefined}
          aria-describedby={ajuda ? idAjuda : undefined}
          className="w-full min-w-0 bg-transparent py-2.5 text-base tabular-nums outline-none placeholder:text-slate-400"
        />
        {sufixo && (
          <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
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
