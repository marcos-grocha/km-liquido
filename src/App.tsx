import { useEffect, useMemo, useRef, useState } from 'react'
import { Cabecalho } from './components/Cabecalho'
import { NavegacaoInferior, type Aba } from './components/NavegacaoInferior'
import { useCamposComErro } from './components/useCamposComErro'
import { calcularProjecao } from './core/calculo'
import { AJUSTES_PADRAO, ROTULOS_CARRO, parametrosDe } from './core/ajustes'
import { Avulsa } from './features/avulsa/Avulsa'
import { Doacao } from './features/doacao/Doacao'
import { MeuCarro } from './features/meu-carro/MeuCarro'
import { Painel } from './features/painel/Painel'
import { Rotina } from './features/rotina/Rotina'
import {
  carregarFechamentoDoacao,
  deveAbrirDoacao,
  salvarFechamentoDoacao,
} from './storage/doacao'
import {
  apagarAjustes,
  carregarAjustes,
  salvarAjustes,
} from './storage/ajustes'

export default function App() {
  const [ajustes, setAjustes] = useState(carregarAjustes)
  // Sem nada salvo, o carro ainda não foi configurado: o app começa por ele.
  const [aba, setAba] = useState<Aba>(() =>
    ajustes === AJUSTES_PADRAO ? 'carro' : 'painel',
  )
  const [doacaoAberta, setDoacaoAberta] = useState(() =>
    deveAbrirDoacao(
      ajustes !== AJUSTES_PADRAO,
      carregarFechamentoDoacao(),
      Date.now(),
    ),
  )
  // O pontinho no coração some quando a pessoa toca nele e volta a cada abertura do app.
  const [pontinho, setPontinho] = useState(true)
  const coracao = useRef<HTMLButtonElement>(null)
  const [trocasDeCarro, setTrocasDeCarro] = useState(0)
  const parametros = useMemo(() => parametrosDe(ajustes), [ajustes])
  const projecao = useMemo(() => calcularProjecao(parametros), [parametros])
  // Campos em vermelho em Meu carro e Rotina: deixam os cálculos pendentes, inclusive no Painel.
  const camposComErro = useCamposComErro()

  // Só fica salvo o que o motorista editou. Sem edição (ou depois de
  // restaurar), vale o padrão atual do app, mesmo que ele mude numa versão nova.
  useEffect(() => {
    if (ajustes === AJUSTES_PADRAO) apagarAjustes()
    else salvarAjustes(ajustes)
  }, [ajustes])

  function trocarAba(novaAba: Aba) {
    setAba(novaAba)
    window.scrollTo({ top: 0 })
  }

  function trocarCarro() {
    setAjustes((atual) => ({
      ...atual,
      carroAtivo: atual.carroAtivo === 0 ? 1 : 0,
    }))
    setTrocasDeCarro((n) => n + 1)
  }

  function abrirPeloCoracao() {
    setDoacaoAberta(true)
    setPontinho(false)
  }

  function fecharDoacao() {
    setDoacaoAberta(false)
    salvarFechamentoDoacao(Date.now())
  }

  // As abas ficam montadas para não perder o que foi digitado ao trocar.
  return (
    <div className="mx-auto min-h-dvh max-w-md largo:max-w-240">
      <Cabecalho
        carro={parametros.carro}
        posicaoCarro={ROTULOS_CARRO[ajustes.carroAtivo]}
        trocas={trocasDeCarro}
        onTrocarCarro={trocarCarro}
        pontinho={pontinho}
        coracao={coracao}
        onApoiar={abrirPeloCoracao}
      />
      <main className="px-4 pb-28">
        <div hidden={aba !== 'rotina'}>
          <Rotina
            parametros={parametros}
            projecao={projecao}
            camposComErro={camposComErro}
            onChange={setAjustes}
          />
        </div>
        <div hidden={aba !== 'painel'}>
          <Painel
            projecao={projecao}
            parametros={parametros}
            camposComErro={camposComErro}
          />
        </div>
        <div hidden={aba !== 'avulsa'}>
          <Avulsa parametros={parametros} camposComErro={camposComErro} />
        </div>
        <div hidden={aba !== 'carro'}>
          <MeuCarro
            ajustes={ajustes}
            parametros={parametros}
            projecao={projecao}
            camposComErro={camposComErro}
            onChange={setAjustes}
          />
        </div>
      </main>
      <NavegacaoInferior aba={aba} onChange={trocarAba} />
      <Doacao aberta={doacaoAberta} onFechar={fecharDoacao} coracao={coracao} />
    </div>
  )
}
