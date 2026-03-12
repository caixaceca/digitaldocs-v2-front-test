import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import ListItem from '@mui/material/ListItem';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
// utils
import { fPercent } from '@/utils/formatNumber';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getComparator, applySort } from '@/hooks/useTable';
import { getFromParametrizacao } from '@/redux/slices/parametrizacao';
// components
import Label from '@/components/Label';
import { CellChecked } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { SearchNotFoundSmall } from '@/components/table';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
//
import { DetalhesContent } from '.';
import { RegrasForm } from '../form-estado';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesTransicao({ dados }) {
  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    { value: 'Regras', component: <RegrasTransicoes dados={dados} /> },
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Info', '');

  return (
    <>
      <TabsWrapperSimple tabsList={tabsList} tab={tab} sx={{ mt: 2, mb: 1, boxShadow: 'none' }} setTab={setTab} />
      <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RegrasTransicoes({ dados }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    dispatch(getFromParametrizacao('colaboradoresEstado', { id: dados?.estado_inicial_id }));
  }, [dispatch, dados?.estado_inicial_id]);

  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Colaborador</TableCell>
            <TableCell size="small" align="right">
              Percentagem
            </TableCell>
            <TableCell size="small" align="center">
              Aprovação
            </TableCell>
            <TableCell size="small" align="center">
              Facultativo
            </TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            <TableCell size="small" width={10}>
              <DefaultAction label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.regras?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${index}`}>
              <TableCell>
                {colaboradores?.find(({ perfil_id: pid }) => pid === row?.perfil_id)?.nome || row?.perfil_id}
              </TableCell>
              <TableCell align="right">{fPercent(row?.percentagem)}</TableCell>
              <CellChecked check={row?.para_aprovacao} />
              <CellChecked check={row?.decisor} />
              <CellChecked check={row?.ativo} />
              <TableCell>
                <DefaultAction small label="EDITAR" onClick={() => setItem(row)} />
              </TableCell>
            </TableRow>
          ))}
          {(!dados?.regras || dados?.regras?.length === 0) && (
            <TableRow>
              <TableCell colSpan={5}>
                <SearchNotFoundSmall message="Nenhum registo disponível..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!!item && (
        <RegrasForm
          onClose={() => setItem(null)}
          item={{ ...dados, perfis: colaboradoresEstado }}
          selectedItem={item?.action === 'add' ? null : item}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FluxosTransicoes({ fluxos }) {
  return (
    <List>
      <ListItem disableGutters divider sx={{ pb: 0.5 }}>
        <Typography variant="subtitle1">Fluxos</Typography>
      </ListItem>
      <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ py: 1 }} spacing={1}>
        {fluxos?.length > 0 ? (
          applySort(fluxos, getComparator('asc', 'fluxo'))?.map((row) => <Label key={row?.id}>{row?.fluxo}</Label>)
        ) : (
          <Label>Todos</Label>
        )}
      </Stack>
    </List>
  );
}
