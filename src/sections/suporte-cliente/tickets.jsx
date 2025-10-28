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

export default function Tickets() {
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

  const { isLoading, tickets, departamentos, modalSuporte, utilizador } = useSelector((state) => state.suporte);

  const [department, setDepartment] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem('filterTickets') || '');
  const [subject, setSubject] = useState(localStorage.getItem('subjectTickets') || '');
  const [status, setStatus] = useState(
    statusList?.find(({ id }) => id === localStorage.getItem('statusTicket')) || { id: 'OPEN', label: 'Pendente' }
  );

  useEffect(() => {
    if (!department?.id && departamentos?.length > 0) {
      const idSel = localStorage.getItem('departmentTicket') || utilizador?.department_id;
      const dep = departamentos.find(({ id }) => Number(id) === Number(idSel));
      if (dep) setDepartment({ id: dep.id, abreviation: dep.abreviation });
    }
  }, [departamentos, department?.id, utilizador?.department_id]);

  useEffect(() => {
    if (department?.id) dispatch(getInSuporte('tickets', { department: department?.id, status: status?.id }));
  }, [dispatch, department?.id, status?.id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const subjectList = useMemo(() => [...new Set(tickets?.map((t) => t.subject_name))], [tickets]);
  const dataFiltered = useMemo(
    () => applySortFilter({ dados: tickets, filter, subject, comparator: getComparator(order, orderBy) }),
    [tickets, filter, subject, order, orderBy]
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
          subjectsList={subjectList}
          departmentsList={departamentos}
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
                  { id: 'current_user_name', label: 'Colaborador' },
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

export function applySortFilter({ dados, filter, subject, comparator }) {
  dados = applySort(dados, comparator);

  if (subject) dados = dados.filter(({ subject_name: subjectRow }) => subjectRow === subject);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ nome, description }) =>
        (nome && normalizeText(nome).indexOf(normalizedFilter) !== -1) ||
        (description && normalizeText(description).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}
