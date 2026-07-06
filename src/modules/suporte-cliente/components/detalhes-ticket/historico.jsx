import { useState, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
// @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
// utils
import { useSelector } from '@/redux/store';
import { ptDateTime } from '@/utils/formatTime';
import { colorLabel } from '@/utils/getColorPresets';
import { applySort, getComparator } from '@/hooks/useTable';
import { getActionLabel, getStatusLabel } from '../../utils';
// components
import { Anexos } from './mensagens';
import Label from '@/components/Label';
import { Criado } from '@/components/Panel';

const FILTER_OPTIONS = ['Atribuição', 'Encaminhamento', 'Mudança de estado'];

// ---------------------------------------------------------------------------------------------------------------------

export default function Historico({ historico }) {
  const [action, setAction] = useState(null);
  const colaboradores = useSelector((state) => state.intranet.colaboradores);
  const colaboradoresMap = useMemo(() => new Map(colaboradores?.map((c) => [c.id, c.nome])), [colaboradores]);

  const processedHistorico = useMemo(() => {
    if (!historico) return [];
    const mapped = historico.map((item) => ({ ...item, action: getActionLabel(item?.action) }));
    const filtered = mapped.filter(({ action: actionRow }) => action === null || actionRow === action);
    return applySort(filtered, getComparator('desc', 'created_at'));
  }, [historico, action]);

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1, pt: 0.5 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Histórico completo do ticket
        </Typography>
        <Autocomplete
          fullWidth
          size="small"
          value={action}
          sx={{ maxWidth: 200 }}
          options={FILTER_OPTIONS}
          onChange={(event, newValue) => setAction(newValue)}
          renderInput={(params) => <TextField {...params} label="Ação" />}
        />
      </Stack>

      <Timeline sx={{ pr: 0, pl: { xs: 0, md: 2 } }}>
        {processedHistorico.length === 0 ? (
          <SemRegisto
            message={
              <>
                Ticket sem histórico de <b>{action || 'registos'}</b>...
              </>
            }
          />
        ) : (
          processedHistorico.map((row, index) => {
            const isLast = index === processedHistorico.length - 1;
            return (
              <TimelineRowItem key={`ht_${index}`} row={row} isLast={isLast} colaboradoresMap={colaboradoresMap} />
            );
          })
        )}
      </Timeline>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TimelineRowItem({ row, isLast, colaboradoresMap }) {
  const { created_at: at, action, linkedMessage } = row;
  const attachments = linkedMessage?.attachments || row?.attachments || [];

  const atribuidoA = colaboradoresMap.get(row?.to_user_id) || row?.to_user_username;
  const criadoPor = colaboradoresMap.get(row?.performed_by_user_id) || row?.performed_by_user_username;

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' } }}>
      <TimelineSeparator>
        <TimelineDot color={colorLabel(action, 'grey')} />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, width: 1 }}>
        <Paper elevation={1} sx={{ px: 2, py: 1.5, mb: 0.5 }}>
          <Stack useFlexGap flexWrap="wrap" direction="row" alignItems="flex-end" spacing={1} sx={{ mb: 1.5 }}>
            <Label color={colorLabel(action, 'default')}>{action}</Label>
            {criadoPor && <Criado tipo="user" sx={{ mt: 0.5, color: 'text.secondary' }} value={criadoPor} />}
            <Typography sx={{ color: 'text.secondary', typography: 'caption' }}>{ptDateTime(at)}</Typography>
          </Stack>

          {action === 'Abertura' && (
            <Typography variant="body2">
              {row?.by_email ? 'Ticket criado a partir do email' : 'Ticket criado pelo cliente'}
            </Typography>
          )}

          {action === 'Atribuição' && (
            <Typography variant="body2">
              Ticket atribuído a <strong>{atribuidoA}</strong>
            </Typography>
          )}

          {action === 'Mudança de estado' && (
            <Typography variant="body2">
              Estado alterado de <strong>{getStatusLabel(row?.old_status)}</strong> para{' '}
              <strong>{getStatusLabel(row?.new_status)}</strong>
            </Typography>
          )}

          {action === 'Mudança de assunto' && (
            <Typography variant="body2">
              Assunto alterado de <strong>{row?.old_subject}</strong> para <strong>{row?.new_subject}</strong>
            </Typography>
          )}

          {action === 'Encaminhamento' && (
            <Typography variant="body2">
              Ticket encaminhado {row?.from_department_name ? 'de' : ''} <strong>{row?.from_department_name}</strong>{' '}
              para <strong>{row?.to_department_name}</strong>
            </Typography>
          )}

          {action === 'Encerramento' && (
            <Typography variant="body2">
              Ticket encerrado{' '}
              <Label variant="filled" color={row?.resolved ? 'primary' : 'error'}>
                {row?.resolved ? 'resolvido' : 'não resolvido'}
              </Label>
            </Typography>
          )}

          {action === 'Mensagem' && <Typography variant="body2">{row?.msg}</Typography>}

          {linkedMessage?.content && (
            <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line', pt: 1, color: 'text.secondary' }}>
              {linkedMessage.content}
            </Typography>
          )}
          {attachments?.length > 0 && <Anexos attachments={attachments} />}
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SemRegisto({ message }) {
  return (
    <TimelineItem sx={{ '&:before': { display: 'none', p: 0 } }}>
      <TimelineContent sx={{ p: 0 }}>
        <Paper elevation={0} sx={{ p: 5, bgcolor: 'background.neutral' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
            {message}
          </Typography>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}
