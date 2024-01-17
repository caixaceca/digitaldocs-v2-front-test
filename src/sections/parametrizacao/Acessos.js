import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { normalizeText } from '../../utils/normalizeText';
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
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

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
  const { isLoading } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);
  const [uo, setUo] = useState(localStorage.getItem('uoParams') || '');
  const [filter, setFilter] = useState(localStorage.getItem('filterParams') || '');

  const handleUpdate = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/acesso/${id}`);
  };

  const colasByName = colaboradores.map((row) => ({
    uo: row?.uo,
    sexo: row.sexo,
    nome: row?.nome,
    perfil: row?.perfil,
    foto_disk: row?.foto_disk,
    unidade_organica: row?.uo?.label,
    nomeacao_funcao: row.nomeacao || row?.funcao,
  }));
  const dataFiltered = applySortFilter({ colasByName, comparator: getComparator(order, orderBy), filter, uo });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, uo]);

  return (
    <>
      <HeaderBreadcrumbs heading="Acessos" links={[{ name: '' }]} action="" sx={{ color: 'text.secondary', px: 1 }} />

      <RoleBasedGuard
        hasContent
        roles={['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}
      >
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
                          <ColaboradorInfo foto={row?.foto_disk} label={row?.perfil?.mail} nome={row?.nome} />
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2"> {row?.uo?.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Balcão nº {row?.uo?.balcao}
                          </Typography>
                        </TableCell>
                        <TableCell>{nomeacaoBySexo(row?.nomeacao_funcao, row?.sexo)}</TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="Gerir acessos" arrow>
                            <DefaultAction
                              label="Acessos & Estados"
                              handleClick={() => handleUpdate(row?.perfil?.id)}
                            />
                          </Tooltip>
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
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ colasByName, comparator, filter, uo }) {
  colasByName = applySort(colasByName, comparator);
  if (uo) {
    colasByName = colasByName.filter((row) => row?.uo?.label === uo);
  }
  if (filter && filter !== null) {
    colasByName = colasByName.filter(
      (row) => row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1
    );
  }
  return colasByName;
}
