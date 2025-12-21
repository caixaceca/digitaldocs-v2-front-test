import { TextRun, Paragraph } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';
import { formatDate } from '../../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../../utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export const identificacaoTable = (dados) => {
  const { montante, prazoAmortizacao, tan, taeg, taxaMora, fiadores } = dados;

  return gerarTabela(
    2,
    'A. ELEMENTOS DE IDENTIFICAÇÃO E OBSERVAÇÕES',
    [
      [1, 1, '1. Identificação da instituição de crédito (Mutuante)', ''],
      [2, 2, '1.1. Denominação', 'Caixa Económica de Cabo Verde'],
      [2, 2, '1.2. Endereço', 'Avenida Cidade de Lisboa, Várzea, Cidade da Praia'],
      [
        2,
        2,
        '1.3. Contactos',
        [
          new TextRun({ text: 'Telefone: +238 260 36 00' }),
          new TextRun({ text: 'Email: caixa@caixa.cv', break: 1 }),
          new TextRun({ text: 'Site: www.caixa.cv', break: 1 }),
        ],
      ],
      [1, 1, '2. Identificação do(s) interveniente(s) de crédito (Mutuário(s))', 'Mutuário(s)'],
      [1, 1, '3. Data de elaboração da FINCC', formatDate(new Date(), "dd 'de' MMMM 'de' yyyy")],
      [1, 1, '4. Tipo de FINCC', 'Simulação'],
      [1, 1, '5. Observações Jurídicas', ''],
      [1, 2, '5.1. No momento da simulação ou entrevista de empréstimo', '--'],
      [1, 2, '5.2. No momento da aprovação do empréstimo', '--'],
    ],
    'PARTE I: CONDIÇÕES FINANCEIRAS DO CRÉDITO AO CONSUMIDOR'
  );
};

// ---------------------------------------------------------------------------------------------------------------------

export const principaisCaracteristicasTable = (dados) => {
  const { montante, prazoAmortizacao, tan, taeg, taxaMora, fiadores } = dados;

  return gerarTabela(2, 'B. DESCRIÇÃO DAS PRINCIPAIS CARACTERÍSTICAS DO CRÉDITO', [
    [1, 1, '1. Designação comercial do produto', ''],
    [2, 2, '1.1. Modalidade', '--'],
    [2, 2, '1.2. Finalidade', '--'],
    [2, 2, '1.3. Tipo de crédito', '--'],
    [1, 1, '2. Campanha promocional (se aplicável)', ''],
    [2, 2, '2.1. Identificação da campanha', '--'],
    [2, 2, '2.2. Condições da campanha', '--'],
    [2, 2, '2.3. Outras informações', '--'],
    [1, 1, '3. Condições de abertura do crédito', ''],
    [2, 2, 'Abertura de uma conta DO', '--'],
    [2, 2, 'Adesão de um outro produto', '--'],
    [2, 2, 'Disponibilização por tranches', '--'],
    [2, 2, 'Transferência de montantes a terceiros com aprovação', '--'],
    [2, 1, '4. Montante e moeda do empréstimo', '--'],
    [2, 1, '5. Duração do contrato', '--'],
    [1, 1, '6. Condições de reembolso', ''],
    [2, 2, '6.1. Modalidade do reembolso', '--'],
    [2, 2, '6.2. Regime de prestações', '--'],
    [2, 2, '6.3. Periodicidade das prestações', '--'],
    [2, 2, '6.3. Montante das prestações', '--'],
    [2, 2, '6.3. Número de prestações', '--'],
    [1, 1, '7. Contrato coligado (se aplicável)', ''],
    [2, 2, '7.1. Bem ou serviço', '--'],
    [2, 2, '7.2. Preço', '--'],
    [1, 1, '8. Garantias', '--'],
    [1, 1, '9. Contratos acessórios exigidos (se aplicável)', ''],
    [1, 2, '9.1. Seguros exigidos', ''],
    [2, 3, '9.1.1. Identificação do segurador', '--'],
    [2, 3, '9.1.2. Designação comercial do produto', '--'],
    [2, 3, '9.1.3. Descrição', '--'],
    [2, 3, '9.1.4. Coberturas mínimas exigidas', '--'],
    [2, 3, '9.1.5. Duração exigida', '--'],
    [2, 3, '9.1.6. Outros requisitos mínimos exigidos', '--'],
    [2, 3, '9.1.7. Periodicidade e valor de pagamento do prémio', '--'],
    [2, 2, '9.2. Outros contratos exigidos', '--'],
    [1, 1, '10. Reembolso anticipado', ''],
    [1, 2, '10.1. Comissão de reembolso anticipado parcial ou total', '--'],
    [
      1,
      2,
      '10.2. Isenções cobranças de comissões',
      'Não será cobrada comissão por liquidação antecipada quando esta se justifique por motivos de morte, deslocação profissional ou desemprego à mais de 3 meses, devidamente comprovado através da Declaração de desemprego emitida pela entidade competente.',
    ],
    [
      1,
      2,
      '10.3. Condições para o exercício do crédito ao reembolso parcial ou total',
      'O mutuário poderá proceder ao reembolso antecipado em qualquer momento do contrato, mediante pré-aviso de 7 dias úteis ou de 30 dias corridos, conforme se tratar de reembolso parcial ou total. O reembolso parcial antecipado deverá ser efetuado em data coincidente com a data de vencimento das prestações de reembolso.',
    ],
  ]);
};

