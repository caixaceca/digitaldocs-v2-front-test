import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/apisUrl';
import { downloadDoc, canPreview } from '../../utils/formatFile';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
//
import { getAccessToken } from './intranet';
import { selectUtilizador, headerOptions, actionGet, doneSucess, hasError } from './sliceActions';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  cursor: '',
  isOpenModal: '',
  isLoadingFile: '',
  isSaving: false,
  isLoading: false,
  isLoadingP: false,
  isLoadingPreview: false,
  processo: null,
  pdfPreview: null,
  filePreview: null,
  selectedItem: null,
  cartoes: [],
  pesquisa: [],
  arquivos: [],
  processos: [],
  objectURLs: [],
  pedidosAcesso: [],
  dadosControle: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    resetProcesso(state) {
      state.processo = null;
      state.filePreview = null;
      state.objectURLs.forEach(URL.revokeObjectURL);
      state.objectURLs = [];
    },

    getListaProcessosSuccess(state, action) {
      const { item, ha_mais: mais, proximo_cursor: proximo, objeto } = action.payload;
      state.cursor = mais && proximo ? proximo : '';
      state[item] = [...state[item], ...(objeto || [])];
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    getProcessoSuccess(state, action) {
      const old = state?.processo ?? null;
      state.processo = { ...old, ...action.payload };
    },

    getCartoesSuccess(state, action) {
      state.cartoes = action.payload?.map((row) => ({ ...row, numero: row?.numero?.substring(9, 15) }));
    },

    addItemProcesso(state, { payload: { item, dados } }) {
      if (!item) return;
      if (!state.processo) state.processo = {};
      state.processo[item] = dados;
    },

    getFileSuccess(state, action) {
      const { url, anexo } = action.payload;
      if (url) state.objectURLs.push(url);
      const index = state.processo.anexos.findIndex(({ item: anexoItem }) => anexoItem === anexo);
      if (index !== -1) state.processo.anexos[index].url = url;
    },

    alterarBalcaopSuccess(state, action) {
      const index = state.cartoes.findIndex(({ id }) => id === action.payload.id);
      if (index !== -1) state.cartoes[index].balcao_entrega = action.payload.balcao;
    },

    deleteAnexoSuccess(state, action) {
      const { id } = action.payload;
      const index = state.processo?.anexos.findIndex(({ id: idA }) => Number(idA) === Number(id));
      if (index !== -1) state.processo.anexos[index].ativo = false;
      if (state?.filePreview?.id === id) state.filePreview = null;
    },

    setModal(state, action) {
      state.isOpenModal = action?.payload?.modal || '';
      state.selectedItem = action?.payload?.dados || null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setModal, getSuccess, resetProcesso, alterarBalcaopSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        (item === 'Por concluir' && `/v1/processos/porconcluir/${perfilId}`) ||
        (item === 'Trabalhados' && `/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`) ||
        (item === 'Entradas' &&
          `/v1/entradas/agencias/intervalo/${params?.uoId}/${perfilId}?diai=${params?.dataInicio}&diaf=${params?.dataFim}`) ||
        (item === 'Devoluções' &&
          `/v2/processos/ht_devolvidos?perfil_cc_id=${perfilId}&uo_id=${params?.uoId}&apartir_de=${params?.dataInicio}&ate=${params?.dataFim}`) ||
        '';
      if (apiUrl) {
        dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: [] }));
        const response = await axios.get(`${BASEURLDD}${apiUrl}`, options);
        dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
      }

      switch (item) {
        case 'Emissão': {
          dispatch(slice.actions.getSuccess({ item: 'cartoes', dados: [] }));
          const response = await axios.get(
            `${BASEURLDD}/v1/cartoes/emitidas?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getCartoesSuccess(response.data));
          break;
        }
        case 'Receção': {
          dispatch(slice.actions.getSuccess({ item: 'cartoes', dados: [] }));
          if (params?.uoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/cartoes/recebidas?balcao=${params?.uoId}&data_inicio=${params?.dataInicio}${
                params?.dataFim ? `&data_final=${params?.dataFim}` : ''
              }`,
              options
            );
            dispatch(slice.actions.getCartoesSuccess(response.data));
          }
          break;
        }
        case 'cartao': {
          const response = await axios.get(`${BASEURLDD}/v1/cartoes/validar/emissoes/detalhe/${params?.id}`, options);
          dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data }));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function getListaProcessos(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.cursor === 0) dispatch(slice.actions.getSuccess({ item: params?.item || item, dados: [] }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const queryParams = new URLSearchParams({
        cursor: params?.cursor ?? 0,
        ...(params?.uo ? { uo_id: params?.uo } : null),
        ...(params?.fluxoId ? { fluxo_id: params?.fluxoId } : null),
        ...(params?.situacao ? { situacao: params?.situacao } : null),
        ...(params?.estadoId ? { estado_id: params?.estadoId } : null),
        ...(params?.perfilId ? { perfil_id: params?.perfilId } : null),
        ...(params?.conta ? { conta: params?.conta } : null),
        ...(params?.cliente ? { cliente: params?.cliente } : null),
        ...(params?.chave ? { search_param: params?.chave } : null),
        ...(params?.entidade ? { entidade: params?.entidade } : null),
        ...(params?.nentrada ? { nentrada: params?.nentrada } : null),
        ...(params?.noperacao ? { noperacao: params?.noperacao } : null),
        ...(params?.fromArquivo ? { em_arquivo: params?.fromArquivo } : null),
        ...(params?.segmento
          ? { segmento: (params?.segmento === 'Particulares' && 'P') || (params?.segmento === 'Empresas' && 'E') }
          : null),
        ...(params?.apartir ? { apartir_de: params?.apartir } : null),
        ...(params?.dataInicio ? { data_inicio: params?.dataInicio } : null),
        ...(params?.dataFim ? { data_final: params?.dataFim } : null),
      });

      const apiPaths = {
        con: `/v1/indicadores/export/con`,
        arquivos: `/v2/arquivos/${perfilId}`,
        pjf: `/v2/processos/historico/pe/financas`,
        Tarefas: `/v2/processos/tarefas/${perfilId}`,
        pedidosAcesso: `/v1/arquivos/pedidos/${perfilId}`,
        Retidos: `/v2/processos/tarefas/retidas/${perfilId}`,
        Agendados: `/v2/processos/tarefas/situacao/${perfilId}`,
        Executados: `/v2/processos/tarefas/situacao/${perfilId}`,
        Pendentes: `/v2/processos/tarefas/pendentes/${perfilId}`,
        Finalizados: `/v2/processos/tarefas/situacao/${perfilId}`,
        pesquisaGlobal: `/v2/processos/pesquisa/base/${perfilId}`,
        Atribuídos: `/v2/processos/tarefas/atribuidas/${perfilId}`,
        pesquisaAvancada: `/v2/processos/pesquisa/especifica/${perfilId}`,
      };

      const apiUrl = apiPaths[item] || '';
      if (!apiUrl) return;

      const response = await axios.get(`${BASEURLDD}${apiUrl}?${queryParams}`, options);
      const dados = item === 'con' || item === 'pedidosAcesso' ? { objeto: response.data } : response.data;
      dispatch(slice.actions.getListaProcessosSuccess({ item: params?.item || item, ...dados }));
      params?.onClose?.();
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function getProcesso(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true });

      const { data } = await axios.get(
        `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${perfilId}`,
        options
      );

      if (!data?.objeto) return;
      const processo = processarProcesso(data.objeto, perfilId, dispatch, '', true);

      const anexoPreview = (processo.anexos || []).find((item) => item?.ativo && canPreview(item));
      if (anexoPreview) {
        const params = { processoId: processo?.id, anexo: { ...anexoPreview, tipoDoc: canPreview(anexoPreview) } };
        dispatch(getAnexo('filePreview', params));
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function getInfoProcesso(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const idPerfilId = `${params?.id}?perfil_cc_id=${perfilId}`;
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      if (item === 'htransicoes') {
        const [htTransicoesRes, htDomiciliosRes] = await Promise.all([
          axios.get(`${BASEURLDD}/v2/processos/ht_transicoes/${idPerfilId}`, options),
          axios.get(`${BASEURLDD}/v2/processos/ht_domicilios/${idPerfilId}`, options),
        ]);

        const htTransicoes = htTransicoesRes?.data?.objeto ?? [];
        const htDomicilios = htDomiciliosRes?.data?.objeto ?? [];

        const transformDomicilio = (row) => ({
          modo: 'Seguimento',
          domiciliacao: true,
          observacao: row?.observacao,
          id: `domiciliacao_${row?.id}`,
          perfil_id: row?.domiciliado_por,
          data_saida: row?.domiciliado_em,
          uo_origem_id: row?.uo_origem_id,
          uo_destino_id: row?.uo_destino_id,
          estado_final: row?.estado_destino,
          estado_inicial: row?.estado_origem,
        });

        const ht = [...htTransicoes, ...htDomicilios.map(transformDomicilio)];
        dispatch(slice.actions.addItemProcesso({ item, dados: applySort(ht, getComparator('desc', 'data_saida')) }));
      } else {
        const apiUrl =
          // DETALHES
          (item === 'hretencoes' && `/v2/processos/ht_retencoes/${idPerfilId}`) ||
          (item === 'hpendencias' && `/v2/processos/ht_pendencias/${idPerfilId}`) ||
          (item === 'hatribuicoes' && `/v2/processos/ht_atribuicoes/${idPerfilId}`) ||
          (item === 'hvisualizacoes' && `/v2/processos/visualizacoes/${perfilId}?processo_id=${params?.id}`) ||
          (item === 'aceitar' && `/v2/processos/aceitar/${perfilId}/${params?.id}?&estado_id=${params?.estadoId}`) ||
          (item === 'destinos' && `/v2/processos/destinos/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`) ||
          (item === 'destinosDesarquivamento' &&
            `/v1/arquivos/destinos/desarquivamento/v2/${perfilId}?processo_id=${params?.id}`) ||
          (item === 'hversoes' &&
            `/v2/processos/historico/versoes?perfil_cc_id=${perfilId}&processo_id=${params?.id}`) ||
          (item === 'confidencialidades' &&
            `/v2/processos/confidencialidades?perfil_cc_id=${perfilId}&processo_id=${params?.id}`) ||
          (item === 'focal-point' &&
            `/v2/processos/definir/dono/${perfilId}?processo_id=${params?.id}&novo_estado_dono_id=${params?.estado?.id}`) ||
          (item === 'resgatar' &&
            `/v2/processos/resgatar/${perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`) ||
          '';

        if (apiUrl) {
          const response = await axios.get(`${BASEURLDD}${apiUrl}`, options);
          if (item === 'resgatar' || item === 'aceitar') {
            processarProcesso(response.data.objeto, perfilId, dispatch, item === 'aceitar' ? params?.estadoId : '');
          } else if (item === 'focal-point') {
            const estado = { estado_id: params?.estado?.id, estado: params?.estado?.label };
            dispatch(slice.actions.addItemProcesso({ item: 'estado', dados: estado }));
          } else dispatch(slice.actions.addItemProcesso({ item, dados: response.data.objeto }));
        }
      }
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function getAnexo(item, params) {
  return async (dispatch, getState) => {
    if (item === 'filePreview') dispatch(slice.actions.getSuccess({ item: 'isLoadingPreview', dados: true }));
    dispatch(slice.actions.getSuccess({ item: 'isLoadingFile', dados: params?.anexo?.anexo }));
    const isPdf = canPreview(params?.anexo) === 'pdf';
    if (isPdf && item !== 'filePreview')
      dispatch(slice.actions.getSuccess({ item: 'pdfPreview', dados: { ...params?.anexo, url: '' } }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      let url = params?.anexo?.url || '';
      if (!url) {
        const response = await axios.get(
          `${BASEURLDD}/v2/processos/anexo/file/${perfilId}?anexo_id=${params?.anexo?.id}&processo_id=${params?.processoId}&da_entidade=${!!params?.anexo?.entidade}`,
          { ...options, responseType: 'arraybuffer' }
        );
        const blob = await new Blob([response.data], { type: params?.anexo?.conteudo });
        url = await URL.createObjectURL(blob);
        const ids = { estadoId: params?.estadoId || '', parecerId: params?.parecerId || '' };
        await dispatch(slice.actions.getFileSuccess({ url, anexo: params?.anexo?.anexo, ...ids }));
      }
      if (item === 'filePreview')
        dispatch(slice.actions.getSuccess({ item: 'filePreview', dados: { ...params?.anexo, url } }));
      else if (isPdf) dispatch(slice.actions.getSuccess({ item: 'pdfPreview', dados: { ...params?.anexo, url } }));
      else downloadDoc(url, params?.anexo?.nome);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      if (item === 'filePreview') dispatch(slice.actions.getSuccess({ item: 'isLoadingPreview', dados: false }));
      dispatch(slice.actions.getSuccess({ item: 'isLoadingFile', dados: '' }));
    }
  };
}

// ----------------------------------------------------------------------

export function createProcesso(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: true });
      const response = await axios.post(
        `${BASEURLDD}/v2/processos/${params?.ex ? 'externo' : 'interno'}/${perfilId}`,
        dados,
        options
      );

      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
      dispatch(slice.actions.getSuccess({ item: 'processo', dados: response?.data?.objeto }));
      if (params?.garantias)
        dispatch(createItem('garantias', params?.garantias, { processoId: response?.data?.objeto?.id }));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      params?.onClose?.();
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { perfilId } = selectUtilizador(getState()?.intranet || {});
      const apiUrl =
        (item === 'garantias' && `${BASEURLDD}/v2/processos/garantias/${perfilId}?processo_id=${params?.processoId}`) ||
        '';
      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });
        const response = await axios.post(apiUrl, dados, options);
        if (item === 'garantias')
          dispatch(slice.actions.addItemProcesso({ item: 'credito', dados: response.data.objeto.credito || null }));
      }
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: !!params?.mfd });

      if (params?.anexos) {
        const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: true });
        const url = `/v2/processos/adicionar/anexo/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`;
        await axios.patch(`${BASEURLDD}${url}`, params?.anexos, options);
      }

      const apiUrl =
        // DETALHES
        (item === 'confirmar emissao multiplo' && `/v1/cartoes/validar/emissoes`) ||
        (item === 'arquivar' && `/v2/processos/arquivar/${perfilId}/${params?.id}`) ||
        (item === 'finalizar' && `/v2/processos/finalizar/${perfilId}/${params?.id}`) ||
        (item === 'confirmar emissao por data' && `/v1/cartoes/validar/todas/emissoes`) ||
        (item === 'desarquivar' && `/v2/processos/desarquivar/${perfilId}/${params?.id}`) ||
        (item === 'alterar balcao' && `/v1/cartoes/alterar/balcao/entrega/${params?.id}`) ||
        (item === 'pendencia' && `/v2/processos/pender/${perfilId}?processo_id=${params?.id}`) ||
        (item === 'domiciliar' && `/v2/processos/domiciliar/${perfilId}?processo_id=${params?.id}`) ||
        (item === 'confirmar rececao multiplo' && `/v1/cartoes/validar/rececoes?balcao=${params?.balcao}`) ||
        (item === 'anular multiplo' && `/v1/cartoes/anular/validacao/listagem?emissao=${params?.emissao}`) ||
        (item === 'confirmar emissao por data' && `/v1/cartoes/validar/todas/rececoes?balcao=${params?.balcao}`) ||
        (item === 'anular por balcao e data' && `/v1/cartoes/anular/validacao/todas?emissao=${params?.emissao}`) ||
        (item === 'parecer individual' &&
          `/v2/processos/parecer/individual/${perfilId}/${params?.processoId}/${params?.id}`) ||
        (item === 'parecer estado' &&
          `/v2/processos/parecer/estado/paralelo/${perfilId}?processo_id=${params?.processoId}`) ||
        (item === 'situacaoCredito' &&
          `/v2/processos/${params?.id}/operacoes_credito/${perfilId}?credito_id=${params?.creditoId}`) ||
        (item === 'encaminhar serie' &&
          `/v2/processos/encaminhar/serie/${perfilId}/${params?.id}?estado_origem_id=${params?.estadoId}`) ||
        (item === 'libertar' &&
          `/v2/processos/abandonar/${params?.perfilId}?processo_id=${params?.id}&estado_id=${params?.estadoId}`) ||
        (item === 'confidencialidade' &&
          `/v2/processos/confidencia/${perfilId}?processo_id=${params?.processoId}&confidencia_id=${params?.id}`) ||
        (item === 'cancelar' &&
          `/v2/processos/fechar/envio/paralelo/${perfilId}?processo_id=${params?.id}&cancelamento=${params?.fechar ? 'false' : 'true'}`) ||
        (item === 'encaminhar paralelo' &&
          `/v2/processos/encaminhar/paralelo/${perfilId}/${params?.id}?estado_origem_id=${params?.estadoId}&estado_dono_id=${params?.dono}`) ||
        (item === 'garantias' &&
          `/v2/processos/garantias/${perfilId}?processo_id=${params?.processoId}&credito_id=${params?.creditoId}&garantia_id=${params?.id}`) ||
        (item === 'atribuir' &&
          `/v2/processos/atribuicao/${perfilId}?perfil_afeto_id=${params?.id}&processo_id=${params?.processoId}&estado_id=${params?.estadoId}`) ||
        '';

      if (apiUrl) {
        const response = await axios.patch(`${BASEURLDD}${apiUrl}`, dados, options);
        if (params?.fillCredito)
          dispatch(slice.actions.addItemProcesso({ item: 'credito', dados: response.data.objeto.credito || null }));
      }
      if (item === 'processo') {
        const response = await axios.put(`${BASEURLDD}/v2/processos/ei/${perfilId}/${params?.id}`, dados, options);
        if (params?.garantias) dispatch(createItem('garantias', params?.garantias, { processoId: params?.id }));
        processarProcesso(response.data.objeto, perfilId, dispatch, '', false);
      }
      if (item === 'adicionar-anexos') {
        const { data } = await axios.get(
          `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${perfilId}`,
          options
        );
        processarProcesso(data.objeto, perfilId, dispatch, '', false);
      }
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { perfilId } = selectUtilizador(getState()?.intranet || {});

      const apiUrl =
        (item === 'garantias' &&
          `/v2/processos/garantias/${perfilId}?processo_id=${params?.processoId}&credito_id=${params?.creditoId}&garantia_id=${params?.id}`) ||
        (item === 'processo' &&
          `/v2/processos/marcar/desmarcar/duplicacao?perfil_id=${perfilId}&processo_id=${params?.id}&estado_id=${params?.estadoId}&duplicado=${params?.duplicado}`) ||
        (item === 'anexo' &&
          `/v2/processos/remover/anexo/${perfilId}?processo_id=${params?.processoId}&estado_id=${params?.estadoId}&anexo_id=${params?.id}&parecer_individual=${!!params?.individual}&da_entidade=${!!params?.entidade}`) ||
        '';

      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.delete(`${BASEURLDD}${apiUrl}`, options);
        if (item === 'anexo') dispatch(slice.actions.deleteAnexoSuccess({ ...params, perfilId }));
        if (item === 'garantias')
          dispatch(slice.actions.addItemProcesso({ item: 'credito', dados: response.data.objeto.credito || null }));
      }
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

