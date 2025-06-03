import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { noDados } from '../../utils/formatText';
import { ptDateTime } from '../../utils/formatTime';
import { acessoGaji9 } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, setModal, closeModal, deleteItem } from '../../redux/slices/gaji9';
// Components
import { Criado } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { DialogConfirmar } from '../../components/CustomDialog';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { sitClausulas } from '../../_mock';
import ClausulaForm from './form-clausula';
import DetalhesGaji9 from './detalhes-gaji9';
import { applySortFilter, listaTitrulares, listaGarantias, listaProdutos } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableClausula.propTypes = { inativos: PropTypes.bool };

export default function TableClausula({ inativos }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem('filterclausulas') || '');

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
  } = useTable({ defaultOrderBy: 'numero_ordem', defaultOrder: 'asc' });

  const { clausulas, isLoading, isSaving, selectedItem, modalGaji9, utilizador, adminGaji9 } = useSelector(
    (state) => state.gaji9
  );

  const dataFiltered = applySortFilter({ filter, comparator: getComparator(order, orderBy), dados: clausulas || [] });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, clausulas]);

  const openModal = (modal, dados) => {
    const eliminar = modal === 'eliminar-clausula';
    dispatch(setModal({ item: modal, dados: eliminar ? dados : null, isEdit: modal === 'form-clausula' }));
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
                headLabel={[
                  { id: 'numero_ordem', label: 'Nº de cláusula' },
                  { id: 'titulo', label: 'Epígrafe' },
                  { id: 'tipo_titular', label: 'Tipo titular' },
                  { id: 'tipo_garantia', label: 'Tipo garantia' },
                  { id: 'componente', label: 'Componente' },
                  { id: 'ultima_modificacao', label: 'Modificado', width: 10 },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={7} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`clausula_${index}`}>
                      <TableCell>
                        {(row?.solta && 'SOLTA') ||
                          (row?.seccao_identificacao && 'IDENTIFICAÇÃO') ||
                          (row?.seccao_identificacao_caixa && 'IDENTIFICAÇÃO CAIXA') ||
                          row?.descritivo ||
                          row?.numero_ordem}
                      </TableCell>
                      <TableCell>{row?.titulo || noDados()}</TableCell>
                      <TableCell>
                        {row?.tipo_titular || noDados()}
                        {row?.tipo_titular === 'Particular' && !row?.consumidor ? ' (Não consumidor)' : ''}
                      </TableCell>
                      <TableCell>
                        {row?.tipo_garantia || noDados()}
                        {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                      </TableCell>
                      <TableCell>{row?.componente || noDados()}</TableCell>
                      <TableCell width={10}>
                        <Criado caption tipo="data" value={ptDateTime(row?.ultima_modificacao || row?.modificado_em)} />
                        <Criado tipo="user" value={row?.feito_por || row?.modificador} baralhar caption />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="ELIMINAR" onClick={() => openModal('eliminar-clausula', row)} />
                          {row?.ativo && (adminGaji9 || acessoGaji9(utilizador?.acessos, ['UPDATE_CLAUSULA'])) && (
                            <DefaultAction small label="EDITAR" onClick={() => openModal('form-clausula', row)} />
                          )}
                          <DefaultAction small label="DETALHES" onClick={() => openModal('view-clausula', row)} />
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

// ----------------------------------------------------------------------

FiltrarClausulas.propTypes = { inativos: PropTypes.bool };

function FiltrarClausulas({ inativos }) {
  const dispatch = useDispatch();
  const { componentes, tiposTitulares, tiposGarantias } = useSelector((state) => state.gaji9);

  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const seccoesList = [
    { id: 'solta', label: 'Solta' },
    { id: 'identificacao', label: 'Secção de identificação' },
    { id: 'caixa', label: 'Secção de identificação Caixa' },
  ];

  const getStoredValue = (key, list) =>
    list?.find(({ id }) => Number(id) === Number(localStorage.getItem(key))) || null;

  const [condicional, setCondicional] = useState(() => getStoredValue(false));
  const [seccao, setSeccao] = useState(() => getStoredValue('seccaoCl', seccoesList));
  const [titular, setTitular] = useState(() => getStoredValue('titularCl', titularesList));
  const [garantia, setGarantia] = useState(() => getStoredValue('garantiaCl', garantiasList));
  const [componente, setComponente] = useState(() => getStoredValue('componenteCl', componentesList));
  const [situacao, setSituacao] = useState(
    () => sitClausulas?.find(({ id }) => id === localStorage.getItem('sitCl')) ?? { id: 'APROVADO', label: 'APROVADO' }
  );

  useEffect(() => {
    dispatch(
      getFromGaji9('clausulas', {
        inativos,
        condicional,
        titularId: titular?.id || null,
        solta: seccao?.label === 'Solta',
        garantiaId: garantia?.id || null,
        situacao: situacao?.id || 'APROVADO',
        componenteId: componente?.id || null,
        caixa: seccao?.label === 'Secção de identificação',
        identificacao: seccao?.label === 'Secção de identificação Caixa',
      })
    );
  }, [componente?.id, situacao, condicional, dispatch, garantia?.id, inativos, seccao?.label, titular?.id]);

  return (
    <Card sx={{ p: 1.5, mb: 3 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Situação" value={situacao} setItem={setSituacao} options={sitClausulas} />
          <SelectItem label="Secção" value={seccao} setItem={setSeccao} options={seccoesList} />

          <FormControlLabel
            label="Condicional"
            sx={{ ml: 0, px: { md: 5 } }}
            control={<Switch checked={condicional} onChange={(event) => setCondicional(event.target.checked)} />}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
            <SelectItem label="Tipo de titular" value={titular} setItem={setTitular} options={titularesList} />
            <SelectItem label="Componente" value={componente} setItem={setComponente} options={componentesList} />
            <SelectItem label="Tipo de garantia" value={garantia} setItem={setGarantia} options={garantiasList} />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

SelectItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  setItem: PropTypes.func,
  options: PropTypes.array,
};

function SelectItem({ label, value, setItem, options }) {
  const item =
    (label === 'Situação' && 'sitCl') ||
    (label === 'Secção' && 'seccaoCl') ||
    (label === 'Componente' && 'componenteCl') ||
    (label === 'Tipo de titular' && 'titularCl') ||
    (label === 'Tipo de garantia' && 'garantiaCl') ||
    '';
  return (
    <Autocomplete
      fullWidth
      size="small"
      value={value}
      options={options}
      disableClearable={label === 'Situação'}
      getOptionLabel={(option) => option?.label}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      onChange={(_, newValue) => {
        setItem(newValue);
        if (item) localStorage.setItem(item, newValue?.id || '');
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
