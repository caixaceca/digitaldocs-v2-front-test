import PropTypes from 'prop-types';
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
import { ptDateTime } from '../../utils/formatTime';
import { nomeacaoBySexo } from '../../utils/formatText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, openModal, getSuccess } from '../../redux/slices/parametrizacao';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { UpdateItem, DefaultAction } from '../../components/Actions';
import { CellChecked, ColaboradorInfo } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';
import { Detalhes, DetalhesContent } from './Detalhes';
import { dadosComColaborador } from './TableParametrizacao';
import { EstadoForm, PerfisEstadoForm, RegraEstadoForm } from './form-estado';

// ----------------------------------------------------------------------

InfoEstado.propTypes = { onClose: PropTypes.func };

export default function InfoEstado({ onClose }) {
  const { uos } = useSelector((state) => state.intranet);
  const { estado, isOpenModal } = useSelector((state) => state.parametrizacao);
  const uo = estado?.uo_id ? uos?.find((row) => Number(row?.id) === Number(estado?.uo_id)) : null;

  return (
    <>
      <Card sx={{ p: 3, pt: 1 }}>
        <DetalhesContent dados={estado} item="Fluxo" uo={uo} />
      </Card>
      {isOpenModal && <EstadoForm onCancel={() => onClose()} />}
    </>
  );
}

// ----------------------------------------------------------------------

TableInfoEstado.propTypes = { item: PropTypes.string, onClose: PropTypes.func };

export function TableInfoEstado({ item, onClose }) {
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
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');
  const { estado, selectedItem, isOpenModal, isOpenView, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'regrasEstado' && dadosComColaborador(estado?.regras, colaboradores)) ||
      (item === 'colaboradores' && colaboradoresList(estado?.perfis, colaboradores)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados) => {
    dispatch(openModal('view'));
    if (item === 'notificacoes' && dados?.id) dispatch(getFromParametrizacao('destinatarios', { id: dados?.id }));
    if (item === 'checklist') dispatch(getFromParametrizacao('checklistitem', { id: dados?.id, item: 'selectedItem' }));
    else dispatch(getSuccess({ item: 'selectedItem', dados }));
  };

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
                  <SkeletonTable column={6} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'colaboradores' && (
                        <>
                          <TableCell>
                            <ColaboradorInfo
                              foto={row?.foto_disk}
                              label={row?.uo?.label}
                              nome={row?.nome || `Perfil: ${row.perfil_id}`}
                            />
                          </TableCell>
                          <TableCell align="left">
                            <Typography variant="subtitle2"> {row?.uo?.label}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Balcão nº {row?.uo?.balcao}
                            </Typography>
                          </TableCell>
                          <TableCell>{nomeacaoBySexo(row?.nomeacao_funcao, row?.sexo)}</TableCell>
                          <TableCell>{row.data_inicial ? ptDateTime(row.data_inicial) : 'Acesso permanente'}</TableCell>
                          <TableCell>{row.data_limite ? ptDateTime(row.data_limite) : 'Acesso permanente'}</TableCell>
                          <CellChecked check={row.observador} />
                        </>
                      )) ||
                        (item === 'regrasEstado' && (
                          <>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="center">{fPercent(row.percentagem)}</TableCell>
                            <CellChecked check={row.para_aprovacao} />
                            <CellChecked check={row.facultativo} />
                            <CellChecked check={row.ativo} />
                          </>
                        ))}
                      {item !== 'colaboradores' && (
                        <TableCell align="center" width={50}>
                          <Stack direction="row" spacing={0.5} justifyContent="right">
                            <UpdateItem dados={{ dados: row }} />
                            <DefaultAction handleClick={() => handleView(row)} label="DETALHES" />
                          </Stack>
                        </TableCell>
                      )}
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

      {isOpenView && <Detalhes item={item} closeModal={() => onClose()} />}
      {isOpenModal && (
        <>
          {item === 'regrasEstado' && (
            <RegraEstadoForm onCancel={onClose} item={estado} estado selectedItem={selectedItem || null} />
          )}
          {item === 'colaboradores' && <PerfisEstadoForm onCancel={onClose} estado={estado} />}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function colaboradoresList(transicoes, colaboradores) {
  const perfisAssociados = [];
  transicoes?.forEach((row) => {
    const colabByPerfil = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    perfisAssociados.push({
      ...row,
      uo: colabByPerfil?.uo,
      sexo: colabByPerfil?.sexo,
      foto_disk: colabByPerfil?.foto_disk,
      nome: colabByPerfil?.perfil?.displayName,
      unidade_organica: colabByPerfil?.uo?.label,
      nomeacao_funcao: colabByPerfil?.nomeacao || colabByPerfil?.funcao,
    });
  });
  return perfisAssociados;
}

function headerTable(item) {
  return [
    ...((item === 'colaboradores' && [
      { id: 'nome', label: 'Nome', align: 'left' },
      { id: 'unidade_organica', label: 'Unidade orgânica', align: 'left' },
      { id: 'nomeacao_funcao', label: 'Nomeação/Função', align: 'left' },
      { id: 'data_inicial', label: 'Data de início', align: 'left' },
      { id: 'data_limite', label: 'Data de fim', align: 'left' },
      { id: 'observador', label: 'Observador', align: 'center' },
    ]) ||
      (item === 'regrasEstado' && [
        { id: 'nome', label: 'Colaborador', align: 'left' },
        { id: 'percentagem', label: 'Percentagem', align: 'center' },
        { id: 'para_aprovacao', label: 'Aprovação', align: 'center' },
        { id: 'facultativo', label: 'Facultativo', align: 'center' },
        { id: 'ativo', label: 'Ativo', align: 'center' },
      ]) ||
      []),
    ...(item !== 'colaboradores' ? [{ id: '', width: 10 }] : []),
  ];
}
