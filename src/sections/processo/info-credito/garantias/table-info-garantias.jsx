// @mui
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { useSelector } from '@/redux/store';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { noDados } from '@/components/Panel';
import { TableSearchNotFound } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableInfoGarantias({ dados, item = '', garantia = false }) {
  return (
    <Table>
      <TableHead>
        {item === 'seguros' && (
          <TableRow sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            {!garantia && <TableCell>Seguro</TableCell>}
            <TableCell>Apólice</TableCell>
            <TableCell>Seguradora</TableCell>
            <TableCell align="right">Cobertura</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="right">Prêmio</TableCell>
            <TableCell align="center">Period.</TableCell>
          </TableRow>
        )}
        {item === 'fiadores' && (
          <TableRow sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableCell>Entidade</TableCell>
            <TableCell>Nome</TableCell>
          </TableRow>
        )}
      </TableHead>
      <TableBody>
        {dados?.map((row, index) => (
          <TableRow hover key={`${row?.id}_${index}`}>
            {item === 'seguros' && (
              <>
                {!garantia && <TableCell>{row?.tipo_seguro || <TipoSeguro tipoId={row?.tipo_seguro_id} />}</TableCell>}
                <TableCell>{row?.apolice}</TableCell>
                <TableCell>{row?.seguradora}</TableCell>
                <TableCell align="right">
                  {fPercent(row?.percentagem_cobertura) || noDados('(Não definido...)')}
                </TableCell>
                <TableCell align="right">{fCurrency(row?.valor) || noDados('(Não definido...)')}</TableCell>
                <TableCell align="right">{fCurrency(row?.premio) || noDados('(Não definido...)')}</TableCell>
                <TableCell align="center">{row?.periodicidade}</TableCell>
              </>
            )}
            {item === 'fiadores' && (
              <>
                <TableCell>{row?.numero_entidade || noDados('(Não definido...)')}</TableCell>
                <TableCell>{row?.nome_entidade || noDados('(Não definido...)')}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
      {dados?.length === 0 && <TableSearchNotFound message="Nenhuma registo encontrado..." height={130} />}
    </Table>
  );
}

function TipoSeguro({ tipoId }) {
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const tipoSeguroLabel = tiposSeguros?.find(({ id }) => id === tipoId)?.designacao;
  return tipoSeguroLabel || noDados('(Não definido...)');
}
