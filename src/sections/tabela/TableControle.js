import { format } from 'date-fns';
import PropTypes from 'prop-types';
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
import TableContainer from '@mui/material/TableContainer';
// utils
import { ColaboradoresAcesso, UosAcesso } from '../../utils/validarAcesso';
import { baralharString, noDados, contaCliEnt } from '../../utils/formatText';
import { ptDateTime, getDataLS, dataValido, fToNow, fYear, dataLabel } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import Label from '../../components/Label';
import { Criado } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import ItemAnalytic from '../../components/ItemAnalytic';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosControle';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData } from './Dados';
import applySortFilter, { dadosList } from './applySortFilter';

// ----------------------------------------------------------------------

TableControle.propTypes = { from: PropTypes.string };

export default function TableControle({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState(getDataLS('dataC', new Date()));
  const [datai, setDatai] = useState(getDataLS('dataIC', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFC', new Date()));
  const [filter, setFilter] = useState(localStorage.getItem('filterC') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoC') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoC') || null);
  const [colaborador, setColaborador] = useState(localStorage.getItem('colaboradorC') || null);

  const { dadosControle, isLoading } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, isAdmin } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, cc, colaboradores, uos } = useSelector((state) => state.intranet);
  const uosList = useMemo(() => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'id'), [cc, isAdmin, meusAmbientes, uos]);
  const [uo, setUo] = useState(
    uosList?.find((row) => row?.id === Number(localStorage.getItem('uoC'))) ||
      uosList?.find((row) => row?.id === cc?.uo?.id) ||
      null
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
    if (uosList?.length > 0 && !uosList?.map((row) => row?.id)?.includes(uo?.id)) {
      const currentUo =
        uosList?.find((row) => row?.id === Number(localStorage.getItem('uoC'))) ||
        uosList?.find((row) => row?.id === cc?.uo?.id) ||
        uosList[0];
      localStorage.setItem('uoC', currentUo.id || '');
      setUo(currentUo);
    }
  }, [uosList, uo, cc?.uo?.id]);

  useEffect(() => {
    if (mail && uo?.id && dataValido(dataf) && dataValido(datai) && (from === 'Entradas' || from === 'Devoluções')) {
      dispatch(
        getAll(from, {
          mail,
          perfilId,
          uoId: uo?.id,
          dataFim: format(dataf, 'yyyy-MM-dd'),
          dataInicio: format(datai, 'yyyy-MM-dd'),
        })
      );
    }
  }, [dispatch, perfilId, uo?.id, mail, datai, dataf, from]);

  useEffect(() => {
    if (mail && data && uo?.id && dataValido(data) && from === 'Trabalhados') {
      dispatch(getAll(from, { mail, uoId: uo?.id, data: format(data, 'yyyy-MM-dd') }));
    }
  }, [dispatch, uo?.id, data, from, mail]);

  useEffect(() => {
    if (mail && perfilId && from === 'Por concluir') {
      dispatch(getAll(from, { perfilId, mail }));
    }
  }, [dispatch, perfilId, from, mail]);

  const dados = useMemo(
    () => dadosList(dadosControle, colaboradores, uos, from),
    [colaboradores, dadosControle, from, uos]
  );
  const dataFiltered = applySortFilter({
    filter,
    estado,
    assunto,
    colaborador,
    dados: dados?.dados,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, assunto, estado, colaborador, uo?.id, datai, dataf]);

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=Controle`);
  };

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
              <ExportarDados
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
        <ResumoTrabalhados dados={dados?.dados} assunto={assunto} colaborador={colaborador} uo={uo?.label} />
      )}

      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          filter={filter}
          estado={estado}
          assunto={assunto}
          setFilter={setFilter}
          setEstado={setEstado}
          setAssunto={setAssunto}
          colaborador={colaborador}
          setColaborador={setColaborador}
          estadosList={dados?.estadosList || []}
          assuntosList={dados?.assuntosList || []}
          colaboradoresList={
            (from === 'Trabalhados' &&
              ColaboradoresAcesso(dados?.colaboradoresList, cc, isAdmin, meusAmbientes)?.map((row) => row?.label)) ||
            dados?.colaboradoresList ||
            []
          }
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'} id="entradas">
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={tableHeaders(from)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={(from === 'Devoluções' && 8) || 7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${from}_${index}`}>
                      <TableCell>
                        {row?.nentrada || row?.entrada}
                        {row?.balcao ? `/${row.balcao}` : ''}
                        {row?.criado_em ? `/${fYear(row?.criado_em)}` : ''}
                      </TableCell>
                      <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
                      <TableCell>{contaCliEnt(row)}</TableCell>
                      <TableCell>{row?.assunto}</TableCell>
                      <TableCell>
                        {row?.nome || row?.estado_inicial}
                        {row?.estado_final ? ` » ${row?.estado_final}` : ''}
                        {row?.motivo && (
                          <Label variant="ghost" color="warning" sx={{ ml: 1 }}>
                            PENDENTE: {row?.motivo}
                          </Label>
                        )}
                        {row?.trabalhado_em && (
                          <Criado
                            caption
                            tipo="data"
                            value1={fToNow(row.trabalhado_em)}
                            value={ptDateTime(row.trabalhado_em)}
                          />
                        )}
                      </TableCell>
                      {from === 'Devoluções' && <TableCell>{row?.motivo || row?.observacao}</TableCell>}
                      <TableCell width={10}>
                        {(row?.criado_em || row?.data_transicao) && (
                          <Criado caption tipo="data" value={ptDateTime(row.criado_em || row?.data_transicao)} />
                        )}
                        {row?.colaborador && <Criado caption tipo="user" value={row.colaborador} baralhar />}
                        {row?.uoLabel && <Criado caption tipo="company" value={row.uoLabel} />}
                      </TableCell>

                      <TableCell align="center">
                        <DefaultAction label="DETALHES" handleClick={() => handleView(row?.id)} />
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

