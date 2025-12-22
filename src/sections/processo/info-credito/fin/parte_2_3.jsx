import { Paragraph } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';

// ---------------------------------------------------------------------------------------------------------------------

export const planoFinanceiroTable = () =>
  gerarTabela({
    section: 'PARTE II: PLANO FINANCEIRO',
    rows: [[1, 1, '', 'Consultar o plano financeiro em anexo']],
  });

// ---------------------------------------------------------------------------------------------------------------------

export const informacaoGeralTable = (dados) =>
  gerarTabela({
    section: 'PARTE III: INFORMAÇÃO GERAL',
    rows: [
      [
        1,
        1,
        '1. Produtos de crédito comercializados',
        [
          new Paragraph({ text: 'Produto 1' }),
          new Paragraph({ text: 'Produto 2;' }),
          new Paragraph({ text: 'Produto 3;' }),
        ],
      ],
      [1, 1, '2. Documentação necessária para análise de crédito', dados?.docs ?? '--'],
      [1, 1, '3. Documentação necessária para celebração do contrato', '--'],
      [1, 1, '4. Rejeição do pedido', '--'],
      [1, 1, '5. Cópia do contrato', '--'],
      [1, 1, '8. Reclamações', '--'],
      [1, 1, '9. Autoridade de supervisão', '--'],
    ],
  });
