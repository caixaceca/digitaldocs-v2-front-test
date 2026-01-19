import { TextRun } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';
import { formatDate } from '../../../../utils/formatTime';

// ---------------------------------------------------------------------------------------------------------------------

export const identificacao = (dados) =>
  gerarTabela({
    columns: 2,
    title: 'A. ELEMENTOS DE IDENTIFICAÇÃO E OBSERVAÇÕES',
    section: 'PARTE I: CONDIÇÕES FINANCEIRAS DO CRÉDITO AO CONSUMIDOR',
    rows: [
      { label: '1. Identificação da instituição de crédito (Mutuante)' },
      { cells: 2, level: 2, label: '1.1. Denominação', value: 'Caixa Económica de Cabo Verde' },
      { cells: 2, level: 2, label: '1.2. Endereço', value: 'Avenida Cidade de Lisboa, Várzea, Cidade da Praia' },
      {
        cells: 2,
        level: 2,
        label: '1.3. Contactos',
        value: [
          new TextRun({ text: 'Telefone: +238 260 36 00' }),
          new TextRun({ text: 'Email: caixa@caixa.cv', break: 1 }),
          new TextRun({ text: 'Site: www.caixa.cv', break: 1 }),
        ],
      },
      {
        label: '2. Identificação do(s) interveniente(s) de crédito (Mutuário(s))',
        value: dados?.mutuario ?? 'Nome(s) do(s) mutuário(s)',
      },
      { cells: 2, label: '3. Data de elaboração da FINCC', value: formatDate(new Date(), "dd 'de' MMMM 'de' yyyy") },
      { cells: 2, label: '4. Tipo de FINCC', value: 'Simulação' },
      { label: '5. Observações Jurídicas' },
      {
        label: '5.1. No momento da simulação ou entrevista de empréstimo',
        value: dados?.obs_juridico_simulacao ?? '--',
      },
      { label: '5.2. No momento da aprovação do empréstimo', value: dados?.obs_juridico_aprovacao ?? '--' },
    ],
  });
