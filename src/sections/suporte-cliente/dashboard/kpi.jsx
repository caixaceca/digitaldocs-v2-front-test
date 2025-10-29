import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { toHourLabel } from '../../../utils/formatTime';
import { fNumber, fPercent } from '../../../utils/formatNumber';
//
import { Icon } from '../../../assets/icons';
import GridItem from '../../../components/GridItem';
import { CheckIcon, TicketIcon, FirstIcon, TimeIcon, SatisfyIcon, ArrowIcon } from './icons';

// ---------------------------------------------------------------------------------------------------------------------

export default function KPI({ dados }) {
  return (
    <Grid container spacing={3}>
      <KpiItem
        color="primary.dark"
        icon={<TicketIcon />}
        title="Tickets Abertos"
        value={fNumber(dados.ticketsOpened)}
        melhorou={dados.ticketsOpened > dados.ticketsOpenedPrev}
        sub={fNumber(dados.ticketsOpened - dados.ticketsOpenedPrev)}
      />
      <KpiItem
        icon={<CheckIcon />}
        title="Tickets Resolvidos"
        value={fNumber(dados.ticketsResolved)}
        melhorou={dados.ticketsResolved > dados.ticketsResolvedPrev}
        sub={fNumber(dados.ticketsResolved - dados.ticketsResolvedPrev)}
      />
      <KpiItem
        color="info.main"
        icon={<FirstIcon />}
        title="Resolução 1º Contacto"
        value={fPercent(dados.firstContactResolution)}
        melhorou={dados.firstContactResolution > dados.firstContactResolutionPrev}
        sub={fPercent(dados.firstContactResolution - dados.firstContactResolutionPrev)}
      />
      <KpiItem
        md={6}
        inverso
        icon={<TimeIcon />}
        title="Tempo Médio Resposta"
        value={toHourLabel(dados.avgResponse)}
        melhorou={dados.avgResponse < dados.avgResponsePrev}
        sub={toHourLabel(dados.avgResponse - dados.avgResponsePrev)}
      />
      <KpiItem
        md={6}
        icon={<SatisfyIcon />}
        title="Satisfação Média"
        value={`${dados.satisfaction} / 5`}
        melhorou={dados.satisfaction > dados.satisfactionPrev}
        sub={(dados.satisfaction - dados.satisfactionPrev).toFixed(1)}
      />
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function KpiItem({ title, value, sub, icon, color = 'primary.main', md = 4, melhorou = false, inverso = false }) {
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
            <Typography variant="h6">{value}</Typography>
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
