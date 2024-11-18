import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { openModal, getSuccess, closeModal, getFromParametrizacao } from '../../redux/slices/parametrizacao';
// Components
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { UpdateItem, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  LinhaForm,
  DespesaForm,
  GarantiaForm,
  RegraAnexoForm,
  AnexoDespesaForm,
  MotivoTransicaoForm,
  MotivoPendenciaForm,
} from './ParametrizacaoForm';
import { Detalhes } from './Detalhes';
import { applySortFilter } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableParametrizacao.propTypes = { item: PropTypes.string, fluxo: PropTypes.object };

export default function TableParametrizacao({ item, fluxo = null }) {
  const dispatch = useDispatch();
  const { handleCloseModal } = useModal(closeModal());
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');
  const {
    anexos,
    linhas,
    despesas,
    garantias,
    isLoading,
    isOpenView,
    isOpenModal,
    regrasAnexos,
    motivosTransicao,
    motivosPendencia,
  } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId } = useSelector((state) => state.intranet);

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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const itemSingle =
    (item === 'despesas' && 'despesa') ||
    (item === 'garantias' && 'garantia') ||
    (item === 'motivosTransicao' && 'motivoTransicao');

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (mail && perfilId && item) {
      dispatch(getFromParametrizacao(item, { mail, perfilId, fluxoId: fluxo?.id, gestao: true }));
    }
  }, [dispatch, perfilId, item, fluxo, mail]);

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'anexos' && anexos) ||
      (item === 'linhas' && linhas) ||
      (item === 'despesas' && despesas) ||
      (item === 'garantias' && garantias) ||
      (item === 'regrasAnexos' && regrasAnexos) ||
      (item === 'motivosPendencia' && motivosPendencia) ||
      (item === 'motivosTransicao' && motivosTransicao) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados) => {
    if (itemSingle) {
      dispatch(openModal('view'));
      dispatch(getFromParametrizacao(itemSingle, { id: dados?.id, mail, perfilId }));
    } else {
      dispatch(openModal('view'));
      dispatch(getSuccess({ item: 'selectedItem', dados }));
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
                    column={(item === 'linhas' && 4) || ((item === 'regrasAnexos' || item === 'anexos') && 5) || 3}
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'anexos' && (
                        <>
                          <TableCell>{row.designacao}</TableCell>
                          <TableCell align="center">
                            <Checked check={row.obriga_prazo_validade} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.reutilizavel} />
                          </TableCell>
                        </>
                      )) ||
                        (item === 'linhas' && (
                          <>
                            <TableCell>{row.linha}</TableCell>
                            <TableCell>{row.descricao}</TableCell>
                          </>
                        )) ||
                        ((item === 'despesas' || item === 'garantias' || item === 'motivosTransicao') && (
                          <TableCell>{row.designacao || row.descritivo}</TableCell>
                        )) ||
                        (item === 'motivosPendencia' && (
                          <>
                            <TableCell>{row.motivo}</TableCell>
                            <TableCell>{row.obs}</TableCell>
                          </>
                        )) ||
                        (item === 'regrasAnexos' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.obrigatorio} />
                            </TableCell>
                          </>
                        ))}
                      <TableCell align="center">
                        <Checked check={item === 'motivosPendencia' ? true : row.ativo} />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {((!itemSingle && item !== 'motivosTransicao' && row?.ativo) ||
                            item === 'motivosPendencia') && <UpdateItem dados={{ dados: row }} />}
                          {itemSingle && <UpdateItem dados={{ item: itemSingle, id: row?.id }} />}
                          <DefaultAction handleClick={() => handleView(row)} label="DETALHES" />
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

      {isOpenView && <Detalhes item={item} closeModal={handleCloseModal} />}
      {isOpenModal && (
        <>
          {item === 'linhas' && <LinhaForm onCancel={handleCloseModal} />}
          {item === 'despesas' && <DespesaForm onCancel={handleCloseModal} />}
          {item === 'garantias' && <GarantiaForm onCancel={handleCloseModal} />}
          {item === 'regrasAnexos' && <RegraAnexoForm onCancel={handleCloseModal} />}
          {item === 'anexos' && <AnexoDespesaForm item="Anexo" onCancel={handleCloseModal} />}
          {item === 'motivosPendencia' && <MotivoPendenciaForm onCancel={handleCloseModal} />}
          {item === 'motivosTransicao' && <MotivoTransicaoForm onCancel={handleCloseModal} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}

function headerTable(item) {
  return [
    ...((item === 'motivosPendencia' && [
      { id: 'motivo', label: 'Designação', align: 'left' },
      { id: 'obs', label: 'Observação', align: 'left' },
    ]) ||
      ((item === 'motivosTransicao' || item === 'despesas') && [
        { id: 'designacao', label: 'Designação', align: 'left' },
      ]) ||
      (item === 'garantias' && [{ id: 'descritivo', label: 'Designação', align: 'left' }]) ||
      (item === 'linhas' && [
        { id: 'linha', label: 'Designação', align: 'left' },
        { id: 'descricao', label: 'Segmento', align: 'left' },
      ]) ||
      (item === 'anexos' && [
        { id: 'designacao', label: 'Designação', align: 'left' },
        { id: 'obriga_prazo_validade', label: 'Prazo de validade', align: 'center' },
        { id: 'reutilizavel', label: 'Reutilizável', align: 'center' },
      ]) ||
      (item === 'regrasAnexos' && [
        { id: 'designacao', label: 'Designação', align: 'left' },
        { id: 'assunto', label: 'Assunto', align: 'left' },
        { id: 'obrigatorio', label: 'Obrigatório', align: 'center' },
      ]) ||
      []),
    { id: 'ativo', label: 'Ativo', align: 'center' },
    { id: '' },
  ];
}
