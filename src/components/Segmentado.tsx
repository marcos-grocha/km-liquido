export interface OpcaoSegmentada<T extends string> {
  valor: T
  rotulo: string
}

interface SegmentadoProps<T extends string> {
  rotulo: string
  opcoes: OpcaoSegmentada<T>[]
  valor: T
  onChange: (valor: T) => void
}

/** Grupo de botões em que uma única opção fica selecionada. */
export function Segmentado<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
}: SegmentadoProps<T>) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
    >
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={opcao.valor === valor}
          onClick={() => onChange(opcao.valor)}
          className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${opcao.valor === valor ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}
