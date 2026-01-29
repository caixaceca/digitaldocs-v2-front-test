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
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import useResponsive from '../../../hooks/useResponsive';
import { colorLabel } from '../../../utils/getColorPresets';
import { applySort, getComparator } from '../../../hooks/useTable';
import { getActionLabel, getStatusLabel, useColaborador } from '../utils';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function Historico({ historico }) {
  const [action, setAction] = useState(null);
  const isDesktop = useResponsive('up', 'md');
  const filteredHistorico = useMemo(
    () =>
      historico
        ?.map((item) => ({ ...item, action: getActionLabel(item?.action) }))
        ?.filter(({ action: actionRow }) => actionRow === action || action === null),
    [historico, action]
  );

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1, pt: 0.5 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Histórico completo do ticket
        </Typography>
        <Autocomplete
          fullWidth
          size="small"
          value={action || null}
          sx={{ maxWidth: { md: 225 } }}
          onChange={(event, newValue) => setAction(newValue)}
          renderInput={(params) => <TextField {...params} label="Ação" />}
          options={['Atribuição', 'Encaminhamento', 'Alteração do estado']}
        />
      </Stack>
      <Timeline sx={{ px: 0 }}>
        {filteredHistorico.length === 0 ? (
          <SemRegisto
            message={
              <>
                Ticket sem histórico de <b>{action}</b>...
              </>
            }
          />
        ) : (
          applySort(filteredHistorico, getComparator('desc', 'created_at'))?.map((row, index) => {
            const isLast = index === filteredHistorico.length - 1;
            return <TimelineRowItem key={`historico_${index}`} row={row} isLast={isLast} isDesktop={isDesktop} />;
          })
        )}
      </Timeline>
    </>
  );
}

function TimelineRowItem({ row, isLast, isDesktop }) {
  const { created_at: at, action } = row;
  const atribuidoA = useColaborador({ userId: row?.to_user_id, nome: true });
  const criadoPor = useColaborador({ userId: row?.performed_by_user_id, nome: true });

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' } }}>
      {isDesktop && (
        <TimelineOppositeContent sx={{ pl: 0, flex: 0, minWidth: 180 }}>
          <Label color={colorLabel(action, 'default')}>{action}</Label>
          <Typography sx={{ color: 'text.secondary', typography: 'caption', mt: 0.5 }}>{ptDateTime(at)}</Typography>
        </TimelineOppositeContent>
      )}
      <TimelineSeparator>
        <TimelineDot color={colorLabel(action, 'grey')} />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, width: 1 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 0.5 }}>
          {!isDesktop && (
            <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mb: 1 }}>
              <Label color={colorLabel(action, 'default')}>{action}</Label>
              <Typography sx={{ color: 'text.secondary', typography: 'caption' }}>{ptDateTime(at)}</Typography>
            </Stack>
          )}
          {action === 'Abertura' && (
            <Typography variant="body2">
              {row?.by_email ? 'Ticket criado a partir do email' : 'Ticket criado pelo cliente'}
            </Typography>
          )}
          {action === 'Atribuição' && (
            <Typography variant="body2">
              Ticket atribuido a <strong>{atribuidoA ?? row?.to_user_username}</strong>
            </Typography>
          )}
          {action === 'Alteração do estado' && (
            <Typography variant="body2">
              Estado alterado de <strong>{getStatusLabel(row?.old_status)}</strong> para{' '}
              <strong>{getStatusLabel(row?.new_status)}</strong>
            </Typography>
          )}
          {action === 'Encaminhamento' && (
            <Typography variant="body2">
              Ticket encaminhado {row?.from_department_name ? ' de' : ``} <strong>{row?.from_department_name}</strong>{' '}
              para <strong>{row?.to_department_name}</strong>
            </Typography>
          )}
          {action === 'Enceramento' && (
            <Typography variant="body2">
              Ticket encerado{' '}
              <Label variant="filled" color={row?.resolved ? 'primary' : 'error'}>
                {row?.resolved ? 'resolvido' : 'não resolvido'}
              </Label>
            </Typography>
          )}
          {action === 'Mensagem' && <Typography variant="body2">{row?.msg}</Typography>}
          <Criado
            tipo="user"
            sx={{ mt: 0.5, color: 'text.secondary' }}
            value={criadoPor ?? row?.performed_by_user_username}
          />
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

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
