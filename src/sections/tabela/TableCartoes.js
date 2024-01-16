import { sub, format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDate } from '../../utils/formatTime';
import { UosAcesso } from '../../utils/validarAcesso';
import { normalizeText, setItemValue, dataValido } from '../../utils/normalizeText';
// hooks
import useToggle, { useToggle1, useToggle2 } from '../../hooks/useToggle';
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, getItem, openModal, selectItem, openDetalhes, closeModal } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarCartoes } from '../../components/SearchToolbar';
import { UpdateItemAlt, ViewItem, Checked, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData } from './Dados';
import { ValidarMultiploForm, BalcaoEntregaForm, ConfirmarPorDataForm, AnularForm, Detalhes } from './CartoesForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'data_emissao', label: 'Data emissão', align: 'left' },
  { id: 'balcao_entrega', label: 'Balcão entrega', align: 'left' },
  { id: 'numero', label: 'Nº cartão', align: 'center' },
  { id: 'cliente', label: 'Nº cliente', align: 'left' },
  { id: 'nome', label: 'Nome cliente', align: 'left' },
  { id: 'tipo', label: 'Tipo cartão', align: 'left' },
  { id: 'emissao_validado', label: 'Conf. DOP', align: 'center' },
  { id: 'rececao_validado', label: 'Conf. Agência', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function TableCartoes() {
  const dispatch = useDispatch();
  const [uo, setUo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const [datai, setDatai] = useState(sub(new Date(), { days: 1 }));
  const [dataf, setDataf] = useState(sub(new Date(), { days: 1 }));
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem('filterCartao') || '');
  const [fase, setFase] = useState(cc?.uo?.tipo === 'Agências' ? 'Receção' : 'Emissão');
  const [tipoCartao, setTipoCartao] = useState(localStorage.getItem('tipoCartao') || '');
  const { isAdmin, confirmarCartoes } = useSelector((state) => state.parametrizacao);
  const { cartoes, done, error, isLoading, isOpenModal } = useSelector((state) => state.digitaldocs);
  const fromAgencia = cc?.uo?.tipo === 'Agências';

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
    setSelected,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'asc',
    defaultOrderBy: 'numero',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || 25),
  });
  const uosList = useMemo(
    () =>
      UosAcesso(
        uos?.filter((row) => row?.tipo === 'Agências'),
        cc,
        fase === 'Emissão' || isAdmin,
        [],
        'balcao'
      ),
    [cc, isAdmin, fase, uos]
  );

  useEffect(() => {
    if (done === 'Receção dos cartões confirmada' || done === 'Confirmação anulada') {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onClose();
      onClose1();
      onClose2();
      setSelected([]);
      if (mail && fase && datai && ((fase === 'Receção' && uo?.id) || fase === 'Emissão')) {
        dispatch(
          getAll(fase, {
            mail,
            uoId: uo?.id,
            dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
            dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
          })
        );
      }
    } else if (done === 'balcao alterado') {
      enqueueSnackbar('Balcão de entrega alterado com sucesso', { variant: 'success' });
      handleCloseModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (fase === 'Receção' && !uo?.id && uosList?.length > 0 && (localStorage.getItem('uoCartao') || cc?.uo?.balcao)) {
      setUo(
        (localStorage.getItem('uoCartao') &&
          uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoCartao')))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.balcao))
      );
      localStorage.setItem('uoCartao', localStorage.getItem('uoIndic') || cc?.uo?.balcao || '');
    }
  }, [uosList, fase, uo, cc?.uo?.balcao]);

  useEffect(() => {
    if (fase === 'Receção' && uosList?.length > 0 && uo?.id !== cc?.uo?.balcao) {
      setUo(uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.balcao)));
      localStorage.setItem('uoCartao', cc?.uo?.balcao || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uosList, fase, cc?.uo?.balcao]);

  useEffect(() => {
    if (cc?.uo?.tipo) {
      setFase(cc?.uo?.tipo === 'Agências' ? 'Receção' : 'Emissão');
    }
  }, [cc?.uo?.tipo]);

  useEffect(() => {
    if (mail && datai && fase === 'Emissão') {
      dispatch(
        getAll(fase, {
          mail,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, datai, dataf, fase, mail]);

  useEffect(() => {
    if (mail && datai && fase === 'Receção' && uo?.id) {
      dispatch(
        getAll(fase, {
          mail,
          uoId: uo?.id,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, uo?.id, datai, dataf, fase, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, fase, datai, dataf, uo?.id]);

  const dados = [];
  const tiposCartao = [];
  cartoes?.forEach((row) => {
    const balcEntrega = uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_entrega));
    dados.push({ ...row, entrega: balcEntrega?.label });
  });

  const dataFiltered = applySortFilter({
    dados,
    filter,
    tipoCartao,
    balcao: uo?.id,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;
  const temDadosNaoValidados =
    (fase === 'Emissão' && dataFiltered?.filter((row) => !row?.emissao_validado)?.length > 0) ||
    (fase === 'Receção' && dataFiltered?.filter((row) => !row?.rececao_validado)?.length > 0);
  const temDadosValidados =
    (fase === 'Emissão' &&
      dataFiltered?.filter(
        (row) =>
          row?.emissao_validado && !row?.rececao_validado && new Date(row?.data_emissao) > sub(new Date(), { years: 1 })
      )?.length > 0) ||
    (fase === 'Receção' &&
      dataFiltered?.filter(
        (row) => row?.rececao_validado && new Date(row?.data_emissao) > sub(new Date(), { months: 1 })
      )?.length > 0);

  applySortFilter({
    dados,
    filter,
    tipoCartao: '',
    balcao: uo?.id,
    comparator: getComparator(order, orderBy),
  })?.forEach((row) => {
    if (!tiposCartao.includes(row?.tipo)) {
      tiposCartao.push(row?.tipo);
    }
  });

  const handleViewRow = (id) => {
    dispatch(openDetalhes());
    dispatch(getItem('cartao', { mail, id }));
  };

  const handleUpdate = (item) => {
    dispatch(openModal('update'));
    dispatch(selectItem(item));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const changeFase = (newValue) => {
    setFase(newValue);
    setSelected([]);
  };

  return (
    <>
      <HeaderBreadcrumbs
        links={[{ name: '' }]}
        heading="Receção de cartões"
        sx={{ color: 'text.secondary', px: 1 }}
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
            <UoData
              uo={uo}
              cartoes
              setUo={setUo}
              datai={datai}
              dataf={dataf}
              uosList={uosList}
              setDatai={setDatai}
              setDataf={setDataf}
              setSelected={setSelected}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              {(isAdmin || fromAgencia) && (
                <Autocomplete
                  fullWidth
                  size="small"
                  disableClearable
                  value={fase || null}
                  options={['Emissão', 'Receção']}
                  onChange={(event, newValue) => setItemValue(newValue, changeFase, '', false)}
                  renderInput={(params) => <TextField {...params} label="Dados de" sx={{ width: 120 }} />}
                />
              )}
              {temDadosNaoValidados && confirmarCartoes && (
                <>
                  {(fase === 'Receção' && Number(uo?.id) !== Number(cc?.uo?.balcao) && !isAdmin) ||
                  (fase === 'Emissão' && fromAgencia && !isAdmin) ? (
                    ''
                  ) : (
                    <Stack direction="row" spacing={1}>
                      {uo && !filter && !tipoCartao && selected.length === 0 && (
                        <DefaultAction label="CONFIRMAR" handleClick={onOpen1} icon="confirmar" variant="contained" />
                      )}
                      {selected.length > 0 && (
                        <DefaultAction label="CONFIRMAR" handleClick={onOpen} icon="confirmar" variant="contained" />
                      )}
                    </Stack>
                  )}
                </>
              )}
              {temDadosValidados &&
                confirmarCartoes &&
                ((fase === 'Receção' && Number(uo?.id) === Number(cc?.uo?.balcao)) ||
                  (fase === 'Emissão' && cc?.uo?.label === 'DOP-CE') ||
                  isAdmin) && (
                  <DefaultAction label="ANULAR CONFIRMAÇÂO" handleClick={onOpen2} icon="cancelar" color="error" />
                )}
            </Stack>
          </Stack>
        }
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarCartoes
          filter={filter}
          setFilter={setFilter}
          tipoCartao={tipoCartao}
          tiposCartao={tiposCartao}
          setTipoCartao={setTipoCartao}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                numSelected={selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={10} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={`${row.id}_${index}`} hover>
                      <TableCell padding="checkbox">
                        {((fase === 'Emissão' && !row?.emissao_validado) ||
                          (fase === 'Receção' && !row?.rececao_validado)) && (
                          <Checkbox checked={selected.includes(row.id)} onClick={() => onSelectRow(row.id)} />
                        )}
                      </TableCell>
                      <TableCell>{ptDate(row.data_emissao)}</TableCell>
                      <TableCell>{row?.entrega}</TableCell>
                      <TableCell align="center">{row?.numero}</TableCell>
                      <TableCell>{row?.cliente}</TableCell>
                      <TableCell>{row?.nome}</TableCell>
                      <TableCell>{row?.tipo}</TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        <Checked check={row.emissao_validado} color={row.emissao_validado ? '' : 'error.main'} />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        <Checked check={row.rececao_validado} color={row.rececao_validado ? '' : 'error.main'} />
                      </TableCell>
                      <TableCell width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {!row.rececao_validado &&
                            confirmarCartoes &&
                            fase === 'Emissão' &&
                            (cc?.uo?.label === 'DOP-CE' || isAdmin) && (
                              <UpdateItemAlt handleClick={() => handleUpdate(row)} />
                            )}
                          <ViewItem handleClick={() => handleViewRow(row?.id)} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum cartão disponível..." />
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

      <Detalhes closeModal={handleCloseModal} />
      {confirmarCartoes && fase === 'Emissão' && (cc?.uo?.label === 'DOP-CE' || isAdmin) && (
        <BalcaoEntregaForm open={isOpenModal} onCancel={handleCloseModal} />
      )}
      {uo && !filter && !tipoCartao && selected.length === 0 && (
        <ConfirmarPorDataForm balcao={uo} open={open1} fase={fase} data={datai} onCancel={onClose1} />
      )}
      {selected.length > 0 && (
        <ValidarMultiploForm
          open={open}
          fase={fase}
          dense={dense}
          balcao={uo?.id}
          onCancel={onClose}
          cartoes={
            (fase === 'Emissão' &&
              dataFiltered?.filter((row) => !row?.emissao_validado && selected.includes(row.id))) ||
            (fase === 'Receção' &&
              dataFiltered?.filter((row) => !row?.rececao_validado && selected.includes(row.id))) ||
            []
          }
        />
      )}
      {temDadosValidados &&
        confirmarCartoes &&
        ((fase === 'Receção' && Number(uo?.id) === Number(cc?.uo?.balcao)) ||
          (fase === 'Emissão' && cc?.uo?.label === 'DOP-CE') ||
          isAdmin) && (
          <AnularForm
            uo={uo}
            fase={fase}
            open={open2}
            dense={dense}
            uosList={uosList}
            onCancel={onClose2}
            cartoes={
              (fase === 'Emissão' &&
                dataFiltered?.filter(
                  (row) =>
                    row?.emissao_validado &&
                    !row?.rececao_validado &&
                    new Date(row?.data_emissao) > sub(new Date(), { years: 1 })
                )) ||
              (fase === 'Receção' &&
                dataFiltered?.filter(
                  (row) => row?.rececao_validado && new Date(row?.data_emissao) > sub(new Date(), { months: 1 })
                )) ||
              []
            }
          />
        )}
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter, tipoCartao, balcao }) {
  dados = applySort(dados, comparator);

  if (balcao) {
    dados = dados.filter((row) => row?.balcao_entrega === balcao);
  }

  if (tipoCartao) {
    dados = dados.filter((row) => row?.tipo === tipoCartao);
  }

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.data_emissao && normalizeText(row?.data_emissao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entrega && normalizeText(row?.entrega).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero && normalizeText(row?.numero).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
