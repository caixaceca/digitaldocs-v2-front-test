import { Paragraph } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';

// ---------------------------------------------------------------------------------------------------------------------

export const planoFinanceiro = () =>
  gerarTabela({
    section: 'PARTE II: PLANO FINANCEIRO',
    rows: [{ value: 'Consultar o plano financeiro em anexo' }],
  });

// ---------------------------------------------------------------------------------------------------------------------

export const informacaoGeral = (dados) =>
  gerarTabela({
    section: 'PARTE III: INFORMAÇÃO GERAL',
    rows: [
      {
        label: '1. Produtos de crédito comercializados',
        value: [
          new Paragraph({ text: 'Produto 1' }),
          new Paragraph({ text: 'Produto 2;' }),
          new Paragraph({ text: 'Produto 3;' }),
        ],
      },
      { label: '2. Documentação necessária para análise de crédito', value: dados?.docs_analise ?? '--' },
      { label: '3. Documentação necessária para celebração do contrato', value: dados?.docs_contrato ?? '--' },
      { label: '4. Rejeição do pedido', value: dados?.rejeicao_pedido ?? '--' },
      { label: '5. Cópia do contrato', value: dados?.contrato ?? '--' },
      { label: '8. Reclamações', value: dados?.reclamacoes ?? '--' },
      { label: '9. Autoridade de supervisão', value: dados?.autoridade_supervisao ?? '--' },
    ],
  });
