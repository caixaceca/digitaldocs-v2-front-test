import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '@/utils/formatNumber';
import { responsabilidadesInfo, calcRendimento, getRiskLevel } from './calculos';
// components
import Label from '@/components/Label';
import { DefaultAction } from '@/components/Actions';
//
import FormFiadores from './form-fiadores';
import { Cabecalho, CellValor } from './fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnaliseFiadores({ fiadores, financiamento, rendimento }) {
  const [fiador, setFiador] = useState(null);
  const rend = calcRendimento(rendimento, false);

  if (!fiadores?.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem fiadores associados a este financiamento.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      {fiadores.map((row) => {
        const liquido = row?.renda_liquido_mensal;
        const preenchido = liquido != null;
        const dados = [{ label: 'Crédito em análise', ...financiamento }, ...(row.fiancas || [])];
        const totalPres = dados.reduce((acc, item) => acc + Number(item.valor_prestacao || 0), 0);

        return (
          <FiadorCard
            key={row?.numero_entidade}
            row={row}
            rend={rend}
            liquido={liquido}
            totalPres={totalPres}
            preenchido={preenchido}
            onEdit={() => setFiador(row)}
            dados={[...dados, { label: 'Total', totais: true, ...responsabilidadesInfo(dados) }]}
          />
        );
      })}
      {!!fiador && <FormFiadores onClose={() => setFiador(null)} dados={fiador} fiadores={fiadores} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FiadorCard({ row, rend, liquido, preenchido, totalPres, dados, onEdit }) {
  const nome = row?.nome || row?.nome_entidade || '—';

  if (!preenchido) {
    return (
      <Card sx={{ boxShadow: 1, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">
              {row?.numero || row?.numero_entidade || '—'} · {nome}
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
              Dados financeiros por preencher...
            </Typography>
          </Box>
          <DefaultAction small label="Editar" onClick={onEdit} />
        </Stack>
      </Card>
    );
  }

  const limite = liquido;
  const limiteDsti = liquido * 0.5;
  const violacoes = getRiskLevel({ totalPres, limite, liquido, rend });
  const rendimentoInsuficiente = violacoes.includes('rendimento_insuficiente');
  const excedeLimite = violacoes.includes('excede_limite');
  const pctProponente = rend ? Math.round((liquido / rend) * 100) : null;
  const pctLimite = limite ? Math.round((totalPres / limite) * 100) : 0;

  return (
    <Card sx={{ boxShadow: 1, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2">
            {row?.numero || row?.numero_entidade || '—'} · {nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ref. DSTI (50%): {fCurrency(limiteDsti)}
          </Typography>
        </Box>
        <DefaultAction small label="Editar" onClick={onEdit} />
      </Stack>

      <Stack direction={{ sm: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
        <ValidadorBox
          label="Rendimento / Proponente"
          value={fCurrency(liquido)}
          referencia={fCurrency(rend)}
          subtitle={pctProponente !== null ? `${pctProponente}% do proponente (mín. 75%)` : '—'}
          alert={rendimentoInsuficiente}
          alertLabel="Abaixo do mínimo"
          situacao={row?.situacao_laboral}
        />
        <ValidadorBox
          label="Comprometido / Limite máx. aval/fiança"
          value={fCurrency(totalPres)}
          referencia={fCurrency(limite)}
          subtitle={`${pctLimite}% do limite máximo`}
          alert={excedeLimite}
          alertLabel="Excede limite"
          barra={pctLimite > 100 ? 100 : pctLimite}
        />
      </Stack>
      <Responsabilidades dados={dados} />
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ValidadorBox({ label, value, referencia, subtitle, alert, alertLabel, barra, situacao }) {
  return (
    <Box sx={{ flex: 1, bgcolor: 'background.neutral', borderRadius: 1, p: 1.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        {alert && <Chip size="small" color="error" label={alertLabel} sx={{ typography: 'caption' }} />}
      </Stack>
      <Typography variant="subtitle2">
        {value}{' '}
        <Typography component="span" variant="body2" color="text.secondary">
          / {referencia}
        </Typography>
      </Typography>
      <Typography variant="caption" color={alert ? 'error.main' : 'text.secondary'}>
        {subtitle}
      </Typography>
      {barra != null && (
        <Box sx={{ height: 4, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden', mt: 0.75 }}>
          <Box sx={{ height: '100%', width: `${barra}%`, bgcolor: alert ? 'error.main' : 'success.main' }} />
        </Box>
      )}
      {situacao && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {situacao}
        </Typography>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Responsabilidades({ dados }) {
  const rowInfo = (row) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell>{row?.tipo_credito || row?.descricao || row?.label}</TableCell>
      <CellValor valor={row?.valor} total={row?.totais} moeda={row?.moeda} />
      <CellValor valor={row?.saldo_divida} total={row?.totais} moeda={row?.moeda} />
      <CellValor valor={row?.valor_prestacao} total={row?.totais} moeda={row?.moeda} />
      <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 10 }}>
        {row?.situacao && <Label color={(row?.situacao === 'Normal' && 'success') || 'error'}>{row?.situacao}</Label>}
      </TableCell>
    </TableRow>
  );

  return (
    <TableContainer sx={{ mt: 1 }}>
      <Table size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
        <Cabecalho
          item="responsabilidades"
          headLabel={[
            { label: 'Responsabilidade', color: 'success.main' },
            { label: 'Capital inicial', align: 'right' },
            { label: 'Saldo em dívida', align: 'right' },
            { label: 'Prestação', align: 'right' },
            { label: 'Situação', align: 'center', width: 10 },
          ]}
        />
        <TableBody>{dados?.map((row, index) => rowInfo({ label: index + 1, ...row }))}</TableBody>
      </Table>
    </TableContainer>
  );
}
