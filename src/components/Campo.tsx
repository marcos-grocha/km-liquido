import { useId, useState, type ChangeEvent } from 'react'
import {
  completarCasas,
  formatarDigitacao,
  type FormatoNumero,
} from '../lib/numero'

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
  /** Sem ele, sai do formato: numérico só para inteiros e decimal para os outros. */
  inputMode?: 'decimal' | 'numeric' | 'text'
  /**
   * Formata o número enquanto a pessoa digita ("1500" vira "1.500") e completa as
   * casas fixas quando o campo perde o foco ("1.500,00").
   */
  formato?: FormatoNumero
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
  inputMode,
  formato,
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
  const [focado, setFocado] = useState(false)
  const exibido = formato && !focado ? completarCasas(valor, formato) : valor
  const ajuda = idMensagem ? undefined : (erro ?? dica)
  const descritoPor =
    idMensagem && erro ? idMensagem : ajuda ? idAjuda : undefined
  const moldura = somenteLeitura
    ? 'border-transparent bg-emerald-50 dark:bg-emerald-950/60'
    : `bg-white transition-shadow focus-within:ring-2 dark:bg-slate-950 ${erro ? 'border-rose-500 focus-within:ring-rose-500/25' : 'border-slate-300 focus-within:border-emerald-600 focus-within:ring-emerald-600/20 dark:border-slate-700'}`

  function digitar(evento: ChangeEvent<HTMLInputElement>) {
    const campo = evento.target
    if (formato) {
      const { texto, cursor } = formatarDigitacao(
        campo.value,
        formato,
        campo.selectionStart ?? campo.value.length,
      )
      // Delete sobre o ponto de milhar: o ponto volta, e o cursor passa para depois dele.
      const pularPonto =
        texto === exibido &&
        (evento.nativeEvent as InputEvent).inputType === 'deleteContentForward'
      const novoCursor = pularPonto
        ? Math.min(cursor + 1, texto.length)
        : cursor
      // Formata já no elemento, para o cursor ficar junto do que foi digitado.
      campo.value = texto
      campo.setSelectionRange(novoCursor, novoCursor)
    }
    onChange?.(campo.value)
  }

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
          inputMode={
            inputMode ?? (formato?.casas === 0 ? 'numeric' : 'decimal')
          }
          autoComplete="off"
          value={exibido}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={digitar}
          onFocus={() => setFocado(true)}
          onBlur={() => {
            setFocado(false)
            onBlur?.()
          }}
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
