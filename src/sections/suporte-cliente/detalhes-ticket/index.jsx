import { useMemo } from 'react';
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
import { useTabsSync } from '../../../hooks/minimal-hooks/use-tabs-sync';
// components
import { Criado } from '../../../components/Panel';
import { TicketSkeleton } from '../../../components/skeleton';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import SearchNotFound from '../../../components/table/SearchNotFound';
//
import { SLA } from './sla';
import Actions from './actions';
import Historico from './historico';
import { Detalhes } from './detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesTicket({ onClose }) {
  // const dispatch = useDispatch();
  const { isLoading, selectedItem, utilizador } = useSelector((state) => state.suporte);
  const atribuidoA = useColaborador({ userId: selectedItem?.current_user_id, nome: true });
  const admin = useMemo(() => utilizador?.role === 'ADMINISTRATOR' || utilizador?.role === 'COORDINATOR', [utilizador]);
  // const { customer = null, status = '' } = selectedItem || {};

  // useEffect(() => {
  //   if (
  //     status !== 'DRAFT' &&
  //     status !== 'CLOSED' &&
  //     customer?.account_number &&
  //     customer?.core_banking_account_validation === null
  //   ) {
  //     const formData = { coreBankingAccountValidation: null, coreBankingEmailValition: null };
  //     dispatch(updateInSuporte('core-validation', formData, { id: customer?.id, patch: true }));
  //   }
  //   if (customer?.account_number && customer?.core_banking_account_validation === null)
  //     dispatch(updateInSuporte('core-validation', null, { id: customer?.id, patch: true }));
  // }, [dispatch, customer?.account_number, customer?.core_banking_account_validation, customer?.id, status]);

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
    ...(selectedItem?.sla_report
      ? [
          {
            value: 'SLA',
            component: (
              <SLA
                sla={selectedItem?.sla_report ?? null}
                departments={selectedItem?.ticket_histories?.filter(
                  ({ action, sla_report: sla }) => action === 'FORWARDING' && sla
                )}
              />
            ),
          },
        ]
      : []),
  ];

  const [tab, setTab] = useTabsSync(tabsList, 'Detalhes', '');

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
                tab={tab}
                setTab={setTab}
                tabsList={tabsList}
                sx={{ mt: 2, mb: 0, boxShadow: 'none' }}
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
                {tab === 'Detalhes' && (
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
                    <Stack direction="row" spacing={1}>
                      <Chip
                        sx={{ typography: 'overline' }}
                        label={getStatusLabel(selectedItem?.status)}
                        color={colorLabel(getStatusLabel(selectedItem?.status), 'default')}
                      />
                      {selectedItem?.status === 'CLOSED' && (
                        <Chip
                          sx={{ typography: 'overline' }}
                          color={selectedItem?.resolved ? 'success' : 'error'}
                          label={selectedItem?.resolved ? 'Resolvido' : 'Não resolvido'}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}
                {tabsList?.find(({ value }) => value === tab)?.component}
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
