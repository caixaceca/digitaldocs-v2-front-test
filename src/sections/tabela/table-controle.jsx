import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { contaCliEnt } from '../../utils/formatText';
import { ColaboradoresAcesso, UosAcesso } from '../../utils/validarAcesso';
import { ptDateTime, getDataLS, dataValido, fToNow, fYear, dataLabel } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromDigitalDocs } from '../../redux/slices/digitaldocs';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import ItemAnalytic from '../../components/ItemAnalytic';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { Criado, noDados, newLineText } from '../../components/Panel';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { ExportarDadosControle } from '../../components/exportar-dados/excel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData } from './uo-data-filter';
import applySortFilter, { dadosList } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableControle({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [uo, setUo] = useState(null);
  const [data, setData] = useState(getDataLS('dataC', new Date()));
  const [datai, setDatai] = useState(getDataLS('dataIC', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFC', new Date()));
  const [filter, setFilter] = useState(localStorage.getItem('filterC') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoC') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoC') || null);
  const [colaborador, setColaborador] = useState(localStorage.getItem('colaboradorC') || null);

  const { cc, colaboradores, uos } = useSelector((state) => state.intranet);
  const { dadosControle, isLoading } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);
  const uosList = useMemo(
    () => UosAcesso(uos, cc, isAdmin || isAuditoria, meusAmbientes, 'id'),
    [cc, isAdmin, isAuditoria, meusAmbientes, uos]
  );

  const {
    page,
    dense,
    order,
    onSort,
    orderBy,
    setPage,
    rowsPerPage,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: from === 'Trabalhados' ? 'asc' : 'desc',
    defaultOrderBy: from === 'Trabalhados' ? 'trabalhado_em' : 'nentrada',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || 25),
  });

  useEffect(() => {
    if (uosList?.length > 0 && !uosList?.map(({ id }) => id)?.includes(uo?.id)) {
      const currentUo =
        uosList?.find(({ id }) => Number(id) === Number(localStorage.getItem('uoC'))) ||
        uosList?.find(({ id }) => Number(id) === Number(cc?.uo_id)) ||
        uosList[0];
      localStorage.setItem('uoC', currentUo.id || '');
      setUo(currentUo);
    }
  }, [uosList, uo, cc?.uo_id]);

  useEffect(() => {
    if ((from === 'Entradas' || from === 'Devoluções') && uo?.id && dataValido(dataf) && dataValido(datai)) {
      const periodo = { dataInicio: format(datai, 'yyyy-MM-dd'), dataFim: format(dataf, 'yyyy-MM-dd') };
      dispatch(getFromDigitalDocs(from, { item: 'dadosControle', uoId: uo?.id, ...periodo }));
    }
  }, [dispatch, uo?.id, datai, dataf, from]);

  useEffect(() => {
    if (from === 'Trabalhados' && uo?.id && dataValido(data))
      dispatch(getFromDigitalDocs(from, { item: 'dadosControle', uoId: uo?.id, data: format(data, 'yyyy-MM-dd') }));
  }, [dispatch, uo?.id, data, from]);

  useEffect(() => {
    if (from === 'Por concluir') dispatch(getFromDigitalDocs(from, { item: 'dadosControle' }));
  }, [dispatch, from]);

  const colaboradoresAcesso = useMemo(
    () =>
      from === 'Trabalhados'
        ? ColaboradoresAcesso(colaboradores, cc, isAdmin || isAuditoria, meusAmbientes)
        : ColaboradoresAcesso(colaboradores, cc, true, []),
    [cc, from, colaboradores, isAdmin, isAuditoria, meusAmbientes]
  );
  const { dados, colaboradoresList, estadosList, assuntosList } = useMemo(
    () => dadosList(dadosControle, colaboradoresAcesso, uos, from),
    [colaboradoresAcesso, dadosControle, from, uos]
  );
  const dataFiltered = applySortFilter({
    comparator: getComparator(order, orderBy),
    ...{ dados, from, filter, estado, assunto, colaborador },
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    if (colaboradoresList?.length === 1 && cc?.nome === colaboradoresList[0]) setColaborador(colaboradoresList[0]);
  }, [cc?.nome, colaboradoresList]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, assunto, estado, colaborador, uo?.id, datai, dataf]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={
          (from === 'Trabalhados' && 'Processos trabalhados') ||
          (from === 'Por concluir' && 'Processos por concluir') ||
          from
        }
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
            {from !== 'Por concluir' && (
              <UoData
                uo={uo}
                data={data}
                setUo={setUo}
                datai={datai}
                dataf={dataf}
                uosList={uosList}
                setData={setData}
                setDatai={setDatai}
                setDataf={setDataf}
                entradas={from === 'Entradas' || from === 'Devoluções'}
              />
            )}
            {!isNotFound && (
              <ExportarDadosControle
                tabela={from}
                dados={dataFiltered}
                titulo={
                  (from === 'Por concluir' && 'Meus processos por concluir') ||
                  `${from} ${uo?.label} - ${dataLabel(datai, dataf)}`
                }
              />
            )}
          </Stack>
        }
      />

      {from === 'Trabalhados' && (
        <ResumoTrabalhados dados={dados} assunto={assunto} colaborador={colaborador} uo={uo?.label} />
      )}

      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          from={from}
          filter={filter}
          estado={estado}
          assunto={assunto}
          setFilter={setFilter}
          setEstado={setEstado}
          setAssunto={setAssunto}
          colaborador={colaborador}
          estadosList={estadosList}
          assuntosList={assuntosList}
          setColaborador={setColaborador}
          colaboradoresList={colaboradoresList}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'} id="entradas">
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={tableHeaders(from)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${from}_${index}`}>
                      <TableCell>
                        {row?.nentrada || row?.entrada}
                        {row?.balcao ? `/${row.balcao}` : ''}
                        {row?.criado_em ? `/${fYear(row?.criado_em)}` : ''}
                      </TableCell>
                      {from === 'Devoluções' ? (
                        <TableCell>
                          {row.titular ?? noDados()}
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {contaCliEnt(row)}
                          </Typography>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell>{row.titular ?? noDados()}</TableCell>
                          <TableCell>{contaCliEnt(row)}</TableCell>
                        </>
                      )}
                      <TableCell>{row?.assunto}</TableCell>
                      {from === 'Devoluções' ? (
                        <>
                          <TableCell>{row?.estado_inicial}</TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            {row?.motivo && <Typography variant="body2">{row?.motivo}</Typography>}
                            {row?.observacao && (
                              <Typography
                                variant="body2"
                                sx={row?.motivo && { color: 'text.secondary', typography: 'caption' }}
                              >
                                {newLineText(row?.observacao)}
                              </Typography>
                            )}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>
                          {row?.nome || row?.estado_inicial}
                          {row?.motivo && (
                            <Label variant="ghost" color="warning" sx={{ ml: 1 }}>
                              PENDENTE: {row?.motivo}
                            </Label>
                          )}
                          {row?.trabalhado_em && from === 'Por concluir' && (
                            <Criado
                              caption
                              tipo="data"
                              sx={{ color: 'text.secondary' }}
                              value1={fToNow(row.trabalhado_em)}
                              value={ptDateTime(row.trabalhado_em)}
                            />
                          )}
                        </TableCell>
                      )}
                      <TableCell width={10}>
                        <Criado caption tipo="data" value={ptDateTime(row.criado_em || row?.data_transicao)} />
                        <Criado
                          baralhar
                          value={row.colaborador}
                          caption={from !== 'Trabalhados'}
                          tipo={from === 'Trabalhados' ? '' : 'user'}
                        />
                        <Criado caption tipo="company" value={row.uoLabel} />
                      </TableCell>

                      <TableCell align="center">
                        <DefaultAction
                          label="DETALHES"
                          onClick={() => navigate(`${PATH_DIGITALDOCS.controle.root}/${row?.id}?from=Controle`)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ResumoTrabalhados({ dados = [], assunto = '', colaborador = '', uo = '' }) {
  const totalUo = dados?.length || 0;
  const totalAssunto = assunto ? dados?.filter(({ assunto: ass }) => ass === assunto)?.length : 0;
  const totalColab =
    (assunto &&
      colaborador &&
      dados?.filter(({ colaborador: colab, assunto: ass }) => colab === colaborador && ass === assunto)?.length) ||
    (colaborador && dados?.filter(({ colaborador: colab }) => colab === colaborador)?.length) ||
    0;
  return (
    <Card sx={{ mb: 3 }}>
      <Scrollbar>
        <Stack
          sx={{ py: 2 }}
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <ItemAnalytic total={totalUo} color="success.main" title={`Total: ${uo || ''}`} />
          {assunto && (
            <ItemAnalytic
              title={assunto}
              total={totalAssunto}
              percent={totalAssunto === 0 || totalUo === 0 ? 0 : (totalAssunto * 100) / totalUo}
            />
          )}
          {colaborador && (
            <ItemAnalytic
              total={totalColab}
              title={colaborador}
              percent={totalColab === 0 || totalUo === 0 ? 0 : (totalColab * 100) / totalUo}
            />
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function tableHeaders(item) {
  return [
    { id: item === 'Devoluções' ? 'entrada' : 'nentrada', label: 'Nº' },
    ...(item === 'Devoluções'
      ? [{ id: 'titular', label: 'Cliente' }]
      : [
          { id: 'titular', label: 'Titular' },
          { id: 'entidades', label: 'Cliente' },
        ]),
    { id: 'assunto', label: 'Assunto' },
    { id: item === 'Devoluções' ? 'estado_inicial' : 'nome', label: item === 'Devoluções' ? 'Origem' : 'Estado atual' },
    ...((item === 'Por concluir' && [{ id: 'colaborador', label: 'Criado' }]) ||
      (item === 'Entradas' && [{ id: 'criado_em', label: 'Criado' }]) ||
      (item === 'Trabalhados' && [{ id: 'colaborador', label: 'Colaborador' }]) ||
      (item === 'Devoluções' && [
        { id: 'motivo', label: 'Motivo' },
        { id: 'data_transicao', label: 'Devolvido em' },
      ]) ||
      []),
    { id: '', width: 10 },
  ];
}
