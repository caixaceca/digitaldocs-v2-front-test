import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { normalizeText } from '../../utils/formatText';
import { nomeacaoBySexo } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { ColaboradorInfo } from '../../components/Panel';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableToolbarPerfilEstados } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'unidade_organica', label: 'Unidade orgânica', align: 'left' },
  { id: 'nomeacao_funcao', label: 'Nomeação/Função', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Acessos() {
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
  } = useTable({ defaultOrderBy: 'nome', defaultOrder: 'asc' });

  const navigate = useNavigate();
  const { isLoading, colaboradores } = useSelector((state) => state.intranet);
  const [uo, setUo] = useState(localStorage.getItem('uoParams') || '');
  const [filter, setFilter] = useState(localStorage.getItem('filterAcessos') || '');

  const dataFiltered = applySortFilter({ colaboradores, comparator: getComparator(order, orderBy), filter, uo });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, uo]);

  const handleUpdate = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/acesso/${id}`);
  };

  return (
    <>
      <HeaderBreadcrumbs heading="Acessos" sx={{ px: 1 }} />
      <Card sx={{ p: 1 }}>
        <TableToolbarPerfilEstados filter={filter} setFilter={setFilter} uo={uo} setUo={setUo} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={4} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row?.id} hover>
                      <TableCell>
                        <ColaboradorInfo
                          id={row?.id}
                          nome={row?.nome}
                          foto={row?.foto_disk}
                          label={row?.perfil?.mail}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="subtitle2"> {row?.uo?.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Balcão nº {row?.uo?.balcao}
                        </Typography>
                      </TableCell>
                      <TableCell>{nomeacaoBySexo(row.nomeacao || row?.funcao, row?.sexo)}</TableCell>
                      <TableCell align="center" width={50}>
                        <DefaultAction label="Gerir acessos" handleClick={() => handleUpdate(row?.perfil?.id)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum colaborador disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ colaboradores, comparator, filter, uo }) {
  colaboradores = applySort(colaboradores, comparator);
  if (uo) {
    colaboradores = colaboradores.filter((row) => row?.uo?.label === uo);
  }
  if (filter && filter !== null) {
    colaboradores = colaboradores.filter(
      (row) => row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1
    );
  }
  return colaboradores;
}
