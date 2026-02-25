import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { fCurrency } from '@/utils/formatNumber';
import { deleteItem } from '@/redux/slices/gaji9';
import { useSelector, useDispatch } from '@/redux/store';
import { applySort, getComparator } from '@/hooks/useTable';
// components
import { SemDados } from '../sub-items';
import { IntervenienteForm } from './form-credito';
import { CellChecked } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { DialogConfirmar } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export default function SegurosEntidades({ garantiaId, ativo, creditoId, dados = [], seguros = false }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { isSaving } = useSelector((state) => state.gaji9);
  const params = { getItem: 'credito', garantiaId, msg: 'Seguro  eliminado', onClose: () => setItem(null) };

  return (
    <>
      <Table sx={{ mt: 1 }}>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableCell>{seguros ? 'Seguro' : 'Nº entidade'}</TableCell>
            <TableCell align={seguros ? 'right' : 'left'}>{seguros ? 'Valor do pémio' : 'Nome'}</TableCell>
            {seguros && <TableCell align="center">Ativo</TableCell>}
            {ativo && (
              <TableCell width={10}>
                <Stack direction="row" justifyContent="right">
                  <DefaultAction
                    small
                    label="ADICIONAR"
                    onClick={() => setItem({ action: seguros ? 'add' : 'add-entidade' })}
                  />
                </Stack>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {applySort(dados, getComparator('desc', 'ativo'))?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${index}`}>
              <TableCell>{seguros ? row?.tipo_seguro : row?.numero_entidade}</TableCell>
              <TableCell align={seguros ? 'right' : 'left'}>
                {seguros ? fCurrency(row?.valor_premio_seguro) : row?.nome}
              </TableCell>
              {seguros && <CellChecked check={row?.ativo} />}
              {ativo && (
                <TableCell>
                  {seguros && row?.ativo && (
                    <Stack direction="row" spacing={0.5} justifyContent="right">
                      <DefaultAction small label="ELIMINAR" onClick={() => setItem({ action: 'eliminar', ...row })} />
                      <DefaultAction small label="EDITAR" onClick={() => setItem({ action: 'editar', ...row })} />
                    </Stack>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {(!dados || dados?.length === 0) && <SemDados colSpan={seguros ? 4 : 3} />}
        </TableBody>
      </Table>

      {item?.action === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          desc="eliminar este seguro da garantia"
          handleOk={() => dispatch(deleteItem('seguro-garantia', { id: item?.id, creditoId, ...params }))}
        />
      )}
      {item?.action === 'add-entidade' && (
        <IntervenienteForm id={creditoId} garantiaId={garantiaId} onClose={() => setItem(null)} />
      )}
    </>
  );
}
