import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// utils
import { getFileThumb } from '../../../utils/getFileFormat';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
import { normalizeText, noDados } from '../../../utils/normalizeText';
import { ptDateTime, ptDate, fDistance, fToNow } from '../../../utils/formatTime';
// hooks
import useTable, { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { getFromCC } from '../../../redux/slices/cc';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import { Checked } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { Criado, ColaboradorInfo } from '../../../components/Panel';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import Anexo from './Anexo';

// ----------------------------------------------------------------------

const TABLE_HEAD_ANEXOS = [
  { id: 'designacao', label: 'Anexo', align: 'left' },
  { id: 'data_validade', label: 'Data de validade', align: 'center' },
  { id: 'ativo', label: 'Estado', align: 'center' },
  { id: 'criador', label: 'Criado', align: 'left' },
];

const TABLE_HEAD_DESPESAS = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'valor', label: 'Valor', align: 'right' },
  { id: 'ativo', label: 'Estado', align: 'center' },
  { id: 'criador', label: 'Criado', align: 'left' },
];

const TABLE_HEAD_RESPONSABILIDADES = [
  { id: 'na_caixa', label: 'Caixa', align: 'center' },
  { id: 'montante', label: 'Montante contratado', align: 'right' },
  { id: 'capital_em_divida', label: 'Capital em dívida', align: 'right' },
  { id: 'taxa_juro', label: 'Taxa de juro', align: 'right' },
  { id: 'prazo_amortizacao', label: 'Prazo amortização', align: 'right' },
  { id: 'prazo_restante', label: 'Prazo restante', align: 'right' },
  { id: 'ativo', label: 'Estado', align: 'center' },
  { id: 'criador', label: 'Criado', align: 'left' },
];

const TABLE_HEAD_RETENCOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: '', label: 'Duração', align: 'center' },
  { id: 'preso_em', label: 'Retido em', align: 'center' },
  { id: 'solto_em', label: 'Solto em', align: 'center' },
  { id: 'solto_por', label: 'Solto por', align: 'left' },
];

const TABLE_HEAD_ATRIBUICOES = [
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'atribuidor', label: 'Atribuidor em', align: 'left' },
];

const TABLE_HEAD_PENDENCIAS = [
  { id: 'motivo', label: 'Motivo', align: 'left' },
  { id: 'observacao', label: 'Observação', align: 'left' },
  { id: 'data_pendente', label: 'Registo', align: 'left' },
];

// ----------------------------------------------------------------------

TableDetalhes.propTypes = { item: PropTypes.string, anexosList: PropTypes.array };

