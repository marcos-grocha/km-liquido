import { useCallback, useState } from 'react'
import { ehCampoDoCarro } from '../core/ajustes'
import type { CampoNumerico } from '../core/parametros'

/** Os campos com erro e como marcá-los; o App guarda um só para todas as abas. */
export type CamposComErro = ReturnType<typeof useCamposComErro>

/** Abas onde ficam os campos que podem ter erro. */
export type AbaComErro = 'Meu carro' | 'Rotina'

/**
 * Campos que estão com erro. Os cálculos que dependem deles ficam pendentes:
 * zerados e em cinza, até o campo voltar a ter um valor válido.
 */
export function useCamposComErro() {
  const [campos, setCampos] = useState<ReadonlySet<CampoNumerico>>(
    () => new Set(),
  )

  // Estável, para os campos poderem avisar dentro de um efeito.
  const marcarErro = useCallback((campo: CampoNumerico, comErro: boolean) => {
    setCampos((atual) => {
      if (atual.has(campo) === comErro) return atual
      const novos = new Set(atual)
      if (comErro) novos.add(campo)
      else novos.delete(campo)
      return novos
    })
  }, [])

  function algumComErro(...lista: CampoNumerico[]): boolean {
    return lista.some((campo) => campos.has(campo))
  }

  /** Abas dos campos da lista que têm erro, para quem não tem os campos apontar aonde ir. */
  function abasComErro(...lista: CampoNumerico[]): AbaComErro[] {
    const comErro = lista.filter((campo) => campos.has(campo))
    const abas: AbaComErro[] = []
    if (comErro.some(ehCampoDoCarro)) abas.push('Meu carro')
    if (comErro.some((campo) => !ehCampoDoCarro(campo))) abas.push('Rotina')
    return abas
  }

  return { algumComErro, abasComErro, marcarErro }
}
