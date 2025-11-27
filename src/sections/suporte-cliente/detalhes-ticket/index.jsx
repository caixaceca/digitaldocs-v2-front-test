import { useState, useMemo } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '../../../redux/store';
import { getStatusLabel, useColaborador } from '../utils';
import { colorLabel } from '../../../utils/getColorPresets';
// components
import { Criado } from '../../../components/Panel';
import { TicketSkeleton } from '../../../components/skeleton';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import SearchNotFound from '../../../components/table/SearchNotFound';
//
import Actions from './actions';
import Historico from './historico';
import { Detalhes } from './detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesTicket({ onClose }) {
  const [currentTab, setCurrentTab] = useState('Detalhes');
  const { isLoading, selectedItem, utilizador } = useSelector((state) => state.suporte);
  const atribuidoA = useColaborador({ userId: selectedItem?.current_user_id, nome: true });
  const admin = useMemo(() => utilizador?.role === 'ADMINISTRATOR' || utilizador?.role === 'COORDINATOR', [utilizador]);

  const tabsList = [
    { value: 'Detalhes', component: <Detalhes ticket={selectedItem} /> },
    {
      value: 'Histórico',
      component: (
        <Historico
          historico={[
            { action: 'Abertura', created_at: selectedItem?.created_at, by_email: selectedItem?.created_by_email },
            ...(getStatusLabel(selectedItem?.status) === 'Fechado' && selectedItem?.closed_at
              ? [
                  {
                    action: 'Enceramento',
                    resolved: selectedItem?.resolved,
                    created_at: new Date(new Date(selectedItem?.closed_at).getTime() + 5000).toISOString(),
                  },
                ]
              : []),
            ...(selectedItem?.ticket_histories ?? []),
            ...(selectedItem?.messages?.map((message) => ({
              action: 'Mensagem',
              msg: message?.content,
              created_at: message?.sent_at,
              performed_by_user_id: message?.user_id,
            })) ?? []),
          ]}
        />
      ),
    },
  ];

  return (
    <Dialog open fullWidth onClose={onClose} maxWidth="lg">
      <DialogTitleAlt
        sx={{ mb: 3 }}
        onClose={onClose}
        title={selectedItem?.code_ticket ?? 'Detalhes de ticket'}
        content={
          selectedItem ? (
            <Stack>
              <TabsWrapperSimple
                tabsList={tabsList}
                currentTab={currentTab}
                sx={{ mt: 2, mb: 0, boxShadow: 'none' }}
                changeTab={(_, newValue) => setCurrentTab(newValue)}
              />
            </Stack>
          ) : null
        }
      />
      <DialogContent>
        {isLoading ? (
          <TicketSkeleton />
        ) : (
          <>
            {selectedItem ? (
              <>
                {currentTab === 'Detalhes' && (
                  <Stack
                    useFlexGap
                    spacing={2}
                    sx={{ mb: 3 }}
                    flexWrap="wrap"
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">
                        <Typography component="span" sx={{ color: 'text.secondary', display: 'inline' }}>
                          Assunto:&nbsp;
                        </Typography>
                        {selectedItem?.subject_name}
                      </Typography>
                      <Stack useFlexGap direction="row" flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                        <Criado tipo="company" value={selectedItem?.current_department_name} />
                        <Criado sx={{ color: 'success.main' }} tipo="user" value={atribuidoA} />
                      </Stack>
                    </Stack>
                    <Chip
                      sx={{ typography: 'overline' }}
                      label={getStatusLabel(selectedItem?.status)}
                      color={colorLabel(getStatusLabel(selectedItem?.status), 'default')}
                    />
                  </Stack>
                )}
                {tabsList?.find(({ value }) => value === currentTab)?.component}
              </>
            ) : (
              <SearchNotFound message="Ticket não encontrado..." />
            )}
          </>
        )}
      </DialogContent>

      {!isLoading && !!selectedItem && selectedItem?.status !== 'CLOSED' && (
        <DialogActions>
          <Actions dados={selectedItem} onClose={onClose} admin={admin} />
        </DialogActions>
      )}
    </Dialog>
  );
}
