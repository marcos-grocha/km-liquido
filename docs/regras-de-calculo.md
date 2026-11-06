# Regras de cálculo — km-liquido

Especificação do núcleo de cálculo do app. As regras vêm da planilha original do projeto:
as fórmulas foram reconstruídas a partir dos valores exibidos e reproduzem a planilha ao
centavo. As diferenças intencionais entre o app e a planilha estão na §6.

## 1. Entradas

| Campo                       |        Exemplo | Padrão do app | Unidade | Observação                                                 |
| --------------------------- | -------------: | ------------: | ------- | ---------------------------------------------------------- |
| Carro                       |           Argo |    Argo Drive | texto   |                                                            |
| KM por hora                 |             20 |            20 | km/h    | média rodada por hora trabalhada, com e sem passageiro     |
| Valor por KM                |           1,50 |          1,70 | R$/km   | faturamento bruto ÷ km total rodado (com e sem passageiro) |
| Horas por semana            | 15,23 (66/mês) |            44 | h       | até 168; a planilha pedia horas por mês (§3)               |
| Dias trabalhados por semana |              5 |             6 | dias    | só no app; distribui as horas entre dia e semana           |
| Valor do combustível        |           6,95 |          6,95 | R$/L    |                                                            |
| Economia do veículo         |             14 |            13 | km/L    |                                                            |
| Manutenção por KM           |           0,10 |          0,15 | R$/km   |                                                            |
| Seguro por ano              |              0 |             0 | R$      |                                                            |
| IPVA por ano                |          1.700 |         1.500 | R$      |                                                            |
| Pagamento do carro          |  financiamento | financiamento | —       | só no app: financiamento ou aluguel                        |
| Financiamento por mês       |              0 |             0 | R$      | quando o pagamento é financiamento                         |
| Aluguel por semana          |              — |           500 | R$      | só no app; quando o pagamento é aluguel                    |

O **exemplo** é o da planilha e é a base dos casos de referência (§4 e §5). O **padrão do app**
são os valores com que o app vem preenchido.

O app guarda dois carros, o Principal e o Secundário. Cada um tem nome, consumo, combustível,
manutenção, seguro, IPVA e pagamento; a rotina (km por hora, valor por km, horas por semana e
dias por semana) vale para os dois, e as contas usam o carro em uso. O Principal vem com o padrão da
tabela acima. O Secundário vem como Dolphin GS: consumo 7, combustível 2, manutenção 0,05, seguro
4.800 e IPVA 3.600, com o pagamento padrão.

## 2. Derivados

| Valor              | Fórmula                        | Exemplo |
| ------------------ | ------------------------------ | ------: |
| Combustível por KM | combustível ÷ economia         |  0,4964 |
| Custo por KM       | combustível/km + manutenção/km |  0,5964 |
| Valor por hora     | km/h × valor/km                |   30,00 |

O custo por KM aparece em Meu carro, no card Veículo. Ele é só para exibição: as métricas por
período (§3) calculam o combustível e a manutenção separados, cada um na sua linha.

## 3. Métricas por período

Cada período é medido em horas trabalhadas, a partir das horas por semana:

| Período | Horas                    | Exemplo |
| ------- | ------------------------ | ------: |
| hora    | 1                        |       1 |
| semana  | horas por semana         |   15,23 |
| ano     | semana × 52              |     792 |
| mês     | ano ÷ 12                 |      66 |
| dia     | semana ÷ dias por semana |    3,05 |

As horas por mês (semana × 52 ÷ 12) e os dias por mês (dias por semana × 52 ÷ 12) aparecem na
aba Rotina, calculados pelo app; o motorista informa só as horas e os dias por semana. A
planilha pedia as horas por mês: o exemplo de 66 h/mês equivale a 66 × 12 ÷ 52 = 15,23 h/semana.
Dados salvos com horas por mês, de versões anteriores do app, viram as horas por semana
equivalentes ao abrir, sem mudar nenhuma conta.

Na tela, as horas aparecem em horas e minutos, arredondadas ao minuto (3,05 h → 3h03min),
inclusive na aba Rotina: as horas por semana são informadas em dois campos, horas e minutos,
e as horas por mês aparecem do mesmo jeito. Os dias por mês aparecem arredondados para baixo,
só com dias completos (5 dias por semana dão 21,67, que aparecem como 21).

Para um período com `h` horas e fração do mês `f = h ÷ horas por mês`:

| Métrica                  | Fórmula                                                |
| ------------------------ | ------------------------------------------------------ |
| Quilometragem            | km/h × h                                               |
| Faturamento bruto        | km × valor/km                                          |
| Gasto com combustível    | km × combustível/km                                    |
| Faturamento líquido      | bruto − combustível                                    |
| Manutenção               | km × manutenção/km                                     |
| Seguro                   | seguro/ano ÷ 12 × f                                    |
| IPVA                     | IPVA/ano ÷ 12 × f                                      |
| TOTAL                    | manutenção + seguro + IPVA                             |
| Faturamento responsável  | faturamento líquido − TOTAL                            |
| Financiamento ou aluguel | financiamento/mês × f, ou aluguel/semana × 52 ÷ 12 × f |
| Lucro real               | faturamento responsável − financiamento ou aluguel     |

O faturamento responsável corresponde ao "Conservador" da planilha. Só um pagamento do carro
entra na conta, o escolhido: o aluguel semanal vira mensal com 52 semanas ÷ 12 meses, então vale
exatamente o aluguel no período "semana".

Indicadores em destaque:

- **Hora líquida** = lucro real do período "hora" (lucro do mês ÷ horas por mês).
- **KM líquido** = lucro real do mês ÷ km do mês.

Forma fechada do lucro mensal:

