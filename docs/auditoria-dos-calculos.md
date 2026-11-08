# Auditoria dos cálculos — km-liquido

Auditoria de todos os cálculos do app, feita em 07/11/2026 sobre o commit `406d7d9`. Responde a duas
perguntas: as contas estão coerentes? E condizem com a realidade do motorista? Os valores citados
usam os padrões do app nessa versão (Argo Drive como Principal e Dolphin GS como Secundário). Depois
da auditoria, o commit `f24028b` passou a mostrar as horas por dia na aba Rotina; isso foi
considerado nos itens 12 e 19.

O documento tem duas partes: um resumo (Relatório 1) e o detalhamento dos pontos de melhoria, com a
justificativa de cada um (Relatório 2). Nenhuma correção foi feita junto com a auditoria.

## Relatório 1 — Resumo

**As contas estão corretas e coerentes. O app calcula bem o que se propõe a calcular, mas o "Lucro
real" sai otimista porque alguns custos de verdade ficam de fora.**

- **Coerência: sim.** Todas as fórmulas foram refeitas do zero, sem usar o código do app. Os 527
  valores conferidos deram iguais, 200 mil cenários aleatórios fecharam todos, os casos da planilha
  batem ao centavo e os 88 testes passam.
- **Realidade: em parte.** Receita por km, combustível, manutenção e a divisão de seguro, IPVA e
  parcela ou aluguel pelas horas trabalhadas estão bem feitos. Mas o "Lucro real" não desconta
  depreciação, celular, lavagem, licenciamento nem INSS/MEI, e conta 52 semanas de trabalho por ano.
  Com os valores padrão (carro próprio), o app mostra **R$ 3.747/mês**; o ganho estimado fica entre
  **R$ 2.640 e R$ 2.790**.
- **Erro mais sério:** "1.500" digitado com ponto de milhar vira **R$ 1,50**, sem aviso. Afeta
  seguro, IPVA, parcela e aluguel.
- **No modo Aluguel**, o app continua descontando IPVA, seguro e manutenção, que as locadoras
  costumam incluir. O lucro aparece até R$ 697/mês menor do que é.
- **Valores padrão:** a maioria é realista. Três estão otimistas: aluguel de R$ 500/semana (um Argo
  sai por R$ 720–770), seguro R$ 0 e manutenção do Dolphin a R$ 0,05/km.

**Assertividade: ≈ 85%** (matemática 100% · entrada e telas ≈ 85% · fidelidade à realidade ≈ 72%).

## Relatório 2 — Detalhado

### Como foi feito

Cinco análises independentes: matemática, entrada de dados, exibição, modelo econômico e valores
padrão, esta com pesquisa de mercado de novembro de 2026. Depois, três revisões cruzadas tentaram
derrubar cada ponto: uma reproduzindo tecnicamente, uma defendendo as escolhas do app e uma
conferindo a realidade do motorista. Nenhum dos 39 pontos caiu; a prioridade é a mediana das três
revisões. Além do recálculo independente, os caminhos de digitação foram testados no app compilado.

### O que está certo

- **Todas as fórmulas, com unidades coerentes:** combustível por km, receita, custos por km, divisão
  dos custos fixos pelas horas trabalhadas, aluguel semanal × 52 ÷ 12, km líquido, hora líquida e
  "Quanto sobrou".
- **Calendário consistente:** semana × 52 = mês × 12 = ano, e dia × dias por semana = semana. Não há
  divisão por zero, porque a validação exige valores maiores que zero nos campos que dividem.
- **Documentação e dados salvos:** os casos de referência de
  [regras-de-calculo.md](regras-de-calculo.md) (§2 a §5) e as diferenças da §6 batem ao centavo. A
  conversão das horas por mês salvas para horas por semana é exata e não mudou nenhum lucro.
- **Valores padrão realistas:** 20 km/h, R$ 1,70/km (R$ 34/h), 44 h e 6 dias por semana, manutenção
  do Argo a R$ 0,15/km, e no Dolphin 7 km/kWh com R$ 2/kWh (recarga pública).
