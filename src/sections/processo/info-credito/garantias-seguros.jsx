import { useState, useMemo } from 'react';
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
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import useToggle from '../../../hooks/useToggle';
import { fCurrency } from '../../../utils/formatNumber';
import { deleteItem } from '../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { CellChecked } from '../../../components/Panel';
import { DefaultAction } from '../../../components/Actions';
import { SearchNotFoundSmall } from '../../../components/table';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import { DialogConfirmar, DialogTitleAlt } from '../../../components/CustomDialog';
//
import MetadadosGarantia from './metadados-garantia';
import MetadadosForm from '../form/credito/form-metadados-garantia';
import { Resgisto, TableRowItem } from '../../parametrizacao/Detalhes';
import { GarantiasSeparados, SeguroForm } from '../form/credito/form-garantias-credito';

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasSeguros({ dados, seguro = false }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { creditoId, garantiaId = '', processoId, garantias = [], seguros = [], modificar = false } = dados;
  const notFound = seguro ? seguros?.length === 0 : garantias?.length === 0;

  const confirmarEliminar = () => {
    const ids = { processoId, id: item?.id, creditoId };
    const msg = seguro ? 'Seguro eliminado' : 'Garantia eliminada';
    dispatch(deleteItem(seguro ? 'seguros' : 'garantias', { ...ids, msg, onClose: () => setItem(null) }));
  };
  const getGarantia = (id) => dados?.garantias?.find((g) => g?.id === id)?.tipo_garantia || 'GARANTIA';

  return (
    <>
      <Table>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': modificar || garantiaId ? { py: 1 } : null }}>
            <TableCell>{seguro ? 'Seguro' : 'Garantia'}</TableCell>
            {seguro && <TableCell>Apólice</TableCell>}
            {seguro && <TableCell>Seguradora</TableCell>}
            {!seguro && <TableCell align="center">Tipo</TableCell>}
            <TableCell align="right">Valor</TableCell>
            {!seguro && <TableCell align="center">Ativo</TableCell>}
            <TableCell width={10}>
              {modificar && <DefaultAction small button label="Adicionar" onClick={() => setItem({ modal: 'add' })} />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(seguro ? seguros : garantias)?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${creditoId}_${index}`}>
              <TableCell>
                {seguro ? row?.tipo_seguro : row?.tipo_garantia}
                {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                {seguro && !garantiaId && row?.garantia_id ? (
                  <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                    {getGarantia(row?.garantia_id)}
                  </Typography>
                ) : null}
              </TableCell>
              {seguro && <TableCell>{row?.apolice}</TableCell>}
              {seguro && <TableCell>{row?.seguradora}</TableCell>}
              {!seguro && <TableCell align="center">{row?.reais ? 'Real' : 'Pessoal'}</TableCell>}
              <TableCell align="right">{fCurrency(row?.valor_garantia || row?.valor_seguro)}</TableCell>
              {!seguro && <CellChecked check={row?.ativo} />}
              <TableCell>
                <Stack direction="row" spacing={0.5} justifyContent="right">
                  {modificar && (
                    <DefaultAction small label="ELIMINAR" onClick={() => setItem({ modal: 'eliminar', ...row })} />
                  )}
                  {modificar && seguro && (
                    <DefaultAction small label="Editar" onClick={() => setItem({ modal: 'editar', ...row })} />
                  )}
                  {!seguro && (
                    <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...row })} />
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {notFound && (
            <TableRow>
              <TableCell colSpan={7}>
                <SearchNotFoundSmall message="Nenhuma registo encontrado..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {item?.modal === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          handleOk={() => confirmarEliminar()}
          title={`Eliminar ${seguro ? 'seguro' : 'garantia'}`}
          desc={`eliminar ${seguro ? 'este seguro' : 'esta garantia'}`}
        />
      )}
      {item?.modal === 'detail' && (
        <DetalhesGarantia
          modificar={modificar}
          onClose={() => setItem(null)}
          dados={{
            ...item,
            processoId,
            creditoId: dados?.creditoId,
            seguros: seguros?.filter((row) => row?.garantia_id === item?.id),
          }}
        />
      )}
      {item?.modal === 'add' && !seguro && <GarantiasSeparados processoId={processoId} onClose={() => setItem(null)} />}
      {(item?.modal === 'add' || item?.modal === 'editar') && seguro && (
        <SeguroForm ids={{ processoId, garantiaId, creditoId }} selectedItem={item} onClose={() => setItem(null)} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DetalhesGarantia({ dados, modificar, onClose }) {
  const [currentTab, setCurrentTab] = useState('Info');
  const { processo } = useSelector((state) => state.digitaldocs);
  const garantia = useMemo(
    () => processo?.credito?.garantias?.find(({ id }) => id === Number(dados?.id)),
    [processo, dados?.id]
  );

  const tabsList = [
    { value: 'Info', component: <Info dados={dados} info /> },
    {
      value: 'Seguros',
      component: (
        <GarantiasSeguros
          seguro
          dados={{ ...dados, ...garantia, creditoId: dados?.creditoId, garantiaId: dados?.id }}
        />
      ),
    },
    {
      value: 'Características',
      component: (
        <Info
          modificar={modificar}
          dados={garantia?.gaji9_metadados}
          ids={{ processoId: dados?.processoId, garantiaId: dados?.id }}
        />
      ),
    },
  ];

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={onClose}
        title="Detalhes da garantia"
        content={
          <TabsWrapperSimple
            tabsList={tabsList}
            currentTab={currentTab}
            sx={{ mt: 1.5, mb: 2, boxShadow: 'none' }}
            changeTab={(_, newValue) => setCurrentTab(newValue)}
          />
        }
      />
      <DialogContent>{tabsList?.find(({ value }) => value === currentTab)?.component}</DialogContent>
    </Dialog>
  );
}

function Info({ dados, info = false, modificar = false, ids = null }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <List sx={{ width: 1 }}>
      {dados ? (
        <>
          <Table size="small">
            <TableBody>
              {info ? (
                <>
                  <TableRowItem title="Garantia:" text={dados?.tipo_garantia} />
                  <TableRowItem title="Subtipo:" text={dados?.subtipo_garantia} />
                  <TableRowItem
                    title="Tipo:"
                    item={<Label color="default">{dados?.reais ? 'Real' : 'Pessoal'}</Label>}
                  />
                  <TableRowItem title="Valor:" text={fCurrency(dados?.valor_garantia)} />
                  <TableRowItem title="Nº entidade:" text={dados?.numero_entidade} />
                  <TableRowItem title="Nº livrança:" text={dados?.numero_livranca} />
                </>
              ) : (
                <MetadadosGarantia dados={dados} />
              )}
            </TableBody>
          </Table>
          {info && (
            <Stack>
              <Divider sx={{ my: 1 }} />
              <Stack useFlexGap flexWrap="wrap" direction="row" spacing={3} justifyContent="center">
                <Resgisto label="Criado" em={dados?.criado_em} por={dados?.criador} />
                <Resgisto label="Modificado" em={dados?.modificado_em} por={dados?.modificador} />
              </Stack>
            </Stack>
          )}
        </>
      ) : (
        <SearchNotFoundSmall message="Nenhuma informação disponível..." />
      )}

      {modificar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: dados ? 0 : 1 }}>
          <DefaultAction small button label={dados ? 'Editar' : 'Adicionar'} onClick={onOpen} />
        </Stack>
      )}
      {open && <MetadadosForm onClose={onClose} dados={dados} ids={ids} />}
    </List>
  );
}
