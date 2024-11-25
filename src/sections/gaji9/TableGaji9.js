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
  RepresentanteForm,
} from './Gaji9Form';
import MinutaForm from './MinutaForm';
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
  const { colaboradores } = useSelector((state) => state.intranet);
  const { funcoes, produtos, tiposTitulares, tiposGarantias, representantes, isLoading, isOpenView, isOpenModal } =
    useSelector((state) => state.gaji9);

  const [produto, setProduto] = useState(
    produtos?.filter((row) => row?.id === localStorage.getItem('produtoCl')) || null
  );
  const [titular, setTitular] = useState(
    tiposTitulares?.filter((row) => row?.id === localStorage.getItem('titularCl')) || null
  );
  const [garantia, setGarantia] = useState(
    tiposGarantias?.filter((row) => row?.id === localStorage.getItem('garantiaCl')) || null
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
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'produtos' && produtos) ||
      (item === 'representantes' && representantes) ||
      (item === 'tiposTitulares' && tiposTitulares) ||
      (item === 'tiposGarantias' && tiposGarantias) ||
      (item === 'funcoes' &&
        funcoes?.map((row) => ({
          ...row,
          colaborador: colaboradores?.find(
            (item) => item?.perfil?.id_aad === row?.utilizador_id || item?.perfil?.mail === row?.utilizador_email
          ),
        }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, id) => {
    const itemSingle =
      (item === 'funcoes' && 'funcao') ||
      (item === 'produtos' && 'produto') ||
      (item === 'tiposTitulares' && 'tipoTitular') ||
      (item === 'tiposGarantias' && 'tipoGarantia');
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
              options={tiposTitulares}
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
              options={tiposGarantias}
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
                  <SkeletonTable
                    row={10}
                    column={((item === 'produtos' || item === 'marcadores') && 4) || (item === 'minutas' && 8) || 3}
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {item === 'funcoes' ? (
                          <ColaboradorInfo
                            labelAltCaption
                            id={row?.colaborador?.id}
                            labelAlt={row?.utilizador_id}
                            foto={row?.colaborador?.foto_disk}
                            caption={!row?.colaborador?.uo?.label}
                            nome={row?.colaborador?.nome || row?.utilizador_email}
                            label={row?.colaborador?.uo?.desegnicao || row?.utilizador_id}
                          />
                        ) : (
                          <>{row?.descritivo || row?.designacao || row?.prefixo || row?.titulo || row?.nome}</>
                        )}
                      </TableCell>
                      {(item === 'produtos' && <TableCell>{row?.rotulo}</TableCell>) ||
                        (item === 'marcadores' && <TableCell>{row?.sufixo}</TableCell>) ||
                        (item === 'funcoes' && <TableCell>{row?._role}</TableCell>) ||
                        (item === 'minutas' && (
                          <>
                            <TableCell>{row?.titulo}</TableCell>
                            <TableCell>{row?.sub_titulo}</TableCell>
                            <TableCell>{row?.tipo_titular}</TableCell>
                            <TableCell>{row?.componente}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.consumidor} />
                            </TableCell>
                            <TableCell align="center">{row?.versao}</TableCell>
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
          {item === 'minutas' && <MinutaForm onCancel={handleCloseModal} />}
          {item === 'recursos' && <RecursoForm onCancel={handleCloseModal} />}
          {item === 'produtos' && <ProdutoForm onCancel={handleCloseModal} />}
          {item === 'variaveis' && <VariavelForm onCancel={handleCloseModal} />}
          {item === 'marcadores' && <MarcadorForm onCancel={handleCloseModal} />}
          {item === 'tiposTitulares' && <TitularForm onCancel={handleCloseModal} />}
          {item === 'tiposGarantias' && <GarantiaForm onCancel={handleCloseModal} />}
          {item === 'representantes' && <RepresentanteForm onCancel={handleCloseModal} />}
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
    ...(((item === 'produtos' || item === 'tiposTitulares') && [
      { id: 'descritivo', label: 'Descritivo', align: 'left' },
    ]) ||
      ((item === 'tiposGarantias' || item === 'grupos') && [
        { id: 'designacao', label: 'Designação', align: 'left' },
      ]) ||
      (item === 'clausulas' && [{ id: 'titulo', label: 'Título', align: 'left' }]) ||
      ((item === 'varaveis' || item === 'recursos' || item === 'representantes') && [
        { id: 'nome', label: 'Nome', align: 'left' },
      ]) ||
      (item === 'marcadores' && [
        { id: 'prefixo', label: 'Prefixo', align: 'left' },
        { id: 'sufixo', label: 'Sufixo', align: 'left' },
      ]) ||
      (item === 'funcoes' && [
        { id: 'utilizador_email', label: 'Colaborador', align: 'left' },
        { id: 'get_role', label: 'Função', align: 'left' },
      ]) ||
      (item === 'minutas' && [
        { id: 'titulo', label: 'Título', align: 'left' },
        { id: 'subtitulo', label: 'Subtiulo', align: 'left' },
        { id: 'tipo_titular', label: 'Tipo titular', align: 'left' },
        { id: 'componente', label: 'Componente', align: 'left' },
        { id: 'consumidor', label: 'Consumidor', align: 'left' },
        { id: 'versão', label: 'Versão', align: 'center' },
      ]) ||
      []),
    ...(item === 'produtos' ? [{ id: 'rotulo', label: 'Rótulo', align: 'left' }] : []),
    { id: 'ativo', label: 'Ativo', align: 'center', width: 10 },
    { id: '', width: 10 },
  ];
}
