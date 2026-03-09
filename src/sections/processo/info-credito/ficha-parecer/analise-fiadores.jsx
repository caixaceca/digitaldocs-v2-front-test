import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
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
import { responsabilidadesInfo, calcRendimento } from './calculos';
// components
import Label from '@/components/Label';
import { rowInfo } from './dados-ficha';
import FormFiadores from './form-fiadores';
import { DefaultAction } from '@/components/Actions';
import { Cabecalho, CellValor } from './dados-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnaliseFiadores({ fiadores, financiamento, rendimento }) {
  const [fiador, setFiador] = useState(null);
  const rend = calcRendimento(rendimento, false);

  return (
    <Stack spacing={3} sx={{ p: 1 }}>
      {fiadores?.map((row) => {
        const bruto = row?.renda_bruto_mensal;
        const liquido = row?.renda_liquido_mensal;
        const dados = [{ ...financiamento, situacao: 'Normal' }, ...(row.fiancas || [])];
        const totalPres = dados.reduce((acc, item) => acc + Number(item.valor_prestacao || 0), 0);

        return (
          <Stack spacing={2} useFlexGap flexWrap="wrap" direction="row" key={row?.numero_entidade}>
            <Card sx={{ width: '40%', flexGrow: 1, boxShadow: 3, p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>
                      {row?.numero || row?.numero_entidade || '—'}
                    </Box>
                    {' - '} {row?.nome || row?.nome_entidade}
                  </Typography>
                </Stack>
                <DefaultAction small label="Editar" onClick={() => setFiador(row)} />
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {rowInfo('Rendimento bruto', fCurrency(bruto), false)}
                    {rowInfo(
                      'Rendimento líquido',
                      fCurrency(liquido),
                      false,
                      liquido < rend * 0.75 ? alerta(true) : ''
                    )}
                    {rowInfo('Limite DSTI', fCurrency(liquido * 0.5), false)}
                    {rowInfo(
                      'Limite Max. Aval/Fiança',
                      fCurrency(liquido),
                      true,
                      totalPres > liquido ? alerta(false) : ''
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
            <Responsabilidades dados={[...dados, { label: 'Total', ...responsabilidadesInfo(dados) }]} />
          </Stack>
        );
      })}
      {!!fiador && <FormFiadores onClose={() => setFiador(null)} dados={fiador} fiadores={fiadores} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Responsabilidades({ dados }) {
  const rowInfo = (row) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell align="right">{row?.label}</TableCell>
      <CellValor valor={row?.valor} total={row?.totais} />
      <CellValor valor={row?.saldo_divida} total={row?.totais} />
      <CellValor valor={row?.valor_prestacao} total={row?.totais} />
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {row?.situacao && (
          <Label color={(row?.situacao === 'Normal' && 'success') || 'error'}>{row?.situacao || ' '}</Label>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Card sx={{ flexGrow: 1, boxShadow: 3, p: 1 }}>
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
          <Cabecalho
            item="responsabilidades"
            headLabel={[
              { label: '', color: 'success.main' },
              { label: 'Capital inicial', align: 'right' },
              { label: 'Saldo em dívida', align: 'right' },
              { label: 'Prestação', align: 'right' },
              { label: 'Situação', align: 'center' },
            ]}
          />
          <TableBody>{dados?.map((row, index) => rowInfo({ label: index + 1, ...row }))}</TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const alerta = (rendimento) => (
  <Typography sx={{ typography: 'caption', fontWeight: 'bold', color: 'error.main' }}>
    {rendimento
      ? ' *Valor de salário inferior a 75% do salário do proponente'
      : ' *Aval/fiança consolidada ultrapassa o limite recomendável'}
  </Typography>
);
