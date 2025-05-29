import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { noDados } from '../../utils/formatText';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, ColaboradorInfo } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import DetalhesGaji9 from './DetalhesGaji9';
import { applySortFilter } from './applySortFilter';
import { GrupoForm, FuncaoForm, RecursoForm, MarcadorForm, VariavelForm } from './form-gaji9';

// ---------------------------------------------------------------------------------------------------------------------

TableParamsGaji9.propTypes = { item: PropTypes.string, inativos: PropTypes.bool };

export default function TableParamsGaji9({ item, inativos }) {
  const dispatch = useDispatch();
  const { handleCloseModal } = useModal(closeModal());
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');

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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const { funcoes, grupos, recursos, variaveis, marcadores, isLoading, isOpenView, isOpenModal } = useSelector(
    (state) => state.gaji9
  );

  useEffect(() => {
    setFilter(localStorage.getItem(`filter${item}`) || '');
  }, [item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  useEffect(() => {
    dispatch(getFromGaji9(item, { inativos }));
  }, [dispatch, inativos, item]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'grupos' && grupos) ||
      (item === 'recursos' && recursos) ||
      (item === 'variaveis' && variaveis) ||
      (item === 'marcadores' && marcadores) ||
      (item === 'funcoes' &&
        funcoes?.map((row) => ({
          ...row,
          uo: uos?.find(({ balcao }) => balcao === row?.balcao)?.label || '',
          colaborador: colaboradores?.find(
            ({ perfil }) =>
              perfil?.id_aad === row?.utilizador_id ||
              perfil?.mail?.toLowerCase() === row?.utilizador_email?.toLowerCase()
          ),
        }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    const itemSingle =
      (item === 'grupos' && 'grupo') ||
      (item === 'funcoes' && 'funcao') ||
      (item === 'recursos' && 'recurso') ||
      (item === 'variaveis' && 'variavel') ||
      (item === 'marcadores' && 'marcador');
    dispatch(openModal(modal));

    dispatch(
      getFromGaji9(itemSingle, { id: item === 'funcoes' ? dados?.utilizador_id : dados?.id, item: 'selectedItem' })
    );
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={((item === 'funcoes' || item === 'variaveis' || item === 'marcadores') && 4) || 3}
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {item === 'funcoes' ? (
                          <ColaboradorInfo
                            labelAltCaption
                            id={row?.colaborador?.id}
                            labelAlt={row?.utilizador_id}
                            foto={row?.colaborador?.foto_disk}
                            caption={!row?.colaborador?.uo?.label}
                            nome={row?.colaborador?.nome || row?.utilizador_email || row?.nome}
                            label={row?.colaborador?.uo?.desegnicao || 'Perfil sem ID_AAD na Intranet'}
                          />
                        ) : (
                          <>{row?.nome || row?.prefixo || row?.designacao || noDados()}</>
                        )}
                      </TableCell>
                      {(item === 'variaveis' && <TableCell>{row?.descritivo}</TableCell>) ||
                        (item === 'marcadores' && <TableCell>{row?.sufixo}</TableCell>) ||
                        (item === 'funcoes' && <TableCell>{row?._role}</TableCell>)}
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction small label="EDITAR" onClick={() => viewItem('update', row)} />
                          <DefaultAction small label="DETALHES" onClick={() => viewItem('view', row)} />
                        </Stack>
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

      {isOpenView && <DetalhesGaji9 closeModal={handleCloseModal} item={item} />}

      {isOpenModal && (
        <>
          {item === 'grupos' && <GrupoForm onClose={handleCloseModal} />}
          {item === 'funcoes' && <FuncaoForm onClose={handleCloseModal} />}
          {item === 'recursos' && <RecursoForm onClose={handleCloseModal} />}
          {item === 'variaveis' && <VariavelForm onClose={handleCloseModal} />}
          {item === 'marcadores' && <MarcadorForm onClose={handleCloseModal} />}
        </>
      )}
    </>
  );
}

function headerTable(item) {
  return [
    ...((item === 'recursos' && [{ id: 'nome', label: 'Nome' }]) ||
      (item === 'grupos' && [{ id: 'designacao	', label: 'Designação' }]) ||
      (item === 'variaveis' && [
        { id: 'nome', label: 'Nome' },
        { id: 'descritivo', label: 'Descritivo' },
      ]) ||
      (item === 'marcadores' && [
        { id: 'prefixo', label: 'Prefixo' },
        { id: 'sufixo', label: 'Sufixo' },
      ]) ||
      (item === 'funcoes' && [
        { id: 'utilizador_email', label: 'Colaborador' },
        { id: '_role', label: 'Função' },
      ]) ||
      []),
    { id: 'ativo', label: 'Ativo', align: 'center' },
    { id: '', width: 10 },
  ];
}
