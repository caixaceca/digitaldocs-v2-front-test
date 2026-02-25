import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import { normalizeText } from '@/utils/formatText';
import { statusList, injectCollaboratorName } from '../utils';
import useTable, { getComparator, applySort } from '@/hooks/useTable';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// Components
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
//
import TablePedidos from './table-pedidos';
import SearchToolbar from './search-toolbar';

// ---------------------------------------------------------------------------------------------------------------------

export default function Tickets({ admin, department, setDepartment }) {
  const dispatch = useDispatch();

  const { order, orderBy, setPage, ...rest } = useTable();

  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, tickets, departamentos, utilizadores } = useSelector((state) => state.suporte);

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
  }, [filter, department, subject, status, colaborador]);

  const dados = useMemo(
    () => injectCollaboratorName(tickets, utilizadores, colaboradores),
    [tickets, utilizadores, colaboradores]
  );
  const dataFiltered = useMemo(
    () => applySortFilter({ dados, filter, subject, colaborador, comparator: getComparator(order, orderBy) }),
    [dados, filter, subject, order, colaborador, orderBy]
  );
  const usersList = useMemo(() => [...new Set(dados?.map((t) => t.colaborador).filter(Boolean))], [dados]);
  const subjectsList = useMemo(() => [...new Set(tickets?.map((t) => t.subject_name).filter(Boolean))], [tickets]);

  return (
    <>
      <HeaderBreadcrumbs sx={{ px: 1 }} heading="Tickets" />
      <Card sx={{ p: 1 }}>
        <SearchToolbar
          extra={{ colaborador, setColaborador, admin }}
          lists={{ usersList, subjectsList, departamentos }}
          dados={{ filter, status, subject, department, setStatus, setFilter, setSubject, setDepartment }}
        />
        <TablePedidos dados={dataFiltered} isLoading={isLoading} useTable={{ order, orderBy, ...rest }} />
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, subject, colaborador, comparator }) {
  dados = applySort(dados, comparator);

  if (subject) dados = dados.filter(({ subject_name: subjectRow }) => subjectRow === subject);
  if (colaborador) dados = dados.filter(({ colaborador: colaboradorRow }) => colaboradorRow === colaborador);

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
