import { useId, useRef, type ReactNode } from 'react'
import { FORMATO_INTEIRO, separarHoras } from '../lib/numero'
import { BotaoZerar } from './BotaoZerar'
import { Campo } from './Campo'

/** O que foi digitado nas horas e nos minutos. */
export interface TextoHoras {
  horas: string
  minutos: string
}

/** Erro de cada parte: o total zerado marca as horas; minutos acima de 59, os minutos. */
export type ErrosHoras = Record<keyof TextoHoras, string | null>

interface CampoHorasOpcionalProps {
  rotulo: string
  valor: TextoHoras
  onChange: (valor: TextoHoras) => void
  /** Duração estimada pelo app, em horas com fração; aparece apagada enquanto os dois estão em branco. */
  estimativa?: number
  dica?: ReactNode
  erros: ErrosHoras
}

/**
 * Duração opcional em horas e minutos, lado a lado, como o `CampoHoras`. Com os
 * dois em branco, mostra a estimativa do app; com um deles preenchido, o outro
 * em branco vale zero.
 */
export function CampoHorasOpcional({
  rotulo,
  valor,
  onChange,
  estimativa,
  dica,
  erros,
}: CampoHorasOpcionalProps) {
  const id = useId()
  const campoHoras = useRef<HTMLInputElement>(null)
  const idAjuda = `${id}-ajuda`
  const estimadas = estimativa === undefined ? null : separarHoras(estimativa)
  const erro = erros.horas ?? erros.minutos
  const ajuda = erro ?? dica

  return (
    <div
      role="group"
      aria-labelledby={id}
      aria-describedby={ajuda ? idAjuda : undefined}
    >
      <p
        id={id}
        className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {rotulo}
      </p>
      {/* Um botão só zera as horas e os minutos e põe o cursor nas horas. */}
      <div className="flex gap-2">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
          <Campo
            ref={campoHoras}
            rotulo={`${rotulo}: horas`}
            ocultarRotulo
            compacto
            maxLength={3}
            formato={FORMATO_INTEIRO}
            valor={valor.horas}
            placeholder={estimadas ? String(estimadas.horas) : undefined}
            sufixo="h"
            erro={erros.horas}
            idMensagem={idAjuda}
            onChange={(horas) => onChange({ ...valor, horas })}
          />
          <Campo
            rotulo={`${rotulo}: minutos`}
            ocultarRotulo
            compacto
            maxLength={2}
            formato={FORMATO_INTEIRO}
            valor={valor.minutos}
            placeholder={estimadas ? String(estimadas.minutos) : undefined}
            sufixo="min"
            erro={erros.minutos}
            idMensagem={idAjuda}
            onChange={(minutos) => onChange({ ...valor, minutos })}
          />
        </div>
        <BotaoZerar
          rotulo={rotulo}
          desativado={valor.horas.trim() === '' && valor.minutos.trim() === ''}
          onClick={() => {
            onChange({ horas: '', minutos: '' })
            campoHoras.current?.focus()
          }}
        />
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
