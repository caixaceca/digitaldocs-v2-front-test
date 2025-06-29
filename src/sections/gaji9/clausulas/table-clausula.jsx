import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { getLocalStorageArray } from '../../../utils/formatObject';
// hooks
import { usePermissao } from '../../../hooks/useAcesso';
import useTable, { getComparator } from '../../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromGaji9, setModal, closeModal, deleteItem } from '../../../redux/slices/gaji9';
// Components
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { Criado, noDados } from '../../../components/Panel';
import { SkeletonTable } from '../../../components/skeleton';
import { DialogConfirmar } from '../../../components/CustomDialog';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import ClausulaForm from './form-clausula';
import DetalhesGaji9 from '../detalhes-gaji9';
import { PreviewMinutaForm } from '../form-minuta';
import FiltrarClausulas from './filtrar-clausulas';
import { applySortFilter, labelTitular } from '../applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableClausula({ inativos }) {
  const dispatch = useDispatch();
  const { temPermissao } = usePermissao();
  const [filter, setFilter] = useState(localStorage.getItem('filterclausulas') || '');

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'asc',
    defaultOrderBy: 'numero_ordem',
    defaultSelected: getLocalStorageArray('selectedClausulas'),
  });

  const { clausulas, isLoading, isSaving, selectedItem, modalGaji9 } = useSelector((state) => state.gaji9);

  const dataFiltered = applySortFilter({ filter, comparator: getComparator(order, orderBy), dados: clausulas || [] });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, clausulas]);

  useEffect(() => {
    localStorage.setItem('selectedClausulas', JSON.stringify(selected));
  }, [selected]);

  const openModal = (modal, dados) => {
    const eliminar = modal === 'eliminar-clausula';
    const isEdit = modal === 'form-clausula' || modal === 'clonar-clausula';
    dispatch(setModal({ item: modal, dados: eliminar ? dados : null, isEdit }));
    if (!eliminar) dispatch(getFromGaji9('clausula', { id: dados?.id, item: 'selectedItem' }));
  };

  const confirmDelete = () => {
    const params = { id: selectedItem?.id, msg: 'Cláusula eliminada' };
    dispatch(deleteItem('clausulas', { ...params, onClose: () => dispatch(setModal({ item: '', dados: null })) }));
  };

  return (
    <>
      <FiltrarClausulas inativos={inativos} />

      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterclausulas" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                numSelected={selected?.length}
                rowCount={dataFiltered?.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    dataFiltered?.map(({ id }) => id)
                  )
                }
                headLabel={[
                  { id: 'numero_ordem', label: 'Nº de cláusula' },
                  { id: 'titulo', label: 'Epígrafe' },
                  { id: 'tipo_titular', label: 'Tipo titular' },
                  { id: 'tipo_garantia', label: 'Tipo garantia' },
                  { id: 'segmento', label: 'Segmento' },
                  { id: 'ultima_modificacao', label: 'Modificado', width: 10 },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={8} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`clausula_${index}`} selected={selected?.includes(row?.id)}>
                      <TableCell
                        align="center"
                        padding="checkbox"
                        sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}
                      >
                        <Checkbox
                          size="small"
                          onClick={() => onSelectRow(row?.id)}
                          checked={selected?.includes(row?.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {(row?.solta && 'SOLTA') ||
                          (row?.seccao_identificacao && 'IDENTIFICAÇÃO') ||
                          (row?.seccao_identificacao_caixa && 'IDENTIFICAÇÃO CAIXA') ||
                          row?.descritivo_numero_ordem ||
                          row?.descritivo ||
                          row?.numero_ordem}
                      </TableCell>
                      <TableCell>{row?.titulo || noDados()}</TableCell>
                      <TableCell>{labelTitular(row?.tipo_titular, row?.consumidor) || noDados()}</TableCell>
                      <TableCell>
                        {row?.tipo_garantia || noDados()}
                        {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                      </TableCell>
                      <TableCell>{row?.segmento || noDados()}</TableCell>
                      <TableCell width={10}>
                        <Criado
                          caption
                          tipo="data"
                          value={ptDateTime(row?.ultima_modificacao || row?.modificado_em || row?.criado_em)}
                        />
                        <Criado caption tipo="user" value={row?.feito_por || row?.modificador || row?.criador} />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="CLONAR" onClick={() => openModal('clonar-clausula', row)} />
                          <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-clausula', row)} />
                          {row?.ativo && temPermissao(['UPDATE_CLAUSULA']) && (
                            <DefaultAction small label="EDITAR" onClick={() => openModal('form-clausula', row)} />
                          )}
                          <DefaultAction
                            small
                            label="DETALHES"
                            onClick={() => {
                              if (!selected?.includes(row?.id)) onSelectRow(row?.id);
                              openModal('view-clausula', row);
                            }}
                          />
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

      {modalGaji9 === 'form-clausula' && <ClausulaForm onClose={() => dispatch(closeModal())} />}
      {modalGaji9 === 'clonar-clausula' && <ClausulaForm onClose={() => dispatch(closeModal())} />}
      {modalGaji9 === 'preview-minuta' && <PreviewMinutaForm onClose={() => dispatch(closeModal())} />}
      {modalGaji9 === 'view-clausula' && <DetalhesGaji9 closeModal={() => dispatch(closeModal())} item="clausulas" />}
      {modalGaji9 === 'eliminar-clausula' && (
        <DialogConfirmar
          isSaving={isSaving}
          desc="eliminar esta cláusula"
          handleOk={() => confirmDelete()}
          onClose={() => dispatch(setModal({ item: '', dados: null }))}
        />
      )}
    </>
  );
}