export default function TableDetalhes({ item, anexosList = [] }) {
  const {
    page,
    dense,
    order,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: item === 'retencoes' ? 'preso_em' : 'ativo' });
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const { pedidoCC, retencoes, pendencias, atribuicoes, isLoading } = useSelector((state) => state.cc);

  useEffect(() => {
    if (mail && pedidoCC?.id && item) {
      switch (item) {
        case 'retencoes':
          dispatch(getFromCC('retencoes', { mail, id: pedidoCC?.id }));
          break;
        case 'pendencias':
          dispatch(getFromCC('pendencias', { mail, id: pedidoCC?.id }));
          break;
        case 'atribuicoes':
          dispatch(getFromCC('atribuicoes', { mail, id: pedidoCC?.id }));
          break;
        default:
          break;
      }
    }
  }, [dispatch, mail, item, pedidoCC?.id]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const viewAnexo = (anexo) => {
    if (mail && anexo) {
      dispatch(
        getFromCC('anexo', {
          mail,
          anexo,
          processo: item === 'anexos' || item === 'anexos entidades' ? 'true' : 'false',
        })
      );
    }
  };

  const dataFiltered = applySortFilter({
    dados:
      (item === 'anexos' && pedidoCC?.anexos) ||
      (item === 'despesas' && pedidoCC?.despesas) ||
      (item === 'responsabilidades' && pedidoCC?.outros_creditos) ||
      (item === 'retencoes' && dadosComColaboradores(retencoes, colaboradores)) ||
      (item === 'pendencias' && dadosComColaboradores(pendencias, colaboradores)) ||
      ((item === 'anexos entidades' || item === 'anexos garantias') && anexosList) ||
      (item === 'atribuicoes' && dadosComColaboradores(atribuicoes, colaboradores)) ||
      [],
    comparator: getComparator(order, orderBy),
    filter,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Box sx={{ p: item !== 'anexos entidades' && item !== 'anexos garantias' && 1 }}>
      {item !== 'anexos entidades' && item !== 'anexos garantias' && (
        <SearchToolbarSimple filter={filter} setFilter={setFilter} />
      )}
      <Scrollbar>
        <TableContainer
          sx={{
            overflow: 'hidden',
            position: 'relative',
            minWidth: item === 'anexos entidades' || item === 'anexos garantias' ? 500 : 800,
          }}
        >
          <Table size={dense || item?.includes('anexo') ? 'small' : 'medium'}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={
                (item === 'despesas' && TABLE_HEAD_DESPESAS) ||
                (item === 'retencoes' && TABLE_HEAD_RETENCOES) ||
                (item === 'pendencias' && TABLE_HEAD_PENDENCIAS) ||
                (item === 'atribuicoes' && TABLE_HEAD_ATRIBUICOES) ||
                (item === 'responsabilidades' && TABLE_HEAD_RESPONSABILIDADES) ||
                ((item === 'anexos' || item === 'anexos entidades' || item === 'anexos garantias') && TABLE_HEAD_ANEXOS)
              }
              onSort={onSort}
            />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable
                  column={
                    (item === 'retencoes' && 6) ||
                    (item === 'responsabilidades' && 8) ||
                    ((item === 'pendencias' || item === 'atribuicoes') && 3) ||
                    4
                  }
                  row={10}
                />
              ) : (
                dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow hover key={`table_detalhes_${index}`}>
                    {((item === 'anexos' || item === 'anexos entidades' || item === 'anexos garantias') && (
                      <>
                        <TableCell>
                          <Button
                            fullWidth
                            variant="soft"
                            color="inherit"
                            onClick={() => viewAnexo(row)}
                            startIcon={getFileThumb(false, null, row?.anexo)}
                            sx={{ justifyContent: 'left', textAlign: 'left' }}
                          >
                            {row?.designacao}
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          {row?.data_validade ? ptDate(row?.data_validade) : noDados(true)}
                        </TableCell>
                      </>
                    )) ||
                      (item === 'despesas' && (
                        <>
                          <TableCell>{row?.designacao}</TableCell>
                          <TableCell align="right">{fCurrency(row?.valor)}</TableCell>
                        </>
                      )) ||
                      (item === 'responsabilidades' && (
                        <>
                          <TableCell align="center" width={10}>
                            <Checked check={row.na_caixa} />
                          </TableCell>
                          <TableCell align="right">{fCurrency(row?.montante)}</TableCell>
                          <TableCell align="right">{fCurrency(row?.capital_em_divida)}</TableCell>
                          <TableCell align="right">{fPercent(row?.taxa_juro)}</TableCell>
                          <TableCell align="right">{row?.prazo_amortizacao} meses</TableCell>
                          <TableCell align="right">{row?.prazo_restante} meses</TableCell>
                        </>
                      )) ||
                      (item === 'retencoes' && (
                        <>
                          <TableCell>
                            <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} />
                          </TableCell>
                          <TableCell>{row?.estado}</TableCell>
                          <TableCell align="center">
                            {(row?.preso_em && row?.solto_em && fDistance(row?.preso_em, row?.solto_em)) ||
                              (row?.preso_em && !row?.solto_em && fToNow(row?.preso_em)) ||
                              noDados(true)}
                          </TableCell>
                          <TableCell align="center">{ptDateTime(row?.preso_em)}</TableCell>
                          <TableCell align="center">
                            {row?.solto_em ? ptDateTime(row?.solto_em) : noDados(true)}
                          </TableCell>
                          <TableCell>{row?.solto_por || noDados(true)}</TableCell>
                        </>
                      )) ||
                      (item === 'atribuicoes' && (
                        <>
                          <TableCell>
                            <ColaboradorInfo nome={row?.nome} label={row?.uo} foto={row?.foto} />
                          </TableCell>
                          <TableCell>{row?.estado}</TableCell>
                        </>
                      )) ||
                      (item === 'pendencias' && (
                        <>
                          <TableCell>{row?.motivo}</TableCell>
                          <TableCell>{row?.observacao || noDados(true)}</TableCell>
                        </>
                      ))}
                    {item !== 'retencoes' && item !== 'atribuicoes' && item !== 'pendencias' && (
                      <TableCell align="center">
                        <Label color={row?.ativo ? 'success' : 'error'}>{row?.ativo ? 'Ativo' : 'Inativo'}</Label>
                      </TableCell>
                    )}
                    {item !== 'retencoes' && (
                      <TableCell width={10}>
                        {(row?.criado_em || row?.atribuido_em) && (
                          <Criado tipo="date" value={ptDateTime(row?.criado_em || row?.atribuido_em)} />
                        )}
                        {(row?.criador || row?.atribuidor || row?.nome) && (
                          <Criado tipo="user" value={row?.criador || row?.atribuidor || row?.nome} />
                        )}
                        {row?.data_pendente && (
                          <Criado
                            tipo="date"
                            value={`${ptDateTime(row?.data_pendente)}${
                              row?.data_libertado ? ` | ${ptDateTime(row?.data_libertado)}` : ''
                            }`}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && isNotFound && (
              <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
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
      {(item === 'anexos' || item === 'anexos entidades' || item === 'anexos garantias') && <Anexo />}
    </Box>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ dados, comparator, filter }) {
  dados = applySort(dados, comparator);
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.uo && normalizeText(row?.uo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.estado && normalizeText(row?.estado).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.criador && normalizeText(row?.criador).indexOf(normalizeText(filter)) !== -1) ||
        (row?.observacao && normalizeText(row?.observacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1)
    );
  }
  return dados;
}

function dadosComColaboradores(dados, colaboradores) {
  const dadosList = [];
  dados?.forEach((row) => {
    const colaborador = colaboradores.find((item) => Number(item?.perfil_id) === Number(row?.perfil_id));
    dadosList.push({
      ...row,
      uo: colaborador?.uo?.label,
      foto: colaborador?.foto_disk,
      nome: colaborador?.perfil?.displayName || `Perfil: ${row.perfil_id}`,
    });
  });
  return dadosList;
}
