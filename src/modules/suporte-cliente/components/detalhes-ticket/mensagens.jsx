// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
// utils
import { useColaborador } from '../../utils';
import { ptDateTime } from '@/utils/formatTime';
import { getFileThumb } from '@/utils/formatFile';
import { API_SUPORTE_CLIENTE_URL } from '@/utils/apisUrl';
// components
import { SemRegisto } from './historico';

// ---------------------------------------------------------------------------------------------------------------------

export default function Mensagens({ messages = [] }) {
  const total = messages.length;
  return (
    <Timeline sx={{ pr: 0, pl: { xs: 0, md: total > 1 ? 2 : 0 }, mt: 1 }}>
      {total === 0 ? (
        <SemRegisto message="Nenhuma mensagem encontrada..." />
      ) : (
        messages.map((msg, idx) => {
          const isLast = idx === total - 1;
          return <TimelineMessageItem key={`${msg.sent_at}-${idx}`} message={msg} isLast={isLast} total={total} />;
        })
      )}
    </Timeline>
  );
}

function TimelineMessageItem({ message, isLast, total }) {
  const { content, sent_at: at, from, attachments = [] } = message;
  const criadoPor = useColaborador({ userId: from, nome: true });

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' } }}>
      {total > 1 && (
        <TimelineSeparator>
          <TimelineDot color={from === 'Cliente' ? 'grey' : 'success'} />
          {!isLast && <TimelineConnector />}
        </TimelineSeparator>
      )}
      <TimelineContent sx={{ width: 1, ...(total === 1 && { p: 0 }) }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
              {criadoPor || from}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {ptDateTime(at)}
            </Typography>
          </Stack>
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {content}
          </Typography>

          {attachments?.length > 0 && (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {attachments.map((anexo) => (
                <Button
                  size="small"
                  component="a"
                  target="_blank"
                  key={anexo?.identifier}
                  rel="noopener noreferrer"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  startIcon={getFileThumb(false, { width: 20, height: 20 }, anexo?.filename)}
                  href={`${API_SUPORTE_CLIENTE_URL}/api/v1/ticket-attachments/download/${anexo?.identifier}`}
                >
                  {anexo?.filename}
                </Button>
              ))}
            </Stack>
          )}
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}
