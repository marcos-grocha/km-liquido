import { useId, useLayoutEffect, useRef, useState } from 'react'
import { FORMATO_INTEIRO, lerDigitacao, separarHoras } from '../lib/numero'
import { Campo } from './Campo'

interface CampoHorasProps {
  rotulo: string
  /** Duração em horas, com fração (44,5 = 44h30min). */
  valor: number
  /** Valor calculado pelo app: os dois campos aparecem apagados. */
  somenteLeitura?: boolean
  /** Valor calculado que depende de um campo com erro: fica em cinza. */
  pendente?: boolean
  onChange?: (horas: number) => void
  /** Confere o total em horas; devolve a mensagem de erro ou `null`. */
  validar?: (horas: number) => string | null
  /** Chamado quando o campo passa a ter erro e quando deixa de ter. Precisa ser estável. */
  onErro?: (comErro: boolean) => void
}

interface Partes {
  horas: string
  minutos: string
}

/**
 * Duração em dois campos estreitos lado a lado, horas e minutos, sem fração de
 * hora; o par ocupa uma coluna da grade, como um campo comum. Como nos outros
 * campos, em branco vale zero ("44" e minutos em branco são 44h); se o total
 * zerado não vale, o campo fica zerado e acusa o erro.
 */
export function CampoHoras({
  rotulo,
  valor,
  somenteLeitura,
  pendente,
  onChange,
  validar,
  onErro,
}: CampoHorasProps) {
  const id = useId()
  const idErro = `${id}-erro`
  const [textos, setTextos] = useState<Partes>(() => paraTexto(valor))
  const [erros, setErros] = useState<Record<keyof Partes, string | null>>({
    horas: null,
    minutos: null,
  })
  // Valor de quando um dos campos ganhou o foco: com erro, é ele que vale nas contas.
  const valorAoFocar = useRef(valor)
  // Só leitura acompanha o valor calculado; editável mostra o que foi digitado.
  const exibidos = somenteLeitura ? paraTexto(valor) : textos
  const temErro = Boolean(erros.horas || erros.minutos)

  // Enquanto há erro, a tela deixa pendentes os cálculos que dependem do campo.
  // Antes da pintura, para o cálculo não aparecer um instante sem o cinza.
  useLayoutEffect(() => {
    if (!temErro || !onErro) return
    onErro(true)
    return () => onErro(false)
  }, [temErro, onErro])

  function alterar(parte: keyof Partes, texto: string) {
    const novos = { ...textos, [parte]: texto }
    setTextos(novos)
    // O formato inteiro só deixa digitar números, então os dois já são inteiros;
    // em branco, vale zero.
    const horas = lerDigitacao(novos.horas, FORMATO_INTEIRO) ?? 0
    const minutos = lerDigitacao(novos.minutos, FORMATO_INTEIRO) ?? 0
    const erroMinutos = minutos <= 59 ? null : 'Use de 0 a 59 minutos.'
    const total = horas + minutos / 60
    const erroTotal = erroMinutos ? null : (validar?.(total) ?? null)
    if (!erroMinutos && !erroTotal) onChange?.(total)
    // Sem isso, apagar "44" de trás para frente deixaria o "4" nas contas.
    else if (valor !== valorAoFocar.current) onChange?.(valorAoFocar.current)
    setErros({ horas: erroTotal, minutos: erroMinutos })
  }

  function guardarValor() {
    valorAoFocar.current = valor
  }

  function restaurar() {
    if (!erros.horas && !erros.minutos) setTextos(paraTexto(valor))
    // Com erro, o que ficou em branco mostra o zero.
    else
      setTextos(({ horas, minutos }) => ({
        horas: horas.trim() || '0',
        minutos: minutos.trim() || '0',
      }))
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
          formato={FORMATO_INTEIRO}
          valor={exibidos.horas}
          sufixo="h"
          somenteLeitura={somenteLeitura}
          pendente={pendente}
          erro={erros.horas}
          idMensagem={idErro}
          onChange={(texto) => alterar('horas', texto)}
          onFocus={guardarValor}
          onBlur={restaurar}
        />
        <Campo
          rotulo={`${rotulo}: minutos`}
          ocultarRotulo
          compacto
          maxLength={2}
          formato={FORMATO_INTEIRO}
          valor={exibidos.minutos}
          sufixo="min"
          somenteLeitura={somenteLeitura}
          pendente={pendente}
          erro={erros.minutos}
          idMensagem={idErro}
          onChange={(texto) => alterar('minutos', texto)}
          onFocus={guardarValor}
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
