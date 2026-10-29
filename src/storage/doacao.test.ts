import { describe, expect, it } from 'vitest'
import { deveAbrirDoacao } from './doacao'

describe('deveAbrirDoacao', () => {
  const agora = Date.UTC(2026, 9, 29, 12)
  const semana = 7 * 24 * 60 * 60 * 1000

  it('não abre antes de o carro ser configurado', () => {
    expect(deveAbrirDoacao(false, null, agora)).toBe(false)
    expect(deveAbrirDoacao(false, agora - 2 * semana, agora)).toBe(false)
  })

  it('abre para quem configurou o carro e nunca fechou o pedido', () => {
    expect(deveAbrirDoacao(true, null, agora)).toBe(true)
  })

  it('depois de fechado, só volta a abrir passada uma semana', () => {
    expect(deveAbrirDoacao(true, agora - 1000, agora)).toBe(false)
    expect(deveAbrirDoacao(true, agora - semana + 1, agora)).toBe(false)
    expect(deveAbrirDoacao(true, agora - semana, agora)).toBe(true)
  })
})
