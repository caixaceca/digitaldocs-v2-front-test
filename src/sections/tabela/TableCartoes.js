import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import {
  Fab,
  Card,
  Stack,
  Table,
  Tooltip,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  Autocomplete,
  TableContainer,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
// utils
import { ptDate } from '../../utils/formatTime';
import { UosAcesso } from '../../utils/validarAcesso';
import { normalizeText } from '../../utils/normalizeText';
// hooks
import useToggle, { useToggle1 } from '../../hooks/useToggle';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, getItem, openDetalhes, closeModal, resetItem } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarCartoes } from '../../components/SearchToolbar';
import { UpdateItem, ViewItem, Checked } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData } from './Dados';
import { ValidarForm, BalcaoEntregaForm, ConfirmarPorDataForm, Detalhes } from './CartoesForm';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'data_emissao', label: 'Data emissão', align: 'left' },
  { id: 'balcao_entrega', label: 'Balcão entrega', align: 'left' },
  { id: 'balcao_cliente', label: 'Balcão domicílio', align: 'left' },
  { id: 'cliente', label: 'Nº cliente', align: 'left' },
  { id: 'nome', label: 'Nome cliente', align: 'left' },
  { id: 'numero', label: 'Nº cartão', align: 'left' },
  { id: 'tipo', label: 'Tipo cartão', align: 'left' },
  { id: 'emissao_validado', label: 'Conf. DOP', align: 'center' },
  { id: 'rececao_validado', label: 'Conf. Agência', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function TableCartoes() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useSearchParams();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const [data, setData] = useState([
    filter?.get('datai') || format(new Date(), 'yyyy-MM-dd'),
    filter?.get('dataf') || format(new Date(), 'yyyy-MM-dd'),
  ]);
  const { cartoes, meusAmbientes, isAdmin, done, error, isLoading, isOpenModal } = useSelector(
    (state) => state.digitaldocs
  );
  const uosList = UosAcesso(
    uos?.filter((row) => row?.tipo === 'Agências'),
    cc,
    isAdmin,
    meusAmbientes,
    'balcao'
  );
  const [uo, setUo] = useState(null);
  const [fase, setFase] = useState(null);
  const [balcaoEntrega, setBalcaoEntrega] = useState(null);

  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'trabalhado_em',
    defaultRowsPerPage: 25,
    defaultDense: cc?.id === 362,
  });

  useEffect(() => {
    if (done === 'rececao confirmada') {
      enqueueSnackbar('Receção dos cartões confirmada com sucesso', { variant: 'success' });
      onClose();
      onClose1();
      if (mail && fase && data && ((fase === 'Receção' && uo?.id) || fase === 'Emissão')) {
        dispatch(getAll(fase, { mail, uoId: uo?.id, dataInicio: data[0], dataFim: data[1] }));
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
    if (cc?.uo?.balcao && uosList) {
      setUo(cc?.uo?.balcao && uosList?.find((row) => row?.id?.toString() === cc?.uo?.balcao?.toString()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uos, cc?.uo?.balcao]);

  useEffect(() => {
    const uoSel = uos?.find((row) => row?.balcao?.toString() === uo?.id?.toString());
    setFase(uoSel?.tipo === 'Agências' ? 'Receção' : 'Emissão');
  }, [uo?.id, uos]);

  useEffect(() => {
    if (mail && fase && data && ((fase === 'Receção' && uo?.id) || fase === 'Emissão')) {
      dispatch(getAll(fase, { mail, uoId: uo?.id, dataInicio: data[0], dataFim: data[1] }));
    }
  }, [dispatch, uo?.id, data, fase, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, fase, data, balcaoEntrega]);

  const dados = [];
  const balcoes = [];
  cartoes?.forEach((row) => {
    const balcEntrega = uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_entrega));
    const balcDomicilio = uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_cliente));
    dados.push({
      ...row,
      domicilio: balcDomicilio?.label,
      entrega: `${row?.balcao_entrega} - ${balcEntrega?.label}`,
    });
    if (!balcoes.includes(`${row?.balcao_entrega} - ${balcEntrega?.label}`)) {
      balcoes.push(`${row?.balcao_entrega} - ${balcEntrega?.label}`);
    }
  });

  const dataFiltered = applySortFilter({
    dados,
    filter: filter?.get('filter'),
    comparator: getComparator(order, orderBy),
    balcaoEntrega,
  });
  const isNotFound = !dataFiltered.length;

  const handleViewRow = (id) => {
    dispatch(openDetalhes());
    dispatch(getItem('cartao', { mail, id }));
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const changeFase = (newValue) => {
    setFase(newValue);
    dispatch(resetItem('cartoes'));
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Receção de cartões"
        links={[{ name: '' }]}
        action={
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
            <UoData
              uo={uo}
              cartoes
              fase={fase}
              setUo={setUo}
              filter={filter}
              dataRange={data}
              setData={setData}
              uosList={uosList}
              setFilter={setFilter}
            />
            {isAdmin && (
              <Stack>
                <Autocomplete
                  fullWidth
                  value={fase}
                  size="small"
                  disableClearable
                  options={['Emissão', 'Receção']}
                  onChange={(event, newValue) => changeFase(newValue)}
                  renderInput={(params) => <TextField {...params} label="Fase" sx={{ width: { md: 120 } }} />}
                />
              </Stack>
            )}
            {((fase === 'Emissão' && dataFiltered?.filter((row) => !row?.rececao_validado)?.length > 0) ||
              (fase === 'Receção' && dataFiltered?.filter((row) => !row?.emissao_validado)?.length > 0)) && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="CONFIRMAR MÚLTIPLO" arrow>
                  <Fab size="small" variant="soft" color="success" onClick={onOpen}>
                    <ChecklistOutlinedIcon />
                  </Fab>
                </Tooltip>
                <Tooltip title="CONFIRMAR POR DATA" arrow>
                  <Fab size="small" variant="soft" color="success" onClick={onOpen1}>
                    <DoneAllIcon />
                  </Fab>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarCartoes
          filter={filter}
          balcoes={balcoes}
          setFilter={setFilter}
          balcaoEntrega={balcaoEntrega}
          setBalcaoEntrega={setBalcaoEntrega}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={10} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={`${row.id}_${index}`} hover>
                      <TableCell>{ptDate(row.data_emissao)}</TableCell>
                      <TableCell>{row?.entrega}</TableCell>
                      <TableCell>
                        {row?.balcao_cliente} - {row?.domicilio}
                      </TableCell>
                      <TableCell>{row?.cliente}</TableCell>
                      <TableCell>{row?.nome}</TableCell>
                      <TableCell>{row?.numero}</TableCell>
                      <TableCell>{row?.tipo}</TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        <Checked check={row.emissao_validado} color={row.emissao_validado ? '' : 'error.main'} />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        <Checked check={row.rececao_validado} color={row.rececao_validado ? '' : 'error.main'} />
                      </TableCell>
                      <TableCell width={10}>
                        <Stack direction="row" spacing={0.75} justifyContent="right">
                          {!row.rececao_validado && fase === 'Emissão' && <UpdateItem dados={row} />}
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
      <BalcaoEntregaForm open={isOpenModal} onCancel={handleCloseModal} />
      <ConfirmarPorDataForm balcao={uo?.id} open={open1} fase={fase} c onCancel={onClose1} />
      <ValidarForm balcao={uo?.id} open={open} dense={dense} fase={fase} cartoes={dataFiltered} onCancel={onClose} />
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter, balcaoEntrega }) {
  const stabilizedThis = dados.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  dados = stabilizedThis.map((el) => el[0]);

  if (balcaoEntrega) {
    dados = dados.filter((row) => row?.entrega === balcaoEntrega);
  }

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.data_emissao && normalizeText(row?.data_emissao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entrega && normalizeText(row?.entrega).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero && normalizeText(row?.numero).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo && normalizeText(row?.tipo).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
