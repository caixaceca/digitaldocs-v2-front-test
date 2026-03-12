import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
// utils
import { useSelector } from '@/redux/store';
import { ptDateTime } from '@/utils/formatTime';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import { DefaultAction } from '@/components/Actions';
import { SearchNotFoundSmall } from '@/components/table';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
import { Criado, CellChecked, DataLabel } from '@/components/Panel';
//
import { DetalhesContent } from '../details';
import { DestinatarioForm } from '../form-fluxo';

// ---------------------------------------------------------------------------------------------------------------------

export function Notificacao({ dados }) {
  const { destinatarios } = useSelector((state) => state.parametrizacao);

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    { value: 'Destinatários', component: <Notificacoes dados={dados} destinatarios={destinatarios || []} /> },
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

function Notificacoes({ dados, destinatarios }) {
  const { id, ativo } = dados;
  const [destinatario, setDestinatario] = useState(null);
  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Contacto</TableCell>
            <TableCell size="small">Data</TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            <TableCell size="small">Registo</TableCell>
            {ativo && (
              <TableCell size="small" width={10}>
                <DefaultAction small label="ADICIONAR" onClick={() => setDestinatario({ add: true })} />
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {destinatarios?.map((row) => (
            <TableRow hover key={`dest_${row?.id}`}>
              <TableCell>
                <Typography variant="body2">{row?.email}</Typography>
                <Typography variant="body2">{row?.telefone}</Typography>
              </TableCell>
              <TableCell>
                <DataLabel data={row?.data_inicio || ''} />
                <DataLabel data={row?.data_fim || ''} termino />
              </TableCell>
              <CellChecked check={row.ativo} />
              <TableCell>
                <Criado tipo="user" value={row?.modificador || row?.criador} caption />
                <Criado tipo="data" value={ptDateTime(row?.modificado_em || row?.criado_em)} caption />
              </TableCell>
              {ativo && (
                <TableCell>
                  <DefaultAction disabled={!row?.ativo} small label="EDITAR" onClick={() => setDestinatario(row)} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!destinatarios?.length && <SearchNotFoundSmall message="Nenhum destinatário adicionado..." />}
      {!!destinatario && <DestinatarioForm id={id} selectedItem={destinatario} onClose={() => setDestinatario(null)} />}
    </>
  );
}
