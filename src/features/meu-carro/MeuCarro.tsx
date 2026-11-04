import { RotateCcw } from 'lucide-react'
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { Campo } from '../../components/Campo'
import { Segmentado } from '../../components/Segmentado'
import type { Projecao } from '../../core/calculo'
import {
  PARAMETROS_PADRAO,
  ROTULOS_PAGAMENTO,
  validarCampo,
  type CampoNumerico,
  type PagamentoDoCarro,
  type Parametros,
} from '../../core/parametros'
import { formatarMoeda, formatarParaEdicao, lerNumero } from '../../lib/numero'

interface DefinicaoCampo {
  campo: CampoNumerico
  rotulo: string
  prefixo?: string
  sufixo?: string
  /** Aparece quando o campo está vazio. */
  placeholder?: string
  /** Campos com dica ocupam a linha inteira. */
  dica?: string
  /** Esconde o rótulo na tela quando o contexto já identifica o campo. */
  ocultarRotulo?: boolean
}

/** Placeholder com o valor padrão do campo como sugestão. */
function sugestao(campo: CampoNumerico): string {
  return `${formatarParaEdicao(PARAMETROS_PADRAO[campo])} é uma sugestão realista`
}

const VEICULO: DefinicaoCampo[] = [
  { campo: 'consumoKmPorLitro', rotulo: 'Consumo', sufixo: 'km/L' },
  {
    campo: 'precoCombustivel',
    rotulo: 'Combustível',
    prefixo: 'R$',
    sufixo: '/L',
  },
]

const CUSTOS: DefinicaoCampo[] = [
  {
    campo: 'manutencaoPorKm',
    rotulo: 'Manutenção',
    prefixo: 'R$',
    sufixo: '/km',
    dica: 'Reserva para pneus, óleo, revisões e peças.',
  },
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

interface MeuCarroProps {
  parametros: Parametros
  projecao: Projecao
  onChange: Dispatch<SetStateAction<Parametros>>
}

export function MeuCarro({ parametros, projecao, onChange }: MeuCarroProps) {
  // Mudar a versão recria os campos com os valores restaurados.
  const [versao, setVersao] = useState(0)
  const { mes } = projecao.periodos

  function alterar(campo: CampoNumerico, valor: number) {
    onChange((atual) => ({ ...atual, [campo]: valor }))
  }

  function campos(definicoes: DefinicaoCampo[]) {
    return definicoes.map((definicao) => (
      <CampoParametro
        key={definicao.campo}
        {...definicao}
        valor={parametros[definicao.campo]}
        onChange={alterar}
      />
    ))
  }

  function restaurarPadrao() {
    const confirmado = window.confirm(
      'Voltar para os valores padrão? Os dados atuais serão substituídos.',
    )
    if (!confirmado) return
    onChange(PARAMETROS_PADRAO)
    setVersao((v) => v + 1)
  }

  return (
    <div key={versao} className="space-y-4">
      <Secao
        titulo="Veículo"
        resumo={`Combustível por km: ${formatarMoeda(projecao.custoCombustivelPorKm)}`}
      >
        <Campo
          className="col-span-2"
          rotulo="Nome do carro"
          inputMode="text"
          valor={parametros.carro}
          placeholder="Ex.: Argo"
          maxLength={30}
          onChange={(carro) => onChange((atual) => ({ ...atual, carro }))}
        />
        {campos(VEICULO)}
      </Secao>

      <Secao
        titulo="Custos do carro"
        resumo={`Custos fixos por mês: ${formatarMoeda(mes.seguro + mes.ipva + mes.financiamentoOuAluguel)}`}
      >
        {campos(CUSTOS)}
        <div className="col-span-2 space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Pagamento do carro
          </p>
          <Segmentado
            rotulo="Pagamento do carro"
            opcoes={OPCOES_PAGAMENTO}
            valor={parametros.pagamentoDoCarro}
            onChange={(pagamentoDoCarro) =>
              onChange((atual) => ({ ...atual, pagamentoDoCarro }))
            }
          />
        </div>
        {campos([PAGAMENTO[parametros.pagamentoDoCarro]])}
      </Secao>

      <Secao
        titulo="Rotina de trabalho"
        resumo={`Faturamento por hora: ${formatarMoeda(projecao.faturamentoPorHora)}`}
      >
        {campos(ROTINA)}
      </Secao>

      <div className="flex flex-col items-center gap-1 text-center">
        <button
          type="button"
          onClick={restaurarPadrao}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw className="size-4" aria-hidden />
          Restaurar valores padrão
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Os dados ficam salvos só neste aparelho.
        </p>
      </div>
    </div>
  )
}

interface SecaoProps {
  titulo: string
  resumo: string
  children: ReactNode
}

function Secao({ titulo, resumo, children }: SecaoProps) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <h2 className="font-semibold">{titulo}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">{children}</div>
      <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 tabular-nums dark:bg-emerald-950/60 dark:text-emerald-300">
        {resumo}
      </p>
    </section>
  )
}

interface CampoParametroProps extends DefinicaoCampo {
  valor: number
  onChange: (campo: CampoNumerico, valor: number) => void
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