- **Exclusões corretas:**
  - IR: zero com os valores padrão em 2026. A base é 60% do bruto, R$ 3.889,60, abaixo do limite de
    R$ 5.000 da Lei 15.270/2025.
  - Pedágio: a plataforma repassa ao motorista.
  - Alimentação: é gasto pessoal.

### Prioridade alta

#### 1. "1.500" vira R$ 1,50

[`src/lib/numero.ts`](../src/lib/numero.ts#L61-L84) (`lerNumero`)

- **O que acontece:** um ponto sozinho é lido como vírgula decimal: "1.500" vira 1,5 e "4.800" vira
  4,8. O valor passa na validação e entra na conta na hora.
- **Por que importa:** é assim que se escreve milhar no Brasil, e o próprio app mostra "R$
  1.500,00".
  - IPVA "1.500": lucro de R$ 3.871,88 em vez de R$ 3.747,00.
  - Parcela "1.200": R$ 3.745,80 em vez de R$ 2.547,00 (+47%), sem nenhuma mensagem.
  - O risco é maior no Android e no computador; no iPhone em português o teclado numérico não tem
    ponto.
  - Atenuante: ao sair do campo ele passa a mostrar "1,5", e o resumo de custos fixos despenca.
- **Sugestão:** nos campos de valores altos (seguro, IPVA, parcela, aluguel e os dois do "Quanto
  sobrou"), ler "1.500" como milhar. Nos campos de R$/L, R$/km e km/L, manter o ponto como decimal;
  senão um preço de bomba como "6.959" quebra. Mostrar embaixo do campo o valor que o app entendeu e
  cobrir esses casos com testes ("1.500", "4.800", "12.000", "6.95", "6.959").

#### 2. "Lucro real" sem depreciação, e a tela não avisa

[`src/core/calculo.ts`](../src/core/calculo.ts#L79-L110) (`calcularPeriodo`) ·
[`src/features/painel/Painel.tsx`](../src/features/painel/Painel.tsx#L39-L52)

- **O que acontece:** com carro próprio, nada representa a perda de valor de um carro que roda
  45.760 km/ano no padrão. Essa ausência só está registrada em
  [regras-de-calculo.md](regras-de-calculo.md) (§7), não na tela.
- **Por que importa:**
  - Pela tabela FIPE do Argo Drive, a depreciação fica entre R$ 349 e R$ 1.041/mês, de −9% a −28% do
    lucro.
  - Com uma depreciação de R$ 670 (valor do meio) mais os custos do item 4, o ganho cai para R$
    2.786; com 2 semanas paradas (item 5), para R$ 2.638. O número em destaque fica 34% a 42% acima
    disso.
  - Efeitos colaterais: o lucro "salta" quando o financiamento acaba, e a comparação entre carro
    próprio e alugado favorece o próprio (o aluguel já embute a depreciação).
- **Sugestão:**
  - Já: uma nota sob o card ("Não inclui depreciação, INSS/MEI, celular, lavagem e licenciamento")
    ou o nome "Sobra no mês".
  - Depois: um campo de depreciação por carro, com ajuda baseada na FIPE ("valor de compra menos
    revenda estimada, dividido pelos meses de uso") e escondido no modo Aluguel.
  - Cuidado: a parcela do financiamento já paga parte do carro. Somar a depreciação a ela sem
    explicar conta o carro duas vezes.

#### 3. Com aluguel, IPVA, seguro e manutenção continuam descontados

[`src/core/ajustes.ts`](../src/core/ajustes.ts#L4-L14) (`CAMPOS_DO_CARRO`) ·
[`src/features/meu-carro/MeuCarro.tsx`](../src/features/meu-carro/MeuCarro.tsx#L55-L63)

- **O que acontece:** trocar para "Aluguel" não mexe nos outros custos do carro. A dica também não
  avisa que locadoras como Zarp/Localiza, Kovi e Movida costumam incluir IPVA, seguro e manutenção.
- **Por que importa:**
  - O Argo alugado mostra R$ 1.580,33; sem IPVA e manutenção, seria R$ 2.277,33 (até R$ 697/mês, ou
    44%). No Dolphin, a diferença chega a R$ 890,67.
  - O IPVA (R$ 125/mês) é quase certamente cobrado duas vezes; a manutenção depende do contrato.
  - O erro é para o lado conservador: o lucro aparece menor do que é.
- **Sugestão:** no modo Aluguel, perguntar o que o contrato inclui. Ou zerar e esconder IPVA e
  seguro, com a dica "O aluguel costuma incluir IPVA, seguro e manutenção; preencha só o que você
  paga à parte".

### Prioridade média

#### 4. Custos do trabalho fora da conta

[`src/core/calculo.ts`](../src/core/calculo.ts#L79-L110) ·
[regras-de-calculo.md](regras-de-calculo.md) (§7)

- **O que acontece:** celular/internet, lavagem, licenciamento e INSS ou DAS-MEI (R$ 86,05 em 2026)
  não entram na conta, nem como campo genérico.
- **Impacto:** cerca de R$ 290/mês, de −5,9% a −14% do lucro padrão. O bruto anual do padrão (R$
  77.792) já é 96% do teto do MEI (R$ 81 mil).
- **Sugestão:** lista de "outros custos", por mês e por km, que já está no roadmap.

#### 5. O ano conta 52 semanas de trabalho

[`src/core/calculo.ts`](../src/core/calculo.ts#L55-L77) (`horasPorMes`, `horasPorPeriodo`)

- **O que acontece:** as horas por mês saem de 52 semanas trabalhadas por ano, sem férias, doença ou
  carro na oficina, enquanto seguro, IPVA, parcela e aluguel correm nos 12 meses.
- **Impacto:** 2 a 4 semanas paradas tiram R$ 149 a R$ 298/mês (−4% a −8%); com aluguel sem pausa,
  −9% a −19%. Dá para contornar informando a média do ano em "Horas por semana", mas a tela não diz
  isso.
- **Sugestão:** dica "use a média do ano, descontando férias e dias parados" ou campo "semanas
  trabalhadas por ano" (ex.: 48).

#### 6. Aluguel padrão de R$ 500/semana apresentado como "sugestão realista"

[`src/core/parametros.ts`](../src/core/parametros.ts#L50) ·
[`src/components/campos.ts`](../src/components/campos.ts#L19-L21)

- **O que acontece:** o campo já vem com 500, o placeholder chama o valor de realista, e o Dolphin
  herda os mesmos R$ 500.
- **Impacto:** um Argo custa R$ 720–770 por semana nas locadoras (nov/2026). A preço de mercado, o
  lucro com aluguel cairia de R$ 1.580 para R$ 411–627. Quem aluga de fato tende a digitar o próprio
  valor.
- **Sugestão:** atualizar para a faixa de mercado, citando mês e fonte, e lembrar na dica da
  franquia de km; valor próprio para o Dolphin.

#### 7. Seguro padrão R$ 0 no Argo

[`src/core/parametros.ts`](../src/core/parametros.ts#L46)

- **O que acontece:** o Principal vem sem seguro, e o Secundário com R$ 4.800/ano.
- **Impacto:** 56% dos motoristas pagam seguro, em média R$ 212/mês (Amobitec/Cebrap). Para eles, o
  lucro cai de 5,7% a 9,1%. Os outros 44% justificam o 0 como opção, mas não como padrão sem
  explicação.
- **Sugestão:** dica "R$ 0 = sem seguro; com uso em app costuma custar R$ 2.500–4.000/ano", ou
  padrão de R$ 2.500–3.000.

#### 8. Manutenção do Dolphin a R$ 0,05/km

[`src/core/ajustes.ts`](../src/core/ajustes.ts#L80)

- **O que acontece:** o valor é um terço do Argo (R$ 0,15/km).
- **Impacto:** pneus e revisões dão R$ 0,08–0,13/km no uso de app; o lucro do Dolphin fica R$
  114–305/mês acima do real (de −2,5% a −6,8%).
- **Sugestão:** subir para cerca de R$ 0,10/km e lembrar na dica que os pneus pesam mais num
  elétrico.

#### 9. Km do "Quanto sobrou" sem orientação nem conferência

[`src/features/avulsa/Avulsa.tsx`](../src/features/avulsa/Avulsa.tsx#L57-L67) ·
[`src/core/calculo.ts`](../src/core/calculo.ts#L150-L168) (`calcularAvulsa`)

- **O que acontece:** o campo só explica o caso em branco. Não pede o km do hodômetro nem compara o
  R$/km resultante com o da Rotina.
- **Impacto:** quem digita só o km das corridas (o que os apps mostram) vê a sobra 22–24% maior e a
  reserva de combustível 32% menor. Leituras erradas, como "1.200" lido como 1,2 km, também passam
  sem alerta.
- **Sugestão:** dica "use o hodômetro: todo o km do dia, com e sem passageiro" e aviso quando o
  R$/km resultante sair de 0,5× a 2× o valor da Rotina.

### Prioridade baixa

#### Entrada de dados

10. **Separador repetido ou no fim vira milhar** ([`numero.ts`](../src/lib/numero.ts#L65-L79)).
    "12,5," vira 125 e "6,95." vira 695, sem erro. Sugestão: recusar vírgula repetida, separadores
    colados e separador no fim.
11. **Sem limite de plausibilidade** ([`parametros.ts`](../src/core/parametros.ts#L60-L73)). 130
    km/L é aceito, e o lucro sobe 49% com cara de verdade; nos outros campos, o erro costuma ser
    grosseiro e visível. Sugestão: alertas que não bloqueiam (ex.: consumo acima de 50 km/L, valor
    por km acima de R$ 5).
12. **Horas por semana não são conferidas com os dias**
    ([`parametros.ts`](../src/core/parametros.ts#L64-L65)). 44 h em 1 dia cria um "dia" de 44 horas.
    Desde o commit `f24028b`, a Rotina mostra "Horas por dia", o que deixa o caso visível, mas ele
    continua aceito. Sugestão: limitar as horas por semana a 24 × dias por semana.
13. **Digitação que termina com erro deixa um valor parcial na conta**
    ([`CampoParametro.tsx`](../src/components/CampoParametro.tsx#L54-L77),
    [`CampoHoras.tsx`](../src/components/CampoHoras.tsx#L44-L75)). Digitar "170" nas horas grava
    17h03, e o campo fica mostrando 170 com erro. Sugestão: voltar ao valor anterior quando o campo
    perde o foco com erro.
14. **Minutos: digitar "30" grava 3**
    ([`CampoHoras.tsx`](../src/components/CampoHoras.tsx#L101-L113)). O campo começa com "0" e
    aceita 2 dígitos. Sugestão: selecionar o conteúdo ao tocar no campo.
15. **Letras são apagadas e os números se juntam** ([`numero.ts`](../src/lib/numero.ts#L62)). "20 a
    25" vira 2025, e "1e3" vira 13. Sugestão: remover só unidades conhecidas e recusar o resto.
16. **A dica do valor por km não fala da taxa da plataforma**
    ([`Rotina.tsx`](../src/features/rotina/Rotina.tsx#L25-L32)). Os apps já mostram os ganhos sem a
    taxa, então o risco é pequeno, mas vale escrever "quanto o app te paga (já sem a taxa) ÷ km
    total rodado".
17. **Mensagem errada com km inválido no "Quanto sobrou"**
    ([`Avulsa.tsx`](../src/features/avulsa/Avulsa.tsx#L32-L38)). Pede para digitar o faturamento
    bruto, que já está preenchido. Sugestão: "Corrija o km rodado ou deixe em branco para estimar".

#### Exibição e rótulos

18. **Linhas do demonstrativo não somam o subtotal mostrado**
    ([`Painel.tsx`](../src/features/painel/Painel.tsx#L112-L143)). A diferença é de 1 a 2 centavos.
    No Dolphin, no mês: 5.393,14 − 190,67 − 400,00 − 300,00 = 4.502,47, e a tela mostra 4.502,48. O
    ano difere de 12 × o mês em até 6 centavos. Sugestão: calcular subtotais e lucro a partir das
    linhas já arredondadas.
19. **"Dias por mês" arredondado para baixo** ([`calculo.ts`](../src/core/calculo.ts#L60-L66)). Com
    5 dias por semana aparecem 21 dias, que não fecham com as horas por mês (−3,1%). Com as horas
    por dia exibidas desde `f24028b`, a diferença fica no mesmo card: 21 × 8h48 = 184h48, contra
    190h40. Sugestão: "21,7 dias" ou "21 dias completos".
20. **"Custo por km" é só combustível e manutenção**
    ([`MeuCarro.tsx`](../src/features/meu-carro/MeuCarro.tsx#L154-L156)). Sugestão: "Custo variável
    por km" e, ao lado, o custo total por km (com os fixos), que é o ponto de equilíbrio.
21. **"Líquido" com dois sentidos** ([`Painel.tsx`](../src/features/painel/Painel.tsx#L119-L139)).
    "Faturamento líquido" desconta só o combustível; "Hora líquida" e "KM líquido" descontam tudo.
    "Faturamento responsável" é jargão. Sugestão: "Depois do combustível" e "Depois dos custos do
    carro".
22. **"Dia" é o dia trabalhado** ([`Painel.tsx`](../src/features/painel/Painel.tsx#L12-L18)). O
    aluguel do dia é 500 ÷ 6 = R$ 83,33, mas o seletor não deixa isso claro. Sugestão: "Dia
    trabalhado".
23. **Elétrico com km/L e R$/L** ([`MeuCarro.tsx`](../src/features/meu-carro/MeuCarro.tsx#L23-L31)).
    O Dolphin já vem com 7 e 2 nesses campos, que na prática são km/kWh e R$/kWh. Sugestão: tipo de
    energia por carro (combustão, GNV, elétrico), trocando as unidades.
24. **"Sobra" com aluguel** ([`Avulsa.tsx`](../src/features/avulsa/Avulsa.tsx#L115-L128)). A sobra
    em destaque é 2,45 vezes o lucro real do dia; a tela avisa "Antes de seguro, IPVA e aluguel",
    mas sem o valor. Sugestão: mostrar "Separe para o aluguel: R$ 83,33".
25. **Porcentagens do "Quanto sobrou" somam 99% ou 101%**
    ([`Avulsa.tsx`](../src/features/avulsa/Avulsa.tsx#L93-L96)). Uma sobra quase zero aparece como
    "-0%". Sugestão: fechar a soma em 100% e usar `signDisplay: 'negative'`.
26. **Sinais de menos** ([`Painel.tsx`](../src/features/painel/Painel.tsx#L151-L175)). Há dois
    glifos diferentes ("−" e "-"), e custos zerados aparecem como "− R$ 0,00". Sugestão: padronizar
    e esconder o sinal em zero.
27. **Valores por km com 2 casas** ([`MeuCarro.tsx`](../src/features/meu-carro/MeuCarro.tsx#L155)).
    R$ 0,68 × km do mês não chega às linhas do Painel (−0,7%). Sugestão: 3 casas, como na bomba.

#### Valores padrão

28. **Gasolina e consumo** ([`parametros.ts`](../src/core/parametros.ts#L43-L44)). R$ 6,95 está
    acima da média da ANP (R$ 6,49 em out/2026), e 13 km/L é o número da etiqueta (em app, perto de
    12). Juntos dão quase o mesmo custo por km, mas quem corrige só o preço fica com um resultado
    otimista. Sugestão: R$ 6,49 e 12 km/L, com a dica "use o consumo que você mede".
29. **IPVA do Dolphin** ([`ajustes.ts`](../src/core/ajustes.ts#L82)). R$ 3.600 não segue a regra de
    nenhum estado: 4% em SP e MG, 0,5% no RJ, isento em RS, DF, PE e BA. Sugestão: dica "FIPE ×
    alíquota do seu estado".

#### Testes, documentação e dados salvos

30. **Fórmula do seguro sem teste** ([`calculo.test.ts`](../src/core/calculo.test.ts#L16-L31)).
    Todos os casos usam seguro 0, e três versões erradas da fórmula passam nos 88 testes. Sugestão:
    um caso com o Dolphin (seguro de R$ 400/mês; lucro de R$ 4.502,48).
31. **Testes não fixam os valores padrão nem as somas das telas**
    ([`calculo.test.ts`](../src/core/calculo.test.ts#L138)). O km líquido é testado com tolerância
    larga (0,8 ± 0,005, para um valor de 0,7962). Sugestão: testes dos cenários padrão nos 5
    períodos e funções puras para as somas feitas nas telas.
32. **Conta resumida do doc** ([`regras-de-calculo.md`](regras-de-calculo.md), §3). O texto escreve
    0,4964, mas o resultado usa o valor exato; refazendo à mão, dá R$ 0,04 de diferença. Sugestão:
    escrever 6,95 ÷ 14.
33. **Padrões congelados depois da primeira edição** ([`App.tsx`](../src/App.tsx#L42-L47)). O app
    salva o objeto inteiro, inclusive os campos que a pessoa não mexeu, e o comentário diz o
    contrário. Quem editou algo entre 28/10 e 06/11 ficou com a manutenção antiga de R$ 0,20/km.
    Sugestão: salvar só o que difere do padrão, ou corrigir o comentário.
34. **Dado salvo corrompido apaga tudo**
    ([`storage/ajustes.ts`](../src/storage/ajustes.ts#L14-L20)). Só acontece se alguém mexer no
    armazenamento por fora. Sugestão: ler cada chave no seu próprio `try/catch`.

### Observações (não são defeitos)

35. Hora líquida e km líquido são médias que incluem os custos fixos. Com aluguel, a hora líquida é
    R$ 8,29, mas uma hora a mais rende R$ 20,31. Vale mostrar também o ganho de uma hora a mais.
36. A rotina vale para os dois carros, então a comparação entre eles reflete só os custos.
37. Sem km informado, o "Quanto sobrou" usa o R$/km médio; num dia fraco, separa menos combustível
    do que o gasto.
38. Apagar um campo para zerá-lo traz o valor antigo de volta; é preciso digitar 0.
39. O ano de 52 semanas (364 dias) reduz as horas do mês em 0,35%, o que é desprezível.

### Como chegamos aos ≈ 85%

- **Matemática, 100%:** nenhuma fórmula errada nas 527 comparações e nos 200 mil cenários.
- **Entrada e telas, ≈ 85%:** dos 32 pontos conferidos entre digitação, telas e dados salvos, um
  está errado (a leitura do "1.500") e 17 têm ressalvas, quase todas de centavos ou de nome.
- **Realidade, ≈ 72%:** com os valores padrão e carro próprio, o ganho estimado (R$ 2.640 a R$
  2.790) equivale a 70%–74% do lucro mostrado. Com um carro que deprecia menos e sem semanas
  paradas, sobe para cerca de 85%.
- **Geral:** a média simples das três notas dá 86%; dando peso igual a coerência e realidade, 82%.
  Arredondado, 85%.

### Fontes e limitações

Fontes de mercado, consultadas em novembro de 2026:

- ANP, Síntese Semanal de Preços (18 a 24/10/2026): gasolina a R$ 6,49/L e etanol a R$ 4,11/L.
- Tabela FIPE do Argo Drive 1.0 e do BYD Dolphin GS (out–nov/2026, via sites agregadores).
- Ofertas de aluguel para motoristas no Uber Match (07/11/2026): Zarp/Localiza, Movida, Moover e
  Kovi.
- Amobitec/Cebrap (relatório de 2025, dados de nov/2024): seguro declarado por 56% dos motoristas,
  em média R$ 212/mês; aluguel médio de R$ 2.403/mês.
- Lei 15.270/2025 (IR a partir de 2026) e salário mínimo de 2026 (R$ 1.621), base do DAS-MEI.
- PBE/Inmetro (consumo do Argo Drive e do Dolphin GS) e regras estaduais de IPVA para elétricos
  (2026).

Limitações: parte dos dados de mercado vem de fontes secundárias; não houve teste em celulares
físicos (o comportamento dos teclados é conhecimento geral); a planilha original não está no
repositório, então os casos de referência foram conferidos contra
[regras-de-calculo.md](regras-de-calculo.md).
