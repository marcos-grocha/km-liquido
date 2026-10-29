import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Arquivos de public/ que o app precisa para abrir sem internet ('/' é a própria página).
const ARQUIVOS_PUBLICOS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
]

/**
 * Gera o sw.js a partir de src/pwa/sw.js, com a lista de arquivos do build. A versão é um
 * hash do conteúdo de tudo, então qualquer mudança faz o aparelho baixar o app de novo.
 */
function serviceWorker(): Plugin {
  return {
    name: 'km-liquido:service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const hash = createHash('sha256')
      const doBuild = Object.values(bundle).map((saida) => {
        hash.update(saida.type === 'chunk' ? saida.code : saida.source)
        return `/${saida.fileName}`
      })
      for (const caminho of ARQUIVOS_PUBLICOS.slice(1)) {
        hash.update(
          readFileSync(new URL(`./public${caminho}`, import.meta.url)),
        )
      }

      const modelo = readFileSync(
        new URL('./src/pwa/sw.js', import.meta.url),
        'utf8',
      )
      hash.update(modelo)
      const arquivos = [
        ...ARQUIVOS_PUBLICOS,
        ...doBuild.filter((a) => a !== '/index.html'),
      ]
      const source = modelo
        .replace(
          "/* VERSAO */ ''",
          JSON.stringify(hash.digest('hex').slice(0, 12)),
        )
        .replace('/* ARQUIVOS */ []', JSON.stringify(arquivos))
      if (
        source.includes('/* VERSAO */') ||
        source.includes('/* ARQUIVOS */')
      ) {
        throw new Error(
          'src/pwa/sw.js: marcadores de versão ou arquivos não encontrados',
        )
      }

      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorker()],
})
