import { describe, expect, it } from 'vitest'
import { proximaEscolha, validarTema } from './tema'

describe('validarTema', () => {
  it('aceita só os temas conhecidos', () => {
    expect(validarTema('claro')).toBe('claro')
    expect(validarTema('escuro')).toBe('escuro')
    expect(validarTema('azul')).toBeNull()
    expect(validarTema(null)).toBeNull()
  })
})

describe('proximaEscolha', () => {
  it('troca para o tema que não é o do aparelho e guarda a escolha', () => {
    expect(proximaEscolha('claro', 'claro')).toBe('escuro')
    expect(proximaEscolha('escuro', 'escuro')).toBe('claro')
  })

  it('volta a seguir o aparelho ao escolher o tema dele', () => {
    expect(proximaEscolha('escuro', 'claro')).toBeNull()
    expect(proximaEscolha('claro', 'escuro')).toBeNull()
  })
})
