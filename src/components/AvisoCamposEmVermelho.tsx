import type { AbaComErro } from './useCamposComErro'

/**
 * "Preencha os campos em vermelho em Meu carro e Rotina", para as abas que não
 * têm os campos. O nome de cada aba vem em vermelho, para a pessoa saber aonde ir.
 */
export function AvisoCamposEmVermelho({ abas }: { abas: AbaComErro[] }) {
  return (
    <>
      Preencha os campos em vermelho em{' '}
      {abas.map((aba, i) => (
        <span key={aba}>
          {i > 0 && ' e '}
          {/* Fundo claro: o vermelho fica legível sobre o cartão cinza. */}
          <strong className="rounded bg-white px-1 font-semibold whitespace-nowrap text-rose-600 dark:bg-slate-900 dark:text-rose-400">
            {aba}
          </strong>
        </span>
      ))}
    </>
  )
}
