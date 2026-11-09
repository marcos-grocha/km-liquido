import { useState, type Dispatch, type SetStateAction } from 'react'
import { Campo } from '../../components/Campo'
import { Campos } from '../../components/CampoParametro'
import { RestaurarPadrao } from '../../components/RestaurarPadrao'
import { Resumo, Secao } from '../../components/Secao'
import { Segmentado } from '../../components/Segmentado'
import {
  METADE,
  METADE_DIREITA,
  sugestao,
  type DefinicaoCampo,
} from '../../components/campos'
import type { CamposComErro } from '../../components/useCamposComErro'
import {
  ROTULOS_CARRO,
  alterarParametro,
  restaurarCarros,
  type Ajustes,
  type IndiceCarro,
} from '../../core/ajustes'
import type { Projecao } from '../../core/calculo'
import {
  ROTULOS_PAGAMENTO,
  type PagamentoDoCarro,
  type Parametros,
} from '../../core/parametros'
import { formatarMoeda } from '../../lib/numero'

const VEICULO: DefinicaoCampo[] = [
  { campo: 'consumoKmPorLitro', rotulo: 'Consumo', sufixo: 'km/L' },
  {
    campo: 'precoCombustivel',
    rotulo: 'Combustível',
    prefixo: 'R$',
    sufixo: '/L',
  },
]

const MANUTENCAO: DefinicaoCampo = {
  campo: 'manutencaoPorKm',
  rotulo: 'Manutenção',
  prefixo: 'R$',
  sufixo: '/km',
  dica: 'Reserva para pneus, óleo, revisões e peças.',
}

const CUSTOS_FIXOS: DefinicaoCampo[] = [
  { campo: 'seguroAnual', rotulo: 'Seguro', prefixo: 'R$', sufixo: '/ano' },
  { campo: 'ipvaAnual', rotulo: 'IPVA', prefixo: 'R$', sufixo: '/ano' },
]

const PAGAMENTO: Record<PagamentoDoCarro, DefinicaoCampo> = {
  financiamento: {
    campo: 'financiamentoMensal',
    rotulo: ROTULOS_PAGAMENTO.financiamento,
    ocultarRotulo: true,
    prefixo: 'R$',
    sufixo: '/mês',
    dica: 'Parcela mensal do carro, se houver.',
  },
  aluguel: {
    campo: 'aluguelSemanal',
    rotulo: ROTULOS_PAGAMENTO.aluguel,
    ocultarRotulo: true,
    prefixo: 'R$',
    sufixo: '/semana',
    placeholder: sugestao('aluguelSemanal'),
    dica: 'Valor pago por semana pelo aluguel do carro.',
  },
}

const OPCOES_PAGAMENTO = (
  Object.keys(ROTULOS_PAGAMENTO) as PagamentoDoCarro[]
).map((valor) => ({ valor, rotulo: ROTULOS_PAGAMENTO[valor] }))

const OPCOES_CARRO = ([0, 1] as const).map((indice) => ({
  valor: String(indice) as `${IndiceCarro}`,
  rotulo: ROTULOS_CARRO[indice],
}))

interface MeuCarroProps {
  ajustes: Ajustes
  /** Os parâmetros do carro em uso. */
  parametros: Parametros
  projecao: Projecao
  camposComErro: CamposComErro
  onChange: Dispatch<SetStateAction<Ajustes>>
  /** Vai para a próxima aba, Rotina. */
  onAvancar: () => void
}

export function MeuCarro({
  ajustes,
  parametros,
  projecao,
  camposComErro,
  onChange,
  onAvancar,
}: MeuCarroProps) {
  // Mudar a versão recria os campos com os valores restaurados.
  const [versao, setVersao] = useState(0)
  const { mes } = projecao.periodos
  // Com algum campo em vermelho, os cálculos que dependem dele ficam zerados e em cinza.
  const { algumComErro, marcarErro } = camposComErro
  const custoPorKmPendente = algumComErro(
    'consumoKmPorLitro',
    'precoCombustivel',
    'manutencaoPorKm',
  )
  const custosFixosPendentes = algumComErro(
    'seguroAnual',
    'ipvaAnual',
    'financiamentoMensal',
    'aluguelSemanal',
  )

  function alterar<C extends keyof Parametros>(campo: C, valor: Parametros[C]) {
    onChange((atual) => alterarParametro(atual, campo, valor))
  }

  function campos(definicoes: DefinicaoCampo[]) {
    return (
      <Campos
        definicoes={definicoes}
        parametros={parametros}
        onChange={alterar}
        onErro={marcarErro}
      />
    )
  }

  function restaurarPadrao() {
    onChange(restaurarCarros)
    setVersao((v) => v + 1)
  }

  // Trocar de carro também recria os campos, agora com os dados do outro carro.
  return (
    <div key={`${versao}-${ajustes.carroAtivo}`} className="space-y-4">
      <Secao
        titulo="Veículo"
        classeGrade="largo:gap-x-6"
        acao={
          <div className="w-44">
            <Segmentado
              rotulo="Carro em uso"
              opcoes={OPCOES_CARRO}
              valor={`${ajustes.carroAtivo}`}
              onChange={(valor) =>
                onChange((atual) => ({
                  ...atual,
                  carroAtivo: Number(valor) as IndiceCarro,
                }))
              }
            />
          </div>
        }
      >
        <div className={METADE}>
          <Campo
            className="col-span-2"
            rotulo="Nome do carro"
            inputMode="text"
            valor={parametros.carro}
            placeholder="Ex.: Argo"
            maxLength={30}
            onChange={(carro) => alterar('carro', carro)}
          />
          {campos(VEICULO)}
          {campos([MANUTENCAO])}
          <Resumo className="col-span-2" pendente={custoPorKmPendente}>
            Custo por km:{' '}
            {formatarMoeda(custoPorKmPendente ? 0 : projecao.custoPorKm)}
          </Resumo>
          {/* Em tela larga, a linha vertical entre as metades já separa os custos fixos. */}
          <hr className="col-span-2 border-slate-200 largo:hidden dark:border-slate-800" />
        </div>
        <div className={METADE_DIREITA}>
          {campos(CUSTOS_FIXOS)}
          <div className="col-span-2 space-y-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Pagamento do carro
            </p>
            <Segmentado
              rotulo="Pagamento do carro"
              opcoes={OPCOES_PAGAMENTO}
              valor={parametros.pagamentoDoCarro}
              onChange={(pagamento) => alterar('pagamentoDoCarro', pagamento)}
            />
          </div>
          {campos([PAGAMENTO[parametros.pagamentoDoCarro]])}
          <Resumo className="col-span-2 mt-1" pendente={custosFixosPendentes}>
            Custos fixos por mês:{' '}
            {formatarMoeda(
              custosFixosPendentes
                ? 0
                : mes.seguro + mes.ipva + mes.financiamentoOuAluguel,
            )}
          </Resumo>
        </div>
      </Secao>

      <RestaurarPadrao
        confirmacao="Voltar para os valores padrão? Os dois carros serão substituídos."
        onRestaurar={restaurarPadrao}
        proxima={{ nome: 'Rotina', onIr: onAvancar }}
      />
    </div>
  )
}
