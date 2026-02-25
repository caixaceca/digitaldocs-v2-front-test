// @mui
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// utils
import useTable from '@/hooks/useTable';
import { ptDate } from '@/utils/formatTime';
import { useDispatch } from '@/redux/store';
import { fPercent } from '@/utils/formatNumber';
import { responsabilidadesInfo } from './calculos';
import { updateFicha } from '@/redux/slices/intranet';
//
import Label from '@/components/Label';
import { TableHeadCustom } from '@/components/table';
import { Cabecalho, CellValor, EmptyRow, NadaConsta } from './dados-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export default function Responsabilidades({ responsabilidades }) {
  const { dividas, garantiasPrestadas, garantiasRecebidas, irregularidades, dividasExternas } = responsabilidades;

  const rowInfo = (row, incidente) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell>{row?.totais || row?.tipo || row?.classe || ' '}</TableCell>
      <TableCell align="center">{row?.conta || ' '}</TableCell>
      <CellValor valor={row?.valor} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.saldo_divida} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.valor_prestacao} moeda={row?.moeda} total={row?.totais} />
      <TableCell align="right">{row?.taxa_juros ? fPercent(row?.taxa_juros, 2) : ' '}</TableCell>
      <TableCell align="center">
        {row?.data_abertura_credito === row?.data_vencimento || !row?.data_vencimento
          ? ptDate(row?.data_abertura_credito)
          : `${ptDate(row?.data_abertura_credito)} - ${ptDate(row?.data_vencimento)}`}
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {row?.situacao && (
          <Label color={(incidente && 'warning') || (row?.situacao === 'Normal' && 'success') || 'error'}>
            {(incidente && row?.maior_irregularidade) || row?.situacao || ' '}
          </Label>
        )}
      </TableCell>
    </TableRow>
  );

  return dividas?.length > 0 ? (
    <>
      <Cabecalho
        item="responsabilidades"
        headLabel={[
          { label: 'Dívidas na caixa', color: 'success.main' },
          { label: 'Conta', align: 'center' },
          { label: 'Capital inicial', align: 'right' },
          { label: 'Saldo em dívida', align: 'right' },
          { label: 'Prestação', align: 'right' },
          { label: 'Taxa', align: 'right' },
          { label: 'Data', align: 'center' },
          { label: 'Situação', align: 'center' },
        ]}
      />
      <TableBody>
        {dividas?.map((row) => rowInfo(row))}
        {dividas?.length > 1 && rowInfo(responsabilidadesInfo(dividas))}
        {dividas?.length === 0 && <EmptyRow empty cells={7} message="Nenhum registo encontrado..." />}

        {/* Dívidas externas  */}
        {dividasExternas?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Dívidas externas" variant="head" />
            {dividasExternas?.map((row) => rowInfo(row))}
            {dividasExternas?.length > 1 && rowInfo(responsabilidadesInfo(dividasExternas))}
          </>
        )}

        {dividas?.length > 0 && dividasExternas?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Dívidas consolidadas" variant="head" />
            {rowInfo(responsabilidadesInfo([...dividas, ...dividasExternas]))}
          </>
        )}

        {/* Outras responsabilidades */}
        {(garantiasRecebidas?.length > 0 || garantiasPrestadas?.length > 0) && (
          <>
            <EmptyRow cells={8} message="Outras responsabilidades" variant="head" />
            {garantiasRecebidas?.map((row) => rowInfo(row))}
            {garantiasRecebidas?.length > 1 && rowInfo(responsabilidadesInfo(garantiasRecebidas))}
            {garantiasPrestadas?.map((row) => rowInfo(row))}
            {garantiasPrestadas?.length > 1 && rowInfo(responsabilidadesInfo(garantiasPrestadas))}
          </>
        )}

        {/* Irregularidades */}
        {irregularidades?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Histórico de incidentes" variant="head" war />
            {irregularidades?.map((row) => rowInfo(row, true))}
          </>
        )}
      </TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function AvalesFiancas({ dados }) {
  const { fiancas, avalesExternos } = dados;

  const rowInfo = (row) => (
    <TableRow hover sx={{ '& > *': { fontWeight: row?.totais ? 'bold' : 'normal' } }}>
      <TableCell>{(row?.totais && 'Total') || row?.tipo_credito || ' '}</TableCell>
      <TableCell align="center">{row?.cliente || ' '}</TableCell>
      <TableCell align="center">{row?.tipo_interveniente}</TableCell>
      <CellValor valor={row?.valor} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.saldo_divida} moeda={row?.moeda} total={row?.totais} />
      <CellValor valor={row?.valor_prestacao} moeda={row?.moeda} total={row?.totais} />
      <TableCell align="center">
        {row?.situacao && <Label color={(row?.situacao === 'Normal' && 'success') || 'error'}>{row?.situacao}</Label>}
      </TableCell>
    </TableRow>
  );

  return fiancas?.length > 0 || avalesExternos?.length > 0 ? (
    <>
      <Cabecalho
        item="avales-fiancas"
        headLabel={[
          { label: 'Avales/Fianças na caixa', color: 'success.main' },
          { label: 'Nº cliente', align: 'center' },
          { label: 'Resp.', align: 'center' },
          { label: 'Capital inicial', align: 'right' },
          { label: 'Saldo em dívida', align: 'right' },
          { label: 'Prestação', align: 'right' },
          { label: 'Situação', align: 'center' },
        ]}
      />
      <TableBody>
        {fiancas?.map((row) => rowInfo(row))}
        {fiancas?.length > 1 && rowInfo(responsabilidadesInfo(fiancas))}
        {fiancas?.length === 0 && <EmptyRow empty cells={7} message="Nenhum registo encontrado..." />}

        {/* Avales/Fianças externas  */}
        {avalesExternos?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Avales/Fianças externas" variant="head" />
            {avalesExternos?.map((row) => rowInfo(row))}
            {avalesExternos?.length > 1 && rowInfo(responsabilidadesInfo(avalesExternos))}
          </>
        )}
        {fiancas?.length > 0 && avalesExternos?.length > 0 && (
          <>
            <EmptyRow cells={8} message="Avales/Fianças consolidadas" variant="head" />
            {rowInfo(responsabilidadesInfo([...fiancas, ...avalesExternos]))}
          </>
        )}
      </TableBody>
    </>
  ) : (
    <NadaConsta />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Liquidacoes({ dividas = [], liquidacoes = [], onClose }) {
  const dispatch = useDispatch();
  const contas = dividas.map(({ conta }) => conta);
  const { selected, onSelectRow, onSelectAllRows } = useTable({ defaultSelected: liquidacoes });

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ mb: 3 }}>Marcar crédito(s) para liquidação</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHeadCustom
            rowCount={dividas.length}
            numSelected={selected.length}
            onSelectAllRows={(checked) => onSelectAllRows(checked, contas)}
            headLabel={[
              { label: 'Conta' },
              { label: 'Capital inicial', align: 'right' },
              { label: 'Saldo em dívida', align: 'right' },
              { label: 'Prestação', align: 'right' },
            ]}
          />
          <TableBody>
            {dividas.map((row, index) => (
              <TableRow key={`${row?.conta}_${index}`} hover selected={selected?.includes(row?.conta)}>
                <TableCell align="center" padding="checkbox" sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}>
                  <Checkbox
                    size="small"
                    checked={selected.includes(row?.conta)}
                    onClick={() => onSelectRow(row?.conta)}
                  />
                </TableCell>
                <TableCell>{row?.conta}</TableCell>
                <CellValor valor={row?.valor} moeda={row?.moeda} />
                <CellValor valor={row?.saldo_divida} moeda={row?.moeda} />
                <CellValor valor={row?.valor_prestacao} moeda={row?.moeda} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="soft"
          onClick={() => {
            dispatch(updateFicha({ liquidacoes: selected }));
            onClose();
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
