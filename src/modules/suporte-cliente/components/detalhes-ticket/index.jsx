import { useMemo } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '@/redux/store';
import { colorLabel } from '@/utils/getColorPresets';
import { getStatusLabel, useColaborador } from '../../utils';
import { useTabsSync } from '@/hooks/minimal-hooks/use-tabs-sync';
// components
import { Criado } from '@/components/Panel';
import { TicketSkeleton } from '@/components/skeleton';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { TabsWrapperSimple } from '@/components/TabsWrapper';
import SearchNotFound from '@/components/table/SearchNotFound';
//
import { SLA } from './sla';
import Actions from './actions';
import Historico from './historico';
import { Detalhes } from './detalhes';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesTicket({ onClose, refetch }) {
  const { isLoading, selectedItem, utilizador } = useSelector((state) => state.suporte);

  const { status = '' } = selectedItem || {};
  const totalHistory = useMemo(() => buildTicketHistory(selectedItem), [selectedItem]);
  const atribuidoA = useColaborador({ userId: selectedItem?.current_user_id, nome: true });

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
    { value: 'Histórico', component: <Historico historico={totalHistory} /> },
    ...(selectedItem?.sla_report
      ? [
          {
            value: 'SLA',
            component: (
              <SLA
                createdAt={selectedItem?.created_at}
                sla={selectedItem?.sla_report ?? null}
                encaminhamentos={selectedItem?.ticket_histories?.filter(
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
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack
                useFlexGap
                spacing={2}
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
                    label={getStatusLabel(status)}
                    sx={{ typography: 'overline' }}
                    color={colorLabel(getStatusLabel(status), 'default')}
                  />
                  {status === 'CLOSED' && (
                    <Chip
                      sx={{ typography: 'overline' }}
                      color={selectedItem?.resolved ? 'success' : 'error'}
                      label={selectedItem?.resolved ? 'Resolvido' : 'Não resolvido'}
                    />
                  )}
                </Stack>
              </Stack>
              <TabsWrapperSimple tab={tab} setTab={setTab} tabsList={tabsList} sx={{ mb: 0, boxShadow: 'none' }} />
            </Stack>
          ) : null
        }
      />
      <DialogContent>
        {isLoading && !selectedItem ? (
          <TicketSkeleton />
        ) : (
          <>
            {selectedItem ? (
              tabsList?.find(({ value }) => value === tab)?.component
            ) : (
              <SearchNotFound message="Ticket não encontrado..." />
            )}
          </>
        )}
      </DialogContent>

      {status !== 'CLOSED' && (
        <Actions dados={selectedItem} onClose={onClose} utilizador={utilizador} refetch={refetch} />
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function buildTicketHistory(selectedItem) {
  if (!selectedItem) return [];

  const { resolved, created_at, messages = [], created_by_email, ticket_histories = [] } = selectedItem;

  const aloneMessages = [];
  const messagesByHistoryId = new Map();

  messages.forEach((message) => {
    if (message?.history_id) messagesByHistoryId.set(message.history_id, message);
    else aloneMessages.push(message);
  });

  const aberturaEvent = { action: 'Abertura', created_at, by_email: created_by_email };

  const processedHistories = ticket_histories.map((history) => {
    const linkedMessage = messagesByHistoryId.get(history?.id);
    const isClosureStatus = history?.action === 'STATUS_CHANGE' && history?.new_status === 'CLOSED';

    let historyItem = { ...history };

    if (isClosureStatus) {
      historyItem.action = 'Encerramento';
      historyItem.resolved = history?.resolved ?? resolved;
    }

    if (linkedMessage && linkedMessage.content) historyItem.linkedMessage = linkedMessage.content;

    return historyItem;
  });

  const processedAloneMessages = aloneMessages.map((message) => ({
    action: 'Mensagem',
    msg: message?.content,
    created_at: message?.sent_at,
    performed_by_user_id: message?.user_id,
  }));

  return [aberturaEvent, ...processedHistories, ...processedAloneMessages];
}
