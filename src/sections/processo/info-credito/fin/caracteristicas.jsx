// utils
import { gerarTabela } from './gerar-tabela';

// ---------------------------------------------------------------------------------------------------------------------

export const principaisCaracteristicas = (dados) =>
  gerarTabela({
    columns: 2,
    title: 'B. DESCRIÇÃO DAS PRINCIPAIS CARACTERÍSTICAS DO CRÉDITO',
    rows: [
      { label: '1. Designação comercial do produto', value: dados?.produto ?? '--' },
      { cells: 2, level: 2, label: '1.1. Modalidade', value: dados?.modalidade ?? '--' },
      { cells: 2, level: 2, label: '1.2. Finalidade', value: dados?.finalidade ?? '--' },
      { cells: 2, level: 2, label: '1.3. Tipo de crédito', value: dados?.tipo_credito ?? '--' },
      { label: '2. Campanha promocional (se aplicável)' },
      { cells: 2, level: 2, label: '2.1. Identificação da campanha', value: dados?.campanha ?? '--' },
      { cells: 2, level: 2, label: '2.2. Condições da campanha', value: dados?.condicoes_campanha ?? '--' },
      { cells: 2, level: 2, label: '2.3. Outras informações', value: dados?.outras_informacoes ?? '--' },
      { label: '3. Condições de abertura do crédito' },
      { cells: 2, level: 2, label: 'Abertura de uma conta DO', value: dados?.abertura_conta_do ?? '--' },
      { cells: 2, level: 2, label: 'Adesão de um outro produto', value: dados?.adesao_outro_produto ?? '--' },
      { cells: 2, level: 2, label: 'Disponibilização por tranches', value: dados?.disponibilizacao_tranches ?? '--' },
      { cells: 2, level: 2, label: 'Transferência de montantes a terceiros com aprovação', value: '--' },
      { cells: 2, label: '4. Montante e moeda do empréstimo', value: dados?.montante ?? '--' },
      { cells: 2, label: '5. Duração do contrato', value: dados?.duracao_contrato ?? '--' },
      { label: '6. Condições de reembolso' },
      { cells: 2, level: 2, label: '6.1. Modalidade do reembolso', value: dados?.modalidade_reembolso ?? '--' },
      { cells: 2, level: 2, label: '6.2. Regime de prestações', value: dados?.regime_prestacoes ?? '--' },
      {
        cells: 2,
        level: 2,
        label: '6.3. Periodicidade das prestações',
        value: dados?.periodicidade_prestacoes ?? '--',
      },
      { cells: 2, level: 2, label: '6.3. Montante das prestações', value: dados?.montante_prestacoes ?? '--' },
      { cells: 2, level: 2, label: '6.3. Número de prestações', value: dados?.numero_prestacoes ?? '--' },
      { label: '7. Contrato coligado (se aplicável)' },
      { cells: 2, level: 2, label: '7.1. Bem ou serviço', value: dados?.bem_servico ?? '--' },
      { cells: 2, level: 2, label: '7.2. Preço', value: dados?.preco ?? '--' },
      { label: '8. Garantias', value: dados?.garantias_desc ?? '--' },
      { label: '9. Contratos acessórios exigidos (se aplicável)' },
      { level: 2, label: '9.1. Seguros exigidos' },
      { cells: 2, level: 3, label: '9.1.1. Identificação do segurador', value: dados?.segurador ?? '--' },
      { cells: 2, level: 3, label: '9.1.2. Designação comercial do produto', value: dados?.produto ?? '--' },
      { cells: 2, level: 3, label: '9.1.3. Descrição', value: dados?.descricao ?? '--' },
      { cells: 2, level: 3, label: '9.1.4. Coberturas mínimas exigidas', value: dados?.coberturas_minimas ?? '--' },
      { cells: 2, level: 3, label: '9.1.5. Duração exigida', value: dados?.duracao_exigida ?? '--' },
      { cells: 2, level: 3, label: '9.1.6. Outros requisitos mínimos exigidos', value: '--' },
      { cells: 2, level: 3, label: '9.1.7. Periodicidade e valor de pagamento do prémio', value: '--' },
      { cells: 2, level: 2, label: '9.2. Outros contratos exigidos', value: dados?.outros_contratos ?? '--' },
      { label: '10. Reembolso anticipado' },
      { level: 2, label: '10.1. Comissão de reembolso anticipado parcial ou total', value: '--' },
      {
        level: 2,
        label: '10.2. Isenções cobranças de comissões',
        value:
          'Não será cobrada comissão por liquidação antecipada quando esta se justifique por motivos de morte, deslocação profissional ou desemprego à mais de 3 meses, devidamente comprovado através da Declaração de desemprego emitida pela entidade competente.',
      },
      {
        level: 2,
        label: '10.3. Condições para o exercício do crédito ao reembolso parcial ou total',
        value:
          'O mutuário poderá proceder ao reembolso antecipado em qualquer momento do contrato, mediante pré-aviso de 7 dias úteis ou de 30 dias corridos, conforme se tratar de reembolso parcial ou total. O reembolso parcial antecipado deverá ser efetuado em data coincidente com a data de vencimento das prestações de reembolso.',
      },
    ],
  });
