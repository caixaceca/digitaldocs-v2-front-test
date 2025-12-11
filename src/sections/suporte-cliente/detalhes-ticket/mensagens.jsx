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
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
// utils
import { useColaborador } from '../utils';
import { ptDateTime } from '../../../utils/formatTime';
import { getFileThumb } from '../../../utils/formatFile';
import useResponsive from '../../../hooks/useResponsive';
import { SUPORTE_CLIENTE_API_SERVER } from '../../../utils/apisUrl';
// components
import { SemRegisto } from './historico';
import { newLineText } from '../../../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function Mensagens({ messages }) {
  const isDesktop = useResponsive('up', 'md');

  return (
    <Timeline sx={{ px: 0, mt: 1 }}>
      {messages.length === 0 ? (
        <SemRegisto message="Nenhuma mensagem encontrada..." />
      ) : (
        messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <TimelineMessageItem key={`${msg.sent_at}-${idx}`} message={msg} isLast={isLast} isDesktop={isDesktop} />
          );
        })
      )}
    </Timeline>
  );
}

function TimelineMessageItem({ message, isLast, isDesktop }) {
  const { content, sent_at: at, from, attachments = [] } = message;
  const criadoPor = useColaborador({ userId: from, nome: true });

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' } }}>
      {isDesktop && (
        <TimelineOppositeContent sx={{ pl: 0, flex: 0, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
            {criadoPor || from}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {ptDateTime(at)}
          </Typography>
        </TimelineOppositeContent>
      )}
      <TimelineSeparator>
        <TimelineDot color={(criadoPor || from) === 'Cliente' ? 'grey' : 'success'} sx={{ boxShadow: 'none' }} />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, width: 1 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 0.5 }}>
          {!isDesktop && (
            <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                {criadoPor || from}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {ptDateTime(at)}
              </Typography>
            </Stack>
          )}
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {newLineText(content)}
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
                  href={`${SUPORTE_CLIENTE_API_SERVER}/api/v1/ticket-attachments/download/${anexo?.identifier}`}
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