// ----------------------------------------------------------------------

ResumoTrabalhados.propTypes = {
  uo: PropTypes.string,
  dados: PropTypes.array,
  assunto: PropTypes.string,
  colaborador: PropTypes.string,
};

export function ResumoTrabalhados({ dados = [], assunto = '', colaborador = '', uo = '' }) {
  const totalUo = dados?.length || 0;
  const totalAssunto = assunto ? dados?.filter((row) => row?.assunto === assunto)?.length : 0;
  const totalColab =
    (colaborador &&
      assunto &&
      dados?.filter((row) => row?.colaborador === colaborador && row?.assunto === assunto)?.length) ||
    (colaborador && dados?.filter((row) => row?.colaborador === colaborador)?.length) ||
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

// ----------------------------------------------------------------------

function tableHeaders(item) {
  return [
    { id: item === 'Devoluções' ? 'entrada' : 'nentrada', label: 'Nº', align: 'left' },
    { id: 'titular', label: 'Titular', align: 'left' },
    { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
    { id: 'assunto', label: 'Assunto', align: 'left' },
    {
      id: item === 'Devoluções' ? 'estado_inicial' : 'nome',
      label: item === 'Devoluções' ? 'Origem' : 'Estado',
      align: 'left',
    },
    ...((item === 'Por concluir' && [{ id: 'colaborador', label: 'Criado', align: 'left' }]) ||
      (item === 'Entradas' && [{ id: 'criado_em', label: 'Criado', align: 'left' }]) ||
      (item === 'Trabalhados' && [{ id: 'trabalhado_em', label: 'Trabalhado em', align: 'left' }]) ||
      (item === 'Devoluções' && [
        { id: 'observacao', label: 'Motivo', align: 'left' },
        { id: 'data_transicao', label: 'Devolvido em', align: 'left' },
      ]) ||
      []),
    { id: '', width: 10 },
  ];
}
