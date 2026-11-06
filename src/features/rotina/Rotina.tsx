import { useState, type Dispatch, type SetStateAction } from 'react'
import { Campos } from '../../components/CampoParametro'
import { RestaurarPadrao } from '../../components/RestaurarPadrao'
import { Secao } from '../../components/Secao'
import { sugestao, type DefinicaoCampo } from '../../components/campos'
import {
  alterarParametro,
  restaurarRotina,
  type Ajustes,
} from '../../core/ajustes'
import type { Projecao } from '../../core/calculo'
import type { Parametros } from '../../core/parametros'
import { formatarMoeda } from '../../lib/numero'

const ROTINA: DefinicaoCampo[] = [
  {
    campo: 'kmPorHora',
    rotulo: 'Km por hora',
    sufixo: 'km/h',
    placeholder: sugestao('kmPorHora'),
    dica: 'Média rodada por hora trabalhada, com e sem passageiro.',
  },
  {
    campo: 'valorPorKm',
    rotulo: 'Valor por km',
    prefixo: 'R$',
    sufixo: '/km',
    placeholder: sugestao('valorPorKm'),
    dica: 'Você deve considerar o km total rodado, com e sem passageiro.',
  },
  { campo: 'horasPorMes', rotulo: 'Horas por mês', sufixo: 'h' },
  { campo: 'diasPorSemana', rotulo: 'Dias por semana', sufixo: 'dias' },
]

interface RotinaProps {
  /** Os parâmetros do carro em uso; a rotina é a mesma para os dois carros. */
  parametros: Parametros
  projecao: Projecao
  onChange: Dispatch<SetStateAction<Ajustes>>
}

export function Rotina({ parametros, projecao, onChange }: RotinaProps) {
  // Mudar a versão recria os campos com os valores restaurados.
  const [versao, setVersao] = useState(0)

  function alterar<C extends keyof Parametros>(campo: C, valor: Parametros[C]) {
    onChange((atual) => alterarParametro(atual, campo, valor))
  }

  function restaurarPadrao() {
    onChange(restaurarRotina)
    setVersao((v) => v + 1)
  }

  // Em tela larga, o card fica centralizado, com a largura do celular.
  return (
    <div key={versao} className="space-y-4 largo:mx-auto largo:max-w-md">
      <Secao
        titulo="Rotina de trabalho"
        resumo={`Faturamento por hora: ${formatarMoeda(projecao.faturamentoPorHora)}`}
      >
        <Campos
          definicoes={ROTINA}
          parametros={parametros}
          onChange={alterar}
        />
      </Secao>

      <RestaurarPadrao
        confirmacao="Voltar para os valores padrão? A rotina de trabalho será substituída."
        onRestaurar={restaurarPadrao}
      />
    </div>
  )
}