```
lucro = horas × km/h × (valor/km − combustível/km − manutenção/km) − (seguro + IPVA) ÷ 12 − financiamento ou aluguel mensal
      = 66 × 20 × (1,50 − 0,4964 − 0,10) − 1.700 ÷ 12 − 0
      = 1.192,71 − 141,67
      = 1.051,05
```

## 4. Casos de referência

### App (exemplo da §1)

| Métrica                 |  Hora |   Dia | Semana |      Mês |       Ano |
| ----------------------- | ----: | ----: | -----: | -------: | --------: |
| Quilometragem           | 20,00 | 60,92 | 304,62 | 1.320,00 | 15.840,00 |
| Bruto                   | 30,00 | 91,38 | 456,92 | 1.980,00 | 23.760,00 |
| Combustível             |  9,93 | 30,24 | 151,22 |   655,29 |  7.863,43 |
| Líquido                 | 20,07 | 61,14 | 305,70 | 1.324,71 | 15.896,57 |
| Manutenção              |  2,00 |  6,09 |  30,46 |   132,00 |  1.584,00 |
| Seguro                  |  0,00 |  0,00 |   0,00 |     0,00 |      0,00 |
| IPVA                    |  2,15 |  6,54 |  32,69 |   141,67 |  1.700,00 |
| TOTAL                   |  4,15 | 12,63 |  63,15 |   273,67 |  3.284,00 |
| Faturamento responsável | 15,92 | 48,51 | 242,55 | 1.051,05 | 12.612,57 |
| Lucro real              | 15,92 | 48,51 | 242,55 | 1.051,05 | 12.612,57 |

KM líquido: R$ 0,80.

Com aluguel de R$ 500 por semana no lugar do financiamento, o mesmo exemplo desconta R$ 100,00
por dia, R$ 500,00 por semana, R$ 2.166,67 por mês e R$ 26.000,00 por ano, e o lucro real fica
em −R$ 1.115,62 por mês.

### Planilha original

| Métrica       | Hora |   Dia | Semana |      Mês |       Ano |
| ------------- | ---: | ----: | -----: | -------: | --------: |
| Quilometragem |   20 | 62,86 | 314,29 |    1.320 |    15.840 |
| Bruto         |   30 | 94,29 | 471,43 |    1.980 |    23.760 |
| Combustível   |   10 | 31,43 | 157,14 |      660 |     7.920 |
| Líquido       |   20 | 62,86 | 314,29 |    1.320 |    15.840 |
| Manutenção    |      |  6,29 |  31,43 |      132 |     1.584 |
| Seguro        |      |       |        |        0 |         0 |
| IPVA          |      |       |        |   141,67 |     1.700 |
| TOTAL         |      |       |        |   273,67 |     3.284 |
| Conservador   |      |       |        | 1.046,33 |    12.556 |
| Lucro final   |      |       |        | 1.046,33 | 12.555,96 |

Com combustível por km de exatamente R$ 0,50 (combustível a R$ 7,00 e 14 km/L), os valores de mês e
ano do app batem com a planilha — e o lucro anual fica em 12.556,00, sem a diferença de
arredondamento.

## 5. Quanto sobrou

A aba responde "fiz R$ X hoje, quanto sobrou?": quanto do bruto separar para o combustível e
para a manutenção. Seguro, IPVA, financiamento e aluguel não entram. No código, é o cálculo
avulso (`calcularAvulsa`).

- km = km informado ou, se em branco, bruto ÷ valor/km
- combustível = km × combustível/km
- líquido = bruto − combustível
- manutenção = km × manutenção/km
- TOTAL = manutenção
- faturamento responsável (sobra) = líquido − TOTAL

| Caso                                        |    km | Combustível | Líquido | Manutenção | Sobra |
| ------------------------------------------- | ----: | ----------: | ------: | ---------: | ----: |
| Planilha (bruto 94,29; combustível/km 0,50) | 62,86 |       31,43 |   62,86 |       6,29 | 56,57 |
| App (bruto 94,29; combustível/km 0,4964)    | 62,86 |       31,21 |   63,08 |       6,29 | 56,80 |
| App (bruto 100,00; 80 km informados)        | 80,00 |       39,71 |   60,29 |       8,00 | 52,29 |

## 6. Diferenças entre o app e a planilha

1. **Sem arredondamento no meio da conta.** A planilha arredonda o combustível por km (0,4964 → 0,50,
   +R$ 4,71/mês de combustível) e o lucro mensal antes do × 12 (12.555,96 em vez de 12.556,00).
   O app calcula com precisão total e arredonda só na exibição.
2. **Calendário.** A planilha fixa 21 dias/mês e 5 dias/semana, e semana × 52 não fecha com o
   ano. O app usa 52 semanas/ano e "dias trabalhados por semana" como parâmetro. Mês e ano não
   mudam; dia e semana mudam (60,92 km/dia em vez de 62,86 no exemplo).
3. **Custos fixos rateados.** Seguro, IPVA e financiamento ou aluguel aparecem também por hora,
   dia e semana, proporcionais às horas trabalhadas. A planilha deixava essas células em branco.
4. **Hora líquida e km líquido** ficam em destaque no app; a planilha não os mostra.
5. **Aluguel.** A planilha só previa financiamento mensal. No app, o pagamento do carro pode ser
   financiamento (por mês) ou aluguel (por semana, R$ 500 por padrão).
6. **Dois carros.** A planilha tinha um carro só. O app guarda dois e calcula com o que estiver
   em uso, sempre com a mesma rotina.

## 7. Fora do escopo por enquanto

Custos não modelados: depreciação, licenciamento, celular/internet, lavagem, impostos/INSS.
Candidatos a uma lista de "outros custos" (fixos por mês ou por km).
