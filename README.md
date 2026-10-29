# km-liquido

Calculadora de ganhos e despesas para motoristas de aplicativo. A partir do carro e da rotina
de trabalho, mostra quanto realmente sobra depois do combustível, da manutenção e dos custos
fixos — por hora, dia, semana, mês e ano.

O nome vem do indicador principal: o **km líquido**, quanto sobra de cada quilômetro rodado.

Acesse o app em [kmliquido.netlify.app](https://kmliquido.netlify.app).

## Funcionalidades

- **Meu carro**: dados do veículo, da rotina e dos custos, com o pagamento do carro como
  financiamento (por mês) ou aluguel (por semana), salvos no próprio aparelho. O app abre
  nesta aba enquanto nenhum valor foi editado.
- **Painel**: lucro real do mês, hora líquida, km líquido e o demonstrativo do faturamento
  bruto até o lucro, por hora, dia, semana, mês ou ano.
- **Quanto sobrou**: "fiz R$ X hoje, quanto sobrou?" — quanto do bruto separar para o combustível e
  para a manutenção. O km rodado é opcional; sem ele, a distância é estimada pelo valor por km.
- **Apoie o projeto**: pop-up com a chave Pix para doações e um botão do WhatsApp para
  dúvidas, sugestões e críticas. Abre sozinho depois que o carro foi configurado e, uma vez
  fechado, só volta depois de uma semana. Ao fechar, encolhe de volta para o coração do
  cabeçalho, que abre o pop-up a qualquer momento e mostra um pontinho de notificação a cada
  abertura do app, até ser tocado.

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
  features/    telas: meu-carro, painel, avulsa (aba "Quanto sobrou") e doacao (pop-up)
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

## Roadmap

- [x] Versão web: painel, calculadora avulsa e dados do carro
- [x] Publicação na Netlify
- [ ] App Android (APK)
- [ ] Publicação na Play Store
- [ ] Diário real: registrar ganhos, km e abastecimentos e comparar com a estimativa
- [ ] Metas: quantas horas rodar para chegar a um valor
- [ ] Outros custos: depreciação, licenciamento, celular
