import { useMemo } from 'react'
import { Cabecalho } from './components/Cabecalho'
import { calcularProjecao } from './core/calculo'
import { PARAMETROS_PADRAO } from './core/parametros'
import { Painel } from './features/painel/Painel'

export default function App() {
  const parametros = PARAMETROS_PADRAO
  const projecao = useMemo(() => calcularProjecao(parametros), [parametros])

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Cabecalho carro={parametros.carro} />
      <main className="px-4 pb-8">
        <Painel projecao={projecao} parametros={parametros} />
      </main>
    </div>
  )
}
