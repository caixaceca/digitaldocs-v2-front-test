// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { idadeCliente } from './calculos';
import { fMonthYear } from '@/utils/formatTime';
import { fCurrency } from '@/utils/formatNumber';
//
import { Field } from '../ficha-parecer/fragments';

// ---------------------------------------------------------------------------------------------------------------------

function sinalRendimento(movimentosCredito = []) {
  const ordenado = movimentosCredito.find((m) => m.tipo === 'Pagamento de Ordenado');
  return ordenado ? Number(ordenado.valor) : null;
}

function antiguidadeRelacao(clientes = [], titularCredito) {
  const titular = clientes.find((c) => c?.titular === titularCredito) || clientes?.[0];
  return titular?.data_abertura ? fMonthYear(titular.data_abertura) : null;
}

export function resumoFicha({
  cr,
  fiancas,
  dividas,
  entidade,
  proposta,
  clientes,
  mensagens,
  rendimento,
  restruturacoes,
  irregularidades,
  movimentosCredito,
}) {
  const idade = entidade?.data_nascimento ? idadeCliente(entidade.data_nascimento) : null;
  const semIncumprimento = !cr?.incumprimento && !cr?.comunicado_com_mora && !cr?.centralizado_com_mora;
  const dividaTotal = (dividas || []).reduce((acc, d) => acc + Math.abs(Number(d.saldo_divida || 0)), 0);
  const exposicaoFiador = (fiancas || []).reduce((acc, f) => acc + Math.abs(Number(f.valor_prestacao || 0)), 0);

  return {
    dividaTotal,
    exposicaoFiador,
    semIncumprimento,
    nif: entidade?.nif,
    estadoCivil: entidade?.estado_civil,
    fiancasCount: (fiancas || []).length,
    dividasCount: (dividas || []).length,
    clientesCount: clientes?.length || 0,
    propostaPreenchida: proposta != null,
    idade: idade ? `${idade} anos` : null,
    rendimentoPreenchido: rendimento != null,
    mensagensCount: (mensagens || []).length,
    restruturacoesCount: (restruturacoes || []).length,
    irregularidadesCount: (irregularidades || []).length,
    antiguidade: antiguidadeRelacao(clientes, entidade?.nome),
    sinalRendimento: rendimento == null ? sinalRendimento(movimentosCredito) : null,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoFicha({ dados }) {
  const r = resumoFicha(dados || {});

  return (
    <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 2 }}>
      <Typography sx={{ mb: 2, pb: 2, borderBottom: '0.5px solid', borderColor: 'divider' }} variant="subtitle1">
        {dados?.numero ?? ''} - {dados?.entidade?.nome ?? ''}
      </Typography>
      <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={3}>
        <Identificacao r={r} proponente />
        <Financeiro r={r} proponente />
      </Stack>

      {r.sinalRendimento != null && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '0.5px solid', borderColor: 'divider' }}>
          <Field
            destaque
            label="Sinal de rendimento (movimentos)"
            value={fCurrency(r.sinalRendimento)}
            extra={`Baseado em "Pagamento de Ordenado" — não substitui declaração`}
          />
        </Box>
      )}

      {(r.irregularidadesCount > 0 || r.mensagensCount > 0 || r.restruturacoesCount > 0) && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="error.main">
            {r.irregularidadesCount > 0 && `${r.irregularidadesCount} irregularidade(s). `}
            {r.mensagensCount > 0 && `${r.mensagensCount} mensagem(ns) pendente(s). `}
            {r.restruturacoesCount > 0 && `${r.restruturacoesCount} reestruturação(ões) no histórico.`}
          </Typography>
        </>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Identificacao({ r, proponente = false }) {
  return (
    <Box>
      <Stack direction="row" flexWrap="wrap" gap={3}>
        <Field label="NIF" value={r.nif} />
        <Field label="Idade" value={r.idade} />
        <Field label="Estado civil" value={r.estadoCivil} />
        {proponente && (
          <>
            <Field label="Cliente desde" value={r.antiguidade} />
            {!r.rendimentoPreenchido && <Field badge label="Rendimento" alert value="Pendente" />}
          </>
        )}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }} noWrap>
        {`${r.clientesCount} cliente${r.clientesCount > 1 ? 's' : ''} associado${r.clientesCount > 1 ? 's' : ''}`}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Financeiro({ r, proponente = false }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={3}>
      <Field
        destaque
        label="Saldo em dívida própria"
        value={fCurrency(r.dividaTotal)}
        extra={`${r.dividasCount} responsabilidades`}
      />
      <Field
        destaque
        value={fCurrency(r.exposicaoFiador)}
        label={proponente ? 'Fianças/avales prestados' : 'Exposição como fiador'}
        extra={`${r.fiancasCount} ${proponente ? 'ativo(s)' : 'fianças ativas'}`}
      />
      <Field
        badge
        label="Central de risco"
        alert={!r.semIncumprimento}
        value={r.semIncumprimento ? 'Sem incumprimento' : 'Incumprimento/mora registado'}
      />
    </Stack>
  );
}
