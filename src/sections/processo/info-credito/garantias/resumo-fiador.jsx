// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { idadeCliente } from '../ficha-parecer/calculos';
import { Identificacao, Financeiro } from '../ficha-parecer/resumo-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export function resumoFiador({ entidade, clientes, fiancas, dividas, cr, irregularidades, mensagens }) {
  const idade = entidade?.data_nascimento ? idadeCliente(entidade.data_nascimento) : null;
  const semIncumprimento = !cr?.incumprimento && !cr?.comunicado_com_mora && !cr?.centralizado_com_mora;
  const exposicaoFiador = fiancas.reduce((acc, f) => acc + Math.abs(Number(f.valor_prestacao || 0)), 0);
  const dividaTotal = (dividas || []).reduce((acc, d) => acc + Math.abs(Number(d.saldo_divida || 0)), 0);

  return {
    dividaTotal,
    exposicaoFiador,
    semIncumprimento,
    nif: entidade?.nif,
    fiancasCount: fiancas.length,
    estadoCivil: entidade?.estado_civil,
    dividasCount: (dividas || []).length,
    clientesCount: clientes?.length || 0,
    idade: idade ? `${idade} anos` : null,
    mensagensCount: (mensagens || []).length,
    irregularidadesCount: (irregularidades || []).length,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoFiador({ dados }) {
  const r = resumoFiador(dados || {});

  return (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 2 }}>
      <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={3}>
        <Identificacao r={r} />
        <Financeiro r={r} />
      </Stack>

      {(r.irregularidadesCount > 0 || r.mensagensCount > 0) && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="error.main">
            {r.irregularidadesCount > 0 && `${r.irregularidadesCount} irregularidade(s) registada(s). `}
            {r.mensagensCount > 0 && `${r.mensagensCount} mensagem(ns) pendente(s).`}
          </Typography>
        </>
      )}
    </Box>
  );
}
