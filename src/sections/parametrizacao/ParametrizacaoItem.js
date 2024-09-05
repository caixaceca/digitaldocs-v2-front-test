import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// routes
import { ptDateTime } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, openModal, closeModal } from '../../redux/slices/parametrizacao';
// Components
import Scrollbar from '../../components/Scrollbar';
import { Checked, Criado } from '../../components/Panel';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { AddItem, UpdateItem, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { FluxoForm, EstadoForm, OrigemForm, ClonarFluxoForm, MotivoPendenciaForm } from './ParametrizacaoForm';
import { applySortFilter } from './applySortFilter';

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
  { id: 'uo', label: 'Unidade orgânica', align: 'left' },
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
  { id: 'obs', label: 'Observação', align: 'left' },
  { id: 'criado_em', label: 'Registo', align: 'left', width: 10 },
  { id: '' },
];

// ----------------------------------------------------------------------

ParametrizacaoItem.propTypes = { item: PropTypes.string };

export default function ParametrizacaoItem({ item }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');
  const { fluxos, estados, origens, motivosPendencias, selectedItem, isOpenModal, isOpenView, isLoading, done } =
    useSelector((state) => state.parametrizacao);

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
      (item === 'estados' && 'nome') ||
      (item === 'fluxos' && 'assunto') ||
      (item === 'origens' && 'designacao') ||
      (item === 'motivos' && 'motivo'),
    defaultOrder: 'asc',
  });

  useEffect(() => {
    if (done) {
      if (
        done === 'Estado adicionado' ||
        done === 'Estado atualizado' ||
        done === 'Fluxo adicionado' ||
        done === 'Fluxo atualizado' ||
        done === 'Fluxo clonado'
      ) {
        navigate(
          `${PATH_DIGITALDOCS.parametrizacao.root}/${item === 'fluxos' ? 'fluxo' : 'estado'}/${selectedItem?.id}`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (mail && perfilId && item) {
      dispatch(getFromParametrizacao(item, { mail, perfilId }));
    }
  }, [dispatch, perfilId, item, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${item === 'fluxos' ? 'fluxo' : 'estado'}/${id}`);
  };

  const handleClone = (id) => {
    dispatch(openModal('view'));
    dispatch(getFromParametrizacao('fluxo', { id, mail, from: 'listagem', perfilId }));
  };

  const dataFiltered = applySortFilter({
    dados:
      (item === 'fluxos' && fluxos) ||
      (item === 'origens' && origens) ||
      (item === 'motivos' && motivosPendencias) ||
      (item === 'estados' &&
        estados?.map((row) => ({ ...row, uo: uos?.find((item) => item?.id === row?.uo_id)?.label || row?.uo_id }))) ||
      [],
    filter,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        action={<AddItem />}
        heading={
          (item === 'fluxos' && 'Fluxos') ||
          (item === 'estados' && 'Estados') ||
          (item === 'origens' && 'Origens') ||
          (item === 'motivos' && 'Motivos de pendências')
        }
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
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
                  (item === 'motivos' && TABLE_HEAD_MOTIVOS)
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      (item === 'fluxos' && 6) ||
                      (item === 'estados' && 5) ||
                      (item === 'origens' && 7) ||
                      (item === 'motivos' && 4)
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
                            <TableCell>{row.uo}</TableCell>
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
                            <TableCell>
                              {!!row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />}
                              {!!row?.criador && <Criado caption tipo="user" value={row?.criador} />}
                            </TableCell>
                          </>
                        ))}

                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {item === 'estados' ||
                            (item === 'fluxos' && row.is_ativo && (
                              <UpdateItem
                                id={row?.id}
                                item={(item === 'fluxos' && 'fluxo') || (item === 'estados' && 'estado')}
                              />
                            ))}
                          {item === 'origens' && <UpdateItem item="origem" id={row?.id} />}
                          {item !== 'estados' && item !== 'fluxos' && item !== 'origens' && <UpdateItem dados={row} />}
                          {item === 'estados' && <UpdateItem item="estado" id={row?.id} />}
                          {item === 'fluxos' && (
                            <DefaultAction
                              color="inherit"
                              label="Clonar fluxo"
                              handleClick={() => handleClone(row?.id)}
                            />
                          )}
                          {(item === 'fluxos' || item === 'estados') && (
                            <DefaultAction
                              handleClick={() => handleView(row?.id)}
                              label={item === 'estados' ? 'Colaboradores' : 'Transições'}
                            />
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

      {item === 'fluxos' && isOpenView && <ClonarFluxoForm onCancel={handleCloseModal} />}
      {isOpenModal && (
        <>
          {item === 'fluxos' && <FluxoForm onCancel={handleCloseModal} />}
          {item === 'estados' && <EstadoForm onCancel={handleCloseModal} />}
          {item === 'origens' && <OrigemForm onCancel={handleCloseModal} />}
          {item === 'motivos' && <MotivoPendenciaForm onCancel={handleCloseModal} />}
        </>
      )}
    </>
  );
}
