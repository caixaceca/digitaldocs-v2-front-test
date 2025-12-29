import { useState } from 'react';
// @mui
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { deleteItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { fCurrency, fPercent } from '../../../../utils/formatNumber';
// components
import { DefaultAction } from '../../../../components/Actions';
import { CellChecked, noDados } from '../../../../components/Panel';
import { DialogConfirmar } from '../../../../components/CustomDialog';
//
import DetalhesGarantia from './detalhes-garantia';
import FormGarantias from '../../form/credito/garantias/form-garantias-credito';
import { TableSearchNotFound } from '../../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableGarantias({ dados, outros = {} }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const { processoId, modificar = false } = outros;
  const notFound = dados?.length === 0;

  const confirmarEliminar = () => {
    const ids = { processoId, id: item?.id };
    dispatch(deleteItem('garantias', { ...ids, msg: 'Garantia eliminada', onClose: () => setItem(null) }));
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': modificar ? { py: 1 } : null }}>
            <TableCell>Garantia</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="right">Cobertura</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="center">Ativo</TableCell>
            <TableCell width={10}>
              {modificar && <DefaultAction small button label="Adicionar" onClick={() => setItem({ modal: 'add' })} />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${index}`}>
              <TableCell>
                {row?.tipo_garantia}
                {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                {!row?.tipo_garantia && !row?.subtipo_garantia ? noDados('(Não definido...)') : ''}
              </TableCell>
              <TableCell align="center">{row?.reais ? 'Real' : 'Pessoal'}</TableCell>
              <TableCell align="right">
                {fPercent(row?.percentagem_cobertura) || noDados('(Não definido...)')}
              </TableCell>
              <TableCell align="right">{fCurrency(row?.valor_garantia || row?.valor)}</TableCell>
              <CellChecked check={row?.ativo} />
              <TableCell>
                <Stack direction="row" spacing={0.5} justifyContent="right">
                  {modificar && row?.ativo && (
                    <>
                      <DefaultAction small label="ELIMINAR" onClick={() => setItem({ modal: 'delete', ...row })} />
                      <DefaultAction small label="Editar" onClick={() => setItem({ modal: 'update', ...row })} />
                    </>
                  )}
                  <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...row })} />
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {notFound && <TableSearchNotFound message="Nenhuma registo encontrado..." height={130} />}
      </Table>

      {item?.modal === 'delete' && (
        <DialogConfirmar
          isSaving={isSaving}
          title="Eliminar garantia"
          desc="eliminar esta garantia"
          onClose={() => setItem(null)}
          handleOk={() => confirmarEliminar()}
        />
      )}
      {item?.modal === 'detail' && <DetalhesGarantia onClose={() => setItem(null)} dados={{ ...item, processoId }} />}
      {(item?.modal === 'add' || item?.modal === 'update') && (
        <FormGarantias processoId={processoId} dados={item} onClose={() => setItem(null)} />
      )}
    </>
  );
}
