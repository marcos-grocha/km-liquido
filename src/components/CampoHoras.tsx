import { useId, useState } from 'react'
import { lerNumero, separarHoras } from '../lib/numero'
import { Campo } from './Campo'

interface CampoHorasProps {
  rotulo: string
  /** Duração em horas, com fração (44,5 = 44h30min). */
  valor: number
  /** Valor calculado pelo app: os dois campos aparecem apagados. */
  somenteLeitura?: boolean
  onChange?: (horas: number) => void
  /** Confere o total em horas; devolve a mensagem de erro ou `null`. */
  validar?: (horas: number) => string | null
}

interface Partes {
  horas: string
  minutos: string
}

/**
 * Duração em dois campos estreitos lado a lado, horas e minutos, sem fração de
 * hora; o par ocupa uma coluna da grade, como um campo comum. Como nos outros
 * campos, em branco mantém o último valor válido e o devolve ao campo quando
 * ele perde o foco.
 */
export function CampoHoras({
  rotulo,
  valor,
  somenteLeitura,
  onChange,
  validar,
}: CampoHorasProps) {
  const id = useId()
  const idErro = `${id}-erro`
  const [textos, setTextos] = useState<Partes>(() => paraTexto(valor))
  const [erros, setErros] = useState<Record<keyof Partes, string | null>>({
    horas: null,
    minutos: null,
  })
  // Só leitura acompanha o valor calculado; editável mostra o que foi digitado.
  const exibidos = somenteLeitura ? paraTexto(valor) : textos

  function alterar(parte: keyof Partes, texto: string) {
    const novos = { ...textos, [parte]: texto }
    setTextos(novos)
    if (novos.horas.trim() === '' || novos.minutos.trim() === '') {
      setErros({ horas: null, minutos: null })
      return
    }
    const horas = lerNumero(novos.horas)
    const minutos = lerNumero(novos.minutos)
    const erroHoras =
      horas !== null && Number.isInteger(horas) && horas >= 0
        ? null
        : 'Use horas inteiras.'
    const erroMinutos =
      minutos !== null &&
      Number.isInteger(minutos) &&
      minutos >= 0 &&
      minutos <= 59
        ? null
        : 'Use de 0 a 59 minutos.'
    let erroTotal: string | null = null
    if (horas !== null && minutos !== null && !erroHoras && !erroMinutos) {
      const total = horas + minutos / 60
      erroTotal = validar?.(total) ?? null
      if (!erroTotal) onChange?.(total)
    }
    setErros({ horas: erroHoras ?? erroTotal, minutos: erroMinutos })
  }

  function restaurar() {
    if (!erros.horas && !erros.minutos) setTextos(paraTexto(valor))
  }

  const erro = erros.horas ?? erros.minutos

  return (
    <div role="group" aria-labelledby={id}>
      <p
        id={id}
        className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {rotulo}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <Campo
          rotulo={`${rotulo}: horas`}
          ocultarRotulo
          compacto
          maxLength={3}
          valor={exibidos.horas}
          sufixo="h"
          somenteLeitura={somenteLeitura}
          erro={erros.horas}
          idMensagem={idErro}
          onChange={(texto) => alterar('horas', texto)}
          onBlur={restaurar}
        />
        <Campo
          rotulo={`${rotulo}: minutos`}
          ocultarRotulo
          compacto
          maxLength={2}
          valor={exibidos.minutos}
          sufixo="min"
          somenteLeitura={somenteLeitura}
          erro={erros.minutos}
          idMensagem={idErro}
          onChange={(texto) => alterar('minutos', texto)}
          onBlur={restaurar}
        />
      </div>
      {erro && (
        <p
          id={idErro}
          className="mt-1 text-xs text-rose-600 dark:text-rose-400"
        >
          {erro}
        </p>
      )}
    </div>
  )
}

function paraTexto(valor: number): Partes {
  const { horas, minutos } = separarHoras(valor)
  return { horas: String(horas), minutos: String(minutos) }
}
