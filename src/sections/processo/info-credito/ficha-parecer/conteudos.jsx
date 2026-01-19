import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Accordion from '@mui/material/Accordion';
import TableContainer from '@mui/material/TableContainer';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// utils
import { extractClientes, movimentosConta } from './calculos';
//
import {
  Saldos,
  Clientes,
  Mensagens,
  Movimentos,
  Identificcao,
  CentralRisco,
  AvalesFiancas,
  Restruturacoes,
  Responsabilidades,
} from './dados-ficha';
import {
  Dsti,
  Parecer,
  Despesas,
  Proposta,
  LimiteAval,
  DstiCorrigido,
  NovoFinanciamento,
  SituacaoProfissional,
} from './info-solvabilidade';
import { FormParecer } from './form-ficha';
import AnexarFicha from './ficha-pdf/anexar-ficha';
import { DefaultAction } from '../../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function Ficha({ credito, ficha, valorPrestacao, titular, cliente, modalIntranet, actionModal }) {
  const {
    saldos,
    titulos,
    dividas,
    restruturacoes,
    irregularidades,
    garantiasPrestadas,
    garantiasRecebidas,
    totalSaldoPorMoeda,
    clientes: clientesList,
  } = useMemo(() => extractClientes(ficha?.clientes || []), [ficha?.clientes]);

  const { rendimento = null, despesas = [], parecer = '' } = ficha || {};
  const { dividas_externas: dividasExternas = [], avales_externas: avalesExternos = [] } = ficha || {};
  const { numero, fiancas, entidade, mensagens, central_risco: cr, movimentos = [], proposta = null } = ficha || {};
  const { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta } = useMemo(
    () => movimentosConta(movimentos),
    [movimentos]
  );

  return (
    <Stack spacing={2}>
      <AccordionItem
        open
        title="1. Identificação"
        children={<Identificcao entidade={{ numero, ...entidade, ...rendimento }} />}
      />
      <AccordionItem title="2. Clientes associados" children={<Clientes dados={clientesList} />} />
      <AccordionItem
        title="3. Saldos e Aplicações"
        children={<Saldos dados={saldos} titulos={titulos} totalMoedas={totalSaldoPorMoeda} />}
      />
      <AccordionItem
        title="4. Resumo de movimentos a Crédito"
        children={<Movimentos dados={movimentosCredito} totaisConta={totaisCredConta} />}
      />
      <AccordionItem
        title="5. Resumo de movimentos a Débito"
        children={<Movimentos dados={movimentosDebito} totaisConta={totaisDebConta} />}
      />
      <AccordionItem
        title="6. Crédito e outras responsabilidades"
        children={
          <Responsabilidades
            responsabilidades={{ dividas, garantiasPrestadas, garantiasRecebidas, irregularidades, dividasExternas }}
          />
        }
      />
      <AccordionItem
        title="7. Responsabilidades como Fiador/Avalista"
        children={<AvalesFiancas dados={{ fiancas, avalesExternos }} />}
      />
      <AccordionItem title="8. Informações da central de riscos" children={<CentralRisco cr={cr} />} />
      <AccordionItem title="9. Mensagens pendentes" children={<Mensagens dados={mensagens} />} />
      <AccordionItem title="10. Restruturações" children={<Restruturacoes dados={restruturacoes} />} />
      <AccordionItem
        children={<SituacaoProfissional dados={rendimento} />}
        title="11. Situação profissional e Rendimento do agregado familiar (mensal)"
      />
      <AccordionItem
        title="12. Novo financiamento"
        children={
          <NovoFinanciamento dados={{ valorPrestacao, proposta, credito, rendimento, dividas, dividasExternas }} />
        }
      />
      <AccordionItem
        title="13. DSTI - Debt Service To Income (<=50%)"
        children={<Dsti dados={{ valorPrestacao, dividas, dividasExternas, rendimento, credito }} />}
      />
      <AccordionItem title="14. Outras despesas regulares (média mensal)" children={<Despesas dados={despesas} />} />
      <AccordionItem
        title="15. DSTI corrigido (<=70%)"
        children={<DstiCorrigido dados={{ valorPrestacao, dividas, dividasExternas, rendimento, credito, despesas }} />}
      />
      <AccordionItem title="16. Limite máximo Aval/Fiança" children={<LimiteAval rendimento={rendimento} />} />
      <AccordionItem
        title="17. Parecer"
        children={<Parecer parecer={ficha?.parecer || ''} />}
        action={
          proposta && (
            <DefaultAction
              small
              button
              label={parecer ? 'Editar' : 'Adicionar'}
              onClick={() => actionModal({ modal: 'form-parecer' })}
            />
          )
        }
      />
      <AccordionItem
        title="18. Proposta de Financiamento"
        children={<Proposta dados={{ valorPrestacao, credito, proposta }} />}
      />

      {ficha?.parecer && (
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
          <AnexarFicha dados={{ valorPrestacao, titular, dividas, cliente, credito, parecer, ...ficha }} />
        </Stack>
      )}

      {modalIntranet === 'form-parecer' && (
        <FormParecer
          onClose={() => actionModal({ modal: '' })}
          ficha={{ valorPrestacao, titular, cliente, dividas, credito, ...ficha }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function AccordionItem({ open = false, title, action = null, children }) {
  const [expanded, setExpanded] = useState(open);

  return (
    <Accordion expanded={expanded} onChange={(event, isExpanded) => setExpanded(isExpanded)}>
      <AccordionSummary sx={{ typography: 'subtitle1', py: title === '17. Parecer' ? 0 : 0.25 }}>
        <Stack
          useFlexGap
          spacing={2}
          flexWrap="wrap"
          direction="row"
          alignItems="center"
          sx={{ flexGrow: 1 }}
          justifyContent="space-between"
        >
          {title}
          {title === '17. Parecer' && (
            <Box sx={{ pr: 1 }} onClick={(e) => e.stopPropagation()}>
              {action}
            </Box>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        <TableContainer>
          <Table size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
            {children}
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}
