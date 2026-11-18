# Simulador Imobiliário

Aplicativo leve para corretores de imóveis simularem financiamento, composição de pagamentos e gerarem um relatório em PDF — tudo no navegador, sem instalação e sem internet.

## Como usar

1. Abra o arquivo `index.html` no Google Chrome, Microsoft Edge ou Firefox (duplo clique ou arraste para o navegador).
2. Preencha o **nome do corretor** e confira a **data da simulação**.
3. **Etapa 1:** informe o valor do imóvel e o % financiado pela Caixa — a **entrada necessária** é calculada automaticamente.
4. **Etapa 2:** informe prazo, parcela mensal e **data de início** do financiamento.
5. Se quiser **entrada maior**, clique em **Quero dar entrada maior** — o financiamento e o % são reajustados.
6. **Etapa 3:** informe primeiro a **comissão**, depois o **sinal**. O abatimento da entrada é **sinal − comissão**; o restante é parcelado automaticamente.
7. **Etapa 4:** juros de obra e ITBI + cartório (opção **Gratuito** disponível).
8. No resumo interno a comissão aparece para o corretor; no **PDF do cliente** ela fica embutida no sinal e no valor do imóvel.

Para recomeçar, use **Limpar formulário** (há confirmação antes de apagar).

## Arquivos

| Arquivo       | Função                                      |
|---------------|---------------------------------------------|
| `index.html`  | Estrutura da tela e do documento de impressão |
| `styles.css`  | Visual do aplicativo e layout do PDF        |
| `app.js`      | Máscaras, cálculos, validações e impressão  |

## Observações importantes

- A **entrada necessária** é automática pelo %; pode ser aumentada manualmente (reajusta o financiamento).
- Comissão primeiro, depois sinal. Abatimento da entrada: `sinal − comissão`. Restante parcelado: `entrada − abatimento`.
- No **PDF do cliente**, a comissão não aparece separada: fica embutida no sinal e no valor do imóvel.
- ITBI + Cartório pode ser marcado como **gratuito**.
- **Juros do financiamento** ≈ total das parcelas − valor financiado; o app mostra também o **% a mais** sobre o imóvel.
- O **cronograma mensal** soma sinal, comissão, entrada, juros de obra, ITBI e financiamento mês a mês.
- Datas de término são calculadas automaticamente a partir da data de início.
- Os dados ficam apenas nesta sessão do navegador; nada é enviado a servidores.

## Requisitos

- Navegador moderno (Chrome, Edge ou Firefox).
- Funciona **offline** (também no GitLab Pages, após carregar a página).
- Sem backend, sem banco de dados e sem bibliotecas externas.
