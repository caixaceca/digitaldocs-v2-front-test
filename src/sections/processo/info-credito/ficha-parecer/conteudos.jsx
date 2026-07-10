import { useMemo, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// utils
//
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
import { dispatch } from '@/redux/store';
import { updateFicha } from '@/redux/slices/intranet';
import { extractClientes, movimentosConta } from './calculos';
import { extrairFiadores } from '../carta-proposta/dados-mapper';
import { useEnriquecerEntidades } from './fiadores/useEnriquecerEntidades';
//
import ResumoFicha from './resumo-ficha';
import { AccordionItem } from './fragments';
import { FormParecer } from './form/form-ficha';
import AnexarFicha from './ficha-pdf/anexar-ficha';
import AnaliseFiadores from './fiadores/analise-fiadores';
import { AddItem, DefaultAction } from '@/components/Actions';
import Responsabilidades, { AvalesFiancas, Liquidacoes } from './responsabilidades';
import { Saldos, Clientes, Mensagens, Movimentos, Identificcao, CentralRisco, Restruturacoes } from './dados-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export default function Ficha({ credito, montante, ficha, valorPrestacao, cliente, modalIntranet, actionModal }) {
  const fiadores1 = useMemo(() => extrairFiadores(credito?.garantias), [credito?.garantias]);
  const { enriquecidos, loading } = useEnriquecerEntidades(!ficha?.fiadores ? fiadores1 : null);

  useEffect(() => {
    if (enriquecidos) dispatch(updateFicha({ fiadores: enriquecidos }));
  }, [enriquecidos]);

  const {
    saldos,
    titulos,
    dividas,
    clientes,
    restruturacoes,
    irregularidades,
    garantiasPrestadas,
    garantiasRecebidas,
    totalSaldoPorMoeda,
  } = useMemo(() => extractClientes(ficha?.clientes || []), [ficha?.clientes]);

  const { dividas_externas: dividasExternas = [], avales_externas: avalesExternos = [] } = ficha || {};
  const { rendimento = null, despesas = [], liquidacoes = [], fiadores = [], parecer = '' } = ficha || {};
  const { numero, fiancas, entidade, mensagens, central_risco: cr, movimentos = [], proposta = null } = ficha || {};

  const { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta } = useMemo(
    () => movimentosConta(movimentos),
    [movimentos]
  );
  const temFiadores = fiadores?.length > 0;
  const divEf = useMemo(() => dividas?.filter((r) => !liquidacoes?.includes(r?.conta)), [dividas, liquidacoes]);

  return (
    <Stack spacing={2}>
      <ResumoFicha
        dados={{
          cr,
          numero,
          fiancas,
          dividas,
          proposta,
          entidade,
          clientes,
          mensagens,
          rendimento,
          restruturacoes,
          irregularidades,
          movimentosCredito,
        }}
      />
      <AccordionItem
        title="1. Identificação"
        children={<Identificcao entidade={{ numero, ...entidade, ...rendimento }} />}
      />
      <AccordionItem title="2. Clientes associados" children={<Clientes dados={clientes} />} />
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
        action={
          dividas?.length > 0 ? (
            <AddItem
              dados={{ small: true, label: 'Liquidação' }}
              onClick={() => actionModal({ modal: 'liquidacao' })}
            />
          ) : null
        }
      >
        <Responsabilidades
          liquidacoes={liquidacoes}
          responsabilidades={{ dividas, garantiasPrestadas, garantiasRecebidas, irregularidades, dividasExternas }}
        />
      </AccordionItem>
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
      <AccordionItem normal title="12. Novo financiamento">
        <NovoFinanciamento dados={{ valorPrestacao, credito, rendimento, dividas: divEf, dividasExternas }} />
      </AccordionItem>
      <AccordionItem
        normal
        title="13. DSTI - Debt Service To Income (<=50%)"
        children={<Dsti dados={{ valorPrestacao, dividas: divEf, dividasExternas, rendimento, credito }} />}
      />
      <AccordionItem title="14. Outras despesas regulares (média mensal)" children={<Despesas dados={despesas} />} />
      <AccordionItem
        normal
        title="15. DSTI corrigido (<=70%)"
        children={
          <DstiCorrigido dados={{ valorPrestacao, dividas: divEf, dividasExternas, rendimento, credito, despesas }} />
        }
      />
      <AccordionItem title="16. Limite máximo Aval/Fiança" children={<LimiteAval rendimento={rendimento} />} />
      {temFiadores && (
        <AccordionItem
          title="17. Análise dos fiadores"
          children={
            <AnaliseFiadores
              loading={loading}
              fiadores={fiadores}
              rendimento={rendimento}
              financiamento={{ valor: montante, saldo_divida: montante, valor_prestacao: valorPrestacao }}
            />
          }
        />
      )}
      <AccordionItem
        normal
        title={`${temFiadores ? '18' : '17'}. Parecer`}
        children={<Parecer parecer={ficha?.parecer || ''} />}
        action={
          proposta ? (
            <DefaultAction
              small
              button
              label={parecer ? 'Editar' : 'Adicionar'}
              onClick={() => actionModal({ modal: 'form-parecer' })}
            />
          ) : null
        }
      />
      <AccordionItem
        title={`${temFiadores ? '19' : '18'}. Proposta de Financiamento`}
        children={<Proposta dados={{ valorPrestacao, credito, proposta }} />}
      />

      {ficha?.parecer && (
        <AnexarFicha
          dados={{ valorPrestacao, montante, dividas, divEf, cliente, credito, parecer, fiadores, ...ficha }}
        />
      )}

      {modalIntranet === 'form-parecer' && (
        <FormParecer
          onClose={() => actionModal({})}
          ficha={{ valorPrestacao, cliente, dividas, divEf, credito, liquidacoes, fiadores, ...ficha }}
        />
      )}
      {modalIntranet === 'liquidacao' && (
        <Liquidacoes dividas={dividas} liquidacoes={liquidacoes} onClose={() => actionModal({})} />
      )}
    </Stack>
  );
}
