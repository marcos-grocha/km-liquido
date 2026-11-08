import { useState, type Dispatch, type SetStateAction } from 'react'
import { Campo } from '../../components/Campo'
import { CampoHoras } from '../../components/CampoHoras'
import { Campos } from '../../components/CampoParametro'
import { RestaurarPadrao } from '../../components/RestaurarPadrao'
import { Resumo, Secao } from '../../components/Secao'
import { sugestao, type DefinicaoCampo } from '../../components/campos'
import {
  alterarParametro,
  restaurarRotina,
  type Ajustes,
} from '../../core/ajustes'
import { diasPorMes, type Projecao } from '../../core/calculo'
import { validarCampo, type Parametros } from '../../core/parametros'
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
      <Secao titulo="Rotina de trabalho">
        <Campos
          definicoes={MEDIAS}
          parametros={parametros}
          onChange={alterar}
        />
        {/* Depende só do km por hora e do valor por km, logo acima. */}
        <Resumo className="col-span-2">
          Faturamento por hora: {formatarMoeda(projecao.faturamentoPorHora)}
        </Resumo>
        <hr className="col-span-2 border-slate-200 dark:border-slate-800" />
        {/* A semana é informada; o mês ao lado é calculado pelo app, como nos dias. */}
        <CampoHoras
          rotulo="Horas por semana"
          valor={parametros.horasPorSemana}
          validar={(horas) => validarCampo('horasPorSemana', horas)}
          onChange={(horas) => alterar('horasPorSemana', horas)}
        />
        <CampoHoras
          rotulo="Horas por mês"
          valor={projecao.periodos.mes.horas}
          somenteLeitura
        />
        <Campos
          definicoes={[DIAS_POR_SEMANA]}
          parametros={parametros}
          onChange={alterar}
        />
        <Campo
          rotulo="Dias por mês"
          somenteLeitura
          valor={String(diasPorMes(parametros))}
          sufixo="dias"
        />
        {/* Depende das horas e dos dias por semana, logo acima. */}
        <Resumo className="col-span-2">
          Horas por dia: {formatarHoras(projecao.periodos.dia.horas)}
        </Resumo>
      </Secao>

      <RestaurarPadrao
        confirmacao="Voltar para os valores padrão? A rotina de trabalho será substituída."
        onRestaurar={restaurarPadrao}
      />
    </div>
  )
}
