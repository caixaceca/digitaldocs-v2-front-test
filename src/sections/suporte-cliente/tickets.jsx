import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { normalizeText } from '../../utils/formatText';
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getInSuporte, setModal } from '../../redux/slices/suporte-cliente';
// Components
import { noDados } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbar, LabelStatus, statusList } from './utils';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import DetalhesTicket from './detalhes-ticket';

// ---------------------------------------------------------------------------------------------------------------------

export default function Tickets({ admin, department, setDepartment }) {
  const dispatch = useDispatch();

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable();

  const { isLoading, tickets, departamentos, modalSuporte } = useSelector((state) => state.suporte);

  const [filter, setFilter] = useState(localStorage.getItem('filterTickets') || '');
  const [subject, setSubject] = useState(localStorage.getItem('subjectTickets') || '');
  const [colaborador, setColaborador] = useState(localStorage.getItem('colaboradorTickets') || '');
  const [status, setStatus] = useState(
    statusList?.find(({ id }) => id === localStorage.getItem('statusTicket')) || { id: 'OPEN', label: 'Pendente' }
  );

  useEffect(() => {
    if (department?.id || admin) dispatch(getInSuporte('tickets', { department: department?.id, status: status?.id }));
  }, [dispatch, department?.id, status?.id, admin]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const subjectsList = useMemo(() => [...new Set(tickets?.map((t) => t.subject_name).filter(Boolean))], [tickets]);
  const usersList = useMemo(() => [...new Set(tickets?.map((t) => t.current_user_name).filter(Boolean))], [tickets]);

  const dataFiltered = useMemo(
    () => applySortFilter({ dados: tickets, filter, subject, colaborador, comparator: getComparator(order, orderBy) }),
    [tickets, filter, subject, order, colaborador, orderBy]
  );
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    dispatch(setModal({ modal: 'detalhes-ticket' }));
    dispatch(getInSuporte('ticket', { id: dados?.id, item: 'selectedItem' }));
  };
  const onClose = () => dispatch(setModal({}));

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Tickets" />
      <Card sx={{ p: 1 }}>
        <SearchToolbar
          extra={{ colaborador, setColaborador, admin }}
          lists={{ usersList, subjectsList, departamentos }}
          dados={{ filter, status, subject, department, setStatus, setFilter, setSubject, setDepartment }}
        />
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
                  { id: 'current_user_name', label: 'Atribuído a' },
                  { id: 'status', label: 'Estado', align: 'center' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={7} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`ticket_${index}`}>
                      <TableCell>{row?.code_ticket}</TableCell>
                      <TableCell>{row?.subject_name}</TableCell>
                      <TableCell>{row?.customer_name}</TableCell>
                      <TableCell align="center">{ptDateTime(row?.created_at)}</TableCell>
                      <TableCell>{row?.current_user_name ?? noDados('(Não atribuido...)')}</TableCell>
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

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
            onChangePage={onChangePage}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      {modalSuporte === 'detalhes-ticket' && <DetalhesTicket onClose={onClose} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, subject, colaborador, comparator }) {
  dados = applySort(dados, comparator);

  if (subject) dados = dados.filter(({ subject_name: subjectRow }) => subjectRow === subject);
  if (colaborador) dados = dados.filter(({ current_user_name: colaboradorRow }) => colaboradorRow === colaborador);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ customer_name: customer, code_ticket: code }) =>
        (code && normalizeText(code).indexOf(normalizedFilter) !== -1) ||
        (customer && normalizeText(customer).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}
