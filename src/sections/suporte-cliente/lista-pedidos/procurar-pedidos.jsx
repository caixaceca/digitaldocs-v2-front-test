import { useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
// utils
import { injectCollaboratorName } from '../utils';
import { normalizeText } from '@/utils/formatText';
import useTable, { getComparator, applySort } from '@/hooks/useTable';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
// Components
import TablePedidos from './table-pedidos';
import { SearchTickets } from './search-toolbar';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '@/components/SearchToolbar';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcurarPedidos() {
  const dispatch = useDispatch();

  const { order, orderBy, ...rest } = useTable();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, pesquisa, utilizadores } = useSelector((state) => state.suporte);

  const [query, setQuery] = useState(localStorage.getItem('queryTickets') || '');
  const [filter, setFilter] = useState(localStorage.getItem('filterTickets') || '');

  const searchPedidos = () => dispatch(getInSuporte('pesquisa', { query, reset: { dados: [] } }));
  const dados = useMemo(
    () => injectCollaboratorName(pesquisa, utilizadores, colaboradores),
    [pesquisa, utilizadores, colaboradores]
  );
  const dataFiltered = useMemo(
    () => applySortFilter({ dados, filter, comparator: getComparator(order, orderBy) }),
    [filter, order, dados, orderBy]
  );

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Procurar tickets"
        action={<SearchTickets query={query} setQuery={setQuery} searchPedidos={searchPedidos} />}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple filter={filter} setFilter={setFilter} item="filterTicket" />
        <TablePedidos dados={dataFiltered} isLoading={isLoading} useTable={{ order, orderBy, ...rest }} />
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ subject_name: subject, customer_name: customer, code_ticket: code }) =>
        (code && normalizeText(code).indexOf(normalizedFilter) !== -1) ||
        (subject && normalizeText(subject).indexOf(normalizedFilter) !== -1) ||
        (customer && normalizeText(customer).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}
