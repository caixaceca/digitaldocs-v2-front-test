// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { colorLabel } from '@/utils/getColorPresets';
import { fCurrency, fPercent } from '@/utils/formatNumber';
import { formatPrazoAmortizacao } from '@/utils/formatText';
//
import { noDados } from '@/components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export default function Kpis({ credito }) {
  const nivel = credito?.nivel_decisao || '';
  const situacao = (credito?.situacao_final_mes || 'em análise').toLowerCase();

  return (
    <Card sx={{ p: 0.75, mb: 3, backgroundColor: 'background.neutral', boxShadow: 'none' }}>
      <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
        <CardItem
          title="Situação"
          value={
            <Chip variant="filled" label={situacao} color={colorLabel(situacao)} sx={{ textTransform: 'uppercase' }} />
          }
        />
        <CardItem title="Montante solicitado" value={fCurrency(credito?.montante_solicitado)} />
        <CardItem title="Montante contratado" value={fCurrency(credito?.montante_contratado)} />
        <CardItem title="Montante aprovado" value={fCurrency(credito?.montante_aprovado)} />
        <CardItem title="Taxa juro" value={fPercent(credito?.taxa_juro)} />
        <CardItem title="Prazo" value={formatPrazoAmortizacao(credito?.prazo_amortizacao)} />
        <CardItem
          title="Escalão de decisão"
          value={
            nivel ? (
              <Chip
                sx={{ textTransform: 'uppercase' }}
                label={`${nivel} - Comité ${(nivel === 1 && 'Base') || (nivel === 2 && 'Diretor') || (nivel === 3 && 'Superior')}`}
              />
            ) : (
              noDados('(Não definido...)')
            )
          }
        />
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CardItem({ title = '', value = '' }) {
  return value ? (
    <Card sx={{ p: 1.5, textAlign: 'center', boxShadow: 'none', flexGrow: 1 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Card>
  ) : null;
}
