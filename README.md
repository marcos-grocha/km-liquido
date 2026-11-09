# km-liquido

Calculadora de ganhos e despesas para motoristas de aplicativo. A partir do carro e da rotina
de trabalho, mostra quanto realmente sobra depois do combustível, da manutenção e dos custos
fixos — por hora, dia, semana, mês e ano.

O nome vem do indicador principal: o **km líquido**, quanto sobra de cada quilômetro rodado.

Acesse o app em [kmliquido.netlify.app](https://kmliquido.netlify.app).

### Instalar no celular

O km líquido é um PWA: dá para instalá-lo na tela de início e usá-lo sem internet.

- **iPhone**: abra o site no Safari, toque em **Compartilhar** e depois em **Adicionar à Tela
  de Início**.
- **Android**: abra o site no Chrome e toque em **Instalar app** (ou, no menu ⋮, **Adicionar à
  tela inicial**).

No iPhone, o app instalado guarda os dados separado do Safari: os valores do carro precisam ser
preenchidos de novo na primeira vez.

## Funcionalidades

- **Tela inicial**: a cada abertura do app, o ícone e o nome do app com dois botões: "Comece
  por aqui", que leva a Meu carro, e "Ir para os resultados", que leva ao Painel. Nela não
  aparecem o cabeçalho, a navegação de baixo nem o pop-up de doação. O ícone com o nome do
  app, no canto superior esquerdo, volta para ela.
- **Meu carro**: dois carros, o Principal e o Secundário, cada um com os dados do veículo e
  dos custos, com o pagamento como financiamento (por mês) ou aluguel (por semana). O seletor
  ao lado de "Veículo" troca o carro em uso, assim como um toque no nome do carro no
  cabeçalho. Cada alteração fica salva na hora, no carro em uso, sem botão de salvar. O
  Secundário vem como Dolphin GS. Tudo fica salvo no próprio aparelho.
- **Rotina**: a rotina de trabalho, que vale para os dois carros: km por hora, valor por km,
  horas e minutos por semana e dias por semana. As horas e os minutos por mês e os dias por
  mês (arredondados para baixo) aparecem calculados pelo app. Cada uma dessas duas abas tem o
  seu "Restaurar valores padrão": o de Meu carro volta só os carros, e o da Rotina, só a
  rotina.
- **Painel**: lucro real do mês, hora líquida, km líquido e o demonstrativo do faturamento
  bruto até o lucro, por hora, dia, semana, mês ou ano.
- **Quanto sobrou**: "fiz R$ X hoje, quanto sobrou?" — quanto do bruto separar para o combustível e
  para a manutenção. O km rodado é opcional; sem ele, a distância é estimada pelo valor por km.
- **Apoie o projeto**: pop-up com a chave Pix para doações e atalhos para o WhatsApp e o
  Instagram, para dúvidas, sugestões e críticas. Abre sozinho depois que o carro foi
  configurado e, uma vez fechado, só volta depois de uma semana. Ao fechar, encolhe de volta
  para o coração do cabeçalho, que abre o pop-up a qualquer momento e mostra um pontinho de
  notificação a cada abertura do app, até ser tocado.
- **Tema claro e escuro**: segue o aparelho e pode ser trocado à mão pelo botão entre o nome
  do carro e o coração. A escolha fica salva; escolher o tema do aparelho volta a segui-lo.
- **Telas largas**: no computador ou no tablet deitado (1024 px ou mais, na horizontal), as
  telas se abrem em colunas, com até 960 px de largura. No Meu carro, o card Veículo se divide
  em duas metades, com os custos fixos à direita; na Rotina, as horas e os dias ficam à
  esquerda e o km por hora e o valor por km à direita; no Painel, os três cards de cima ficam
  numa coluna estreita e o demonstrativo à direita; no Quanto sobrou, o resultado aparece ao
  lado do formulário. No celular e no tablet em pé, o layout continua o mesmo.

## Regras de cálculo

As regras vêm de uma planilha usada como referência e estão especificadas em
[docs/regras-de-calculo.md](docs/regras-de-calculo.md). O núcleo de cálculo fica em
`src/core` e é testado contra os valores da planilha.

## Desenvolvimento

Requer Node.js 22.12 ou mais recente (o CI usa a versão 24).

```bash
npm install
npm run dev           # servidor local em http://localhost:5173
npm test              # testes (Vitest)
npm run lint          # Oxlint
npm run format        # Prettier
npm run build         # checagem de tipos e build de produção em dist/
```

### Estrutura

```
src/
  core/        regras de cálculo, sem dependência de React
  lib/         leitura e formatação de números em pt-BR
  storage/     persistência local (localStorage)
  components/  componentes de interface compartilhados
  features/    telas: inicio (tela inicial), meu-carro, rotina, painel, avulsa (aba "Quanto
               sobrou"), doacao (pop-up) e tema (botão de tema claro e escuro)
  pwa/         service worker (o build injeta a lista de arquivos; ver vite.config.ts)
public/        ícones e manifest do PWA
docs/          especificação das regras de cálculo
```

### Fluxo de trabalho

- Toda mudança entra por pull request; o CI roda lint, formatação, testes e build.
- Os commits seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com a
  descrição em português.

## Deploy

O app é estático (Vite) e está publicado na Netlify, em
[kmliquido.netlify.app](https://kmliquido.netlify.app). Cada merge na `main` publica em
produção, e cada pull request ganha um Deploy Preview com link no próprio PR. A configuração
de build fica em [`netlify.toml`](netlify.toml): `npm run build`, publicando `dist/`, com Node 24.

O service worker só existe no build de produção. Para testá-lo localmente, rode
`npm run build && npm run preview`. A cada deploy, ele ganha uma versão nova: o aparelho baixa
o app de novo e apaga a cópia anterior.

## Roadmap

- [x] Versão web: painel, calculadora avulsa e dados do carro
- [x] Publicação na Netlify
- [x] PWA: instalação na tela de início e uso offline
- [ ] App Android (APK)
- [ ] Publicação na Play Store
- [ ] Diário real: registrar ganhos, km e abastecimentos e comparar com a estimativa
- [ ] Metas: quantas horas rodar para chegar a um valor
- [ ] Outros custos: depreciação, licenciamento, celular
