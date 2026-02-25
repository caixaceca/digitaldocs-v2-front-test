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
import { CheckIcon, TicketIcon, FirstIcon, TimeIcon, SatisfyIcon, ArrowIcon } from './icons';

// ---------------------------------------------------------------------------------------------------------------------

export default function KPI({ dados }) {
  return (
    <Grid container spacing={3}>
      <KpiItem
        color="primary.dark"
        icon={<TicketIcon />}
        title="Tickets Abertos"
        value={fNumber(dados?.tickets_opened)}
        melhorou={dados?.tickets_opened > dados?.tickets_opened_prev}
        sub={fNumber(dados?.tickets_opened - dados?.tickets_opened_prev)}
      />
      <KpiItem
        icon={<CheckIcon />}
        title="Tickets Resolvidos"
        value={fNumber(dados?.tickets_resolved)}
        melhorou={dados?.tickets_resolved > dados?.tickets_resolved_prev}
        sub={fNumber(dados?.tickets_resolved - dados?.tickets_resolved_prev)}
        percentagem={fPercent(calcPercentagem(dados?.tickets_resolved, dados?.tickets_opened))}
      />
      <KpiItem
        color="info.main"
        icon={<FirstIcon />}
        title="Resolução 1º Contacto"
        value={fNumber(dados?.first_contact_resolution)}
        melhorou={dados?.first_contact_resolution > dados?.first_contact_resolution_prev}
        sub={fNumber(dados?.first_contact_resolution - dados?.first_contact_resolution_prev)}
        percentagem={fPercent(calcPercentagem(dados?.first_contact_resolution, dados?.tickets_resolved))}
      />
      <KpiItem
        md={6}
        inverso
        icon={<TimeIcon />}
        title="Tempo Médio Resposta"
        value={toHourLabel(dados?.avg_response)}
        melhorou={dados?.avg_response < dados?.avg_response_prev}
        sub={toHourLabel(dados?.avg_response - dados?.avg_response_prev)}
      />
      <KpiItem
        md={6}
        icon={<SatisfyIcon />}
        title="Satisfação Média"
        value={`${dados?.avg_satisfaction?.toFixed(1)} / 5`}
        melhorou={dados?.avg_satisfaction > dados?.avg_satisfaction_prev}
        sub={(dados?.avg_satisfaction - dados?.avg_satisfaction_prev).toFixed(1)}
      />
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function KpiItem({ title, value, sub, icon, color = 'primary.main', md = 4, melhorou = false, inverso, percentagem }) {
  const cleanSub = String(sub).replace(/[+-]/, '').trim();
  const signedSub = `${(!inverso && melhorou) || (inverso && !melhorou) ? '+' : '−'}${cleanSub}`;

  return (
    <GridItem xs={6} md={md} xl={2.4}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.disabled' }}>
          <Box sx={{ ...((!inverso && melhorou) || (inverso && !melhorou) ? null : { transform: 'rotate(180deg)' }) }}>
            <Icon sx={{ width: 20, height: 20, color: melhorou ? 'success.main' : 'error.main' }}>
              <ArrowIcon />
            </Icon>
          </Box>
          <Typography variant="caption" sx={{ color: melhorou ? 'success.main' : 'error.main' }}>
            {signedSub}{' '}
          </Typography>
          <Typography variant="caption">&nbsp;do que o período anterior</Typography>
        </Box>
      </Card>
    </GridItem>
  );
}
