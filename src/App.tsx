import { useEffect, useMemo, useState } from 'react'
import { Cabecalho } from './components/Cabecalho'
import { NavegacaoInferior, type Aba } from './components/NavegacaoInferior'
import { calcularProjecao } from './core/calculo'
import { MeuCarro } from './features/meu-carro/MeuCarro'
import { Painel } from './features/painel/Painel'
import { carregarParametros, salvarParametros } from './storage/parametros'

export default function App() {
  const [parametros, setParametros] = useState(carregarParametros)
  const [aba, setAba] = useState<Aba>('painel')
  const projecao = useMemo(() => calcularProjecao(parametros), [parametros])

  useEffect(() => salvarParametros(parametros), [parametros])

  function trocarAba(novaAba: Aba) {
    setAba(novaAba)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Cabecalho carro={parametros.carro} />
      <main className="px-4 pb-28">
        {aba === 'painel' && (
          <Painel projecao={projecao} parametros={parametros} />
        )}
        {aba === 'carro' && (
          <MeuCarro
            parametros={parametros}
            projecao={projecao}
            onChange={setParametros}
          />
        )}
      </main>
      <NavegacaoInferior aba={aba} onChange={trocarAba} />
    </div>
  )
}
