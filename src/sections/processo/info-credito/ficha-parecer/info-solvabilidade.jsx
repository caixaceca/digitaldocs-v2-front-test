// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
// utils
import Markdown from '@/components/Markdown';
import { fPercent, fCurrency } from '@/utils/formatNumber';
import { normalizeQuillLists } from '@/components/editor/normalizeEditorText';
//
import {
  limiteDsti,
  dstiCorrigido,
  totalDespesas,
  dstiDisponivel,
  calcRendimento,
  percentagemDsti,
  limiteDstiCorrigido,
  dstiAposContratacao,
  dividasConsolidadas,
} from './calculos';
import { situacaoProfissionalRows } from './utils';
import { Cabecalho, rowInfo, EmptyRow } from './dados-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export function SituacaoProfissional({ dados }) {
  return (
    <>
      <Cabecalho
        item="situacao-profissional"
        headLabel={[
          { label: '' },
          { label: 'Situação laboral' },
          { label: 'Rendimento bruto', align: 'right' },
          { label: 'Rendimento líquido', align: 'right' },
        ]}
      />
      <TableBody>
        {dados ? (
          situacaoProfissionalRows(dados).map((row, idx) => (
            <TableRow key={idx} hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
              <TableCell>{row.item}</TableCell>
              <TableCell>{row.tipo}</TableCell>
              <TableCell align="right">{fCurrency(row.bruto)}</TableCell>
              <TableCell align="right">{fCurrency(row.liquido)}</TableCell>
            </TableRow>
          ))
        ) : (
          <EmptyRow cells={4} message="Sem rendimento..." empty />
        )}
      </TableBody>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function NovoFinanciamento({ dados }) {
  const { valorPrestacao = 0, credito = null, proposta = null } = dados || {};
  const consolidadas = dividasConsolidadas(dados, proposta?.montante || credito?.montante_solicitado, valorPrestacao);
  const prestacaoM40 =
    credito?.componente?.includes('Habitação') && valorPrestacao > calcRendimento(dados?.rendimento, true) * 0.4;

  return (
    <TableBody>
      {rowInfo('Capital pretendido', fCurrency(proposta?.montante || credito?.montante_solicitado), false)}
      {rowInfo('Tipo de crédito', credito?.componente, false)}
      {rowInfo('Taxa do preçário', proposta?.taxa_precario || '', false)}
      {rowInfo(
        'Taxa de juros',
        `${fPercent(proposta?.taxa_juro || credito?.taxa_juro)}${
          proposta?.origem_taxa ? ` - ${proposta?.origem_taxa}` : ''
        }`
      )}
      {rowInfo('Prazo de amortização', `${proposta?.prazo_amortizacao || credito?.prazo_amortizacao} meses`, false)}
      {rowInfo(
        'Prestação mensal',
        fCurrency(valorPrestacao),
        false,
        prestacaoM40 ? <Alerta alerta="A prestação excede 40% do rendimento bruto mensal do agregado" /> : null
      )}
      {rowInfo('Dívidas consolidadas após o fincanciamento', '*title*', false)}
      {rowInfo('Capital inicial', fCurrency(consolidadas?.valor), true)}
      {rowInfo('Saldo em dívida', fCurrency(consolidadas?.saldo_divida), true)}
      {rowInfo('Serviço mensal', fCurrency(consolidadas?.valor_prestacao), true)}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Dsti({ dados }) {
  const dsti = percentagemDsti(dados);
  return (
    <TableBody>
      {rowInfo('Limite do DSTI', fCurrency(limiteDsti(dados?.rendimento)))}
      {rowInfo('DSTI disponível', fCurrency(dstiDisponivel(dados)))}
      {rowInfo(
        'DSTI',
        fPercent(dsti),
        false,
        dsti > 50 ? <Alerta alerta="DSTI ultrapassa o limite recomendável" /> : null
      )}
      {rowInfo('DSTI após contratação', fCurrency(dstiAposContratacao(dados)))}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Despesas({ dados }) {
  return (
    <TableBody>
      {dados?.map(({ despesa, valor }) => rowInfo(despesa, fCurrency(valor), false))}
      {dados?.length > 1 && rowInfo('Total', fCurrency(totalDespesas(dados)), true)}
      {dados?.length === 0 && <EmptyRow cells={2} message="Nenhuma despesa encontrada..." empty />}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DstiCorrigido({ dados }) {
  const corrigido = dstiCorrigido(dados);
  return (
    <TableBody>
      {rowInfo('Limite do DSTI corrigido', fCurrency(limiteDstiCorrigido(dados)), false)}
      {rowInfo(
        'DSTI corrigido',
        fPercent(corrigido),
        false,
        corrigido > 70 ? <Alerta alerta="DSTI Corrigido ultrapassa o limite recomendável" /> : null
      )}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function LimiteAval({ rendimento }) {
  return (
    <TableBody>
      {rendimento ? (
        <TableRow>
          <TableCell>{fCurrency(limiteDsti(rendimento) * 2)}</TableCell>
        </TableRow>
      ) : (
        <EmptyRow cells={2} message="Sem rendimento..." empty />
      )}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Parecer({ parecer }) {
  return (
    <TableBody>
      {parecer ? (
        <TableRow>
          <TableCell>
            <Markdown>{normalizeQuillLists(parecer)}</Markdown>
          </TableCell>
        </TableRow>
      ) : (
        <EmptyRow cells={2} message="Ainda não foi adicionado o parecer..." empty />
      )}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Proposta({ dados }) {
  const { credito = null, proposta = null, valorPrestacao = 0 } = dados || {};
  return (
    <TableBody>
      {proposta ? (
        <>
          {rowInfo('Tipo de crédito', credito?.componente)}
          {rowInfo('Finalidade', credito?.finalidade)}
          {rowInfo('Montante', fCurrency(proposta?.montante))}
          {rowInfo('Taxa de juro', fPercent(proposta?.taxa_juro) || '')}
          {rowInfo('Prazo de amortização', `${proposta?.prazo_amortizacao} meses`)}
          {rowInfo('Prazo de utilização', proposta?.prazo_utilizacao ? `${proposta?.prazo_utilizacao || 0} meses` : '')}
          {rowInfo('Valor da prestação', fCurrency(valorPrestacao))}
          {rowInfo('Comissões', proposta?.comissoes)}
          {rowInfo('Garantia', credito?.garantia)}
          {rowInfo('Outros', proposta?.observacao)}
        </>
      ) : (
        <EmptyRow cells={2} message="Os dados da proposta ainda não foram preenchidas..." empty />
      )}
    </TableBody>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Alerta({ alerta }) {
  return (
    <Typography component="span" variant="subtitle2" sx={{ color: 'error.main' }}>
      {` *${alerta}`}
    </Typography>
  );
}
