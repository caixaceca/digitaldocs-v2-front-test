// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
// utils
import Markdown from '@/components/Markdown';
import { labelMeses } from '@/utils/formatText';
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
import { situacaoProfissionalRows } from './utilss';
import { Cabecalho, rowInfo, EmptyRow, Field, AlertaInfo } from './fragments';

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
  const { taxa_juro = 0, taxa_precario = 0 } = proposta || {};

  const montante = proposta?.montante || credito?.montante_solicitado;
  const consolidadas = dividasConsolidadas(dados, montante, valorPrestacao);
  const prestacaoM40 =
    credito?.componente?.includes('Habitação') && valorPrestacao > calcRendimento(dados?.rendimento, true) * 0.4;

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Stack useFlexGap flexWrap="wrap" direction="row" spacing={5}>
        <Stack direction="row" spacing={5}>
          <Field destaque label="Capital pretendido" value={fCurrency(montante)} />
          <Field
            destaque
            label="Prestação mensal"
            value={fCurrency(valorPrestacao)}
            alertLabel={prestacaoM40 ? <AlertaInfo alerta="Excede 40% do rendimento bruto" /> : null}
          />
        </Stack>
        <Stack direction="row" spacing={5}>
          <Field
            label="Taxa do preçário"
            value={taxa_precario && taxa_precario !== taxa_juro ? fPercent(taxa_precario) : null}
          />
          <Field
            label="Taxa de juro"
            value={`${fPercent(taxa_juro || credito?.taxa_juro)}${proposta?.origem_taxa ? ` · ${proposta.origem_taxa}` : ''}`}
          />
          <Field label="Prazo de amortização" value={labelMeses(proposta?.prazo_amortizacao)} />
          <Field label="Tipo de crédito" value={credito?.componente} />
        </Stack>
      </Stack>

      <Divider />

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
          Dívidas consolidadas após o financiamento
        </Typography>
        <Stack direction="row" spacing={5}>
          <Field label="Capital inicial" value={fCurrency(consolidadas?.valor)} />
          <Field label="Saldo em dívida" value={fCurrency(consolidadas?.saldo_divida)} />
          <Field destaque label="Serviço mensal" value={fCurrency(consolidadas?.valor_prestacao)} />
        </Stack>
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Dsti({ dados }) {
  const dsti = percentagemDsti(dados);
  const limite = limiteDsti(dados?.rendimento);
  const disponivel = dstiDisponivel(dados);
  const aposContratacao = dstiAposContratacao(dados);

  return (
    <Stack direction="row" spacing={5} sx={{ p: 1 }}>
      <Field
        destaque
        label="DSTI"
        value={fPercent(dsti)}
        alertLabel={dsti > 50 ? <AlertaInfo alerta="Ultrapassa o limite recomendável" /> : null}
      />
      <Field label="Limite do DSTI" value={fCurrency(limite)} />
      <Field label="DSTI disponível" value={fCurrency(disponivel)} />
      <Field label="Disponível após contratação" value={fCurrency(aposContratacao)} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DstiCorrigido({ dados }) {
  const corrigido = dstiCorrigido(dados);
  return (
    <Stack direction="row" spacing={5} sx={{ p: 1 }}>
      <Field
        destaque
        label="DSTI corrigido"
        value={fPercent(corrigido)}
        alertLabel={corrigido > 70 ? <AlertaInfo alerta="Ultrapassa o limite recomendável" /> : null}
      />
      <Field label="Limite do DSTI corrigido" value={fCurrency(limiteDstiCorrigido(dados))} />
    </Stack>
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
  return parecer ? (
    <Box sx={{ p: 1.5 }}>
      <Markdown>{normalizeQuillLists(parecer)}</Markdown>
    </Box>
  ) : (
    <EmptyRow cells={2} message="Ainda não foi adicionado o parecer..." empty />
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
          {rowInfo('Finalidade', proposta?.finalidade)}
          {rowInfo('Montante', fCurrency(proposta?.montante))}
          {rowInfo('Taxa de juro', fPercent(proposta?.taxa_juro) || '')}
          {rowInfo('Prazo de amortização', labelMeses(proposta?.prazo_amortizacao))}
          {rowInfo('Prazo de utilização', labelMeses(proposta?.prazo_utilizacao))}
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
