import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../utils/formatNumber';
import { normalizeText, baralharString } from '../../utils/formatText';
import { ptDate, ptDateTime, getDataLS, dataValido, dataLabel } from '../../utils/formatTime';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getListaProcessos } from '../../redux/slices/digitaldocs';
// Components
import { RHFDateIF } from '../../components/hook-form';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, Criado, noDados } from '../../components/Panel';
import { DefaultAction, MaisProcessos } from '../../components/Actions';
import { ExportarDados } from '../../components/ExportDados/ToExcell/DadosControle';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ---------------------------------------------------------------------------------------------------------------------

const TABLE_HEAD_CON = [
  { id: 'nome_cliente', label: 'Cliente', align: 'left' },
  { id: 'titular_ordenador', label: 'Ordenador', align: 'center' },
  { id: 'conta_processo', label: 'Nº de conta', align: 'right' },
  { id: 'Valor', label: 'Valor', align: 'right' },
  { id: 'cdg_operacao', label: 'Cod. operação', align: 'right' },
  { id: 'data_entrada', label: 'Data', align: 'center' },
  { id: '', width: 10 },
];

const TABLE_HEAD_JF = [
  { id: 'referencia', label: 'Referência', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'origem', label: 'Origem', align: 'left' },
  { id: 'doc_1', label: 'Doc. identificação', align: 'left' },
  { id: 'operacao', label: 'Operação', align: 'left' },
  { id: 'data_entrada', label: 'Registo', align: 'left' },
  { id: '', width: 10 },
];

// ---------------------------------------------------------------------------------------------------------------------

export default function TableCON({ item = 'con' }) {
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
  } = useTable({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dataf, setDataf] = useState(getDataLS('dataFCon', new Date()));
  const [filter, setFilter] = useState(localStorage.getItem('filterCon') || '');
  const title = (item === 'pjf' && 'Processos Judiciais e Fiscais') || 'Comunicação Operação Numerário';
  const [datai, setDatai] = useState(
    getDataLS('dataICon', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const { dadosControle, cursor, isLoading } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (item === 'con' && dataValido(datai) && dataValido(dataf)) {
      const dataFim = format(dataf, 'yyyy-MM-dd');
      const dataInicio = format(datai, 'yyyy-MM-dd');
      dispatch(getListaProcessos('con', { item: 'dadosControle', cursor: 0, dataFim, dataInicio }));
    }
  }, [dispatch, item, datai, dataf]);

  useEffect(() => {
    if (item === 'pjf') dispatch(getListaProcessos('pjf', { item: 'dadosControle', cursor: 0 }));
  }, [dispatch, item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dadosControle]);

  const dataFiltered = applySortFilter({
    filter,
    dados: dadosControle,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={title}
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            {item === 'con' && (
              <RHFDateIF options={{ datai, dataf, setDatai, setDataf, labeli: 'dataICon', labelf: 'dataFCon' }} />
            )}
            {!isNotFound && (
              <ExportarDados
                dados={dataFiltered}
                tabela={item === 'pjf' ? 'PJF' : 'CON'}
                titulo={(item === 'pjf' && title) || `${title}  - ${dataLabel(datai, dataf)}`}
              />
            )}
          </Stack>
        }
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCon" filter={filter} setFilter={setFilter} />
        <TableContainer sx={{ position: 'relative' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              onSort={onSort}
              orderBy={orderBy}
              headLabel={(item === 'pjf' && TABLE_HEAD_JF) || TABLE_HEAD_CON}
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable column={7} row={10} />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`${row?.id}_${index}`}>
                    {(item === 'pjf' && (
                      <>
                        <TableCell>{row?.referencia}</TableCell>
                        <TableCell>{row?.titular ? baralharString(row?.titular) : noDados()}</TableCell>
                        <TableCell>{row?.origem || noDados()}</TableCell>
                        <TableCell>
                          {!row?.doc_1 && !row?.doc_2 && noDados()}
                          {row?.doc_1 && <Criado value={row.doc_1} baralhar />}
                          {row?.doc_2 && <Criado value={row.doc_2} baralhar />}
                        </TableCell>
                        <TableCell>
                          {!row?.operacao && !row?.valor && noDados()}
                          {row?.operacao && <Criado value={row.operacao} />}
                          {row?.valor && <Criado value={fCurrency(row.valor)} />}
                        </TableCell>
                        <TableCell>
                          {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row.criado_em)} />}
                          {row?.estado && <Criado caption tipo="company" value={row.estado} />}
                        </TableCell>
                      </>
                    )) || (
                      <>
                        <TableCell>{baralharString(row?.nome_cliente)}</TableCell>
                        <CellChecked check={row.titular_ordenador} />
                        <TableCell align="right">{baralharString(row?.conta_processo)}</TableCell>
                        <TableCell align="right">{row?.valor ? fCurrency(row?.valor) : noDados()}</TableCell>
                        <TableCell align="right">{row?.cdg_operacao || noDados()}</TableCell>
                        <TableCell align="center">{ptDate(row?.data_entrada) || noDados()}</TableCell>
                      </>
                    )}
                    <TableCell align="center">
                      <DefaultAction
                        label="DETALHES"
                        onClick={() =>
                          navigate(`${PATH_DIGITALDOCS.controle.root}/${row?.processo_id || row?.id}?from=Controle`)
                        }
                      />
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
      {page + 1 === Math.ceil(dataFiltered.length / rowsPerPage) && cursor && (
        <MaisProcessos verMais={() => dispatch(getListaProcessos('pjf', { item: 'dadosControle', cursor }))} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    const normalizedFilter = normalizeText(filter);
    const campos = [
      'nif',
      'docid',
      'origem',
      'titular',
      'operacao',
      'ordenador',
      'cdg_operacao',
      'nome_cliente',
      'conta_processo',
    ];

    dados = dados.filter((row) =>
      campos.some((campo) => row?.[campo] && normalizeText(row[campo]).includes(normalizedFilter))
    );
  }
  return dados;
}
