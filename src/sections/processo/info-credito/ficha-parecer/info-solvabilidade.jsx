// @mui

import TableBody from '@mui/material/TableBody';
// utils
import { fPercent, fCurrency } from '../../../../utils/formatNumber';
//
import { rowInfo } from './dados-ficha';
import { valorPrestacao, calcRendimento, dividasConsolidadas } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

export function SituacaoProfissional({ conjuge = false, dados }) {
  return (
    <TableBody>
      {rowInfo('Tipo de contrato', dados?.tipo_contrato, false)}
      {rowInfo('Rendimento bruto proponente', fCurrency(dados?.renda_bruto_mensal), false)}
      {conjuge && rowInfo('Rendimento bruto cônjuge', fCurrency(dados?.renda_bruto_mensal_conjuge), false)}
      {conjuge && rowInfo('Total rendimento bruto', fCurrency(calcRendimento(dados, true)), true)}
      {rowInfo('Rendimento líquido proponente', fCurrency(dados?.renda_liquido_mensal), false)}
      {conjuge && rowInfo('Rendimento líquido cônjuge', fCurrency(dados?.renda_liquido_mensal_conjuge), false)}
      {conjuge && rowInfo('Total rendimento líquido', fCurrency(calcRendimento(dados, false)), true)}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function NovoFinanciamento({ dados, dividas }) {
  const consolidadas = dividasConsolidadas(dividas, dados?.montante_solicitado, valorPrestacao(dados));
  return (
    <TableBody>
      {rowInfo('Capital pretendido', fCurrency(dados?.montante_solicitado), false)}
      {rowInfo('Tipo de crédito', dados?.componente, false)}
      {rowInfo('Taxa de juros', fPercent(dados?.taxa_juro), false)}
      {rowInfo('Taxa do preçario', dados?.taxa_precario || '', false)}
      {rowInfo('Origem da taxa', dados?.origem_taxa || '', false)}
      {rowInfo('Prazo de amortização', `${dados?.prazo_amortizacao} meses`, false)}
      {rowInfo('Prestação mensal', fCurrency(valorPrestacao(dados)), false)}
      {rowInfo('Dívidas consolidadas após o fincanciamento', '*title*', false)}
      {rowInfo('Capital inicial', fCurrency(consolidadas?.valor), true)}
      {rowInfo('Saldo em dívida', fCurrency(consolidadas?.divida), true)}
      {rowInfo('Serviço mensal da dívida', fCurrency(consolidadas?.prestacao), true)}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Dsti() {
  return (
    <TableBody>
      {rowInfo('Limite do DSTI', fCurrency(0))}
      {rowInfo('DSTI', fPercent(0))}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Despesas() {
  return (
    <TableBody>
      {rowInfo('Água', fCurrency(0), false)}
      {rowInfo('Eletricidade', fCurrency(0), false)}
      {rowInfo('Outras', fCurrency(0), false)}
      {rowInfo('Total despesas', fCurrency(0), true)}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DstiCorrigido() {
  return (
    <TableBody>
      {rowInfo('Limite do DSTI corrigido', fCurrency(0), false)}
      {rowInfo('DSTI corrigido', fPercent(0), false)}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Proposta({ dados }) {
  return (
    <TableBody>
      {rowInfo('Tipo de crédito', dados?.componente)}
      {rowInfo('Finalidade', dados?.finalidade)}
      {rowInfo('Montante', fCurrency(dados?.montante_solicitado))}
      {rowInfo('Taxa de juro', fPercent(dados?.taxa_juro) || '')}
      {rowInfo('Prazo de utilização', `${dados?.prazo_utilizacao || 0} meses`)}
      {rowInfo('Prazo de amortização', `${dados?.prazo_amortizacao} meses`)}
      {rowInfo('Valor da prestação', fCurrency(0))}
      {rowInfo('Comissões', 'comissões')}
      {rowInfo('Garantia', 'garantia')}
      {rowInfo('Outros', 'outros')}
    </TableBody>
  );
}
