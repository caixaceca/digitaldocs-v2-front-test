import { useEffect, useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fPercent } from '../../utils/formatNumber';
import { emailCheck } from '../../utils/validarAcesso';
import { nomeacaoBySexo } from '../../utils/formatText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// Components
import Scrollbar from '../../components/Scrollbar';
import { ActionButton } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, ColaboradorInfo, DataLabel } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableInfoEstado({ item, dados }) {
  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: item === 'colaboradores' ? 'asc' : 'desc',
    defaultOrderBy: item === 'colaboradores' ? 'nome' : 'id',
  });
  const { isLoading } = useSelector((state) => state.parametrizacao);
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: colaboradoresList(dados, colaboradores),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter_${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={item === 'colaboradores' ? 7 : 6} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        <ColaboradorInfo
                          caption
                          id={row?.cid}
                          foto={row?.foto}
                          nome={row?.nome || `Perfil: ${row.perfil_id}`}
                          label={nomeacaoBySexo(row?.nomeacao_funcao, row?.sexo)}
                        />
                      </TableCell>
                      {(item === 'colaboradores' && (
                        <>
                          <TableCell align="left">
                            <Typography variant="subtitle2"> {row?.unidade_organica}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Balcão nº {row?.balcao}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <DataLabel data={row?.data_inicio || ''} />
                            <DataLabel data={row?.data_limite || ''} termino />
                          </TableCell>
                          <CellChecked check={row.padrao} />
                          <CellChecked check={row.gestor} />
                          <CellChecked check={row.observador} />
                        </>
                      )) ||
                        (item === 'regrasEstado' && (
                          <>
                            <TableCell align="center">{fPercent(row.percentagem)}</TableCell>
                            <CellChecked check={row.para_aprovacao} />
                            <CellChecked check={row.facultativo} />
                            <CellChecked check={row.ativo} />
                          </>
                        ))}
                      <TableCell align="center" width={50}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {(item === 'regrasEstado' || emailCheck(mail, '')) && (
                            <ActionButton options={{ fab: true, sm: true, item: 'eliminar-item', dados: row }} />
                          )}
                          <ActionButton options={{ fab: true, sm: true, label: 'EDITAR', item, dados: row }} />
                          <ActionButton
                            options={{ fab: true, sm: true, label: 'DETALHES', item: 'detalhes-estado', dados: row }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível.." />}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function colaboradoresList(transicoes, colaboradores) {
  const perfisAssociados = [];
  transicoes?.forEach((row) => {
    const colaborador = colaboradores?.find(({ perfil_id: pid }) => pid === row.perfil_id);
    perfisAssociados.push({
      ...row,
      cid: colaborador?.id,
      sexo: colaborador?.sexo,
      nome: colaborador?.nome,
      balcao: colaborador?.balcao,
      foto: colaborador?.foto_anexo,
      unidade_organica: colaborador?.uo_label,
      nomeacao_funcao: colaborador?.nomeacao_funcao,
    });
  });
  return perfisAssociados;
}

function headerTable(item) {
  return [
    ...((item === 'colaboradores' && [
      { id: 'nome', label: 'Nome' },
      { id: 'unidade_organica', label: 'Unidade orgânica' },
      { id: '', label: 'Data' },
      { id: 'padrao', label: 'Padrão', align: 'center' },
      { id: 'gestor', label: 'Gestor', align: 'center' },
      { id: 'observador', label: 'Observador', align: 'center' },
    ]) ||
      (item === 'regrasEstado' && [
        { id: 'nome', label: 'Colaborador' },
        { id: 'percentagem', label: 'Percentagem', align: 'center' },
        { id: 'para_aprovacao', label: 'Aprovação', align: 'center' },
        { id: 'facultativo', label: 'Facultativo', align: 'center' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
      ]) ||
      []),
    { id: '', width: 10 },
  ];
}
