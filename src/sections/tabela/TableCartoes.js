import { sub, format } from 'date-fns';
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
import { UosAcesso } from '../../utils/validarAcesso';
import { ptDate, dataValido } from '../../utils/formatTime';
import { normalizeText, baralharString } from '../../utils/formatText';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
import useToggle, { useToggle1, useToggle2 } from '../../hooks/useToggle';
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { setModal, getAll } from '../../redux/slices/digitaldocs';
// Components
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarCartoes } from '../../components/SearchToolbar';
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
  { id: 'emissao_validado', label: 'Canais', align: 'center' },
  { id: 'rececao_validado', label: 'Agência', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function TableCartoes() {
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
  const dispatch = useDispatch();
  const [uo, setUo] = useState(null);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const [datai, setDatai] = useState(sub(new Date(), { days: 1 }));
  const [dataf, setDataf] = useState(sub(new Date(), { days: 1 }));
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem('filterCartao') || '');
  const [fase, setFase] = useState(cc?.uo?.tipo === 'Agências' ? 'Receção' : 'Emissão');
  const [tipoCartao, setTipoCartao] = useState(localStorage.getItem('tipoCartao') || '');
  const { cartoes, done, isLoading, isOpenModal } = useSelector((state) => state.digitaldocs);
  const { isAdmin, isAuditoria, confirmarCartoes, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const uosList = useMemo(
    () =>
      UosAcesso(
        uos?.filter((row) => row?.tipo === 'Agências'),
        cc,
        fase === 'Emissão' || isAdmin || isAuditoria,
        meusAmbientes,
        'balcao'
      ),
    [cc, isAdmin, isAuditoria, meusAmbientes, fase, uos]
  );
  const acessoDop = useMemo(() => fase === 'Emissão' && cc?.uo?.label === 'DOP-CE', [cc?.uo?.label, fase]);
  const acessoAgencia = useMemo(
    () => fase === 'Receção' && uosList?.find((row) => row?.id === uo?.id),
    [fase, uo?.id, uosList]
  );

  useEffect(() => {
    if (done === 'Receção dos cartões confirmada' || done === 'Confirmação anulada') {
      onClose();
      onClose1();
      onClose2();
      setSelected([]);
      if (mail && fase && datai && ((fase === 'Receção' && uo?.id) || fase === 'Emissão'))
        dispatch(
          getAll(fase, {
            mail,
            uoId: uo?.id,
            dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
            dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
          })
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (fase === 'Receção' && uosList?.length > 0 && !uosList?.map((row) => row?.id)?.includes(uo?.id)) {
      const _uo =
        uosList?.find((row) => row?.id === Number(localStorage.getItem('uoCartao'))) ||
        uosList?.find((row) => row?.id === cc?.uo?.balcao) ||
        uosList[0];
      localStorage.setItem('uoCartao', _uo.id || '');
      setUo(_uo);
    }
  }, [uosList, fase, uo, cc?.uo?.balcao]);

  useEffect(() => {
    if (mail && datai && fase === 'Emissão')
      dispatch(
        getAll(fase, {
          mail,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
  }, [dispatch, datai, dataf, fase, mail]);

  useEffect(() => {
    if (mail && datai && uo?.id && fase === 'Receção')
      dispatch(
        getAll(fase, {
          mail,
          uoId: uo?.id,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
  }, [dispatch, uo?.id, datai, dataf, fase, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, fase, datai, dataf, uo?.id]);

  const dados = useMemo(() => dadosList(cartoes, uos), [cartoes, uos]);
  const dataFiltered = applySortFilter({
    dados,
    filter,
    tipoCartao,
    balcao: uo?.id,
    comparator: getComparator(order, orderBy),
  });
  const tiposCartao = useMemo(() => tiposCartoes(dados, filter, uo), [dados, filter, uo]);
  const isNotFound = !dataFiltered.length;
  const dadosNaoValidados = useMemo(
    () =>
      fase === 'Emissão'
        ? dataFiltered?.filter((row) => !row?.emissao_validado)
        : dataFiltered?.filter((row) => !row?.rececao_validado),
    [dataFiltered, fase]
  );
  const dadosValidados = useMemo(
    () =>
      fase === 'Emissão'
        ? dataFiltered?.filter(
            (row) =>
              row?.emissao_validado &&
              !row?.rececao_validado &&
              new Date(row?.data_emissao) > sub(new Date(), { months: 3 })
          )
        : dataFiltered?.filter(
            (row) => row?.rececao_validado && new Date(row?.data_emissao) > sub(new Date(), { days: 15 })
          ),
    [dataFiltered, fase]
  );

  useNotificacao({ done, afterSuccess: () => dispatch(setModal({ modal: '', dados: null })) });

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Receção de cartões"
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
              {(isAdmin || isAuditoria || cc?.uo?.tipo === 'Agências') && (
                <Autocomplete
                  fullWidth
                  size="small"
                  disableClearable
                  value={fase || null}
                  options={['Emissão', 'Receção']}
                  renderInput={(params) => <TextField {...params} label="Fase" sx={{ width: 120 }} />}
                  onChange={(event, newValue) => {
                    setFase(newValue);
                    setSelected([]);
                  }}
                />
              )}
              {dadosNaoValidados?.length > 0 && (isAdmin || (confirmarCartoes && (acessoAgencia || acessoDop))) && (
                <>
                  {(uo && !filter && !tipoCartao && selected.length === 0 && (
                    <DefaultAction label="CONFIRMAR" onClick={onOpen1} variant="contained" />
                  )) ||
                    (selected.length > 0 && <DefaultAction label="CONFIRMAR" onClick={onOpen} variant="contained" />)}
                </>
              )}
              {dadosValidados?.length > 0 && (isAdmin || (confirmarCartoes && (acessoAgencia || acessoDop))) && (
                <DefaultAction label="ANULAR CONFIRMAÇÂO" onClick={onOpen2} icon="cancelar" color="error" />
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
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const validado =
                      (fase === 'Emissão' && row?.emissao_validado) || (fase === 'Receção' && row?.rececao_validado);
                    return (
                      <TableRow key={`${row.id}_${index}`} hover>
                        <TableCell padding="checkbox" sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}>
                          <Checkbox
                            disabled={validado}
                            onClick={() => onSelectRow(row.id)}
                            checked={selected.includes(row.id) || validado}
                          />
                        </TableCell>
                        <TableCell>{ptDate(row.data_emissao)}</TableCell>
                        <TableCell>{row?.entrega}</TableCell>
                        <TableCell align="center">{baralharString(row?.numero)}</TableCell>
                        <TableCell>{baralharString(row?.cliente)}</TableCell>
                        <TableCell>{baralharString(row?.nome)}</TableCell>
                        <TableCell>{row?.tipo}</TableCell>
                        <TableCell align="center" sx={{ width: 10 }}>
                          <Checked check={row.emissao_validado} color={row.emissao_validado ? '' : 'error.main'} />
                        </TableCell>
                        <TableCell align="center" sx={{ width: 10 }}>
                          <Checked check={row.rececao_validado} color={row.rececao_validado ? '' : 'error.main'} />
                        </TableCell>
                        <TableCell width={10}>
                          <Stack direction="row" spacing={0.75} justifyContent="right">
                            {!row.rececao_validado && (isAdmin || (confirmarCartoes && acessoDop)) && (
                              <DefaultAction
                                label="EDITAR"
                                onClick={() => dispatch(setModal({ modal: 'balcao-entrega', dados: row }))}
                              />
                            )}
                            <DefaultAction
                              label="DETALHES"
                              onClick={() => {
                                dispatch(setModal({ modal: 'detalhes-cartao', dados: null }));
                                dispatch(getAll('cartao', { id: row?.id }));
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

      {isOpenModal === 'detalhes-cartao' && (
        <Detalhes closeModal={() => dispatch(setModal({ modal: '', dados: null }))} />
      )}
      {isOpenModal === 'balcao-entrega' && (
        <BalcaoEntregaForm onCancel={() => dispatch(setModal({ modal: '', dados: null }))} />
      )}
      {open && (
        <ValidarMultiploForm
          fase={fase}
          balcao={uo?.id}
          onCancel={onClose}
          cartoes={
            fase === 'Emissão'
              ? dadosNaoValidados?.filter((row) => selected.includes(row.id))
              : dadosNaoValidados?.filter((row) => selected.includes(row.id))
          }
        />
      )}
      {open1 && <ConfirmarPorDataForm balcao={uo} fase={fase} datai={datai} onCancel={onClose1} dataf={dataf} />}
      {open2 && (isAdmin || (confirmarCartoes && (acessoAgencia || acessoDop))) && (
        <AnularForm uo={uo} fase={fase} dense={dense} uosList={uosList} onCancel={onClose2} cartoes={dadosValidados} />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function dadosList(cartoes, uos) {
  return cartoes?.map((row) => ({
    ...row,
    entrega: uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_entrega))?.label || row?.balcao_entrega,
  }));
}

function tiposCartoes(dados, filter, uo) {
  const tiposCartao = [];
  applySortFilter({ dados, filter, tipoCartao: '', balcao: uo?.id, comparator: getComparator('asc', 'id') })?.forEach(
    (row) => {
      tiposCartao.push(row?.tipo);
    }
  );
  return [...new Set(tiposCartao)];
}

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
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero && normalizeText(row?.numero).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.data_emissao && normalizeText(row?.data_emissao).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
