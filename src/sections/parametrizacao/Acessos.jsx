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
import { normalizeText, nomeacaoBySexo } from '../../utils/formatText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { ColaboradorInfo, Criado, noDados } from '../../components/Panel';
import { TableToolbarPerfilEstados } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ---------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome' },
  { id: 'unidade_organica', label: 'Unidade orgânica' },
  { id: 'vinculo', label: 'Vínculo' },
  { id: '', label: 'Contacto' },
  { id: '' },
];

// ---------------------------------------------------------------------------------------------------------------------

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
  const [uo, setUo] = useState(localStorage.getItem('uoParams') || '');
  const [filter, setFilter] = useState(localStorage.getItem('filterAcessos') || '');

  const { isLoading, colaboradores } = useSelector((state) => state.intranet);
  const dataFiltered = applySortFilter({ colaboradores, comparator: getComparator(order, orderBy), filter, uo });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, uo]);

  return (
    <>
      <HeaderBreadcrumbs heading="Acessos" sx={{ px: 1 }} />
      <Card sx={{ p: 1 }}>
        <TableToolbarPerfilEstados options={{ uo, setUo, filter, setFilter }} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row?.id} hover>
                      <TableCell>
                        <ColaboradorInfo
                          caption
                          id={row?.id}
                          nome={row?.nome}
                          foto={row?.foto_anexo}
                          label={nomeacaoBySexo(row.nomeacao_funcao, row?.sexo)}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="subtitle2"> {row?.uo_label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Balcão nº {row?.balcao}
                        </Typography>
                      </TableCell>
                      <TableCell>{row?.vinculo || noDados()}</TableCell>
                      <TableCell>
                        <Criado value={row?.email} />
                        <Criado value={row?.telefone} />
                      </TableCell>
                      <TableCell align="center" width={50}>
                        <DefaultAction
                          label="Gerir acessos"
                          onClick={() => navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/acesso/${row?.perfil_id}`)}
                        />
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

// ---------------------------------------------------------------------------------------------------------------------

function applySortFilter({ colaboradores, comparator, filter, uo }) {
  colaboradores = applySort(colaboradores, comparator);
  if (uo) colaboradores = colaboradores.filter(({ uo_label: label }) => label === uo);
  if (filter && filter !== null) {
    const normalizedFilter = normalizeText(filter);
    colaboradores = colaboradores.filter(
      ({ nome, nomeacao }) =>
        (nome && normalizeText(nome).indexOf(normalizedFilter) !== -1) ||
        (nomeacao && normalizeText(nomeacao).indexOf(normalizedFilter) !== -1)
    );
  }
  return colaboradores;
}
