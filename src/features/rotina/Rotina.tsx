import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { Campo } from '../../components/Campo'
import { CampoHoras } from '../../components/CampoHoras'
import { Campos } from '../../components/CampoParametro'
import { RestaurarPadrao } from '../../components/RestaurarPadrao'
import { Resumo, Secao } from '../../components/Secao'
import {
  METADE,
  METADE_DIREITA,
  sugestao,
  type DefinicaoCampo,
} from '../../components/campos'
import type { CamposComErro } from '../../components/useCamposComErro'
import {
  alterarParametro,
  restaurarRotina,
  type Ajustes,
} from '../../core/ajustes'
import { diasPorMes, type Projecao } from '../../core/calculo'
import {
  avisoHorasPorDia,
  validarCampo,
  type Parametros,
} from '../../core/parametros'
import { formatarHoras, formatarMoeda } from '../../lib/numero'

const MEDIAS: DefinicaoCampo[] = [
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
]

const DIAS_POR_SEMANA: DefinicaoCampo = {
  campo: 'diasPorSemana',
  rotulo: 'Dias por semana',
  sufixo: 'dias',
}

interface RotinaProps {
  /** Os parâmetros do carro em uso; a rotina é a mesma para os dois carros. */
  parametros: Parametros
  projecao: Projecao
  camposComErro: CamposComErro
  onChange: Dispatch<SetStateAction<Ajustes>>
}

export function Rotina({
  parametros,
  projecao,
  camposComErro,
  onChange,
}: RotinaProps) {
  // Mudar a versão recria os campos com os valores restaurados.
  const [versao, setVersao] = useState(0)
  // Com algum campo em vermelho, os cálculos que dependem dele ficam zerados e em cinza.
  const { algumComErro, marcarErro } = camposComErro
  const faturamentoPendente = algumComErro('kmPorHora', 'valorPorKm')
  const horasPendentes = algumComErro('horasPorSemana')
  const diasPendentes = algumComErro('diasPorSemana')
  const horasPorDiaPendentes = horasPendentes || diasPendentes
  const marcarErroDasHoras = useCallback(
    (comErro: boolean) => marcarErro('horasPorSemana', comErro),
    [marcarErro],
  )

  function alterar<C extends keyof Parametros>(campo: C, valor: Parametros[C]) {
    onChange((atual) => alterarParametro(atual, campo, valor))
  }

  function restaurarPadrao() {
    onChange(restaurarRotina)
    setVersao((v) => v + 1)
  }

  // No celular, as horas e os dias vêm primeiro e as médias por km depois; em tela
  // larga, as horas e os dias ficam à esquerda e as médias à direita, como em Meu carro.
  return (
    <div key={versao} className="space-y-4">
      <Secao titulo="Rotina de trabalho" classeGrade="largo:gap-x-6">
        <div className={METADE}>
          {/* A semana é informada; o mês ao lado é calculado pelo app, como nos dias. */}
          <CampoHoras
            rotulo="Horas por semana"
            valor={parametros.horasPorSemana}
            validar={(horas) => validarCampo('horasPorSemana', horas)}
            onChange={(horas) => alterar('horasPorSemana', horas)}
            onErro={marcarErroDasHoras}
          />
          <CampoHoras
            rotulo="Horas por mês"
            valor={horasPendentes ? 0 : projecao.periodos.mes.horas}
            somenteLeitura
            pendente={horasPendentes}
          />
          <Campos
            definicoes={[DIAS_POR_SEMANA]}
            parametros={parametros}
            onChange={alterar}
            onErro={marcarErro}
          />
          <Campo
            rotulo="Dias por mês"
            somenteLeitura
            pendente={diasPendentes}
            valor={diasPendentes ? '0' : String(diasPorMes(parametros))}
            sufixo="dias"
          />
          {/* Depende das horas e dos dias por semana, logo acima. */}
          <Resumo
            className="col-span-2"
            pendente={horasPorDiaPendentes}
            alerta={avisoHorasPorDia(parametros)}
          >
            Horas por dia:{' '}
            {formatarHoras(
              horasPorDiaPendentes ? 0 : projecao.periodos.dia.horas,
            )}
          </Resumo>
          {/* Em tela larga, a linha vertical entre as metades já separa as médias. */}
          <hr className="col-span-2 border-slate-200 largo:hidden dark:border-slate-800" />
        </div>
        <div className={METADE_DIREITA}>
          <Campos
            definicoes={MEDIAS}
            parametros={parametros}
            onChange={alterar}
            onErro={marcarErro}
          />
          {/* Depende só do km por hora e do valor por km, logo acima. */}
          <Resumo className="col-span-2" pendente={faturamentoPendente}>
            Faturamento por hora:{' '}
            {formatarMoeda(
              faturamentoPendente ? 0 : projecao.faturamentoPorHora,
            )}
          </Resumo>
        </div>
      </Secao>

      <RestaurarPadrao
        confirmacao="Voltar para os valores padrão? A rotina de trabalho será substituída."
        onRestaurar={restaurarPadrao}
      />
    </div>
  )
}
