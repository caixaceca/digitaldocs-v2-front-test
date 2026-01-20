import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { applySortFilter } from './applySortFilter';
import { PATH_DIGITALDOCS } from '../../routes/paths';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { openModal, getSuccess, closeModal, getFromParametrizacao } from '../../redux/slices/parametrizacao';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, CellUoBalcao, noDados } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { Detalhes } from './Detalhes';
import { FluxoForm } from './form-fluxo';
import { EstadoForm } from './form-estado';
import { LinhaForm, OrigemForm, DespesaForm, DocumentoForm } from './ParametrizacaoForm';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableParametrizacao({ item }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    dispatch(getFromParametrizacao(item));
  }, [dispatch, item]);

  useEffect(() => {
    if (done === 'Estado adicionado' || done === 'Fluxo adicionado')
      navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/${item === 'fluxos' ? 'fluxo' : 'estado'}/${selectedItem?.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    setFilter(localStorage.getItem(`filter${item}`) || '');
  }, [item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'linhas' && linhas) ||
      (item === 'fluxos' && fluxos) ||
      (item === 'origens' && origens) ||
      (item === 'despesas' && despesas) ||
      (item === 'documentos' && documentos) ||
      (item === 'estados' &&
        estados?.map((row) => ({
          ...row,
          uo: uos?.find(({ id }) => Number(id) === Number(row?.uo_id))?.label || row?.uo_id,
        }))) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados, modal) => {
    const itemSingle =
      (item === 'origens' && 'origem') || (item === 'despesas' && 'despesa') || (item === 'documentos' && 'documento');

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
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
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
                      (item === 'fluxos' && 6) ||
                      (item === 'origens' && 7) ||
                      ((item === 'documentos' || item === 'estados') && 5) ||
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
                        (item === 'despesas' && <TableCell>{row.designacao || row.descritivo}</TableCell>) ||
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
                            <TableCell>{row.email || noDados('(Não definido)')}</TableCell>
                            <TableCell>{row.telefone || noDados('(Não definido)')}</TableCell>
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
                      {item !== 'estados' && item !== 'origens' && <CellChecked check={row?.is_ativo || row.ativo} />}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {item !== 'fluxos' && item !== 'estados' && (
                            <DefaultAction small label="EDITAR" onClick={() => handleView(row, 'update')} />
                          )}
                          <DefaultAction small onClick={() => handleView(row, 'view')} label="DETALHES" />
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
          {item === 'linhas' && <LinhaForm onClose={() => dispatch(closeModal())} />}
          {item === 'fluxos' && <FluxoForm onClose={() => dispatch(closeModal())} />}
          {item === 'estados' && <EstadoForm onClose={() => dispatch(closeModal())} />}
          {item === 'origens' && <OrigemForm onClose={() => dispatch(closeModal())} />}
          {item === 'despesas' && <DespesaForm onClose={() => dispatch(closeModal())} />}
          {item === 'documentos' && <DocumentoForm onClose={() => dispatch(closeModal())} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EstadoDetail({ row = null }) {
  return (
    <>
      <TableCell>{row.nome}</TableCell>
      <CellUoBalcao uo={row?.uo} balcao={row?.balcao} />
      <CellChecked check={row.is_inicial} />
      <CellChecked check={row.is_final} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find(({ perfil_id: pid }) => pid === row?.perfil_id)?.nome || row?.perfil_id,
  }));
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'linhas' && [
      { id: 'linha', label: 'Designação' },
      { id: 'descricao', label: 'Segmento' },
    ]) ||
      (item === 'despesas' && [{ id: 'linha', label: 'Designação' }]) ||
      (item === 'fluxos' && [
        { id: 'assunto', label: 'Assunto' },
        { id: 'modelo', label: 'Modelo' },
        { id: 'is_interno', label: 'Interno', align: 'center' },
        { id: 'is_credito', label: 'Crédito', align: 'center' },
      ]) ||
      (item === 'estados' && [
        { id: 'nome', label: 'Nome' },
        { id: 'uo', label: 'Unidade orgânica' },
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
    ...(item !== 'estados' && item !== 'origens'
      ? [{ id: item === 'fluxos' ? 'is_ativo' : 'ativo', label: 'Ativo', align: 'center', width: 10 }]
      : []),
    { id: '', width: 10 },
  ];
}
