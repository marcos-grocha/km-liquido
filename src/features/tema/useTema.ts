import { useEffect, useState } from 'react'
import {
  carregarTema,
  proximaEscolha,
  salvarTema,
  type Tema,
} from '../../storage/tema'

const CONSULTA_ESCURO = '(prefers-color-scheme: dark)'

function temaDoAparelho(): Tema {
  return window.matchMedia(CONSULTA_ESCURO).matches ? 'escuro' : 'claro'
}

/** O tema em uso e a função que troca para o outro. */
export function useTema(): [Tema, () => void] {
  const [escolhido, setEscolhido] = useState(carregarTema)
  const [aparelho, setAparelho] = useState(temaDoAparelho)

  // Acompanha o aparelho com o app aberto (ex.: modo escuro automático à noite).
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_ESCURO)
    const aoMudar = () => setAparelho(consulta.matches ? 'escuro' : 'claro')
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  // Força o tema no <html> (data-theme, que o index.css usa); sem escolha, segue o aparelho.
  useEffect(() => {
    const raiz = document.documentElement
    if (escolhido)
      raiz.dataset.theme = escolhido === 'escuro' ? 'dark' : 'light'
    else delete raiz.dataset.theme
    salvarTema(escolhido)
  }, [escolhido])

  const tema = escolhido ?? aparelho
  return [tema, () => setEscolhido(proximaEscolha(tema, aparelho))]
}
