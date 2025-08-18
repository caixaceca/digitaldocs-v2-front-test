import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// hooks
import { usePermissao } from '../../hooks/useAcesso';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, getSuccess, openModal, closeModal } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { CellChecked, Colaborador, noDados } from '../../components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  TipoForm,
  SeguroForm,
  ProdutoForm,
  SegmentoForm,
  GarantiaForm,
  FreguesiaForm,
  TipoTitularForm,
  RepresentanteForm,
} from './form-identificadores';
import DetalhesGaji9 from './detalhes-gaji9';
import { applySortFilter } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableIdentificadores({ item, inativos }) {
  const dispatch = useDispatch();
  const { temPermissao } = usePermissao();
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
    segmentos,
    isOpenView,
    freguesias,
    isOpenModal,
    finalidades,
    componentes,
    tiposSeguros,
    tiposImoveis,
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
      (item === 'segmentos' && segmentos) ||
      (item === 'freguesias' && freguesias) ||
      (item === 'componentes' && componentes) ||
      (item === 'finalidades' && finalidades) ||
      (item === 'tiposSeguros' && tiposSeguros) ||
      (item === 'tiposImoveis' && tiposImoveis) ||
      (item === 'tiposTitulares' && tiposTitulares) ||
      (item === 'tiposGarantias' && tiposGarantias) ||
      (item === 'representantes' &&
        representantes?.map((row) => ({
          ...row,
          uo: uos?.find(({ balcao }) => Number(balcao) === Number(row?.balcao))?.label || '',
          colaborador: colaboradores?.find(
            ({ ad_id: adId, email }) =>
              adId === row?.utilizador_id || email?.toLowerCase() === row?.utilizador_email?.toLowerCase()
          ),
        }))) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const viewItem = (modal, dados) => {
    const itemSingle =
      (item === 'segmentos' && 'segmento') ||
      (item === 'freguesias' && 'freguesia') ||
      (item === 'finalidades' && 'finalidade') ||
      (item === 'componentes' && 'componente') ||
      (item === 'tiposSeguros' && 'tipoSeguro') ||
      (item === 'tiposImoveis' && 'tipoImovel') ||
      (item === 'tiposTitulares' && 'tipoTitular') ||
      (item === 'tiposGarantias' && 'tipoGarantia') ||
      (item === 'representantes' && 'representante');
    dispatch(openModal(modal));
    if (item === 'componentes') dispatch(getSuccess({ item: 'selectedItem', dados }));
    else dispatch(getFromGaji9(itemSingle, { id: dados?.id, item: 'selectedItem' }));
  };

  const onClose = () => dispatch(closeModal());

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
                      (item === 'freguesias' && 5) ||
                      (item === 'componentes' && 4) ||
                      ((item === 'tiposTitulares' || item === 'representantes' || item === 'tiposGarantias') && 3) ||
                      2
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>
                        {item === 'representantes' ? (
                          <Colaborador row={row} />
                        ) : (
                          <>
                            {(item === 'componentes' && row?.codigo) ||
                              ((item === 'tiposImoveis' || item === 'finalidades') && (row?.tipo || row?.designacao)) ||
                              ((item === 'tiposGarantias' || item === 'tiposSeguros' || item === 'segmentos') &&
                                row?.designacao) ||
                              row?.nome ||
                              row?.tipo ||
                              row?.freguesia ||
                              row?.descritivo ||
                              noDados()}
                          </>
                        )}
                      </TableCell>
                      {(item === 'componentes' && (
                        <>
                          <TableCell>{row?.descritivo}</TableCell>
                          <TableCell>{row?.rotulo || noDados('(Não definido)')}</TableCell>
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
                      {item === 'tiposGarantias' && <CellChecked check={row.reais} />}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {((item === 'segmentos' && temPermissao(['UPDATE_SEGMENTO'])) ||
                            (item === 'representantes' && temPermissao(['UPDATE_REPRESENTANTE'])) ||
                            (item === 'freguesias' && temPermissao(['UPDATE_DIVISAO ADMINISTRATIVA'])) ||
                            ((item === 'tiposSeguros' || item === 'tiposGarantias') &&
                              temPermissao(['UPDATE_TIPO GARANTIA'])) ||
                            (item === 'componentes' && temPermissao(['UPDATE_PRODUTO/COMPONENTE'])) ||
                            ((item === 'tiposTitulares' || item === 'tiposImoveis' || item === 'finalidades') &&
                              temPermissao(['UPDATE_TIPO TITULAR']))) && (
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

      {isOpenView && <DetalhesGaji9 closeModal={onClose} item={item} />}
      {isOpenModal && (
        <>
          {item === 'segmentos' && <SegmentoForm onClose={onClose} />}
          {item === 'tiposSeguros' && <SeguroForm onClose={onClose} />}
          {item === 'componentes' && <ProdutoForm onClose={onClose} />}
          {item === 'freguesias' && <FreguesiaForm onClose={onClose} />}
          {item === 'tiposGarantias' && <GarantiaForm onClose={onClose} />}
          {item === 'tiposTitulares' && <TipoTitularForm onClose={onClose} />}
          {item === 'representantes' && <RepresentanteForm onClose={onClose} />}
          {item === 'tiposImoveis' && <TipoForm onClose={onClose} item={item} label="imóvel" />}
          {item === 'finalidades' && <TipoForm onClose={onClose} item={item} label="finalidade" />}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function headerTable(item) {
  return [
    ...((item === 'tiposTitulares' && [{ id: 'descritivo', label: 'Descritivo' }]) ||
      ((item === 'tiposGarantias' || item === 'tiposSeguros' || item === 'segmentos') && [
        { id: 'designacao', label: 'Designação' },
      ]) ||
      (item === 'representantes' && [{ id: 'nome', label: 'Nome' }]) ||
      []),
    ...(item === 'representantes' ? [{ id: 'uo', label: 'U.O' }] : []),
    ...(item === 'tiposImoveis' || item === 'finalidades' ? [{ id: 'tipo', label: 'Tipo' }] : []),
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
    ...(item === 'tiposGarantias' ? [{ id: 'reais', label: 'Real', align: 'center' }] : []),
    ...(item === 'tiposTitulares' ? [{ id: 'consumidor', label: 'Consumidor', align: 'center' }] : []),
    { id: '', width: 10 },
  ];
}
