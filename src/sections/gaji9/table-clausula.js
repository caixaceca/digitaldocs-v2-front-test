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
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import { Criado } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import ClausulaForm from './form-clausula';
import DetalhesGaji9 from './DetalhesGaji9';
import { applySortFilter, listaTitrulares, listaGarantias, listaProdutos } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableClausula.propTypes = { inativos: PropTypes.bool };

export default function TableClausula({ inativos }) {
  const dispatch = useDispatch();
  const { handleCloseModal } = useModal(closeModal());
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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const { clausulas, isLoading, isOpenView, isOpenModal, utilizador } = useSelector((state) => state.gaji9);

  const dataFiltered = applySortFilter({ filter, comparator: getComparator(order, orderBy), dados: clausulas || [] });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, clausulas]);

  const viewItem = (modal, dados) => {
    dispatch(openModal(modal));
    dispatch(getFromGaji9('clausula', { id: dados?.id, item: 'selectedItem' }));
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
                  { id: 'titulo', label: 'Título' },
                  { id: 'numero_ordem', label: 'Nº', align: 'right' },
                  { id: 'tipo_titular', label: 'Tipo titular' },
                  { id: 'tipo_garantia', label: 'Tipo garantia' },
                  { id: 'componente', label: 'Produto' },
                  { id: '', label: 'Secção' },
                  { id: 'criado_em', label: 'Criado' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={8} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`clausula_${index}`}>
                      <TableCell>{row?.titulo || noDados()}</TableCell>
                      <TableCell align="right">{row?.numero_ordem}</TableCell>
                      <TableCell>
                        {row?.tipo_titular || noDados()}
                        {row?.consumidor ? ' (Consumidor)' : ''}
                      </TableCell>
                      <TableCell>{row?.tipo_garantia || noDados()}</TableCell>
                      <TableCell>{row?.componente || noDados()}</TableCell>
                      <TableCell>
                        {(row?.solta && 'Solta') ||
                          (row?.seccao_identificacao && 'Secção de identificação') ||
                          (row?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
                          noDados()}
                      </TableCell>
                      <TableCell width={10}>
                        {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row.criado_em)} />}
                        {row?.criado_por && <Criado tipo="user" value={row.criado_por} baralhar caption />}
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {(utilizador?._role === 'ADMIN' || acessoGaji9(utilizador?.acessos, ['UPDATE_CLAUSULA'])) && (
                            <DefaultAction label="EDITAR" handleClick={() => viewItem('update', row)} />
                          )}
                          <DefaultAction label="DETALHES" handleClick={() => viewItem('view', row)} />
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

      {isOpenView && <DetalhesGaji9 closeModal={handleCloseModal} item="clausulas" />}
      {isOpenModal && <ClausulaForm onCancel={handleCloseModal} />}
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
    list?.find((row) => Number(row?.id) === Number(localStorage.getItem(key))) || null;

  const [condicional, setCondicional] = useState(() => getStoredValue(false));
  const [seccao, setSeccao] = useState(() => getStoredValue('clSeccao', seccoesList));
  const [titular, setTitular] = useState(() => getStoredValue('titularCl', titularesList));
  const [garantia, setGarantia] = useState(() => getStoredValue('garantiaCl', garantiasList));
  const [componente, setComponente] = useState(() => getStoredValue('componenteCl', componentesList));

  useEffect(() => {
    dispatch(
      getFromGaji9('clausulas', {
        inativos,
        condicional,
        titularId: titular?.id || null,
        solta: seccao?.label === 'Solta',
        garantiaId: garantia?.id || null,
        componenteId: componente?.id || null,
        caixa: seccao?.label === 'Secção de identificação',
        identificacao: seccao?.label === 'Secção de identificação Caixa',
      })
    );
  }, [componente?.id, condicional, dispatch, garantia?.id, inativos, seccao?.label, titular?.id]);

  return (
    <Card sx={{ p: 1, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Secção" value={seccao} setItem={setSeccao} options={seccoesList} />
          <SelectItem label="Tipo de titular" value={titular} setItem={setTitular} options={titularesList} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Componente" value={componente} setItem={setComponente} options={componentesList} />
          <SelectItem label="Tipo de garantia" value={garantia} setItem={setGarantia} options={garantiasList} />
        </Stack>
        <Stack sx={{ pl: 0.5 }}>
          <FormControlLabel
            label="Condicional"
            control={<Switch checked={condicional} onChange={(event) => setCondicional(event.target.checked)} />}
          />
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
    (label === 'Secção' && 'clSeccao') ||
    (label === 'Componente' && 'componenteCl') ||
    (label === 'Tipo de titular' && 'titularCl') ||
    (label === 'Tipo de garantia' && 'garantiaCl') ||
    '';
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={options}
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
