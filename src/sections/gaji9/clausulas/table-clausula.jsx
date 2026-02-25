import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '@/utils/formatTime';
import { PATH_DIGITALDOCS } from '@/routes/paths';
import useTable, { getComparator } from '@/hooks/useTable';
import { getLocalStorageArray, contarIdsValidos } from '@/utils/formatObject';
// redux
import { dispatch, useSelector } from '@/redux/store';
import { getSuccess, setModal } from '@/redux/slices/gaji9';
// Components
import Scrollbar from '@/components/Scrollbar';
import { DefaultAction } from '@/components/Actions';
import { Criado, noDados } from '@/components/Panel';
import { SkeletonTable } from '@/components/skeleton';
import DialogPreviewDoc from '@/components/CustomDialog';
import { SearchToolbarSimple } from '@/components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';
//
import ClausulaForm from './form-clausula';
import FiltrarClausulas from './filtrar-clausulas';
import { PreviewMinutaForm } from '../form-minuta';
import { applySortFilter, labelTitular } from '../applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableClausula({ inativos }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState(localStorage.getItem('filterclausulas') || '');

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrder: 'asc',
    defaultOrderBy: 'numero_ordem',
    defaultSelected: getLocalStorageArray('selectedClausulas'),
  });

  const { clausulas, isLoading, modalGaji9, previewFile, isLoadingDoc } = useSelector((state) => state.gaji9);

  const dataFiltered = applySortFilter({ filter, comparator: getComparator(order, orderBy), dados: clausulas || [] });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, clausulas]);

  useEffect(() => {
    localStorage.setItem('selectedClausulas', JSON.stringify(selected));
  }, [selected]);

  return (
    <>
      <FiltrarClausulas inativos={inativos} />

      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterclausulas" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                rowCount={dataFiltered?.length}
                numSelected={contarIdsValidos(selected, dataFiltered)}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    dataFiltered?.map(({ id }) => id)
                  )
                }
                headLabel={[
                  { id: 'numero_ordem', label: 'Nº de cláusula' },
                  { id: 'titulo', label: 'Epígrafe' },
                  { id: 'tipo_titular', label: 'Tipo titular' },
                  { id: 'tipo_garantia', label: 'Tipo garantia' },
                  { id: 'segmento', label: 'Segmento' },
                  { id: 'ultima_modificacao', label: 'Modificado', width: 10 },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={8} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`clausula_${index}`} selected={selected?.includes(row?.id)}>
                      <TableCell
                        align="center"
                        padding="checkbox"
                        sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}
                      >
                        <Checkbox
                          size="small"
                          onClick={() => onSelectRow(row?.id)}
                          checked={selected?.includes(row?.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {(row?.solta && 'SOLTA') ||
                          (row?.seccao_identificacao && 'IDENTIFICAÇÃO') ||
                          (row?.seccao_identificacao_caixa && 'IDENTIFICAÇÃO CAIXA') ||
                          row?.descritivo_numero_ordem ||
                          row?.descritivo ||
                          row?.numero_ordem}
                      </TableCell>
                      <TableCell>{row?.titulo || noDados()}</TableCell>
                      <TableCell>{labelTitular(row?.tipo_titular, row?.consumidor) || noDados()}</TableCell>
                      <TableCell>
                        {row?.tipo_garantia || noDados()}
                        {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                      </TableCell>
                      <TableCell>{row?.segmento || noDados()}</TableCell>
                      <TableCell width={10}>
                        <Criado
                          caption
                          tipo="data"
                          value={ptDateTime(row?.ultima_modificacao || row?.modificado_em || row?.criado_em)}
                        />
                        <Criado caption tipo="user" value={row?.feito_por || row?.modificador || row?.criador} />
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <DefaultAction
                          label="DETALHES"
                          onClick={() => {
                            if (!selected?.includes(row?.id)) onSelectRow(row?.id);
                            navigate(`${PATH_DIGITALDOCS.gaji9.root}/clausula/${row?.id}`);
                          }}
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

        {modalGaji9 === 'preview-minuta' && <PreviewMinutaForm onClose={() => dispatch(setModal())} />}
        {modalGaji9 === 'form-clausula' && <ClausulaForm onClose={() => dispatch(setModal())} clausula={null} />}
        {(isLoadingDoc || previewFile) && (
          <DialogPreviewDoc
            onClose={() => dispatch(getSuccess({ item: 'previewFile', dados: '' }))}
            params={{ url: previewFile, isLoading: isLoadingDoc, titulo: 'Previsualização Minuta' }}
          />
        )}
      </Card>
    </>
  );
}
