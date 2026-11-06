import { RotateCcw } from 'lucide-react'
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { Campo } from '../../components/Campo'
import { Segmentado } from '../../components/Segmentado'
import {
  AJUSTES_PADRAO,
  ROTULOS_CARRO,
  alterarParametro,
  salvarCarroComo,
  type Ajustes,
  type IndiceCarro,
} from '../../core/ajustes'
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
import { SalvarCarro } from './SalvarCarro'

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

/**
 * Cada metade do card Veículo. No celular, as duas se empilham na mesma grade;
 * em tela larga, o veículo e a manutenção ficam à esquerda e os custos fixos à direita.
 */
const METADE =
  'col-span-2 grid grid-cols-2 content-start gap-3 largo:col-span-1'

const OPCOES_CARRO = ([0, 1] as const).map((indice) => ({
  valor: String(indice) as `${IndiceCarro}`,
  rotulo: ROTULOS_CARRO[indice],
}))

interface MeuCarroProps {
  ajustes: Ajustes
  /** Os parâmetros do carro em uso, já com a rotina. */
  parametros: Parametros
  projecao: Projecao
  onChange: Dispatch<SetStateAction<Ajustes>>
}

export function MeuCarro({
  ajustes,
  parametros,
  projecao,
  onChange,
}: MeuCarroProps) {
  // Mudar a versão recria os campos com os valores restaurados.
  const [versao, setVersao] = useState(0)
  const [escolhendoOndeSalvar, setEscolhendoOndeSalvar] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const { mes } = projecao.periodos

  function alterar<C extends keyof Parametros>(campo: C, valor: Parametros[C]) {
    onChange((atual) => alterarParametro(atual, campo, valor))
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

  function salvarComo(destino: IndiceCarro) {
    onChange((atual) => salvarCarroComo(atual, destino))
    setEscolhendoOndeSalvar(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  function restaurarPadrao() {
    const confirmado = window.confirm(
      'Voltar para os valores padrão? Os dois carros e a rotina serão substituídos.',
    )
    if (!confirmado) return
    onChange(AJUSTES_PADRAO)
    setVersao((v) => v + 1)
  }

  return (
    <>
      {/* Trocar de carro também recria os campos, agora com os dados do outro carro. */}
      {/* Em tela larga, o card Veículo ocupa duas colunas e a rotina a terceira. */}
      <div
        key={`${versao}-${ajustes.carroAtivo}`}
        className="space-y-4 largo:grid largo:grid-cols-3 largo:items-start largo:gap-4 largo:space-y-0"
      >
        <Secao
          titulo="Veículo"
          className="largo:col-span-2"
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
            <div className="col-span-2 flex items-end gap-2">
              <Campo
                className="min-w-0 flex-1"
                rotulo="Nome do carro"
                inputMode="text"
                valor={parametros.carro}
                placeholder="Ex.: Argo"
                maxLength={30}
                onChange={(carro) => alterar('carro', carro)}
              />
              <button
                type="button"
                onClick={() => setEscolhendoOndeSalvar(true)}
                className="h-11.5 shrink-0 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
              >
                {salvo ? 'Salvo!' : 'Salvar'}
              </button>
            </div>
            {campos(VEICULO)}
            {campos([MANUTENCAO])}
            <Resumo className="col-span-2">
              Custo por km: {formatarMoeda(projecao.custoPorKm)}
            </Resumo>
            {/* Em tela larga, a linha vertical entre as metades já separa os custos fixos. */}
            <hr className="col-span-2 border-slate-200 largo:hidden dark:border-slate-800" />
          </div>
          <div
            className={`${METADE} largo:border-l largo:border-slate-200 largo:pl-6 dark:largo:border-slate-800`}
          >
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
            <Resumo className="col-span-2 mt-1">
              Custos fixos por mês:{' '}
              {formatarMoeda(
                mes.seguro + mes.ipva + mes.financiamentoOuAluguel,
              )}
            </Resumo>
          </div>
        </Secao>

        <Secao
          titulo="Rotina de trabalho"
          resumo={`Faturamento por hora: ${formatarMoeda(projecao.faturamentoPorHora)}`}
        >
          {campos(ROTINA)}
        </Secao>

        <div className="flex flex-col items-center gap-1 text-center largo:col-span-3">
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

      <SalvarCarro
        aberto={escolhendoOndeSalvar}
        nomes={[ajustes.carros[0].carro, ajustes.carros[1].carro]}
        carroAtivo={ajustes.carroAtivo}
        onEscolher={salvarComo}
        onFechar={() => setEscolhendoOndeSalvar(false)}
      />
    </>
  )
}

interface SecaoProps {
  titulo: string
  /** Controle que fica ao lado do título. */
  acao?: ReactNode
  /** Sem ele, o resumo fica por conta dos próprios campos. */
  resumo?: string
  className?: string
  children: ReactNode
}

function Secao({ titulo, acao, resumo, className = '', children }: SecaoProps) {
  return (
    <section
      className={`rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{titulo}</h2>
        {acao}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 largo:gap-x-6">
        {children}
      </div>
      {resumo && <Resumo className="mt-4">{resumo}</Resumo>}
    </section>
  )
}

/** Valor calculado a partir dos campos, em destaque. */
function Resumo({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <p
      className={`rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 tabular-nums dark:bg-emerald-950/60 dark:text-emerald-300 ${className}`}
    >
      {children}
    </p>
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
