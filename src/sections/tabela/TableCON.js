import { useEffect, useState } from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel-3';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { add, format } from 'date-fns';
import { getFileThumb } from '../../utils/getFileFormat';
import { normalizeText, dataValido, setDataUtil } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import { Checked } from '../../components/Actions';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// _mock
import { dis, estadosCivis } from '../../_mock';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titular_ordenador', label: 'Titular', align: 'center' },
  { id: 'ordenador', label: 'Ordenador', align: 'left' },
  { id: 'docid', label: 'Doc. identificação', align: 'left' },
  { id: 'nif', label: 'NIF', align: 'left' },
  { id: 'data_nascimento', label: 'Data nascimento', align: 'left' },
  { id: 'estado_civil', label: 'Estado civil', align: 'left' },
  { id: 'pai', label: 'Pai', align: 'left' },
  { id: 'mae', label: 'Mãe', align: 'left' },
];

// ----------------------------------------------------------------------

export default function TableCON() {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { con, isLoading } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterCon') || '');
  const [datai, setDatai] = useState(
    localStorage.getItem('dataICon')
      ? add(new Date(localStorage.getItem('dataICon')), { hours: 2 })
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFCon') ? add(new Date(localStorage.getItem('dataFCon')), { hours: 2 }) : new Date()
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
  } = useTable({});

  useEffect(() => {
    if (mail) {
      dispatch(
        getAll('con', {
          mail,
          dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
        })
      );
    }
  }, [dispatch, mail, datai, dataf]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({ dados: con, filter, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Comunicação Operação Numerário"
        links={[{ name: '' }]}
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            <DatePicker
              value={datai}
              label="Data inicial"
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
              onChange={(newValue) => setDataUtil(newValue, setDatai, 'dataICon', setDataf, 'dataFCon')}
            />
            <DatePicker
              value={dataf}
              minDate={datai}
              disabled={!datai}
              label="Data final"
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
              onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFCon', '', '')}
            />
            {con?.length > 0 && (
              <Stack>
                <ReactHTMLTableToExcel
                  table="tabel-con"
                  id="table-xls-button"
                  className="MuiButtonBase-root-MuiButton-root"
                  sheet="Comunicação Operação Numerário"
                  filename={`Comunicação Operação Numerário ${dataValido(datai) ? format(datai, 'yyyy-MM-dd') : ''} - ${
                    dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : ''
                  }`}
                  children={
                    <Button variant="soft" startIcon={getFileThumb('file.xlsx')}>
                      Exportar
                    </Button>
                  }
                />
              </Stack>
            )}
          </Stack>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCon" filter={filter} setFilter={setFilter} />
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
                      <TableCell align="center" width={10}>
                        <Checked check={row.titular_ordenador} />
                      </TableCell>
                      <TableCell>{row?.ordenador}</TableCell>
                      <TableCell>{row?.docid}</TableCell>
                      <TableCell>{row?.nif}</TableCell>
                      <TableCell>{row?.data_nascimento}</TableCell>
                      <TableCell>
                        {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                      </TableCell>
                      <TableCell>{row?.pai}</TableCell>
                      <TableCell>{row?.mae}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhuma entrada disponível..." />
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

        <Table id="tabel-con" sx={{ display: 'none' }}>
          <TableHead>
            <TableRow>
              <TableCell>Titular</TableCell>
              <TableCell>Ordenador</TableCell>
              <TableCell>Tipo doc. identificação</TableCell>
              <TableCell>Doc. identificação</TableCell>
              <TableCell>NIF</TableCell>
              <TableCell>Estado civil</TableCell>
              <TableCell>Data nascimento</TableCell>
              <TableCell>Pai</TableCell>
              <TableCell>Mãe</TableCell>
              <TableCell>Local/País nascimento</TableCell>
              <TableCell>Nacionalidade</TableCell>
              <TableCell>Profissão</TableCell>
              <TableCell>Beneficiário residente</TableCell>
              <TableCell>Morada</TableCell>
              <TableCell>Local de trabalho</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Telemóvel</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Origem dos fundos</TableCell>
              <TableCell>Finalidade dos fundos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {con.map((row, index) => (
              <TableRow key={`con_${index}`}>
                <TableCell>{row.titular_ordenador ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{row?.ordenador}</TableCell>
                <TableCell>{dis?.find((item) => item?.id === row?.tipo_docid)?.label || row?.tipo_docid}</TableCell>
                <TableCell>{row?.docid}</TableCell>
                <TableCell>{row?.nif}</TableCell>
                <TableCell>
                  {estadosCivis?.find((item) => item?.id === row?.estado_civil)?.label || row?.estado_civil}
                </TableCell>
                <TableCell>{row?.data_nascimento}</TableCell>
                <TableCell>{row?.pai}</TableCell>
                <TableCell>{row?.mae}</TableCell>
                <TableCell>{row?.local_pais_nascimento}</TableCell>
                <TableCell>{row?.nacionalidade}</TableCell>
                <TableCell>{row?.profissao}</TableCell>
                <TableCell>{row?.residente ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{row?.morada}</TableCell>
                <TableCell>{row?.local_trabalho}</TableCell>
                <TableCell>{row?.telefone}</TableCell>
                <TableCell>{row?.telemovel}</TableCell>
                <TableCell>{row?.email}</TableCell>
                <TableCell>{row?.origem_fundo}</TableCell>
                <TableCell>{row?.finalidade_fundo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
        (row?.ordenador && normalizeText(row?.ordenador).indexOf(normalizeText(filter)) !== -1) ||
        (row?.pai && normalizeText(row?.pai).indexOf(normalizeText(filter)) !== -1) ||
        (row?.mae && normalizeText(row?.mae).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nif && normalizeText(row?.nif).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
