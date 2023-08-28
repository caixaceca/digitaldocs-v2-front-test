import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Fab, Card, Tooltip, Table, TableBody, TableCell, TableRow, IconButton, TableContainer } from '@mui/material';
// utils
import { ptDate } from '../../utils/formatTime';
import { UosAcesso } from '../../utils/validarAcesso';
import { normalizeText } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, updateItem } from '../../redux/slices/digitaldocs';
// Components
import Scrollbar from '../../components/Scrollbar';
import { Checked } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarCartoes } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData } from './Dados';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'data_emissao', label: 'Data emissão', align: 'left' },
  { id: 'entrega', label: 'Balcão entrega', align: 'left' },
  { id: 'numero_cliente', label: 'Nº cliente', align: 'left' },
  { id: 'nome_cliente', label: 'Nome cliente', align: 'left' },
  { id: 'numero_cartao', label: 'Nº cartão', align: 'left' },
  { id: 'tipo_cartao', label: 'Tipo cartão', align: 'left' },
  { id: 'confirmacao_dop', label: 'Conf. DOP', align: 'center' },
  { id: 'confirmacao_agencia', label: 'Conf. Agência', align: 'center' },
];

// ----------------------------------------------------------------------

export default function TableCartoes() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useSearchParams();
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const [data, setData] = useState(filter?.get('data') || format(new Date(), 'yyyy-MM-dd'));
  const { cartoes, meusAmbientes, isAdmin, done, error, isLoading } = useSelector((state) => state.digitaldocs);
  const uosList = UosAcesso(uos, cc, isAdmin, meusAmbientes);
  const fromAgencia = cc?.uo?.tipo === 'Agências';
  const [uo, setUo] = useState(
    filter?.get('uoId') ? uosList?.find((row) => row?.id?.toString() === filter?.get('uoId')?.toString()) : null
  );

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
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
  });

  useEffect(() => {
    if (done === 'rececao confirmado') {
      enqueueSnackbar('Receção do cartão confirmado', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (cc?.uo?.id && uosList && !uo?.id) {
      setUo(uosList?.find((row) => row?.id === cc?.uo?.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cc?.uo?.id, uosList]);

  useEffect(() => {
    if (mail && data && uo?.id) {
      dispatch(getAll('trabalhados', { mail, uoId: uo?.id, data }));
    }
  }, [dispatch, uo?.id, data, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleConfirmar = (item, id) => {
    dispatch(updateItem(item, '', { id, mail, perfilId: cc?.perfil_id, msg: 'rececao confirmado' }));
  };

  const dados = [];
  cartoes?.forEach((row) => {
    const balcEntrega = uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_entrega));
    const balcDomicilio = uos?.find((uo) => Number(uo.balcao) === Number(row?.balcao_domicilio));
    dados.push({
      ...row,
      entrega: balcEntrega?.label,
      domicilio: balcDomicilio?.label,
      data_emissao: row.data_emissao ? ptDate(row.data_emissao) : '',
    });
  });

  const dataFiltered = applySortFilter({
    dados,
    filter: filter?.get('filter'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Processos trabalhados"
        links={[{ name: '' }]}
        action={
          <UoData
            uo={uo}
            setUo={setUo}
            filter={filter}
            dataSingle={data}
            setData={setData}
            uosList={uosList}
            setFilter={setFilter}
          />
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />

      <Card sx={{ p: 1 }}>
        <SearchToolbarCartoes filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={8} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={`${row.id}_${index}`} hover>
                      <TableCell>{row.data_emissao}</TableCell>
                      <TableCell>{row?.entrega}</TableCell>
                      <TableCell>{row?.numero_cliente}</TableCell>
                      <TableCell>{row?.nome_cliente}</TableCell>
                      <TableCell>{row?.numero_cartao}</TableCell>
                      <TableCell>{row?.tipo_cartao}</TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {!row.confirmacao_dop && cc?.uo?.label === 'DOP-CE' ? (
                          <Tooltip title="Confirmar receção" arrow>
                            <Fab
                              variant="soft"
                              color="success"
                              sx={{ width: 34, height: 34 }}
                              onClick={() => handleConfirmar('conf. cartao dop', row?.id)}
                            >
                              <CheckOutlinedIcon />
                            </Fab>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={
                              row.confirmacao_dop
                                ? `${
                                    row?.confirmado_por_dop
                                      ? colaboradores?.find(
                                          (colab) => Number(colab?.perfil_id) === Number(row?.confirmado_por_dop)
                                        )?.perfil?.displayName
                                      : ''
                                  } ${row?.data_confirmacao_dop ? `- ${ptDate(row?.data_confirmacao_dop)} ` : ''}`
                                : 'Não confirmado'
                            }
                            arrow
                          >
                            <IconButton sx={{ width: 26, height: 26 }}>
                              <Checked check={row.confirmacao_dop} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {!row.confirmacao_agencia && Number(cc?.uo?.balcao) === Number(row?.balcao_entrega) ? (
                          ''
                        ) : (
                          <Tooltip
                            title={
                              row.confirmacao_agencia
                                ? `${
                                    row?.confirmado_por_agencia
                                      ? colaboradores?.find(
                                          (colab) => Number(colab?.perfil_id) === Number(row?.confirmado_por_agencia)
                                        )?.perfil?.displayName
                                      : ''
                                  } ${
                                    row?.data_confirmacao_agencia ? `- ${ptDate(row?.data_confirmacao_agencia)} ` : ''
                                  }`
                                : 'Não confirmado'
                            }
                            arrow
                          >
                            <IconButton sx={{ width: 26, height: 26 }}>
                              <Checked check={row.confirmacao_agencia} />
                            </IconButton>
                          </Tooltip>
                        )}
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
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  const stabilizedThis = dados.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  dados = stabilizedThis.map((el) => el[0]);

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.data_emissao && normalizeText(row?.data_emissao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entrega && normalizeText(row?.entrega).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero_cliente && normalizeText(row?.numero_cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome_cliente && normalizeText(row?.nome_cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero_cartao && normalizeText(row?.numero_cartao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_cartao && normalizeText(row?.tipo_cartao).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
