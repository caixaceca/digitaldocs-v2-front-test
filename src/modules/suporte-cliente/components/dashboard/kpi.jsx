import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { toHourLabel } from '@/utils/formatTime';
import { fNumber, fPercent, calcPercentagem } from '@/utils/formatNumber';
//
import { Icon } from '@/assets/icons';
import GridItem from '@/components/GridItem';
import { CheckIcon, TicketIcon, TimeIcon, SatisfyIcon, ArrowIcon } from './icons';

// ---------------------------------------------------------------------------------------------------------------------

export default function KPI({ dados }) {
  const { tickets_opened = 0, tickets_opened_prev = 0, tickets_resolved = 0, tickets_resolved_prev = 0 } = dados || {};
  const { avg_response = 0, avg_response_prev = 0, avg_satisfaction = 0, avg_satisfaction_prev = 0 } = dados || {};

  return (
    <Grid container spacing={2}>
      <KpiItem
        color="primary.dark"
        icon={<TicketIcon />}
        title="Tickets Abertos"
        value={fNumber(tickets_opened)}
        melhorou={tickets_opened > tickets_opened_prev}
        sub={tickets_opened_prev > 0 ? fNumber(tickets_opened - tickets_opened_prev) : null}
      />
      <KpiItem
        icon={<CheckIcon />}
        title="Tickets Resolvidos"
        value={fNumber(tickets_resolved)}
        melhorou={tickets_resolved > tickets_resolved_prev}
        percentagem={fPercent(calcPercentagem(tickets_resolved, tickets_opened))}
        sub={tickets_resolved_prev > 0 ? fNumber(tickets_resolved - tickets_resolved_prev) : null}
      />
      <KpiItem
        inverso
        icon={<TimeIcon />}
        title="Tempo Médio Resposta"
        value={toHourLabel(avg_response)}
        melhorou={avg_response < avg_response_prev}
        sub={avg_response_prev > 0 ? toHourLabel(avg_response - avg_response_prev) : null}
      />
      <KpiItem
        icon={<SatisfyIcon />}
        title="Satisfação Média"
        value={`${avg_satisfaction?.toFixed(1)} / 5`}
        melhorou={avg_satisfaction > avg_satisfaction_prev}
        sub={avg_satisfaction_prev > 0 ? (avg_satisfaction - avg_satisfaction_prev).toFixed(1) : null}
      />
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function KpiItem({ title, value, sub, icon, color = 'primary.main', md = 6, melhorou = false, inverso, percentagem }) {
  const cleanSub = String(sub).replace(/[+-]/, '').trim();
  const signedSub = `${(!inverso && melhorou) || (inverso && !melhorou) ? '+' : '−'}${cleanSub}`;

  return (
    <GridItem sm={6} md={md} lg={3}>
      <Card sx={{ height: 1, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box>
            <Icon sx={{ color, width: 36, height: 36, opacity: 0.72 }}>{icon}</Icon>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6">
              {value}
              {percentagem && (
                <Typography variant="body2" component="span" color="text.disabled">
                  &nbsp;({percentagem})
                </Typography>
              )}
            </Typography>
          </Box>
        </Stack>
        {sub ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.disabled' }}>
            <Box
              sx={{ ...((!inverso && melhorou) || (inverso && !melhorou) ? null : { transform: 'rotate(180deg)' }) }}
            >
              <Icon sx={{ width: 20, height: 20, color: melhorou ? 'success.main' : 'error.main' }}>
                <ArrowIcon />
              </Icon>
            </Box>
            <Typography variant="caption" sx={{ color: melhorou ? 'success.main' : 'error.main' }}>
              {signedSub}{' '}
            </Typography>
            <Typography variant="caption">&nbsp;do que o período anterior</Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            Sem dados no período anterior
          </Typography>
        )}
      </Card>
    </GridItem>
  );
}
