import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
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
import { setItemValue } from '../../utils/formatText';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { Checked, ColaboradorInfo } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  GrupoForm,
  FuncaoForm,
  RecursoForm,
  ProdutoForm,
  TitularForm,
  GarantiaForm,
  MarcadorForm,
  VariavelForm,
} from './Gaji9Form';
import ClausulaForm from './ClausulaForm';
import { applySortFilter } from './applySortFilter';
import { Detalhes } from '../parametrizacao/Detalhes';

// ---------------------------------------------------------------------------------------------------------------------

TableGaji9.propTypes = { item: PropTypes.string };

export default function TableGaji9({ item }) {
  const dispatch = useDispatch();
  const { handleCloseModal } = useModal(closeModal());
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');

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
  // const { colaboradores } = useSelector((state) => state.intranet);
  const { produtos, titulares, garantias, isLoading, isOpenView, isOpenModal } = useSelector((state) => state.gaji9);

  const itemSingle =
    (item === 'produtos' && 'produto') || (item === 'titulares' && 'titular') || (item === 'garantias' && 'garantia');
  const [produto, setProduto] = useState(
    produtos?.filter((row) => row?.id === localStorage.getItem('produtoCl')) || null
  );
  const [titular, setTitular] = useState(
    titulares?.filter((row) => row?.id === localStorage.getItem('titularCl')) || null
  );
  const [garantia, setGarantia] = useState(
    garantias?.filter((row) => row?.id === localStorage.getItem('garantiaCl')) || null
  );

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (item && item !== 'clausulas') {
      dispatch(getFromGaji9(item, { getInativos: true }));
    }
  }, [dispatch, item]);

  useEffect(() => {
    if (item && item === 'clausulas' && produto?.id && titular?.id && garantia?.id) {
      dispatch(getFromGaji9(item, { getInativos: true }));
    }
  }, [dispatch, item, garantia?.id, produto?.id, titular?.id]);

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'produtos' && produtos) ||
      (item === 'titulares' && titulares) ||
      (item === 'garantias' && garantias) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, id) => {
    dispatch(openModal(modal));
    dispatch(getFromGaji9(itemSingle, { id }));
  };

  return (
    <>
      {item === 'clausulas' && (
        <Card sx={{ p: 1, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Autocomplete
              fullWidth
              value={titular}
              disableClearable
              options={titulares}
              renderInput={(params) => <TextField {...params} label="Titular" />}
              onChange={(event, newValue) => setItemValue(newValue, setTitular, 'titularCl')}
            />
            <Autocomplete
              fullWidth
              value={produto}
              disableClearable
              options={produtos}
              renderInput={(params) => <TextField {...params} label="Produto" />}
              onChange={(event, newValue) => setItemValue(newValue, setProduto, 'produtoCl')}
            />
            <Autocomplete
              fullWidth
              value={garantia}
              disableClearable
              options={garantias}
              renderInput={(params) => <TextField {...params} label="Garantia" />}
              onChange={(event, newValue) => setItemValue(newValue, setGarantia, 'garantiaCl')}
            />
          </Stack>
        </Card>
      )}
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={((item === 'produtos' || item === 'marcadores') && 4) || 3} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {row?.descritivo || row?.designacao || row?.prefixo || row?.titulo || row?.nome}
                      </TableCell>
                      {(item === 'produtos' && <TableCell>{row?.rotulo}</TableCell>) ||
                        (item === 'marcadores' && <TableCell>{row?.sufixo}</TableCell>) ||
                        (item === 'funcoes' && (
                          <>
                            <TableCell>
                              <ColaboradorInfo
                                label={row?.uo}
                                nome={row?.nome}
                                foto={row?.foto_disk}
                                status={row?.presence}
                              />
                            </TableCell>
                            <TableCell>{row?.funcoa}</TableCell>
                          </>
                        ))}
                      <TableCell align="center">
                        <Checked check={row.ativo} />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction
                            label="EDITAR"
                            color="warning"
                            handleClick={() => viewItem('update', row?.id)}
                          />
                          <DefaultAction label="DETALHES" handleClick={() => viewItem('view', row?.id)} />
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
          {item === 'grupos' && <GrupoForm onCancel={handleCloseModal} />}
          {item === 'funcoes' && <FuncaoForm onCancel={handleCloseModal} />}
          {item === 'recursos' && <RecursoForm onCancel={handleCloseModal} />}
          {item === 'produtos' && <ProdutoForm onCancel={handleCloseModal} />}
          {item === 'titulares' && <TitularForm onCancel={handleCloseModal} />}
          {item === 'garantias' && <GarantiaForm onCancel={handleCloseModal} />}
          {item === 'variaveis' && <VariavelForm onCancel={handleCloseModal} />}
          {item === 'marcadores' && <MarcadorForm onCancel={handleCloseModal} />}
          {item === 'clausulas' && (
            <ClausulaForm
              onCancel={handleCloseModal}
              dados={{ titularId: titular?.id, garantiaID: garantia?.ia, produtoId: produto?.id }}
            />
          )}
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
    ...(((item === 'produtos' || item === 'titulares') && [{ id: 'descritivo', label: 'Descritivo', align: 'left' }]) ||
      ((item === 'garantias' || item === 'grupos') && [{ id: 'designacao', label: 'Designação', align: 'left' }]) ||
      (item === 'clausulas' && [{ id: 'titulo', label: 'Título', align: 'left' }]) ||
      ((item === 'varaveis' || item === 'recursos') && [{ id: 'nome', label: 'Nome', align: 'left' }]) ||
      (item === 'marcadores' && [
        { id: 'prefixo', label: 'Prefixo', align: 'left' },
        { id: 'sufixo', label: 'Sufixo', align: 'left' },
      ]) ||
      (item === 'funcoes' && [
        { id: 'nome', label: 'Colaborador', align: 'left' },
        { id: 'funcao', label: 'get_role', align: 'left' },
      ]) ||
      []),
    ...(item === 'produtos' ? [{ id: 'rotulo', label: 'Rótulo', align: 'left' }] : []),
    { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
    { id: '', width: 10 },
  ];
}
