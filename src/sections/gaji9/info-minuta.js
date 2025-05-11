import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, getFromGaji9, setModal, updateItem, deleteItem } from '../../redux/slices/gaji9';
// Components
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { Criado, CellChecked } from '../../components/Panel';
import { DialogConfirmar } from '../../components/CustomDialog';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import ClausulaForm from './form-clausula';
import { applySortFilter } from './applySortFilter';
import { GarantiasForm, ComponentesForm } from './form-minuta';
import DetalhesGaji9, { DetalhesContent } from './DetalhesGaji9';

// ----------------------------------------------------------------------

InfoMinuta.propTypes = { onCancel: PropTypes.func };

export default function InfoMinuta({ onCancel }) {
  const { minuta } = useSelector((state) => state.gaji9);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Stack sx={{ width: 1 }}>
        <Card sx={{ p: 3, pt: 1 }}>
          <DetalhesContent dados={minuta} item="Minuta" />
        </Card>
      </Stack>
      <Stack sx={{ width: 1 }} spacing={3}>
        <GarantiaComponente onCancel={onCancel} garantia hideAdd={!minuta?.em_analise} />
        {minuta?.em_vigor && <GarantiaComponente onCancel={onCancel} />}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

TableInfoMinuta.propTypes = { item: PropTypes.string, onClose: PropTypes.func };

export function TableInfoMinuta({ item, onClose }) {
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
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');
  const { minuta, modalGaji9, isSaving, selectedItem, isLoading } = useSelector((state) => state.gaji9);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    comparator: getComparator(order, orderBy),
    filter: item === 'clausulaMinuta' ? filter : '',
    dados:
      (item === 'clausulaMinuta' && minuta?.clausulas) ||
      (item === 'componentesMinuta' && minuta?.componentes) ||
      (item === 'tiposGarantias' && minuta?.tipos_garantias?.filter((row) => row?.ativo)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const eliminarItem = () => {
    const params = {
      patch: true,
      id: minuta?.id,
      getItem: 'minuta',
      onClose: () => dispatch(getSuccess({ item: 'selectedItem', dados: null })),
    };
    const msg = `${
      (item === 'tiposGarantias' && 'Tipo de garantia') || (item === 'componentesMinuta' && 'Componente') || 'Cláusula'
    } eliminado`;

    if (item === 'tiposGarantias')
      dispatch(updateItem('removeGarant', JSON.stringify({ tipos_garantias: [selectedItem?.id] }), { ...params, msg }));
    else if (item === 'componentesMinuta')
      dispatch(deleteItem('componentesMinuta', { ...params, msg, componenteId: selectedItem?.componente_id }));
    else dispatch(deleteItem('clausulaMinuta', { ...params, msg, clausulaId: selectedItem?.clausula_id }));
  };

  const openModal = (modal, dados) => {
    const getClausula = item === 'clausulaMinuta' && modal !== 'eliminar-item';
    dispatch(setModal({ item: modal, isEdit: modal === 'form-clausula', dados: getClausula ? null : dados }));
    if (getClausula) dispatch(getFromGaji9('clausula', { id: dados?.clausula_id, item: 'selectedItem' }));
  };

  return (
    <>
      {item === 'clausulaMinuta' && (
        <SearchToolbarSimple item={`filter_${item}`} filter={filter} setFilter={setFilter} />
      )}
      <Table size={dense || item !== 'clausulaMinuta' ? 'small' : 'medium'}>
        <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
        <TableBody>
          {isLoading && isNotFound ? (
            <SkeletonTable row={item === 'clausulaMinuta' ? 10 : 4} column={(item === 'tiposGarantias' && 3) || 4} />
          ) : (
            dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow hover key={`${item}_${index}`}>
                {(item === 'tiposGarantias' && <TableCell>{row?.designacao}</TableCell>) ||
                  (item === 'clausulaMinuta' && (
                    <>
                      <TableCell>
                        {(row?.numero_ordem === 0 && !row?.titulo && 'SOLTA') ||
                          (row?.numero_ordem === 0 && 'IDENTIFICAÇÃO') ||
                          `${row?.descritivo_numero_ordem ?? ''}`}
                      </TableCell>
                      <TableCell>{row?.titulo || 'Cláusula solta'}</TableCell>
                    </>
                  )) ||
                  (item === 'componentesMinuta' && <TableCell>{row?.componente}</TableCell>)}
                <CellChecked check={row.ativo} />
                {item === 'componentesMinuta' && (
                  <TableCell>
                    <Criado caption tipo="data" value={ptDateTime(row?.ultima_modificacao)} />
                    {row?.feito_por && <Criado caption tipo="user" value={row.feito_por} />}
                  </TableCell>
                )}
                <TableCell align="center" width={50}>
                  <Stack direction="row" spacing={0.5} justifyContent="right">
                    {minuta?.ativo && (minuta?.em_analise || item === 'componentesMinuta') && (
                      <>
                        <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-item', row)} />
                        {item === 'clausulaMinuta' && (
                          <DefaultAction small label="EDITAR" onClick={() => openModal('form-clausula', row)} />
                        )}
                      </>
                    )}
                    {item === 'clausulaMinuta' && (
                      <DefaultAction small label="DETALHES" onClick={() => openModal('view-clausula', row)} />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {!isLoading && isNotFound && (
          <TableSearchNotFound height={item !== 'clausulaMinuta' ? 99 : 220} message="Nenhum registo disponível..." />
        )}
      </Table>

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

      {modalGaji9 === 'form-garantia' && <GarantiasForm onCancel={onClose} />}
      {modalGaji9 === 'form-componente' && <ComponentesForm onCancel={onClose} />}
      {modalGaji9 === 'view-clausula' && <DetalhesGaji9 closeModal={onClose} item={item} />}
      {modalGaji9 === 'form-clausula' && <ClausulaForm onCancel={onClose} minutaId={minuta?.id} />}

      {modalGaji9 === 'eliminar-item' && (
        <DialogConfirmar
          isSaving={isSaving}
          handleOk={() => eliminarItem()}
          desc={
            (item === 'tiposGarantias' && 'eliminar este tipo de garantia associada a minuta') ||
            (item === 'componentesMinuta' && 'eliminar este componete da minuta') ||
            'eliminar esta cláusula da minuta'
          }
          onClose={() => dispatch(setModal({ item: '', dados: null }))}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

GarantiaComponente.propTypes = { onCancel: PropTypes.func, garantia: PropTypes.bool, hideAdd: PropTypes.bool };

function GarantiaComponente({ onCancel, garantia = false, hideAdd = false }) {
  const dispatch = useDispatch();

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">{garantia ? 'Tipos de garantias' : 'Componentes'}</Typography>
        {!hideAdd && (
          <DefaultAction
            small
            button
            label="Adicionar"
            onClick={() => dispatch(setModal({ item: garantia ? 'form-garantia' : 'form-componente', dados: null }))}
          />
        )}
      </Stack>
      <TableInfoMinuta item={garantia ? 'tiposGarantias' : 'componentesMinuta'} onClose={onCancel} />
    </Card>
  );
}

function headerTable(item) {
  return [
    ...((item === 'tiposGarantias' && [{ id: 'designacao', label: 'Designação' }]) ||
      (item === 'clausulaMinuta' && [
        { id: 'numero_ordem', label: 'Nº de cláusula' },
        { id: 'titulo', label: 'Epígrafe' },
      ]) ||
      (item === 'componentesMinuta' && [{ id: 'componente', label: 'Componente' }]) ||
      []),
    { id: 'ativo', label: 'Ativo', width: 10, align: 'center' },
    ...(item === 'componentesMinuta' ? [{ id: 'ultima_modificacao', label: 'Registo', width: 10 }] : []),
    { id: '', width: 10, align: 'center' },
  ];
}
