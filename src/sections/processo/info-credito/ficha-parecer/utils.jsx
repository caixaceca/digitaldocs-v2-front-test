// redux
import { calcRendimento } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

export function situacaoProfissionalRows(dados) {
  const rows = [];

  // Proponente
  rows.push({
    item: 'Proponente',
    tipo: `${dados?.tipo_contrato ?? ''}${dados?.tipo_contrato ? ` (${dados?.local_trabalho})` : ''}`,
    bruto: dados?.renda_bruto_mensal,
    liquido: dados?.renda_liquido_mensal,
  });

  // Cônjuge
  if (dados?.conjuge) {
    rows.push({
      item: 'Cônjuge',
      tipo: `${dados?.tipo_contrato_conjuge ?? ''}${dados?.tipo_contrato_conjuge ? ` (${dados?.local_trabalho_conjuge})` : ''}`,
      bruto: dados?.renda_bruto_mensal_conjuge,
      liquido: dados?.renda_liquido_mensal_conjuge,
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
