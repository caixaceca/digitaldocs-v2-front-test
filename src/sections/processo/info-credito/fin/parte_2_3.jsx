import { Paragraph } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';
import { formatDate } from '../../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../../utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export const planoFinanceiroTable = () =>
  gerarTabela(1, '', [[1, 1, '', 'Consultar o plano financeiro em anexo']], 'PARTE II: PLANO FINANCEIRO');

// ---------------------------------------------------------------------------------------------------------------------

export const informacaoGeralTable = (dados) => {
  const { montante, prazoAmortizacao, tan, taeg, taxaMora, fiadores } = dados;

  return gerarTabela(
    1,
    '',
    [
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
      [1, 1, '2. Documentação necessária para análise de crédito', '--'],
      [1, 1, '3. Documentação necessária para celebração do contrato', '--'],
      [1, 1, '4. Rejeição do pedido', '--'],
      [1, 1, '5. Cópia do contrato', '--'],
      [1, 1, '8. Reclamações', '--'],
      [1, 1, '9. Autoridade de supervisão', '--'],
    ],
    'PARTE III: INFORMAÇÃO GERAL'
  );
};
