// @mui
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
// redux
import { useSelector } from '../../redux/store';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import { SearchNotFound404 } from '../../components/table';
import { SkeletonProcesso } from '../../components/skeleton';
//
import Anexos from './Anexos';
import NotaProcesso from './NotaProcesso';
import DetalhesProcesso from './DetalhesProcesso';

// ----------------------------------------------------------------------

export default function DadosGerais() {
  const { isLoadingP, processo } = useSelector((state) => state.digitaldocs);
  // const processo = {
  //   id: 0,
  //   numero_entrada: 10,
  //   titular: 'string',
  //   referencia: 'string',
  //   entidade: 'string',
  //   segmento: 'string',
  //   cliente: 'string',
  //   conta: 'string',
  //   doc_idp: 'string',
  //   tipo_doc_idp: 'string',
  //   doc_ids: 'string',
  //   tipo_doc_ids: 'string',
  //   valor: 10,
  //   saldo_cativo: 10,
  //   operacao: 'string',
  //   numero_operacao: 'string',
  //   observacao: 'string',
  //   uo_origem_id: 0,
  //   fluxo_id: 0,
  //   assunto: 'string',
  //   estado_atual_id: 0,
  //   estado_atual: 'string',
  //   preso: true,
  //   perfil_id: 0,
  //   criado_em: '2024-03-06T18:18:29.675Z',
  //   canal: 'string',
  //   criador: 'string',
  //   nota: 'string',
  //   status: 'string',
  //   validado: true,
  //   agendado: true,
  //   periodicidade: 'string',
  //   dia_mes: 0,
  //   data_arquivamento: '2024-03-06T18:18:29.675Z',
  //   data_ultima_transicao: '2024-03-06T18:18:29.675Z',
  //   cor: 'string',
  //   pendente: true,
  //   em_paralelo: false,
  //   motivo_pendencia_id: 0,
  //   motivo: 'string',
  //   observacao_motivo_pendencia: 'string',
  //   email: 'string',
  //   data_entrada: '2024-03-06T18:18:29.675Z',
  //   origem_id: 0,
  //   designacao_origem: 'string',
  //   seguimento_origem: 'string',
  //   tipo_origem: 'string',
  //   anexos: [
  //     {
  //       id: 0,
  //       nome: 'string',
  //       anexo: 'string',
  //       conteudo: 'string',
  //       ativo: true,
  //       criador: 'string',
  //       criado_em: '2024-03-06T18:18:29.675Z',
  //     },
  //   ],
  //   cativos: [
  //     {
  //       id: 0,
  //       conta: 'string',
  //       saldo: 0,
  //       saldo_cve: 0,
  //       moeda: 'string',
  //       enviado_banka: true,
  //       executado: true,
  //       cativador: 'string',
  //       data_cativo: '2024-03-06',
  //     },
  //   ],
  //   pareceres_estado: [
  //     {
  //       id: 0,
  //       estado_id: 0,
  //       nome: 'string',
  //       perfil_id: 0,
  //       data_limite: '2024-03-06T18:18:29.675Z',
  //       parecer: 'string',
  //       data_parecer: '2024-03-06T18:18:29.675Z',
  //       parecer_obs: 'string',
  //       validado: true,
  //       criado_em: '2024-03-06T18:18:29.675Z',
  //       anexos: [
  //         {
  //           id: 0,
  //           nome: 'string',
  //           anexo: 'string',
  //           conteudo: 'string',
  //           ativo: true,
  //           criador: 'string',
  //           criado_em: '2024-03-06T18:18:29.675Z',
  //           parecer_id: 0,
  //         },
  //       ],
  //     },
  //   ],
  //   credito: {
  //     id: 0,
  //     segmento: 'string',
  //     linha_id: 0,
  //     linha: 'string',
  //     numero: 0,
  //     setor_atividade: 'string',
  //     montante_solicitado: 10,
  //     finalidade: 'string',
  //     situacao_final_mes: 'string',
  //     nproposta: 'string',
  //     data_aprovacao: '2024-03-06T18:18:29.675Z',
  //     montante_aprovado: 10,
  //     data_contratacao: '2024-03-06T18:18:29.675Z',
  //     montante_contratado: 10,
  //     prazo_amortizacao: 'string',
  //     taxa_juro: 'string',
  //     escalao_decisao: 'string',
  //     descricao: 'string',
  //     garantia: 'string',
  //     data_indeferido: '2024-03-06T18:18:29.675Z',
  //     data_desistido: '2024-03-06T18:18:29.675Z',
  //     valor_divida: 10,
  //   },
  //   con: {
  //     id: 0,
  //     titular_ordenador: true,
  //     ordenador: 'string',
  //     estado_civil: 'string',
  //     data_nascimento: '2024-03-06T18:18:29.675Z',
  //     pai: 'string',
  //     mae: 'string',
  //     local_pais_nascimento: 'string',
  //     nacionalidade: 'string',
  //     tipo_docid: 'string',
  //     docid: 'string',
  //     nif: 'string',
  //     profissao: 'string',
  //     residente: true,
  //     morada: 'string',
  //     local_trabalho: 'string',
  //     telefone: 'string',
  //     telemovel: 'string',
  //     email: 'string',
  //     origem_fundo: 'string',
  //     finalidade: 'string',
  //     entidade_con: 0,
  //   },
  //   estados: [
  //     {
  //       id: 0,
  //       processo_id: 0,
  //       estado_id: 0,
  //       estado: 'string',
  //       perfil_id: 0,
  //       data_entrada: '2024-03-06T18:18:29.675Z',
  //       data_saida: '2024-03-06T18:18:29.675Z',
  //       parecer_favoravel: true,
  //       parecer_em: '2024-03-06T18:18:29.675Z',
  //       parecer_data_limite: '2024-03-06T18:18:29.675Z',
  //       pareceres: [
  //         {
  //           id: 0,
  //           processo_estado_id: 0,
  //           perfil_id: 0,
  //           parecer_favoravel: true,
  //           parecer_em: '2024-03-06T18:18:29.675Z',
  //           validado: true,
  //           validado_em: '2024-03-06T18:18:29.675Z',
  //           descritivo: 'string',
  //         },
  //       ],
  //       is_lock: true,
  //     },
  //   ],
  // };
  const hasAnexos = processo?.anexos && processo?.anexos?.length > 0;
  const devolvido = processo?.htransicoes?.[0]?.modo === 'Devolução';
  const isPS =
    processo?.assunto === 'Diário' ||
    processo?.assunto === 'Preçário' ||
    processo?.assunto === 'Produtos e Serviços' ||
    processo?.assunto === 'Receção de Cartões - DOP';

  return (
    <CardContent sx={{ pt: 1 }}>
      {isLoadingP ? (
        <SkeletonProcesso />
      ) : (
        <>
          {processo ? (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={hasAnexos && 5}>
                <Grid id="detalhes">
                  {devolvido && <NotaProcesso motivo={processo?.htransicoes?.[0]?.observacao} />}
                  {!isPS && processo?.nota && <NotaProcesso nota={processo?.nota} segmento={processo?.segmento} />}
                  <DetalhesProcesso isPS={isPS} processo={processo} />
                </Grid>
              </Grid>
              {hasAnexos && (
                <Grid item xs={12} lg={7}>
                  <Anexos anexos={applySort(processo?.anexos, getComparator('asc', 'id'))} />
                </Grid>
              )}
            </Grid>
          ) : (
            <SearchNotFound404 message="Processo não encontrado ou não tens acesso..." noShadow />
          )}
        </>
      )}
    </CardContent>
  );
}
