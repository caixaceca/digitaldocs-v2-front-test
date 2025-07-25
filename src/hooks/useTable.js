import { useState } from 'react';

// ---------------------------------------------------------------------------------------------------------------------

export default function useTable(props) {
  const [dense, setDense] = useState(
    (localStorage.getItem('dense') === 'true' && true) || props?.defaultDense || false
  );

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy || 'id');

  const [order, setOrder] = useState(props?.defaultOrder || 'desc');

  const [page, setPage] = useState(props?.defaultCurrentPage || 0);

  const [rowsPerPage, setRowsPerPage] = useState(
    props?.defaultRowsPerPage ||
      (localStorage.getItem('rowsPerPage') && Number(localStorage.getItem('rowsPerPage'))) ||
      10
  );

  const [selected, setSelected] = useState(props?.defaultSelected || []);

  const onSort = (id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
      setPage(0);
    }
  };

  const onSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id);

    let newSelected = [];

    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));

    setSelected(newSelected);
  };

  const onSelectAllRows = (checked, newSelecteds) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const onChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    localStorage.setItem('rowsPerPage', event.target.value);
    setPage(0);
  };

  const onChangeDense = (event) => {
    setDense(event.target.checked);
    localStorage.setItem('dense', event.target.checked);
  };

  // filter

  return {
    dense,
    order,
    page,
    setPage,
    orderBy,
    rowsPerPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function emptyRows(page, rowsPerPage, arrayLength) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

export function applySort(array, comparator) {
  if (!array || array?.length === 0) return [];

  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  array = stabilizedThis.map((el) => el[0]);
  return array;
}