function processarProcesso(processo, perfilId, dispatch, aceitar, ht) {
  const { estados = [], anexos_entidades: anexosEnt = [], anexos = [] } = processo;
  const { estado_dono_paralelo_id: donoId, estado_dono_paralelo: donoLabel } = processo;
  const { id, status = '', duplicado = false, data_duplicacao: dataDup = '', cc_duplicacao: ccDup = '' } = processo;

  const preso = estados?.find(({ preso, perfil_id: pid }) => preso && pid === perfilId)?.estado_id || '';

  if (status === 'A') processo.estado = { estado: 'Arquivo', duplicado, dataDup, ccDup };
  else if (donoId && donoLabel) processo.estado = { estado: donoLabel, estado_id: donoId, duplicado, dataDup, ccDup };
  else if (estados.length === 1) {
    processo.estado = {
      ...(estados?.[0] ?? null),
      ...{ duplicado, dataDup, ccDup },
      atribuidoAMim: estados?.[0]?.perfil_id === perfilId,
    };
    processo.pareceres_estado = estados[0]?.pareceres?.length ? estados[0].pareceres : [];
    processo.estados = [];
  }

  processo.estadoPreso = preso;

  const anexosEnts = anexosEntidades(anexosEnt);
  processo.anexos = [...anexos, ...anexosEnts];
  dispatch(slice.actions.getProcessoSuccess(processo));
  dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: false }));

  if (aceitar || preso) dispatch(getInfoProcesso('destinos', { id, estadoId: aceitar || preso }));
  if (ht) dispatch(getInfoProcesso('htransicoes', { id }));

  return processo;
}

function anexosEntidades(data) {
  const listagem = [];
  data?.forEach((entidade) => entidade?.anexos.forEach((anexo) => listagem.push(anexo)));
  return listagem;
}
