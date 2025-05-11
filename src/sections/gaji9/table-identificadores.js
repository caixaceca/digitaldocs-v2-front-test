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
import { acessoGaji9 } from '../../utils/validarAcesso';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { CellChecked, ColaboradorInfo } from '../../components/Panel';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import DetalhesGaji9 from './DetalhesGaji9';
import { applySortFilter } from './applySortFilter';
import { ProdutoForm, GarantiaForm, TipoTitularForm, RepresentanteForm, FreguesiaForm } from './form-gaji9';

// ---------------------------------------------------------------------------------------------------------------------

TableIdentificadores.propTypes = { item: PropTypes.string, inativos: PropTypes.bool };

export default function TableIdentificadores({ item, inativos }) {
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

  const {
    isLoading,
    adminGaji9,
    isOpenView,
    utilizador,
    freguesias,
    isOpenModal,
    componentes,
    tiposTitulares,
    tiposGarantias,
    representantes,
  } = useSelector((state) => state.gaji9);
  const { colaboradores, uos } = useSelector((state) => state.intranet);

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
      (item === 'freguesias' && freguesias) ||
      (item === 'componentes' && componentes) ||
      (item === 'tiposTitulares' && tiposTitulares) ||
      (item === 'tiposGarantias' && tiposGarantias) ||
      (item === 'representantes' &&
        representantes?.map((row) => ({
          ...row,
          uo: uos?.find((item) => item?.balcao === row?.balcao)?.label || '',
          colaborador: colaboradores?.find(
            (item) =>
              item?.perfil?.id_aad === row?.utilizador_id ||
              item?.perfil?.mail?.toLowerCase() === row?.utilizador_email?.toLowerCase()
          ),
        }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    const itemSingle =
      (item === 'freguesias' && 'freguesia') ||
      (item === 'componentes' && 'componente') ||
      (item === 'tiposTitulares' && 'tipoTitular') ||
      (item === 'tiposGarantias' && 'tipoGarantia') ||
      (item === 'representantes' && 'representante');
    dispatch(openModal(modal));
    if (item === 'componentes') dispatch(getSuccess({ item: 'selectedItem', dados }));
    else dispatch(getFromGaji9(itemSingle, { id: dados?.id, item: 'selectedItem' }));
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
                    column={
                      ((item === 'tiposTitulares' || item === 'representantes') && 4) ||
                      (item === 'componentes' && 5) ||
                      (item === 'freguesias' && 6) ||
                      3
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {item === 'representantes' ? (
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
                          <>
                            {(item === 'componentes' && row?.codigo) ||
                              (item === 'tiposGarantias' && row?.designacao) ||
                              row?.nome ||
                              row?.freguesia ||
                              row?.descritivo ||
                              noDados()}
                          </>
                        )}
                      </TableCell>
                      {(item === 'componentes' && (
                        <>
                          <TableCell>{row?.descritivo}</TableCell>
                          <TableCell>{row?.rotulo || noDados('Não definido')}</TableCell>
                        </>
                      )) ||
                        (item === 'freguesias' && (
                          <>
                            <TableCell>{row?.concelho}</TableCell>
                            <TableCell>{row?.ilha}</TableCell>
                            <TableCell>{row?.regiao}</TableCell>
                          </>
                        )) ||
                        (item === 'representantes' && (
                          <TableCell>
                            {row?.uo} ({row?.balcao})
                          </TableCell>
                        )) ||
                        (item === 'tiposTitulares' && <CellChecked check={row.consumidor} />)}
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {(adminGaji9 ||
                            (item === 'tipoTitulares' && acessoGaji9(utilizador?.acessos, ['UPDATE_TIPO TITULAR'])) ||
                            (item === 'tiposGarantias' && acessoGaji9(utilizador?.acessos, ['UPDATE_TIPO GARANTIA'])) ||
                            (item === 'representantes' && acessoGaji9(utilizador?.acessos, ['UPDATE_REPRESENTANTE'])) ||
                            (item === 'freguesias' &&
                              acessoGaji9(utilizador?.acessos, ['UPDATE_DIVISAO ADMINISTRATIVA'])) ||
                            (item === 'componentes' &&
                              acessoGaji9(utilizador?.acessos, ['UPDATE_PRODUTO/COMPONENTE']))) && (
                            <DefaultAction small label="EDITAR" onClick={() => viewItem('update', row)} />
                          )}
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
          {item === 'componentes' && <ProdutoForm onCancel={handleCloseModal} />}
          {item === 'freguesias' && <FreguesiaForm onCancel={handleCloseModal} />}
          {item === 'tiposGarantias' && <GarantiaForm onCancel={handleCloseModal} />}
          {item === 'tiposTitulares' && <TipoTitularForm onCancel={handleCloseModal} />}
          {item === 'representantes' && <RepresentanteForm onCancel={handleCloseModal} />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'tiposTitulares' && [{ id: 'descritivo', label: 'Descritivo' }]) ||
      (item === 'tiposGarantias' && [{ id: 'designacao', label: 'Designação' }]) ||
      (item === 'representantes' && [{ id: 'nome', label: 'Nome' }]) ||
      []),
    ...(item === 'representantes' ? [{ id: 'uo', label: 'U.O' }] : []),
    ...(item === 'componentes'
      ? [
          { id: 'codigo', label: 'Código' },
          { id: 'descritivo', label: 'Descritivo' },
          { id: 'rotulo', label: 'Rótulo' },
        ]
      : []),
    ...(item === 'freguesias'
      ? [
          { id: 'freguesia', label: 'Freguesia' },
          { id: 'concelho', label: 'Concelho' },
          { id: 'ilha', label: 'Ilha' },
          { id: 'regiao', label: 'Região' },
        ]
      : []),
    ...(item === 'tiposTitulares' ? [{ id: 'consumidor', label: 'Consumidor', align: 'center' }] : []),
    { id: 'ativo', label: 'Ativo', align: 'center' },
    { id: '', width: 10 },
  ];
}
