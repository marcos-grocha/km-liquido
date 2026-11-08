import { useLayoutEffect, useRef, useState } from 'react'
import {
  validarCampo,
  type CampoNumerico,
  type Parametros,
} from '../core/parametros'
import { formatarEntrada, lerDigitacao } from '../lib/numero'
import { Campo } from './Campo'
import { FORMATOS, type DefinicaoCampo } from './campos'

type AoAlterar = (campo: CampoNumerico, valor: number) => void
/** Chamado quando o campo passa a ter erro e quando deixa de ter. Precisa ser estável. */
type AoMarcarErro = (campo: CampoNumerico, comErro: boolean) => void

interface CamposProps {
  definicoes: DefinicaoCampo[]
  parametros: Parametros
  onChange: AoAlterar
  onErro?: AoMarcarErro
}

/** Um campo para cada definição, com os valores atuais dos parâmetros. */
export function Campos({
  definicoes,
  parametros,
  onChange,
  onErro,
}: CamposProps) {
  return (
    <>
      {definicoes.map((definicao) => (
        <CampoParametro
          key={definicao.campo}
          {...definicao}
          valor={parametros[definicao.campo]}
          onChange={onChange}
          onErro={onErro}
        />
      ))}
    </>
  )
}

interface CampoParametroProps extends DefinicaoCampo {
  valor: number
  onChange: AoAlterar
  onErro?: AoMarcarErro
}

/**
 * Campo numérico que só repassa o valor quando ele é válido. Em branco vale
 * zero; nos campos que não aceitam zero, como o consumo, o campo fica zerado e
 * acusa o erro.
 */
function CampoParametro({
  campo,
  valor,
  onChange,
  onErro,
  dica,
  ...visual
}: CampoParametroProps) {
  const formato = FORMATOS[campo]
  const [texto, setTexto] = useState(() => formatarEntrada(valor, formato))
  const [erro, setErro] = useState<string | null>(null)
  // Valor de quando o campo ganhou o foco: com erro, é ele que vale nas contas.
  const valorAoFocar = useRef(valor)
  const temErro = erro !== null

  // Enquanto há erro, a tela deixa pendentes os cálculos que dependem do campo.
  // Antes da pintura, para o cálculo não aparecer um instante sem o cinza.
  useLayoutEffect(() => {
    if (!temErro || !onErro) return
    onErro(campo, true)
    return () => onErro(campo, false)
  }, [temErro, campo, onErro])

  function alterarTexto(novoTexto: string) {
    setTexto(novoTexto)
    const numero =
      novoTexto.trim() === '' ? 0 : lerDigitacao(novoTexto, formato)
    const mensagem =
      numero === null ? 'Informe um número.' : validarCampo(campo, numero)
    setErro(mensagem)
    if (numero !== null && mensagem === null) onChange(campo, numero)
    // Sem isso, apagar "20" de trás para frente deixaria o "2" nas contas.
    else if (valor !== valorAoFocar.current)
      onChange(campo, valorAoFocar.current)
  }

  return (
    <Campo
      {...visual}
      className={dica ? 'col-span-2' : undefined}
      dica={dica}
      formato={formato}
      valor={texto}
      erro={erro}
      onChange={alterarTexto}
      onFocus={() => {
        valorAoFocar.current = valor
      }}
      onBlur={() => {
        // Em branco, mostra o zero; com erro, ele continua acusado.
        if (texto.trim() === '') setTexto(formatarEntrada(0, formato))
        else if (!erro) setTexto(formatarEntrada(valor, formato))
      }}
    />
  )
}
