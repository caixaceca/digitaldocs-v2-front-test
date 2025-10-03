import { useState } from 'react';
// @mui
import List from '@mui/material/List';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import DialogContent from '@mui/material/DialogContent';
// redux
import { fCurrency } from '../../../utils/formatNumber';
import { deleteItem } from '../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { DefaultAction } from '../../../components/Actions';
import { SearchNotFoundSmall } from '../../../components/table';
import { CellChecked, noDados } from '../../../components/Panel';
import { Resgisto, TableRowItem } from '../../parametrizacao/Detalhes';
import { GarantiasSeparados } from '../form/credito/form-garantias-credito';
import { DialogConfirmar, DialogTitleAlt } from '../../../components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export function Garantias({ dados }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { id, processoId, garantias = [], modificar } = dados;
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const eliminarGarantia = () => {
    const ids = { processoId, id: item?.id, creditoId: id };
    dispatch(deleteItem('garantias', { ...ids, msg: 'Garantia eliminada', onClose: () => setItem(null) }));
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Garantia</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="center">Ativo</TableCell>
            <TableCell width={10}>
              {modificar && <DefaultAction small button label="Adicionar" onClick={() => setItem({ modal: 'add' })} />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {garantias?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${id}_${index}`}>
              <TableCell>
                {row?.tipo_garantia}
                {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
              </TableCell>
              <TableCell align="center">{row?.reais ? 'Real' : 'Pessoal'}</TableCell>
              <TableCell align="right">
                {row?.valor_garantia ? `${fCurrency(row?.valor_garantia)}` : noDados('(Não definido)')}
              </TableCell>
              <CellChecked check={row?.ativo} />

              <TableCell>
                <Stack direction="row" spacing={0.5} justifyContent="right">
                  {modificar && (
                    <DefaultAction small label="ELIMINAR" onClick={() => setItem({ modal: 'eliminar', ...row })} />
                  )}
                  <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...row })} />
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {(!garantias || garantias?.length === 0) && (
            <TableRow>
              <TableCell colSpan={7}>
                <SearchNotFoundSmall message="Nenhuma garantia adicionada..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {item?.modal === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          desc="eliminar esta garantia"
          handleOk={() => eliminarGarantia()}
        />
      )}
      {item?.modal === 'detail' && <DetalhesGarantia dados={item} onClose={() => setItem(null)} />}
      {item?.modal === 'add' && <GarantiasSeparados processoId={processoId} onClose={() => setItem(null)} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DetalhesGarantia({ dados, onClose }) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Detalhes" onClose={onClose} />
      <DialogContent>
        <List sx={{ width: 1 }}>
          <Table size="small">
            <TableBody>
              <TableRowItem title="Garantia:" text={dados?.tipo_garantia} />
              <TableRowItem title="Subtipo:" text={dados?.subtipo_garantia} />
              <TableRowItem title="Tipo:" item={<Label color="default">{dados?.reais ? 'Real' : 'Pessoal'}</Label>} />
              <TableRowItem title="Valor:" text={fCurrency(dados?.valor_garantia)} />
              <TableRowItem title="Nº entidade:" text={dados?.numero_entidade} />
              <TableRowItem title="Nº livrança:" text={dados?.numero_livranca} />
            </TableBody>
          </Table>
          <Stack>
            <Divider sx={{ my: 1 }} />
            <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
              <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador} />
              <Resgisto label="Modificado" em={dados?.modificado_em} por={dados?.modificador} />
            </Stack>
          </Stack>
        </List>
      </DialogContent>
    </Dialog>
  );
}
