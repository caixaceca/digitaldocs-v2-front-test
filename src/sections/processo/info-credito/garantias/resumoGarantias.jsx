import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export function useCoberturaGarantias(garantias, montanteSolicitado) {
  return useMemo(() => {
    const fallback = {
      coberturaRatio: 0,
      garantiasTotal: 0,
      garantiasReais: { total: 0, pct: 0 },
      garantiasPessoais: { total: 0, pct: 0 },
    };

    if (!garantias?.length || !montanteSolicitado) return fallback;

    const ativas = garantias.filter(({ ativo }) => ativo !== false);
    if (!ativas.length) return fallback;

    const garantiasTotal = ativas.reduce((acc, g) => acc + Math.abs(parseFloat(g.valor_garantia) || 0), 0);
    const totalReais = ativas
      .filter((g) => g.reais)
      .reduce((acc, g) => acc + Math.abs(parseFloat(g.valor_garantia) || 0), 0);
    const totalPessoais = garantiasTotal - totalReais;

    const pctReais = garantiasTotal > 0 ? Math.round((totalReais / garantiasTotal) * 100) : 0;
    const coberturaRatio = Math.round((garantiasTotal / parseFloat(montanteSolicitado)) * 100);

    return {
      coberturaRatio,
      garantiasTotal,
      garantiasReais: { total: totalReais, pct: pctReais },
      garantiasPessoais: { total: totalPessoais, pct: 100 - pctReais },
    };
  }, [garantias, montanteSolicitado]);
}

// ---------------------------------------------------------------------------------------------------------------------

function getCoberturaPresentation(ratio, hasData) {
  if (!hasData) return { label: 'Sem referência', color: 'default' };
  if (ratio >= 100) return { label: 'Totalmente coberto', color: 'success' };
  if (ratio >= 75) return { label: 'Cobertura elevada', color: 'info' };
  if (ratio >= 50) return { label: 'Cobertura parcial', color: 'warning' };
  return { label: 'Cobertura baixa', color: 'error' };
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasResumo({ dados, parecer = false }) {
  const theme = useTheme();
  const montante = dados?.montante_contratado || dados?.montante_aprovado || dados?.montante_solicitado || 0;
  const { coberturaRatio, garantiasTotal, garantiasReais, garantiasPessoais } = useCoberturaGarantias(
    dados?.garantias,
    montante
  );
  const { label, color } = getCoberturaPresentation(coberturaRatio, garantiasTotal > 0);
  const fase = (dados?.montante_contratado && 'Contratado') || (dados?.montante_aprovado && 'Aprovado') || 'Solicitado';

  return (
    <Box>
      <Stack direction="column" justifyContent="space-between" alignItems="center" sx={{ pb: 1 }}>
        <Chip
          size="small"
          color={color}
          sx={{ typography: 'overline' }}
          label={`${fPercent(coberturaRatio)} · ${label}`}
        />
      </Stack>

      <LinearProgress
        color={color}
        variant="determinate"
        value={Math.min(coberturaRatio, 100)}
        sx={{ mb: 1, height: 5, bgcolor: alpha(theme.palette[color].main, 0.1) }}
      />

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {parecer ? 'Garantido' : 'Valor Garantido'}: {fCurrency(garantiasTotal)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {parecer ? fase : `Valor ${fase}`}: {fCurrency(dados?.montante_solicitado)}
        </Typography>
      </Stack>

      {garantiasTotal > 0 && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Reais: {fCurrency(garantiasReais.total)} ({garantiasReais.pct}%) | Pessoais:{' '}
          {fCurrency(garantiasPessoais.total)} ({garantiasPessoais.pct}%)
        </Typography>
      )}
    </Box>
  );
}

export function GarantiasList({ dados, parecer = false }) {
  return (
    <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
      {dados.map((g, i) => (
        <Stack key={g.id ?? i} direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              px: 0.6,
              minWidth: 18,
              flexShrink: 0,
              borderRadius: 0.5,
              textAlign: 'center',
              typography: 'caption',
              color: 'text.secondary',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
            }}
          >
            {g.reais ? 'R' : 'P'}
          </Box>
          <Typography variant={parecer ? 'caption' : 'body2'} sx={{ flex: 1, color: 'text.secondary' }} noWrap>
            {g.tipo_garantia} {g.subtipo_garantia ? ` - ${g.subtipo_garantia}` : ''}
          </Typography>
          <Typography variant={parecer ? 'caption' : 'body2'}>
            {fCurrency(Math.abs(Number(g?.valor_garantia || 0)))}
          </Typography>
          {g.percentagem_cobertura && (
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
              {fPercent(g.percentagem_cobertura)}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
