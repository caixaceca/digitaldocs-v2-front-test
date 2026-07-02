// redux
import { calcRendimento } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

export function situacaoProfissionalRows(dados) {
  const rows = [];

  // Proponente
  rows.push({
    item: 'Proponente',
    bruto: dados?.renda_bruto_mensal,
    liquido: dados?.renda_liquido_mensal,
    tipo: `${dados?.situacao_laboral ?? ''}${dados?.local_trabalho ? ` (${dados?.local_trabalho})` : ''}`,
  });

  // Cônjuge
  if (dados?.conjuge) {
    rows.push({
      item: 'Cônjuge',
      bruto: dados?.renda_bruto_mensal_conjuge,
      liquido: dados?.renda_liquido_mensal_conjuge,
      tipo: `${dados?.situacao_laboral_conjuge ?? ''} (${dados?.local_trabalho_conjuge ?? ''})`,
    });

    // Totais
    rows.push({
      item: 'Total',
      tipo: '',
      bruto: calcRendimento(dados, true),
      liquido: calcRendimento(dados, false),
      totais: true,
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------------------------------------------------

export const situacoesLaboral = [
  'Quadro efetivo',
  'Contratado',
  'Trabalhador por conta própria',
  'Reformado/Aposentado',
  'Desempregado',
  'Estagiário',
  'Prorrogado',
  'Suspenso',
];
