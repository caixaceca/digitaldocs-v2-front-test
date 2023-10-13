import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Card, Stack, Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { newLineText } from '../../utils/normalizeText';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, closeModal, closeParecer } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { AddItem, UpdateItem, ViewItem, CloneItem, Checked } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';
import {
  LinhaForm,
  FluxoForm,
  EstadoForm,
  OrigemForm,
  ClonarFluxoForm,
  MotivoPendenciaForm,
} from './ParametrizacaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD_FLUXOS = [
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'modelo', label: 'Modelo', align: 'left' },
  { id: 'is_interno', label: 'Interno', align: 'center' },
  { id: 'is_credito', label: 'Crédito', align: 'center' },
  { id: 'is_ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_ESTADOS = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'is_inicial', label: 'Inicial', align: 'center' },
  { id: 'is_final', label: 'Final', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_ORIGENS = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'seguimento', label: 'Segmento', align: 'left' },
  { id: 'tipo', label: 'Tipo', align: 'left' },
  { id: 'ilha', label: 'Localização', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'telefone', label: 'Telefone', align: 'left' },
  { id: '' },
];

const TABLE_HEAD_MOTIVOS = [
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: ' obs', label: 'Observação', align: 'left' },
  { id: '' },
];

const TABLE_HEAD_LINHAS = [
  { id: 'linha', label: 'Linha', align: 'left' },
  { id: 'descricao', label: 'Descrição', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

ParametrizacaoItem.propTypes = { item: PropTypes.string };

export default function ParametrizacaoItem({ item }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem('filterParams') || '');
  const { fluxos, estados, origens, motivosPendencias, linhas, estadoId, fluxoId, isLoading, done, error } =
    useSelector((state) => state.digitaldocs);

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
    defaultOrderBy:
      (item === 'fluxos' && 'assunto') ||
      (item === 'estados' && 'nome') ||
      (item === 'origens' && 'designacao') ||
      (item === 'motivos' && 'motivo') ||
      (item === 'linhas' && 'linha'),
    defaultOrder: 'asc',
  });

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      handleCloseModal();
      if (
        done === 'Estado adicionado' ||
        done === 'Estado atualizado' ||
        done === 'Fluxo adicionado' ||
        done === 'Fluxo atualizado' ||
        done === 'fluxo clonado'
      ) {
        navigate(
          item === 'fluxos'
            ? `${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${fluxoId}`
            : `${PATH_DIGITALDOCS.parametrizacao.root}/estado/${estadoId}`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (mail && cc?.perfil_id && item) {
      dispatch(getAll(item, { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, cc?.perfil_id, item, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCloseModal = () => {
    dispatch(closeModal());
    dispatch(closeParecer());
  };

  const handleView = (id) => {
    navigate(
      (item === 'fluxos' && `${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${id}`) ||
        (item === 'estados' && `${PATH_DIGITALDOCS.parametrizacao.root}/estado/${id}`)
    );
  };

  const dataFiltered = applySortFilter({
    dados:
      (item === 'fluxos' && fluxos) ||
      (item === 'estados' && estados) ||
      (item === 'origens' && origens) ||
      (item === 'motivos' && motivosPendencias) ||
      (item === 'linhas' && linhas) ||
      [],
    filter,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        links={[{ name: '' }]}
        action={<AddItem />}
        sx={{ color: 'text.secondary', px: 1 }}
        heading={
          (item === 'fluxos' && 'Fluxos') ||
          (item === 'estados' && 'Estados') ||
          (item === 'origens' && 'Origens') ||
          (item === 'linhas' && 'Linhas de crédito') ||
          (item === 'motivos' && 'Motivos de pendências')
        }
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple filter={filter} setFilter={setFilter} from="params" />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={
                  (item === 'fluxos' && TABLE_HEAD_FLUXOS) ||
                  (item === 'estados' && TABLE_HEAD_ESTADOS) ||
                  (item === 'origens' && TABLE_HEAD_ORIGENS) ||
                  (item === 'motivos' && TABLE_HEAD_MOTIVOS) ||
                  (item === 'linhas' && TABLE_HEAD_LINHAS)
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      (item === 'fluxos' && 6) ||
                      (item === 'estados' && 4) ||
                      (item === 'origens' && 7) ||
                      ((item === 'motivos' || item === 'linhas') && 3)
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'fluxos' && (
                        <>
                          <TableCell>{row.assunto}</TableCell>
                          <TableCell>{row.modelo}</TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_interno} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_credito} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.is_ativo} />
                          </TableCell>
                        </>
                      )) ||
                        (item === 'estados' && (
                          <>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.is_inicial} />
                            </TableCell>
                            <TableCell align="center">
                              <Checked check={row.is_final} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'origens' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell>{row.seguimento}</TableCell>
                            <TableCell>{row.tipo}</TableCell>
                            <TableCell>
                              {row.ilha} - {row.cidade}
                            </TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.telefone}</TableCell>
                          </>
                        )) ||
                        (item === 'motivos' && (
                          <>
                            <TableCell>{row.motivo}</TableCell>
                            <TableCell>{row.obs}</TableCell>
                          </>
                        )) ||
                        (item === 'linhas' && (
                          <>
                            <TableCell>{row.linha}</TableCell>
                            <TableCell>{newLineText(row.descricao)}</TableCell>
                          </>
                        ))}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75} justifyContent="right">
                          {item === 'origens' || item === 'estados' ? (
                            <UpdateItem
                              id={row?.id}
                              item={(item === 'origens' && 'origem') || (item === 'estados' && 'estado')}
                            />
                          ) : (
                            <UpdateItem dados={row} />
                          )}
                          {item === 'fluxos' && <CloneItem item="fluxo" id={row?.id} />}
                          {(item === 'fluxos' || item === 'estados') && (
                            <ViewItem estado={item === 'estados'} handleClick={() => handleView(row?.id)} />
                          )}
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

      {(item === 'fluxos' && (
        <>
          <FluxoForm onCancel={handleCloseModal} />
          <ClonarFluxoForm onCancel={handleCloseModal} />
        </>
      )) ||
        (item === 'estados' && <EstadoForm onCancel={handleCloseModal} />) ||
        (item === 'origens' && <OrigemForm onCancel={handleCloseModal} />) ||
        (item === 'motivos' && <MotivoPendenciaForm onCancel={handleCloseModal} />) ||
        (item === 'linhas' && <LinhaForm onCancel={handleCloseModal} />)}
    </>
  );
}
