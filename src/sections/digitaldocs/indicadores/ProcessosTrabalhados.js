import PropTypes from 'prop-types';
// @mui
import { Card, Stack, Typography, CardHeader, LinearProgress } from '@mui/material';
// utils
import { fNumber, fPercent } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

ProcessosTrabalhados.propTypes = {
  dados: PropTypes.array,
  total: PropTypes.number,
};

export default function ProcessosTrabalhados({ dados, total }) {
  return (
    <Card>
      <CardHeader title="Processos trabalhados" />
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ px: 3, py: { md: 5.2, xs: 3 } }}>
        {dados.map((row) => (
          <ProgressItem key={row.titulo} dados={row} total={total} />
        ))}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  dados: PropTypes.shape({
    titulo: PropTypes.string,
    total: PropTypes.number,
  }),
  total: PropTypes.number,
};

function ProgressItem({ dados, total }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {dados.titulo}
        </Typography>
        <Typography variant="subtitle2">{fNumber(dados.total)}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          &nbsp;({fPercent((dados.total * 100) / total)})
        </Typography>
      </Stack>

      <LinearProgress variant="determinate" value={(dados.total * 100) / total} color={'success'} sx={{ height: 6 }} />
    </Stack>
  );
}
