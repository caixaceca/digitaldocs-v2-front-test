import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { noDados } from '../../utils/formatText';
import { setItemValue } from '../../utils/formatObject';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { openModal, getSuccess, closeModal, getFromParametrizacao } from '../../redux/slices/parametrizacao';
// Components
import Scrollbar from '../../components/Scrollbar';
import { CellChecked } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  LinhaForm,
  OrigemForm,
  DespesaForm,
  DocumentoForm,
  MotivoTransicaoForm,
  MotivoPendenciaForm,
} from './ParametrizacaoForm';
import { Detalhes } from './Detalhes';
import { FluxoForm } from './form-fluxo';
import { EstadoForm } from './form-estado';
import { applySortFilter } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableParametrizacao.propTypes = { item: PropTypes.string };

export default function TableParametrizacao({ item }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fluxo, setFluxo] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');
  const {
    done,
    fluxos,
    linhas,
    estados,
    origens,
    despesas,
    isLoading,
    isOpenView,
    documentos,
    isOpenModal,
    selectedItem,
    motivosTransicao,
    motivosPendencia,
  } = useSelector((state) => state.parametrizacao);
  const { uos } = useSelector((state) => state.intranet);

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
    defaultOrder: 'asc',
    defaultOrderBy: (item === 'estados' && 'nome') || (item === 'fluxos' && 'assunto') || 'designacao',
  });

  useEffect(() => {
    if (done === 'Estado adicionado' || done === 'Fluxo adicionado')
      navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${item === 'fluxos' ? 'fluxo' : 'estado'}/${selectedItem?.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  useEffect(() => {
    if (item) dispatch(getFromParametrizacao(item, { fluxoId: fluxo?.id }));
  }, [dispatch, item, fluxo]);

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'linhas' && linhas) ||
      (item === 'fluxos' && fluxos) ||
      (item === 'origens' && origens) ||
      (item === 'despesas' && despesas) ||
      (item === 'documentos' && documentos) ||
      (item === 'motivosPendencia' && motivosPendencia) ||
      (item === 'motivosTransicao' && motivosTransicao) ||
      (item === 'estados' &&
        estados?.map((row) => ({ ...row, uo: uos?.find(({ id }) => id === row?.uo_id)?.label || row?.uo_id }))) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados, modal) => {
    const itemSingle =
      (item === 'origens' && 'origem') ||
      (item === 'despesas' && 'despesa') ||
      (item === 'documentos' && 'documento') ||
      (item === 'motivosTransicao' && 'motivoTransicao');

    if (modal === 'view' && (item === 'fluxos' || item === 'estados')) {
      navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${item === 'fluxos' ? 'fluxo' : 'estado'}/${dados?.id}`);
    } else {
      dispatch(openModal(modal));
      if (itemSingle) dispatch(getFromParametrizacao(itemSingle, { id: dados?.id, item: 'selectedItem' }));
      else dispatch(getSuccess({ item: 'selectedItem', dados }));
    }
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {item === 'motivosTransicao' && <Fluxos fluxo={fluxo} setFluxo={setFluxo} />}
          <Stack sx={{ flexGrow: 1 }}>
            <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
          </Stack>
        </Stack>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      (item === 'linhas' && 4) ||
                      (item === 'origens' && 7) ||
                      (item === 'documentos' && 5) ||
                      ((item === 'fluxos' || item === 'estados') && 6) ||
                      3
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'linhas' && (
                        <>
                          <TableCell>{row.linha}</TableCell>
                          <TableCell>{row.descricao}</TableCell>
                        </>
                      )) ||
                        ((item === 'despesas' || item === 'motivosTransicao') && (
                          <TableCell>{row.designacao || row.descritivo}</TableCell>
                        )) ||
                        (item === 'motivosPendencia' && (
                          <>
                            <TableCell>{row.motivo}</TableCell>
                            <TableCell>{row.obs}</TableCell>
                          </>
                        )) ||
                        (item === 'fluxos' && (
                          <>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell>{row.modelo}</TableCell>
                            <CellChecked check={row.is_interno} />
                            <CellChecked check={row.is_credito} />
                          </>
                        )) ||
                        (item === 'estados' && <EstadoDetail row={row} />) ||
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
                        (item === 'documentos' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell align="center">
                              {(row?.anexo && 'Anexo') || (row.formulario && 'Formulário') || null}
                            </TableCell>
                            <CellChecked check={row.obriga_prazo_validade} />
                          </>
                        ))}
                      {item !== 'motivosPendencia' && item !== 'estados' && item !== 'origens' && (
                        <CellChecked check={row?.is_ativo || row.ativo} />
                      )}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {item !== 'fluxos' && item !== 'estados' && (
                            <DefaultAction label="EDITAR" onClick={() => handleView(row, 'update')} />
                          )}
                          <DefaultAction onClick={() => handleView(row, 'view')} label="DETALHES" />
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

      {isOpenView && <Detalhes item={item} closeModal={() => dispatch(closeModal())} />}
      {isOpenModal && (
        <>
          {item === 'linhas' && <LinhaForm onCancel={() => dispatch(closeModal())} />}
          {item === 'fluxos' && <FluxoForm onCancel={() => dispatch(closeModal())} />}
          {item === 'estados' && <EstadoForm onCancel={() => dispatch(closeModal())} />}
          {item === 'origens' && <OrigemForm onCancel={() => dispatch(closeModal())} />}
          {item === 'despesas' && <DespesaForm onCancel={() => dispatch(closeModal())} />}
          {item === 'documentos' && <DocumentoForm onCancel={() => dispatch(closeModal())} />}
          {item === 'motivosPendencia' && <MotivoPendenciaForm onCancel={() => dispatch(closeModal())} />}
          {item === 'motivosTransicao' && <MotivoTransicaoForm onCancel={() => dispatch(closeModal())} />}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

EstadoDetail.propTypes = { row: PropTypes.object };

export function EstadoDetail({ row = null }) {
  return (
    <>
      <TableCell>{row.nome}</TableCell>
      <TableCell>{row.uo}</TableCell>
      <TableCell>{row.balcao || noDados('(Não definido)')}</TableCell>
      <CellChecked check={row.is_inicial} />
      <CellChecked check={row.is_final} />
    </>
  );
}

// ----------------------------------------------------------------------

Fluxos.propTypes = { fluxo: PropTypes.object, setFluxo: PropTypes.func };

function Fluxos({ fluxo = null, setFluxo }) {
  const { fluxos } = useSelector((state) => state.parametrizacao);

  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })) || [],
    [fluxos]
  );

  useEffect(() => {
    if (localStorage.getItem('fluxoRegras'))
      setFluxo(fluxosList.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras'))) || null);
  }, [fluxosList, setFluxo]);

  return (
    <Autocomplete
      fullWidth
      disableClearable
      options={fluxosList}
      value={fluxo || null}
      sx={{ maxWidth: { sm: 250, md: 350 } }}
      renderInput={(params) => <TextField {...params} label="Fluxo" />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setFluxo, 'fluxoRegras', true)}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'motivosPendencia' && [
      { id: 'motivo', label: 'Designação' },
      { id: 'obs', label: 'Observação' },
    ]) ||
      ((item === 'motivosTransicao' || item === 'despesas') && [{ id: 'designacao', label: 'Designação' }]) ||
      (item === 'linhas' && [
        { id: 'linha', label: 'Designação' },
        { id: 'descricao', label: 'Segmento' },
      ]) ||
      (item === 'fluxos' && [
        { id: 'assunto', label: 'Assunto' },
        { id: 'modelo', label: 'Modelo' },
        { id: 'is_interno', label: 'Interno', align: 'center' },
        { id: 'is_credito', label: 'Crédito', align: 'center' },
      ]) ||
      (item === 'estados' && [
        { id: 'nome', label: 'Nome' },
        { id: 'uo', label: 'Unidade orgânica' },
        { id: 'balcao', label: 'Nº de balcão' },
        { id: 'is_inicial', label: 'Inicial', align: 'center' },
        { id: 'is_final', label: 'Final', align: 'center' },
      ]) ||
      (item === 'origens' && [
        { id: 'designacao', label: 'Designação' },
        { id: 'seguimento', label: 'Segmento' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'ilha', label: 'Localização' },
        { id: 'email', label: 'Email' },
        { id: 'telefone', label: 'Telefone' },
      ]) ||
      (item === 'documentos' && [
        { id: 'designacao', label: 'Designação' },
        { id: '', label: 'Anexo', align: 'center' },
        { id: 'obriga_prazo_validade', label: 'Validade', align: 'center' },
      ]) ||
      []),
    ...(item !== 'motivosPendencia' && item !== 'estados' && item !== 'origens'
      ? [{ id: item === 'fluxos' ? 'is_ativo' : 'ativo', label: 'Ativo', align: 'center', width: 10 }]
      : []),
    { id: '', width: 10 },
  ];
}
