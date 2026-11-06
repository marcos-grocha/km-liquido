import { useState } from 'react'
import {
  validarCampo,
  type CampoNumerico,
  type Parametros,
} from '../core/parametros'
import { formatarParaEdicao, lerNumero } from '../lib/numero'
import { Campo } from './Campo'
import type { DefinicaoCampo } from './campos'

type AoAlterar = (campo: CampoNumerico, valor: number) => void

interface CamposProps {
  definicoes: DefinicaoCampo[]
  parametros: Parametros
  onChange: AoAlterar
}

/** Um campo para cada definição, com os valores atuais dos parâmetros. */
export function Campos({ definicoes, parametros, onChange }: CamposProps) {
  return (
    <>
      {definicoes.map((definicao) => (
        <CampoParametro
          key={definicao.campo}
          {...definicao}
          valor={parametros[definicao.campo]}
          onChange={onChange}
        />
      ))}
    </>
  )
}

interface CampoParametroProps extends DefinicaoCampo {
  valor: number
  onChange: AoAlterar
}

/**
 * Campo numérico que só repassa o valor quando ele é válido. Em branco, mantém
 * o último valor válido e o devolve ao campo quando ele perde o foco.
 */
function CampoParametro({
  campo,
  valor,
  onChange,
  dica,
  ...visual
}: CampoParametroProps) {
  const [texto, setTexto] = useState(() => formatarParaEdicao(valor))
  const [erro, setErro] = useState<string | null>(null)

  function alterarTexto(novoTexto: string) {
    setTexto(novoTexto)
    if (novoTexto.trim() === '') {
      setErro(null)
      return
    }
    const numero = lerNumero(novoTexto)
    const mensagem =
      numero === null ? 'Informe um número.' : validarCampo(campo, numero)
    setErro(mensagem)
    if (numero !== null && mensagem === null) onChange(campo, numero)
  }

  return (
    <Campo
      {...visual}
      className={dica ? 'col-span-2' : undefined}
      dica={dica}
      valor={texto}
      erro={erro}
      onChange={alterarTexto}
      onBlur={() => {
        if (!erro) setTexto(formatarParaEdicao(valor))
      }}
    />
  )
}
