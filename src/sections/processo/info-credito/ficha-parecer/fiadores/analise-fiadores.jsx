import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { fCurrency } from '@/utils/formatNumber';
import useFiadorCalculos from './useFiadorCalculos';
import { calcRendimento, formatContagem } from '../calculos';
// components
import { noDados } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
//
import FormFiadores from '../form/form-fiadores';
import Responsabilidades, { AvalesFiancas } from '../responsabilidades';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnaliseFiadores({ fiadores, financiamento, rendimento }) {
  const [fiador, setFiador] = useState(null);
  const rend = calcRendimento(rendimento, false);

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      {fiadores.map((row) => (
        <FiadorCard
          row={row}
          rend={rend}
          key={row?.numero_entidade}
          financiamento={financiamento}
          onEdit={() => setFiador(row)}
        />
      ))}
      {!!fiador && <FormFiadores onClose={() => setFiador(null)} dados={fiador} fiadores={fiadores} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FiadorCard({ row, financiamento, rend, onEdit }) {
  const calc = useFiadorCalculos(row, financiamento, rend);

  if (row?.erroEnriquecimento) {
    return (
      <Card sx={{ boxShadow: 1, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2">
            {calc.numero} · {calc.nome}
          </Typography>
          <DefaultAction small label="Editar" onClick={onEdit} />
        </Stack>
        <Alert severity="warning">
          Não foi possível carregar a ficha desta entidade{row?.erroMensagem ? `: ${row.erroMensagem}` : '.'}
        </Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 1, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2">
            {calc.numero} · {calc.nome}
          </Typography>
          <Typography variant="body2">
            {calc.estadoCivil} · {calc.idade}
            {calc.antiguidade ? ` · Cliente desde ${calc.antiguidade}` : ''}
          </Typography>
        </Box>
        <DefaultAction small label="Editar" onClick={onEdit} />
      </Stack>

      <Stack direction={{ sm: 'column', md: 'row' }} spacing={1.5}>
        <ValidadorBox
          referencia={rend}
          value={calc.liquido}
          alertLabel="Abaixo do mínimo"
          label="Rendimento / Proponente"
          alert={calc.rendimentoInsuficiente}
          subtitle={calc.liquido ? `${calc.pctProponente}% do proponente (mín. 75%)` : ''}
          situacao={row?.situacao_laboral ? `${row?.situacao_laboral ?? ''} - ${row?.entidade_patronal ?? ''}` : ''}
        />
        <ValidadorBox
          label="Dívidas ativas"
          alertLabel="Excede limite DSTI"
          alert={calc.excedeLimiteDsti}
          value={calc.totalDividaPropria}
          situacao={calc.liquido ? `Limite do DSTI: ${fCurrency(calc.dstiPropria)}` : ''}
          subtitle={calc.totalPrestacaoPropria ? `Soma das prestações: ${fCurrency(calc.totalPrestacaoPropria)}` : ''}
        />
        <ValidadorBox
          value={calc.totalPres}
          alert={calc.excedeLimite}
          alertLabel="Excede limite"
          referencia={calc.limiteFianca}
          label="Comprometido / Limite máx. aval/fiança"
          subtitle={calc.liquido ? `${calc.pctLimite}% do limite máximo` : ''}
          barra={calc.liquido ? (calc.pctLimite > 100 ? 100 : calc.pctLimite) : null}
        />
      </Stack>

      <SecaoTabela
        titulo="Dívidas ativas"
        temDados={calc.temDividasAtivas}
        interna={calc.numDividasInternas}
        externa={calc.numDividasExternas}
      >
        <Responsabilidades
          fiador
          responsabilidades={{
            dividas: calc.dividas,
            irregularidades: calc.irregularidades,
            dividasExternas: calc.dividasExternas,
          }}
        />
      </SecaoTabela>

      <SecaoTabela
        titulo="Responsabilidades Aval/Fiança"
        temDados={calc.temAvalFianca}
        interna={calc.numAvalFiancaInternas}
        externa={calc.numAvalFiancaExternas}
      >
        <AvalesFiancas fiador dados={{ fiancas: calc.fiancas, avalesExternos: calc.avalesExternos }} />
      </SecaoTabela>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SecaoTabela({ titulo, temDados, interna = 0, externa = 0, children }) {
  const [aberto, setAberto] = useState(false);

  if (!temDados) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion expanded={aberto} onChange={() => setAberto((v) => !v)}>
        <AccordionSummary expanded sx={{ typography: 'subtitle2', py: 0 }}>
          {titulo} {formatContagem(interna, externa)}
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1 }}>
          <Table size="small">{children}</Table>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function ValidadorBox({ label, value, referencia, subtitle, alert, alertLabel, barra, situacao }) {
  return (
    <Box sx={{ flex: 1, bgcolor: 'background.neutral', borderRadius: 1, p: 1.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        {alert && <Chip size="small" color="error" label={alertLabel} sx={{ typography: 'caption' }} />}
      </Stack>
      {value ? (
        <Typography variant="subtitle2">
          {fCurrency(value)}
          {referencia && (
            <Typography component="span" variant="body2" color="text.secondary">
              {` / ${fCurrency(referencia)}`}
            </Typography>
          )}
        </Typography>
      ) : (
        <Box>{noDados(label === 'Dívidas ativas' ? '(Sem dívidas...)' : '(Sem rendimento...)')}</Box>
      )}

      {subtitle && (
        <Typography variant="caption" color={alert ? 'error.main' : 'success.main'}>
          {subtitle}
        </Typography>
      )}
      {barra != null && (
        <Box sx={{ height: 4, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden', mt: 0.75 }}>
          <Box sx={{ height: '100%', width: `${barra}%`, bgcolor: alert ? 'error.main' : 'success.main' }} />
        </Box>
      )}
      {situacao && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {situacao}
        </Typography>
      )}
    </Box>
  );
}
