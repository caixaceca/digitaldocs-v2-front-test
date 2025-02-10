import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { normalizeText, noDados } from '../../../utils/formatText';
import { ptDateTime, fDistance, fToNow } from '../../../utils/formatTime';
// hooks
import useTable, { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getInfoProcesso, selectParecer } from '../../../redux/slices/digitaldocs';
// components
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { Criado, ColaboradorInfo } from '../../../components/Panel';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import { ConfidencialidadesForm } from '../form/IntervencaoForm';

// ----------------------------------------------------------------------

const TABLE_HEAD_RETENCOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'preso_em', label: 'Retido em', align: 'center' },
  { id: '', label: 'Duração', align: 'center' },
  { id: 'solto_em', label: 'Solto em', align: 'center', minWidth: 100, width: 10 },
];

const TABLE_HEAD_ATRIBUICOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'atribuido_em', label: 'Atribuido em', align: 'center', minWidth: 130, width: 10 },
];

const TABLE_HEAD_PENDENCIAS = [
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: 'observacao', label: 'Observação', align: 'left' },
  { id: '', label: 'Duração', align: 'left' },
  { id: 'data_pendente', label: 'Registo', align: 'center', minWidth: 130, width: 10 },
];

const TABLE_HEAD_CONF = [
  { id: '', label: 'Critérios', align: 'left' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: 'criador', label: 'Criado', align: 'left' },
  { id: '', width: 10 },
];

// ----------------------------------------------------------------------

TableDetalhes.propTypes = { id: PropTypes.number, item: PropTypes.string };

export default function TableDetalhes({ id, item }) {
  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const { colaboradores } = useSelector((state) => state.intranet);
  const { processo, isLoading, isOpenModal1 } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (id && item) dispatch(getInfoProcesso(item, { id }));
  }, [dispatch, item, id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    dados:
      (item === 'confidencialidades' && processo?.confidencialidades) ||
      (item === 'hretencoes' && dadosComColaboradores(processo?.hretencoes || [], colaboradores)) ||
      (item === 'hpendencias' && dadosComColaboradores(processo?.hpendencias || [], colaboradores)) ||
      (item === 'hatribuicoes' && dadosComColaboradores(processo?.hatribuicoes || [], colaboradores)) ||
      [],
    comparator: getComparator(order, orderBy),
    filter,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Box sx={{ p: 1 }}>
      <SearchToolbarSimple filter={filter} setFilter={setFilter} />
      <Scrollbar>
        <TableContainer sx={{ overflow: 'hidden', position: 'relative', minWidth: 800 }}>
          <Table size={dense || item?.includes('anexo') ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              onSort={onSort}
              orderBy={orderBy}
              headLabel={
                (item === 'hretencoes' && TABLE_HEAD_RETENCOES) ||
                (item === 'hpendencias' && TABLE_HEAD_PENDENCIAS) ||
                (item === 'confidencialidades' && TABLE_HEAD_CONF) ||
                (item === 'hatribuicoes' && TABLE_HEAD_ATRIBUICOES)
              }
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={(item === 'hatribuicoes' && 3) || 4} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`table_detalhes_${index}`}>
                    {(item === 'hretencoes' || item === 'hatribuicoes') && (
                      <TableCell>
                        <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} id={row?.idColab} />
                      </TableCell>
                    )}
                    {(item === 'hretencoes' && (
                      <>
                        <TableCell align="center">{ptDateTime(row?.preso_em)}</TableCell>
                        <TableCell align="center">
                          {(row?.preso_em && row?.solto_em && fDistance(row?.preso_em, row?.solto_em)) ||
                            (row?.preso_em && !row?.solto_em && fToNow(row?.preso_em)) ||
                            noDados('--')}
                        </TableCell>
                        <TableCell align={row?.solto_em ? 'left' : 'center'}>
                          {row?.solto_em ? (
                            <Criado tipo="data" value={ptDateTime(row?.solto_em)} />
                          ) : (
                            <Criado sx={{ color: 'text.success' }} caption value="Ainda está a trabalhar no processo" />
                          )}
                          {row?.solto_em && row?.por && (
                            <Criado tipo="user" value={row?.por === 'system' ? 'Pelo sistema' : row?.por} baralhar />
                          )}
                        </TableCell>
                      </>
                    )) ||
                      (item === 'hatribuicoes' && (
                        <>
                          <TableCell>{row?.estado}</TableCell>
                          <TableCell>
                            {row?.atribuido_em && <Criado caption tipo="data" value={ptDateTime(row?.atribuido_em)} />}
                            {row?.atribuidor && <Criado caption tipo="user" value={row?.atribuidor} baralhar />}
                          </TableCell>
                        </>
                      )) ||
                      (item === 'hpendencias' && (
                        <>
                          <TableCell>{row?.motivo}</TableCell>
                          <TableCell>{row?.observacao || noDados('--')}</TableCell>
                          <TableCell>
                            {(row?.data_pendente && row?.data_libertado && (
                              <Criado caption tipo="time" value={fDistance(row?.data_pendente, row?.data_libertado)} />
                            )) ||
                              (row?.data_pendente && !row?.data_libertado && (
                                <Criado caption tipo="time" value={fToNow(row?.data_pendente)} />
                              )) ||
                              noDados('--')}
                            {row?.data_libertado && (
                              <Criado caption tipo="data" value={ptDateTime(row?.data_libertado)} />
                            )}
                          </TableCell>
                          <TableCell>
                            {row?.nome && <Criado caption tipo="user" value={row?.nome} baralhar />}
                            {row?.data_pendente && (
                              <Criado caption tipo="data" value={ptDateTime(row?.data_pendente)} />
                            )}
                          </TableCell>
                        </>
                      )) ||
                      (item === 'confidencialidades' && (
                        <>
                          <TableCell>
                            <Criterios dados={row?.criterios} colaboradores={colaboradores} />
                          </TableCell>
                          <TableCell align="center">
                            <Label variant="ghost" color={row?.ativo ? 'success' : 'default'}>
                              {row?.ativo ? 'Sim' : 'Não'}
                            </Label>
                          </TableCell>
                          <TableCell>
                            {row?.criador && <Criado caption tipo="user" value={row?.criador} baralhar />}
                            {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />}
                          </TableCell>
                          <TableCell>
                            {row?.ativo && row?.permite_alteracao && (
                              <DefaultAction
                                label="EDITAR"
                                color="warning"
                                handleClick={() => dispatch(selectParecer(row))}
                              />
                            )}
                          </TableCell>
                        </>
                      ))}
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

      {isOpenModal1 && <ConfidencialidadesForm processoId={processo.id} />}
    </Box>
  );
}

