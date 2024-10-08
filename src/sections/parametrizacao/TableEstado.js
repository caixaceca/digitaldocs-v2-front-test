import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { closeModal } from '../../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Label from '../../components/Label';
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { AddItem, UpdateItem } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { applySortFilter } from './applySortFilter';
import { TransicaoForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD_TRANSICOES = [
  { id: 'estado_inicial', label: 'Origem', align: 'left' },
  { id: 'estado_final', label: 'Destino', align: 'left' },
  { id: 'modo', label: 'Modo', align: 'center' },
  { id: 'prazoemdias', label: 'Prazo', align: 'center' },
  { id: 'is_after_devolucao', label: 'Depois dev.', align: 'center' },
  { id: 'requer_parecer', label: 'Requer parecer', align: 'center' },
  { id: 'is_paralelo', label: 'Paralelo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_ESTADOS = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'is_inicial', label: 'Inicial', align: 'center' },
  { id: 'is_final', label: 'Final', align: 'center' },
];

// ----------------------------------------------------------------------

TableEstado.propTypes = { tab: PropTypes.string };

export default function TableEstado({ tab }) {
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
  } = useTable({
    defaultOrder: tab === 'transicoes' ? 'desc' : 'asc',
    defaultOrderBy: tab === 'transicoes' ? 'id' : 'nome',
  });
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem('filterEstado') || '');
  const { fluxo, estados, isOpenModal, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      tab === 'transicoes'
        ? transicoesList(fluxo?.transicoes, estados)?.filter((option) => option?.modo !== 'desarquivamento')
        : estadosList(fluxo?.transicoes, estados),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={tab === 'transicoes' ? 'Transições' : 'Estados'}
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
          { name: tab === 'transicoes' ? 'Transições' : 'Estados' },
        ]}
        action={
          tab === 'transicoes' &&
          fluxo?.is_ativo && (
            <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
              <AddItem />
            </RoleBasedGuard>
          )
        }
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterEstado" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={tab === 'transicoes' ? TABLE_HEAD_TRANSICOES : TABLE_HEAD_ESTADOS}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={tab === 'transicoes' ? 8 : 3} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${tab}_${index}`}>
                      {tab === 'transicoes' ? (
                        <>
                          <TableCell>{row.estado_inicial}</TableCell>
                          <TableCell>{row.estado_final}</TableCell>
                          <TableCell align="center">
                            <Label color={row?.modo === 'Seguimento' ? 'success' : 'error'}>{row?.modo}</Label>
                          </TableCell>
                          <TableCell align="center">
                            {row.prazoemdias > 1 ? `${row.prazoemdias} dias` : `${row.prazoemdias} dia`}
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_after_devolucao} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.requer_parecer} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_paralelo} />
                          </TableCell>
                          <TableCell align="center" width={50}>
                            <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
                              {fluxo?.is_ativo && <UpdateItem item="transicao" id={row?.id} />}
                            </RoleBasedGuard>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{row.nome}</TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_inicial} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_final} />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível.." />}
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

      {isOpenModal && <TransicaoForm onCancel={handleCloseModal} fluxoId={fluxo?.id} />}
    </>
  );
}

// ----------------------------------------------------------------------

function transicoesList(transicoes, estados) {
  const transicoesL = [];
  transicoes?.forEach((row) => {
    transicoesL.push({
      ...row,
      estado_inicial: estados?.find((item) => item.id === row.estado_inicial_id)?.nome,
      estado_final: estados?.find((item) => item.id === row.estado_final_id)?.nome,
    });
  });
  return transicoesL;
}

function estadosList(transicoes, estados) {
  const estadosId = [];
  const estadosL = [];
  transicoes?.forEach((row) => {
    if (!estadosId.includes(row?.estado_inicial_id)) {
      estadosId.push(row.estado_inicial_id);
      const estado = estados.find((_row) => _row?.id === row?.estado_inicial_id);
      estadosL.push(estado);
    }
    if (!estadosId.includes(row?.estado_final_id)) {
      estadosId.push(row.estado_final_id);
      const estado = estados.find((_row) => _row?.id === row?.estado_final_id);
      estadosL.push(estado);
    }
  });
  return estadosL;
}
