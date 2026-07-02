// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
// utils
import { fNumber, fPercent, calcPercentagem } from '@/utils/formatNumber';
//
import GridItem from '@/components/GridItem';

// ---------------------------------------------------------------------------------------------------------------------

export default function KPIEstados({ dados }) {
  const total = dados?.draft + dados?.open + dados?.inProgress + dados?.closed;

  return (
    <Grid container spacing={2}>
      <EstadoItem title="Rascunhos" value={fNumber(dados?.draft)} total={total} />
      <EstadoItem color="warning.main" title="Pendentes" value={fNumber(dados?.open)} total={total} />
      <EstadoItem color="info.main" title="Em análise" value={fNumber(dados?.inProgress)} total={total} />
      <EstadoItem title="Fechados" value={fNumber(dados?.closed)} total={total} />
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function EstadoItem({ title, value, color = 'focus.main', md = 6, total }) {
  return (
    <GridItem sm={6} md={md} lg={3}>
      <Card sx={{ height: 1, p: 2 }}>
        <Typography variant="overline" color={color}>
          {title}
        </Typography>
        <Typography variant="h6">
          {value}
          <Typography variant="body2" component="span" color="text.disabled">
            &nbsp;({fPercent(calcPercentagem(value, total))})
          </Typography>
        </Typography>
      </Card>
    </GridItem>
  );
}
