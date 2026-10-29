import { useEffect, useMemo, useState } from 'react'
import { Cabecalho } from './components/Cabecalho'
import { NavegacaoInferior, type Aba } from './components/NavegacaoInferior'
import { calcularProjecao } from './core/calculo'
import { PARAMETROS_PADRAO } from './core/parametros'
import { Avulsa } from './features/avulsa/Avulsa'
import { MeuCarro } from './features/meu-carro/MeuCarro'
import { Painel } from './features/painel/Painel'
import {
  apagarParametros,
  carregarParametros,
  salvarParametros,
} from './storage/parametros'

export default function App() {
  const [parametros, setParametros] = useState(carregarParametros)
  // Sem nada salvo, o carro ainda não foi configurado: o app começa por ele.
  const [aba, setAba] = useState<Aba>(() =>
    parametros === PARAMETROS_PADRAO ? 'carro' : 'painel',
  )
  const projecao = useMemo(() => calcularProjecao(parametros), [parametros])

  // Só fica salvo o que o motorista editou. Sem edição (ou depois de
  // restaurar), vale o padrão atual do app, mesmo que ele mude numa versão nova.
  useEffect(() => {
    if (parametros === PARAMETROS_PADRAO) apagarParametros()
    else salvarParametros(parametros)
  }, [parametros])

  function trocarAba(novaAba: Aba) {
    setAba(novaAba)
    window.scrollTo({ top: 0 })
  }

  // As abas ficam montadas para não perder o que foi digitado ao trocar.
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Cabecalho carro={parametros.carro} />
      <main className="px-4 pb-28">
        <div hidden={aba !== 'painel'}>
          <Painel projecao={projecao} parametros={parametros} />
        </div>
        <div hidden={aba !== 'avulsa'}>
          <Avulsa parametros={parametros} />
        </div>
        <div hidden={aba !== 'carro'}>
          <MeuCarro
            parametros={parametros}
            projecao={projecao}
            onChange={setParametros}
          />
        </div>
      </main>
      <NavegacaoInferior aba={aba} onChange={trocarAba} />
    </div>
  )
}
