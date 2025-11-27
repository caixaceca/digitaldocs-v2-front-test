// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { LabelStatus } from '../utils';
import { ptDateTime } from '../../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getInSuporte, setModal } from '../../../redux/slices/suporte-cliente';
// Components
import { noDados } from '../../../components/Panel';
import DetalhesTicket from '../detalhes-ticket/index';
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';

// ---------------------------------------------------------------------------------------------------------------------

export default function TablePedidos({ dados, useTable }) {
  const { isLoading, modalSuporte } = useSelector((state) => state.suporte);
  const dispatch = useDispatch();
  const { page, order, dense, orderBy, rowsPerPage, onSort, onChangePage, onChangeDense, onChangeRowsPerPage } =
    useTable;
  const isNotFound = !dados.length;

  const viewItem = (modal, dados) => {
    dispatch(setModal({ modal: 'detalhes-ticket' }));
    dispatch(getInSuporte('ticket', { id: dados?.id, item: 'selectedItem' }));
  };

  return (
    <>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              onSort={onSort}
              orderBy={orderBy}
              headLabel={[
                { id: 'code_ticket', label: 'Código' },
                { id: 'subject_name', label: 'Assunto' },
                { id: 'customer_name', label: 'Requerente' },
                { id: 'created_at', label: 'Data', align: 'center' },
                { id: 'colaborador', label: 'Atribuído a' },
                { id: 'status', label: 'Estado', align: 'center' },
                { id: '', width: 10 },
              ]}
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable row={10} column={7} />
              ) : (
                dados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`ticket_${index}`}>
                    <TableCell>{row?.code_ticket}</TableCell>
                    <TableCell>{row?.subject_name}</TableCell>
                    <TableCell>{row?.customer_name}</TableCell>
                    <TableCell align="center">{ptDateTime(row?.created_at)}</TableCell>
                    <TableCell>{row?.colaborador ?? noDados('(Não atribuido...)')}</TableCell>
                    <TableCell align="center">
                      <LabelStatus label={row?.status} />
                    </TableCell>
                    <TableCell align="center" width={10}>
                      <Stack direction="row" spacing={0.5} justifyContent="right">
                        <DefaultAction small label="DETALHES" onClick={() => viewItem('view', row)} />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      {!isNotFound && dados.length > 10 && (
        <TablePaginationAlt
          page={page}
          dense={dense}
          rowsPerPage={rowsPerPage}
          count={dados.length}
          onChangePage={onChangePage}
          onChangeDense={onChangeDense}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      )}

      {modalSuporte === 'detalhes-ticket' && <DetalhesTicket onClose={() => dispatch(setModal({}))} />}
    </>
  );
}