// ----------------------------------------------------------------------

Criterios.propTypes = { dados: PropTypes.array, colaboradores: PropTypes.array };

export function Criterios({ dados, colaboradores }) {
  const estadosIncluidos = dados.filter((row) => row.estado_incluido_id).map((item) => item.estado_incluido);
  const estadosExcluidos = dados.filter((row) => row.estado_excluido_id).map((item) => item.estado_excluido);
  const perfisIncluidos = dados
    .filter((row) => row.perfil_incluido_id)
    .map(
      (item) =>
        colaboradores?.find((colab) => colab?.perfil_id === item.perfil_incluido_id)?.perfil?.displayName ||
        `PerfilID: ${item.perfil_incluido_id}`
    );
  const perfisExcluidos = dados
    .filter((row) => row.perfil_excluido_id)
    .map(
      (item) =>
        colaboradores?.find((colab) => colab?.perfil_id === item.perfil_excluido_id)?.perfil?.displayName ||
        `PerfilID: ${item.perfil_excluido_id}`
    );

  return (
    <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
      {(estadosIncluidos?.length > 0 || perfisIncluidos?.length > 0) && (
        <ItemsCriterios label="Com acesso" estados={estadosIncluidos} colaboradores={perfisIncluidos} />
      )}
      {(estadosExcluidos?.length > 0 || perfisExcluidos?.length > 0) && (
        <ItemsCriterios label="Sem acesso" estados={estadosExcluidos} colaboradores={perfisExcluidos} />
      )}
    </Stack>
  );
}

ItemsCriterios.propTypes = { label: PropTypes.string, estados: PropTypes.array, colaboradores: PropTypes.array };

export function ItemsCriterios({ label, estados = [], colaboradores = [] }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
        {label}:
      </Typography>
      <Stack spacing={1}>
        {estados?.length > 0 && (
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            {estados?.map((row, index) => (
              <Label color={label === 'Com acesso' ? 'success' : 'error'} key={`${row}_${index}`}>
                {row}
              </Label>
            ))}
          </Stack>
        )}
        {colaboradores?.length > 0 && (
          <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
            {colaboradores?.map((row, index) => (
              <Label color={label === 'Com acesso' ? 'success' : 'error'} key={`${row}_${index}`}>
                {row}
              </Label>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.estado && normalizeText(row?.estado).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.observacao && normalizeText(row?.observacao).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}

function dadosComColaboradores(dados, colaboradores) {
  const dadosList = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores.find((item) => Number(item?.perfil_id) === Number(row?.perfil_id));
    dadosList.push({
      ...row,
      idColab: colaborador?.id,
      uo: colaborador?.uo?.label,
      foto: colaborador?.foto_disk,
      mail: colaborador?.perfil?.mail,
      nome: colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`,
    });
  });
  return dadosList;
}
