// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { colorLabel } from '@/utils/getColorPresets';
import { fCurrency, fPercent } from '@/utils/formatNumber';
import { formatPrazoAmortizacao } from '@/utils/formatText';

// ---------------------------------------------------------------------------------------------------------------------

export default function Kpis({ credito }) {
  const situacao = (credito?.situacao_final_mes || 'em análise').toLowerCase();

  return (
    <Card sx={{ p: 0.75, mb: 3, backgroundColor: 'background.neutral', boxShadow: 'none' }}>
      <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
        <CardItem
          title="Situação"
          value={
            <Chip color={colorLabel(situacao)} variant="filled" label={situacao} sx={{ textTransform: 'uppercase' }} />
          }
        />
        <CardItem title="Montante solicitado" value={fCurrency(credito?.montante_solicitado)} />
        <CardItem title="Montante contratado" value={fCurrency(credito?.montante_contratado)} />
        <CardItem title="Montante aprovado" value={fCurrency(credito?.montante_aprovado)} />
        <CardItem title="Taxa juro" value={fPercent(credito?.taxa_juro)} />
        <CardItem title="Prazo" value={formatPrazoAmortizacao(credito?.prazo_amortizacao)} />
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CardItem({ title, value }) {
  return value ? (
    <Card sx={{ p: 1.5, textAlign: 'center', boxShadow: 'none', flexGrow: 1 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Card>
  ) : null;
}
