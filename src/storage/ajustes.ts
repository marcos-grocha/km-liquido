import {
  AJUSTES_PADRAO,
  type Ajustes,
  type DadosDoCarro,
  type Rotina,
} from '../core/ajustes'
import { CAMPOS_NUMERICOS, validarCampo } from '../core/parametros'

const CHAVE = 'km-liquido:ajustes:v2'
/** Formato anterior: um carro só, com a rotina nos mesmos campos. */
const CHAVE_V1 = 'km-liquido:parametros:v1'

/** Lê os ajustes salvos no aparelho; campos ausentes ou inválidos voltam ao padrão. */
export function carregarAjustes(): Ajustes {
  try {
    return interpretarAjustes(lerJson(CHAVE), lerJson(CHAVE_V1))
  } catch {
    return AJUSTES_PADRAO
  }
}

/**
 * Monta os ajustes a partir do que estava salvo, no formato atual ou, sem ele, no
 * anterior: o carro antigo vira o Carro 01. Sem nada salvo, devolve o próprio
 * `AJUSTES_PADRAO`.
 */
export function interpretarAjustes(salvo: unknown, antigo: unknown): Ajustes {
  const [padrao1, padrao2] = AJUSTES_PADRAO.carros
  if (ehObjeto(salvo)) {
    const carros = Array.isArray(salvo.carros) ? salvo.carros : []
    return {
      carros: [lerCarro(carros[0], padrao1), lerCarro(carros[1], padrao2)],
      carroAtivo: salvo.carroAtivo === 1 ? 1 : 0,
      rotina: lerRotina(salvo.rotina),
    }
  }
  if (ehObjeto(antigo)) {
    return {
      carros: [lerCarro(antigo, padrao1), padrao2],
      carroAtivo: 0,
      rotina: lerRotina(antigo),
    }
  }
  return AJUSTES_PADRAO
}

export function salvarAjustes(ajustes: Ajustes): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(ajustes))
    localStorage.removeItem(CHAVE_V1)
  } catch {
    // Sem armazenamento disponível (modo privado, cota cheia): segue só em memória.
  }
}

export function apagarAjustes(): void {
  try {
    localStorage.removeItem(CHAVE)
    localStorage.removeItem(CHAVE_V1)
  } catch {
    // Sem armazenamento disponível: não há o que apagar.
  }
}

function lerJson(chave: string): unknown {
  return JSON.parse(localStorage.getItem(chave) ?? 'null')
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function lerCarro(dados: unknown, padrao: DadosDoCarro): DadosDoCarro {
  const carro = { ...padrao }
  if (!ehObjeto(dados)) return carro
  if (typeof dados.carro === 'string') carro.carro = dados.carro
  const pagamento = dados.pagamentoDoCarro
  if (pagamento === 'financiamento' || pagamento === 'aluguel') {
    carro.pagamentoDoCarro = pagamento
  }
  copiarNumeros(carro, dados)
  return carro
}

function lerRotina(dados: unknown): Rotina {
  const rotina = { ...AJUSTES_PADRAO.rotina }
  if (ehObjeto(dados)) copiarNumeros(rotina, dados)
  return rotina
}

/** Copia para `destino` os campos numéricos dele que estão salvos e são válidos. */
function copiarNumeros(destino: object, dados: Record<string, unknown>): void {
  for (const campo of CAMPOS_NUMERICOS) {
    const valor = dados[campo]
    if (
      campo in destino &&
      typeof valor === 'number' &&
      validarCampo(campo, valor) === null
    ) {
      ;(destino as Record<string, number>)[campo] = valor
    }
  }
}
