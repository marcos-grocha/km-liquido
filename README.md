# km-liquido

Calculadora de ganhos e despesas para motoristas de aplicativo. A partir do carro e da rotina
de trabalho, mostra quanto realmente sobra depois do combustível, da manutenção e dos custos
fixos — por hora, dia, semana, mês e ano.

O nome vem do indicador principal: o **km líquido**, quanto sobra de cada quilômetro rodado.

## Funcionalidades

- **Painel**: lucro real do mês, hora líquida, km líquido e o demonstrativo do faturamento
  bruto até o lucro, por hora, dia, semana, mês ou ano.
- **Avulsa**: "fiz R$ X hoje, quanto sobrou?" — quanto do bruto separar para o combustível e
  para a manutenção. O km rodado é opcional; sem ele, a distância é estimada pelo valor por km.
- **Meu carro**: dados do veículo, da rotina e dos custos, com o pagamento do carro como
  financiamento (por mês) ou aluguel (por semana), salvos no próprio aparelho.

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
  features/    telas: painel, avulsa e meu-carro
docs/          especificação das regras de cálculo
```

### Fluxo de trabalho

- Toda mudança entra por pull request; o CI roda lint, formatação, testes e build.
- Os commits seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com a
  descrição em português.

## Deploy

O app é estático (Vite) e roda na Vercel: ao importar o repositório em
[vercel.com/new](https://vercel.com/new), a configuração de Vite é detectada automaticamente.
Cada push na `main` publica em produção, e cada pull request ganha uma URL de pré-visualização.

## Roadmap

- [x] Versão web: painel, calculadora avulsa e dados do carro
- [ ] Publicação na Vercel
- [ ] App Android (APK)
- [ ] Publicação na Play Store
- [ ] Diário real: registrar ganhos, km e abastecimentos e comparar com a estimativa
- [ ] Metas: quantas horas rodar para chegar a um valor
- [ ] Outros custos: depreciação, licenciamento, celular
