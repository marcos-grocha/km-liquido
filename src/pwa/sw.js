// Service worker do km líquido: guarda o app no aparelho para ele abrir sem internet.
// No build, o vite.config.ts troca a versão e a lista de arquivos pelos do build atual.
const VERSAO = /* VERSAO */ ''
const ARQUIVOS = /* ARQUIVOS */ []
const CACHE = `km-liquido-${VERSAO}`
// O JS e o CSS são pedidos com crossorigin, e o servidor pode responder com "Vary: Origin":
// sem ignorar o Vary, a cópia guardada (baixada sem Origin) não seria encontrada offline.
const BUSCA = { ignoreVary: true }

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  )
})

// Apaga o que sobrou de versões anteriores.
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome.startsWith('km-liquido-') && nome !== CACHE)
            .map((nome) => caches.delete(nome)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const { request } = evento
  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== self.location.origin
  )
    return

  // Páginas: rede primeiro, para pegar a versão nova; sem internet, a cópia guardada.
  if (request.mode === 'navigate') {
    evento.respondWith(fetch(request).catch(() => caches.match('/', BUSCA)))
    return
  }

  // Demais arquivos: a cópia guardada primeiro (os do build têm hash no nome).
  evento.respondWith(
    caches.match(request, BUSCA).then((salvo) => salvo ?? fetch(request)),
  )
})
