import { useState, useMemo, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// utils
import { downloadDoc } from '../../../../utils/formatFile';
import { setModal } from '../../../../redux/slices/intranet';
import { useDispatch, useSelector } from '../../../../redux/store';
import { extractClientes, movimentosConta, calcValorPrestacao } from './calculos';
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
import FichaPdf from './ficha-pdf';
import { SearchEntidade } from './procurar';
import FormFicha, { FormParecer } from './form-ficha';
import { DefaultAction } from '../../../../components/Actions';
import SearchNotFound from '../../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function FichaAnalise() {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { fichaInformativa, modalIntranet, isLoading } = useSelector((state) => state.intranet);

  const { entidade = '', titular = '', cliente = '', credito = null } = processo || {};
  const entidades = useMemo(() => entidade?.split(';')?.map((row) => row) || [], [entidade]);
  const valorPrestacao = useMemo(
    () =>
      fichaInformativa?.proposta
        ? calcValorPrestacao({
            componente: credito?.componente,
            taxa: fichaInformativa?.proposta?.taxa_juro,
            montante: fichaInformativa?.proposta?.montante,
            prazo: fichaInformativa?.proposta?.prazo_amortizacao,
          })
        : calcValorPrestacao({
            taxa: credito?.taxa_juro,
            componente: credito?.componente,
            prazo: credito?.prazo_amortizacao,
            montante: credito?.montante_solicitado,
          }),
    [credito, fichaInformativa]
  );

  const actionModal = ({ modal = '' }) => dispatch(setModal({ modal }));

  return (
    <>
      <Stack
        useFlexGap
        spacing={1}
        sx={{ mb: 3 }}
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Ficha de Análise e Parecer
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <DefaultAction
            small
            button
            icon="adicionar"
            label="Info. adicional"
            onClick={() => actionModal({ modal: 'form-ficha' })}
          />
          <SearchEntidade entidades={entidades} />
        </Stack>
      </Stack>
      {isLoading ? (
        <Stack spacing={3}>
          {[...Array(3)].map((z, y) => (
            <Skeleton key={y} variant="text" height={220} sx={{ transform: 'scale(1)' }} />
          ))}
        </Stack>
      ) : (
        <>
          {fichaInformativa?.entidade ? (
            <Ficha
              titular={titular}
              cliente={cliente}
              ficha={fichaInformativa}
              credito={credito || null}
              actionModal={actionModal}
              modalIntranet={modalIntranet}
              valorPrestacao={valorPrestacao}
            />
          ) : (
            <SearchNotFound message="Informação da entidade não encontrada..." />
          )}

          {modalIntranet === 'form-ficha' && (
            <FormFicha credito={credito} ficha={fichaInformativa} onClose={() => actionModal({ modal: '' })} />
          )}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Ficha({ credito, ficha, valorPrestacao, titular, cliente, modalIntranet, actionModal }) {
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
  } = useMemo(() => extractClientes(ficha?.clientes || {}), [ficha?.clientes]);

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
      <BaixarFicha dados={{ valorPrestacao, titular, dividas, cliente, credito, parecer, ...ficha }} />

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

// ---------------------------------------------------------------------------------------------------------------------

export function BaixarFicha({ dados }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [baixar, setBaixar] = useState(false);
  const { cc } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (pdfUrl) {
      setBaixar(false);
      downloadDoc(pdfUrl, `Ficha de Análise e Parecer de Crédito - ${dados?.numero}`);
    }
  }, [setPdfUrl, pdfUrl, dados?.numero]);

  return (
    <Stack justifyContent="center" alignItems="center">
      {baixar ? (
        <PDFDownloadLink
          style={{ textDecoration: 'none' }}
          fileName={`Ficha de Análise e Parecer de Crédito - ${dados?.numero}`}
          document={<FichaPdf dados={{ ...dados, analista: cc?.nome, uo: cc?.uo_label }} />}
        >
          {({ loading, url }) => {
            if (!loading && url) setPdfUrl(url);
            return <DefaultAction button variant="contained" disabled={loading} label="GERANDO PDF..." />;
          }}
        </PDFDownloadLink>
      ) : (
        <DefaultAction button variant="contained" icon="pdf" label="GERAR FICHA" onClick={() => setBaixar(true)} />
      )}
    </Stack>
  );
}
