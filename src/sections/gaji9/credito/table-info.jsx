import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { usePermissao } from '../../../hooks/useAcesso';
import useTable, { getComparator } from '../../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getDocumento, getFromGaji9, deleteItem, setModal } from '../../../redux/slices/gaji9';
// Components
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { CellChecked, noDados } from '../../../components/Panel';
import { DialogConfirmar } from '../../../components/CustomDialog';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import DetalhesCredito from './detalhes-credito';
import { applySortFilter } from '../applySortFilter';
import { IntervenienteForm, DataContrato } from './form-credito';

// ---------------------------------------------------------------------------------------------------------------------

export function TableInfoCredito({ params, dados = [] }) {
  const dispatch = useDispatch();
  const { temPermissao, isGerente } = usePermissao();
  const { contratado = false, id, tab = '' } = params;
  const permissao = isGerente || temPermissao(['READ_CONTRATO']);
  const [filter, setFilter] = useState(localStorage.getItem(`${tab}_form`) || '');

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
  } = useTable({});

  const { isSaving, isLoading, modalGaji9, selectedItem, contratos } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (tab === 'contratos' && permissao) dispatch(getFromGaji9('contratos', { id }));
  }, [dispatch, tab, id, permissao]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: tab === 'contratos' ? contratos : dados,
  });
  const isNotFound = !dataFiltered.length;

  const openModal = (item, dados) => dispatch(setModal({ item, dados }));
  const downloadContrato = (codigo) => dispatch(getDocumento('contrato', { codigo, titulo: `CONTRATO: ${codigo}` }));

  const eliminarInterveniente = () => {
    const params = { numero: selectedItem?.participante_id, getItem: 'credito', onClose: () => openModal() };
    dispatch(deleteItem('intervenientes', { id, msg: 'Interveniente eliminado', ...params }));
  };

  const eliminarContrato = () => {
    const params = { creditoId: id, id: selectedItem?.id, onClose: () => openModal() };
    dispatch(deleteItem('contratos', { ...params, msg: 'Contrato eliminado' }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`${tab}_form`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(tab)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={tab === 'garantias' ? 4 : 5} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    (row, index) =>
                      (tab === 'contratos' && (
                        <TableRow hover key={`contratos_${index}`}>
                          <TableCell>{row?.codigo}</TableCell>
                          <TableCell>{row?.representante}</TableCell>
                          <TableCell align="center">{row?.versao}</TableCell>
                          <CellChecked check={row.ativo} />
                          <TableCell align="center" width={10}>
                            <Stack direction="row" spacing={0.75}>
                              <DefaultAction small label="CONTRATO" onClick={() => downloadContrato(row?.codigo)} />
                              {temPermissao(['DELETE_CONTRATO']) && (
                                <DefaultAction
                                  small
                                  label="ELIMINAR"
                                  onClick={() => openModal('eliminar-contrato', row)}
                                />
                              )}
                              {(isGerente || temPermissao(['CREATE_CONTRATO'])) && (
                                <DefaultAction small label="EDITAR" onClick={() => openModal('data-contrato', row)} />
                              )}
                              <DefaultAction small label="DETALHES" onClick={() => openModal('view-contrato', row)} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )) ||
                      (tab === 'garantias' && (
                        <TableRow hover key={`garantia_${index}`}>
                          <TableCell>{row?.tipo}</TableCell>
                          <TableCell>{row?.valor ? fCurrency(row?.valor) : noDados}</TableCell>
                          <CellChecked check={row.ativo} />
                          <TableCell>
                            <DefaultAction small label="DETALHES" onClick={() => openModal('view-garantia', row)} />
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow hover key={`interveniente_${index}`}>
                          <TableCell align="right">{row?.numero_ordem}</TableCell>
                          <TableCell>{row?.numero_entidade}</TableCell>
                          <TableCell>{row?.nome}</TableCell>
                          <TableCell>
                            {row?.dono_garantia ? (
                              'Dono de garantia'
                            ) : (
                              <>
                                {row?.designacao}
                                {(row?.fiador && ' (FIADOR)') || (row?.avalista && ' (AVALISTA)') || ''}
                                {row?.entidade_representada_nome ? ` - ${row?.entidade_representada_nome}` : ''}
                              </>
                            )}
                          </TableCell>
                          <TableCell align="center" width={10}>
                            {!contratado && !row.mutuario && (isGerente || temPermissao(['CREATE_CREDITO'])) && (
                              <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-interv', row)} />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                  )
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível..." />}
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

      {modalGaji9 === 'eliminar-interv' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => openModal()}
          handleOk={eliminarInterveniente}
          desc="eliminar este interveniente"
        />
      )}
      {modalGaji9 === 'eliminar-contrato' && (
        <DialogConfirmar
          isSaving={isSaving}
          handleOk={eliminarContrato}
          onClose={() => openModal()}
          desc="eliminar este contrato"
        />
      )}
      {modalGaji9 === 'form-interveniente' && (
        <IntervenienteForm
          id={id}
          onClose={() => openModal()}
          dados={dados?.filter(({ mutuario, fiador }) => mutuario || fiador)}
        />
      )}
      {modalGaji9 === 'data-contrato' && <DataContrato creditoId={id} onClose={openModal} />}
      {modalGaji9 === 'view-contrato' && <DetalhesCredito id={id} onClose={openModal} item="contrato" />}
      {modalGaji9 === 'view-garantia' && <DetalhesCredito id={id} onClose={openModal} item="garantia" />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(tab) {
  return [
    ...((tab === 'contratos' && [
      { id: 'codigo', label: 'Código' },
      { id: 'representante', label: 'Representante' },
      { id: 'versao', label: 'Versão', align: 'center', width: 10 },
      { id: 'ativo', label: 'Ativo', align: 'center' },
      { id: '', width: 10 },
    ]) ||
      (tab === 'garantias' && [
        { id: 'tipo', label: 'Garantia' },
        { id: 'valor', label: 'Valor' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
        { id: '', width: 10 },
      ]) || [
        { id: 'numero_ordem', label: 'Ordem', align: 'right', width: 10 },
        { id: 'numero_entidade', label: 'Nº entidade' },
        { id: 'nome', label: 'Nome' },
        { id: 'designacao', label: 'Designação' },
        { id: '', width: 10 },
      ]),
  ];
}
