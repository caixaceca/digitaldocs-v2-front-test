import { sub } from 'date-fns';
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
import { baralharString } from '../../utils/formatText';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { setModal, getFromDigitalDocs } from '../../redux/slices/digitaldocs';
// Components
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarCartoes } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { Detalhes } from './detalhes-cartao';
import { UoData } from '../tabela/uo-data-filter';
import { dadosList, tiposCartoes, datas, applySortFilter } from './utils-cartoes';
import { ValidarMultiploForm, BalcaoEntregaForm, ConfirmarPorDataForm, AnularForm } from './form-cartoes';

// ---------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'data_emissao', label: 'Data emissão' },
  { id: 'balcao_entrega', label: 'Balcão entrega' },
  { id: 'numero', label: 'Nº cartão', align: 'center' },
  { id: 'cliente', label: 'Nº cliente' },
  { id: 'nome', label: 'Nome cliente' },
  { id: 'tipo', label: 'Tipo cartão' },
  { id: 'emissao_validado', label: 'Canais', align: 'center' },
  { id: 'rececao_validado', label: 'Agência', align: 'center' },
  { id: '' },
];

// ---------------------------------------------------------------------------------------------------------------------

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
  const [datai, setDatai] = useState(sub(new Date(), { days: 1 }));
  const [dataf, setDataf] = useState(sub(new Date(), { days: 1 }));
  const [filter, setFilter] = useState(localStorage.getItem('filterCartao') || '');
  const [tipoCartao, setTipoCartao] = useState(localStorage.getItem('tipoCartao') || '');

  const { cc, uos } = useSelector((state) => state.intranet);
  const { cartoes, done, isLoading, isOpenModal } = useSelector((state) => state.digitaldocs);
  const { isAdmin, isAuditoria, confirmarCartoes, meusAmbientes } = useSelector((state) => state.parametrizacao);

  const [fase, setFase] = useState(cc?.uo_tipo === 'Agências' ? 'Receção' : 'Emissão');
  const uosList = useMemo(
    () =>
      UosAcesso(
        uos?.filter(({ tipo }) => tipo === 'Agências'),
        cc,
        fase === 'Emissão' || isAdmin || isAuditoria,
        meusAmbientes,
        'balcao'
      ),
    [cc, isAdmin, isAuditoria, meusAmbientes, fase, uos]
  );
  const acessoDop = useMemo(() => fase === 'Emissão' && cc?.uo_label === 'DOP-CE', [cc?.uo_label, fase]);
  const acessoAgencia = useMemo(
    () => fase === 'Receção' && uosList?.find(({ id }) => id === uo?.id),
    [fase, uo?.id, uosList]
  );

  useEffect(() => {
    if (done === 'Receção dos cartões confirmada' || done === 'Confirmação anulada') {
      setSelected([]);
      dispatch(getFromDigitalDocs(fase, { uoId: uo?.id, ...datas(datai, dataf) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (fase === 'Receção' && uosList?.length > 0 && !uosList?.map(({ id }) => id)?.includes(uo?.id)) {
      const uoSel =
        uosList?.find(({ id }) => Number(id) === Number(localStorage.getItem('uoCartao'))) ||
        uosList?.find(({ id }) => Number(id) === Number(cc?.uo_balcao)) ||
        uosList[0];
      localStorage.setItem('uoCartao', uoSel?.id || '');
      setUo(uoSel);
    }
  }, [uosList, fase, uo, cc?.uo_balcao]);

  useEffect(() => {
    if (datai && fase === 'Emissão') dispatch(getFromDigitalDocs(fase, datas(datai, dataf)));
  }, [dispatch, datai, dataf, fase]);

  useEffect(() => {
    if (datai && uo?.id && fase === 'Receção')
      dispatch(getFromDigitalDocs(fase, { uoId: uo?.id, ...datas(datai, dataf) }));
  }, [dispatch, uo?.id, datai, dataf, fase]);

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
        ? dataFiltered?.filter(({ emissao_validado: ev }) => !ev)
        : dataFiltered?.filter(({ rececao_validado: rv }) => !rv),
    [dataFiltered, fase]
  );
  const dadosValidados = useMemo(
    () =>
      fase === 'Emissão'
        ? dataFiltered?.filter(
            ({ emissao_validado: ev, rececao_validado: rv, data_emissao: data }) =>
              ev && !rv && new Date(data) > sub(new Date(), { months: 1, days: 15 })
          )
        : dataFiltered?.filter(
            ({ rececao_validado: rv, data_emissao: data }) => rv && new Date(data) > sub(new Date(), { days: 15 })
          ),
    [dataFiltered, fase]
  );

  const openModal = (modal, dados) => dispatch(setModal({ modal: modal || '', dados: dados || '' }));
  useNotificacao({ done, onClose: () => openModal() });

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
              {(isAdmin || isAuditoria || cc?.uo_tipo === 'Agências') && (
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
                    <DefaultAction
                      label="CONFIRMAR"
                      variant="contained"
                      onClick={() => openModal('validar-por-data', null)}
                    />
                  )) ||
                    (selected.length > 0 && (
                      <DefaultAction
                        label="CONFIRMAR"
                        variant="contained"
                        onClick={() => openModal('validar-multiplo', null)}
                      />
                    ))}
                </>
              )}
              {dadosValidados?.length > 0 && (isAdmin || (confirmarCartoes && (acessoAgencia || acessoDop))) && (
                <DefaultAction label="ANULAR CONFIRMAÇÂO" onClick={() => openModal('anular', null)} color="error" />
              )}
            </Stack>
          </Stack>
        }
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarCartoes options={{ filter, setFilter, tipoCartao, tiposCartao, setTipoCartao }} />
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
                    dataFiltered.map(({ id }) => id)
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
                      <TableRow key={`${row?.id}_${index}`} hover selected={selected?.includes(row?.id)}>
                        <TableCell
                          align="center"
                          padding="checkbox"
                          sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}
                        >
                          <Checkbox
                            size="small"
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
                              <DefaultAction small label="EDITAR" onClick={() => openModal('balcao-entrega', row)} />
                            )}
                            <DefaultAction
                              small
                              label="DETALHES"
                              onClick={() => {
                                openModal('detalhes-cartao', null);
                                dispatch(getFromDigitalDocs('cartao', { id: row?.id }));
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

      {isOpenModal === 'detalhes-cartao' && <Detalhes closeModal={openModal} />}
      {isOpenModal === 'balcao-entrega' && <BalcaoEntregaForm onClose={openModal} />}
      {isOpenModal === 'validar-multiplo' && (
        <ValidarMultiploForm
          fase={fase}
          balcao={uo?.id}
          onClose={openModal}
          cartoes={
            fase === 'Emissão'
              ? dadosNaoValidados?.filter(({ id }) => selected.includes(id))
              : dadosNaoValidados?.filter(({ id }) => selected.includes(id))
          }
        />
      )}
      {isOpenModal === 'validar-por-data' && (
        <ConfirmarPorDataForm balcao={uo} fase={fase} datai={datai} onClose={openModal} dataf={dataf} />
      )}
      {isOpenModal === 'anular' && (isAdmin || (confirmarCartoes && (acessoAgencia || acessoDop))) && (
        <AnularForm uo={uo} fase={fase} dense={dense} uosList={uosList} onClose={openModal} cartoes={dadosValidados} />
      )}
    </>
  );
}