// ---------------------------------------------------------------------------------------------------------------------

export const custosTable = (dados) => {
  const { montante, prazoAmortizacao, tan, taeg, taxaMora, fiadores } = dados;

  return gerarTabela(2, 'C. CUSTOS DO CRÉDITO', [
    [1, 1, '1. Taxa de juro anual nominal (TAN)', ''],
    [2, 2, '1.1. Taxa de juro nominal', '--'],
    [2, 2, '1.2. Regime  de taxa de juro', '--'],
    [2, 2, '1.3. Taxa de juro nominal fixa', '--'],
    [2, 3, '1.3.1. Taxa base (se aplicável)', '--'],
    [2, 3, '1.3.2. Spread inicial (se aplicável)', '--'],
    [2, 3, '1.3.3. Taxa de juro fixa contratada (se aplicável)', '--'],
    [2, 3, '1.3.4. Alteração da taxa (se aplicável)', '--'],
    [2, 2, '1.4. Taxa de juro nominal variável (se aplicável)', '--'],
    [2, 3, '1.4.1. Indexante', '--'],
    [2, 3, '1.4.2. Spread', '--'],
    [2, 3, '1.4.3. Spread contratado', '--'],
    [2, 3, '1.4.2. Alteração da taxa (se aplicável)', '--'],
    [2, 2, '1.5. Periodicidade de revisão da taxa', '--'],
    [2, 2, '1.6. Outros componentes', '--'],

    [1, 1, '2. Taxa anual de encargos efetiva global (TAEG)', ''],
    [2, 2, '2.1. TAEG', '--'],
    [2, 2, '2.2. Valor total dos encargos', '--'],
    [2, 2, '2.3. Vendas associadas facultativas', '--'],
    [2, 3, '2.3.1. Descrição do produto ou serviço financeiro adquirido', '--'],
    [2, 2, '2.4. Condições promocionais', ''],
    [2, 3, '2.4.1. Descrição das condições promocionais', '--'],
    [2, 3, '2.4.2. TAEG com condições promocionais', '--'],
    [2, 3, '2.4.3. TAEG sem condições promocionais', '--'],
    [2, 3, '2.4.4. TAEG após condições promocionais', '--'],
    [2, 2, '2.5. Condições incluídas na TAEG', ''],
    [2, 3, '2.5.1. Comissões iniciais', '--'],
    [2, 3, '2.5.2. Comissões de processamento de prestações (se aplicável)', '--'],
    [2, 2, '2.6. Anuidades (se aplicável)', '--'],
    [2, 2, '2.7. Seguros exigidos (se aplicável)', '--'],
    [2, 2, '2.8. Imposto de selo (se aplicável)', ''],
    [2, 3, 'Capital', '--'],
    [2, 3, 'Juros', '--'],
    [2, 3, 'Comissões', '--'],
    [2, 2, '2.9. Abertura de conta depósito a ordem (DO)', ''],
    [2, 2, '2.10. Custos com conta DO', ''],
    [2, 2, '2.11. Custos com meios de pagamentos', ''],
    [2, 2, '2.12. Custos notariais (se aplicável)', ''],
    [2, 3, 'Procuração irrevogável', '--'],
    [2, 3, 'Reconhecimento de assinatura', '--'],
    [2, 3, 'Termo de autenticação', '--'],
    [2, 3, 'Custo de escritura', '--'],
    [2, 3, 'Custo de registo', '--'],
    [2, 3, 'Custo de emissão de certidão predial', '--'],
    [2, 3, 'Custo de emissão do CIP', '--'],
    [2, 3, 'Custo de do IUP de Transição', '--'],
    [2, 3, '2.12.1. Outros custos', '--'],
    [2, 3, '2.12.2. Condições de alteração dos custo (se aplicável)', '--'],

    [1, 1, '3. Outros custos e despesas', ''],
    [2, 2, '3.1. Comissão de contrato de hipoteca/escritura', '--'],
    [2, 2, '3.2. Comissão de desistência', '--'],
    [1, 1, '4. Montante total imputado ao consumidor (se aplicável)', ''],
    [1, 1, '5. Custos por falta de pagamento', ''],
    [2, 2, '5.1. Taxa de juro de mora', '--'],
    [
      1,
      2,
      '5.2. Regras de aplicação da taxa de juro de mora',
      'A sobretaxa de mora será aplicada, agravando a taxa de juros, sempre que o Mutuário não faça o pagamento de qualquer prestação de reembolso na data do seu vencimento. A aplicação da sobretaxa de mora durará enquanto durar a mora.',
    ],
    [
      1,
      2,
      '5.3. Implicações de não cumprimento do contrato (falta de pagamento do crédito)',
      'A falta de cumprimento do contrato poderá acarretar:\n• Resolução do contrato por parte do banco;\n• Inclusão do Mutuário e Garantes na Central de Risco de Crédito;\n• Execução judicial;\n• Perda do património pessoal/do bem dado em garantia',
    ],
    [1, 2, '5.4. Outros encargos', '--'],
  ]);
};
