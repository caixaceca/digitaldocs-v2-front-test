import PropTypes from 'prop-types';
import { add, format } from 'date-fns';
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
import { ptDateTime } from '../../utils/formatTime';
import { ColaboradoresAcesso, UosAcesso } from '../../utils/validarAcesso';
import { dataValido, entidadesParse, noDados } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { DefaultAction, ExportExcel } from '../../components/Actions';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// sections
import ArquivoAnalytic from '../arquivo/ArquivoAnalytic';
//
import { UoData, RowItem } from './Dados';
import applySortFilter, { dadosList } from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD_ENTRADAS = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado', align: 'left', width: 10 },
  { id: 'empty', width: 10 },
];

const TABLE_HEAD_TRABALHADOS = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'trabalhado_em', label: 'Trabalhado', align: 'left', width: 10 },
  { id: '', width: 10 },
];

const TABLE_HEAD_PORCONCLUIR = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'colaborador', label: 'Criado por', align: 'left' },
  { id: 'trabalhado_em', label: 'Modificado em', align: 'center' },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

TableControle.propTypes = { from: PropTypes.string };

export default function TableControle({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem('filterC') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoC') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoC') || null);
  const [colaborador, setColaborador] = useState(localStorage.getItem('colaboradorC') || null);
  const [data, setData] = useState(
    localStorage.getItem('dataIC') ? add(new Date(localStorage.getItem('dataC')), { hours: 2 }) : new Date()
  );
  const [datai, setDatai] = useState(
    localStorage.getItem('dataIC') ? add(new Date(localStorage.getItem('dataIC')), { hours: 2 }) : new Date()
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFC') ? add(new Date(localStorage.getItem('dataFC')), { hours: 2 }) : new Date()
  );
  const { mail, colaboradores, cc, uos } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin } = useSelector((state) => state.parametrizacao);
  const { entradas, trabalhados, porConcluir, isLoading } = useSelector((state) => state.digitaldocs);
  const uosList = useMemo(() => UosAcesso(uos, cc, isAdmin, meusAmbientes, 'id'), [cc, isAdmin, meusAmbientes, uos]);
  const [uo, setUo] = useState(
    (localStorage.getItem('uoC') && uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoC')))) ||
      uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );
  const perfilId = cc?.perfil_id;
  const fromAgencia = cc?.uo?.tipo === 'Agências';

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
    defaultOrder: from === 'trabalhados' ? 'asc' : 'desc',
    defaultOrderBy: from === 'trabalhados' ? 'trabalhado_em' : 'nentrada',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || (fromAgencia && 100) || 25),
  });

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoC') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoC'))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id))
      );
      localStorage.setItem('uoC', localStorage.getItem('uoC') || cc?.uo?.id || '');
    }
  }, [uosList, uo, cc?.uo?.id]);

  useEffect(() => {
    if (mail && perfilId && uo?.id && from === 'entradas') {
      dispatch(
        getAll(from, {
          mail,
          perfilId,
          uoId: uo?.id,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, perfilId, uo?.id, mail, datai, dataf, from]);

  useEffect(() => {
    if (mail && data && uo?.id && from === 'trabalhados') {
      dispatch(getAll(from, { mail, uoId: uo?.id, data: dataValido(data) ? format(data, 'yyyy-MM-dd') : '' }));
    }
  }, [dispatch, uo?.id, data, from, mail]);

  useEffect(() => {
    if (mail && cc?.perfil_id && from === 'porconcluir') {
      dispatch(getAll(from, { perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, cc?.perfil_id, from, mail]);

  const handleView = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=${from}`);
  };

  const dados = dadosList(
    (from === 'entradas' && entradas) || (from === 'trabalhados' && trabalhados) || porConcluir,
    colaboradores,
    from
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

  const totalUo = dados?.dados?.length || 0;
  const totalAssunto =
    from === 'trabalhados' && assunto ? dados?.dados?.filter((row) => row?.assunto === assunto)?.length : 0;
  const totalColab =
    (from === 'trabalhados' &&
      colaborador &&
      assunto &&
      dados?.dados?.filter((row) => row?.perfil_id === colaborador && row?.colaborador === assunto)?.length) ||
    (from === 'trabalhados' &&
      colaborador &&
      dados?.dados?.filter((row) => row?.colaborador === colaborador)?.length) ||
    0;

  const title =
    (from === 'entradas' && 'Entradas') ||
    (from === 'trabalhados' && 'Processos trabalhados') ||
    (from === 'porconcluir' && 'Processos por concluir');

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
            {from !== 'porconcluir' && (
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
                entradas={from === 'entradas'}
              />
            )}
            {isAdmin && !isNotFound && <ExportExcel table="entradas" filename={title} icon />}
          </Stack>
        }
      />

      {from === 'trabalhados' && (
        <Card sx={{ mb: 3 }}>
          <Scrollbar>
            <Stack
              sx={{ py: 2 }}
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            >
              <ArquivoAnalytic
                total={totalUo}
                color="success.main"
                icon="/assets/icons/navbar/dashboard.svg"
                title={`Total: ${uo?.label ? uo?.label : ''}`}
              />
              {assunto && (
                <ArquivoAnalytic
                  title={assunto}
                  total={totalAssunto}
                  percent={totalAssunto === 0 || totalUo === 0 ? 0 : (totalAssunto * 100) / totalUo}
                />
              )}
              {colaborador && (
                <ArquivoAnalytic
                  total={totalColab}
                  title={colaborador}
                  percent={totalColab === 0 || totalUo === 0 ? 0 : (totalColab * 100) / totalUo}
                />
              )}
            </Stack>
          </Scrollbar>
        </Card>
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
          setColaborador={setColaborador}
          estadosList={dados?.estadosList}
          assuntosList={dados?.assuntosList}
          colaboradoresList={
            ((from === 'entradas' || from === 'porconcluir') && dados?.colaboradoresList) ||
            ColaboradoresAcesso(dados?.colaboradoresList, cc, isAdmin, meusAmbientes)?.map((row) => row?.label)
          }
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'} id="entradas">
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={
                  (from === 'entradas' && TABLE_HEAD_ENTRADAS) ||
                  (from === 'trabalhados' && TABLE_HEAD_TRABALHADOS) ||
                  (from === 'porconcluir' && TABLE_HEAD_PORCONCLUIR)
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={from === 'porconcluir' ? 8 : 7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <>
                      {from === 'porconcluir' ? (
                        <TableRow hover key={`${from}_${index}`}>
                          <TableCell>{row.nentrada}</TableCell>
                          <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                          <TableCell>
                            {row.conta || row.cliente || entidadesParse(row?.entidades) || noDados()}
                          </TableCell>
                          <TableCell>{row?.assunto}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{row?.nome}</Typography>
                            {row?.motivo && (
                              <Label variant="ghost" color="warning" sx={{ mt: 0.5 }}>
                                PENDENTE: {row?.motivo}
                              </Label>
                            )}
                          </TableCell>
                          <TableCell>{row?.colaborador}</TableCell>
                          <TableCell align="center" sx={{ width: 10 }}>
                            {row?.trabalhado_em && (
                              <Typography noWrap variant="body2">
                                {ptDateTime(row.trabalhado_em)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <DefaultAction label="DETALHES" handleClick={() => handleView(row?.id)} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        <RowItem row={row} key={`${from}_${index}`} handleViewRow={handleView} />
                      )}
                    </>
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
