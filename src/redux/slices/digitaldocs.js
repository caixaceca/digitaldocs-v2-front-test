import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
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
  isLoadingFile: '',
  isSaving: false,
  isLoading: false,
  isLoadingP: false,
  isOpenModal: false,
  isOpenModal1: false,
  isLoadingPreview: false,
  processo: null,
  filePreview: null,
  selectedItem: null,
  processosInfo: null,
  selectedAnexoId: null,
  indicadoresArquivo: null,
  pedidos: [],
  cartoes: [],
  pesquisa: [],
  arquivos: [],
  processos: [],
  objectURLs: [],
  dadosControle: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    resetProcesso(state) {
      state.objectURLs = [];
      state.processo = null;
      state.filePreview = null;
      state.objectURLs.forEach(URL.revokeObjectURL);
    },

    getListaProcessosSuccess(state, action) {
      const { item, ha_mais: mais, proximo_cursor: proximo, objeto: dados } = action.payload;
      state.processosInfo = mais && proximo ? proximo : null;
      state[item] = [...state[item], ...(dados || [])];
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    getArquivosSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.arquivos = [...state.arquivos, ...action.payload.objeto];
    },

    getCartoesSuccess(state, action) {
      state.cartoes = action.payload?.map((row) => ({ ...row, numero: row?.numero?.substring(9, 15) }));
    },

    getPesquisaSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.pesquisa = [...state.pesquisa, ...action.payload.objeto];
    },

    addItemProcesso(state, { payload: { item, dados } }) {
      if (!item) return;
      state.processo[item] = dados;
    },

    resgatarSuccess(state, action) {
      state.processo.preso = true;
      state.processo.perfil_id = action.payload.perfil_id;
      state.processo.estado_atual = action.payload.estado_atual;
      state.processo.estado_atual_id = action.payload.estado_atual_id;
      state.processo.data_ultima_transicao = action.payload.data_ultima_transicao;
      state.processo.estado_processo = {
        _lock: true,
        perfil_id: action.payload.perfil_id,
        estado: action.payload.estado_atual,
        estado_id: action.payload.estado_atual_id,
        data_entrada: action.payload.data_ultima_transicao,
      };
      state.isLoadingP = false;
    },

    getFileSuccess(state, action) {
      const { url, parecerId, transicaoId, anexo } = action.payload;
      if (url) state.objectURLs.push(url);
      if (!state.processo) return;

      const updateNestedAnexo = (container, transicaoId, parecerId, anexoValue, url) => {
        const transicaoIndex = container.findIndex((item) => item.id === transicaoId);
        if (transicaoIndex === -1) return;

        const { pareceres } = container[transicaoIndex];
        if (!Array.isArray(pareceres)) return;

        const parecerIndex = pareceres.findIndex((item) => item.id === parecerId);
        if (parecerIndex === -1) return;

        const { anexos } = pareceres[parecerIndex];
        if (!Array.isArray(anexos)) return;

        const anexoIndex = anexos.findIndex((item) => item.anexo === anexoValue);
        if (anexoIndex !== -1) anexos[anexoIndex].url = url;
      };

      const updateDirectAnexo = (container, transicaoId, anexoValue, url) => {
        const transicaoIndex = container.findIndex((item) => item.id === transicaoId);
        if (transicaoIndex === -1) return;

        const { anexos } = container[transicaoIndex];
        if (!Array.isArray(anexos)) return;

        const anexoIndex = anexos.findIndex((item) => item.anexo === anexoValue);
        if (anexoIndex !== -1) anexos[anexoIndex].url = url;
      };

      if (transicaoId && parecerId) {
        if (Array.isArray(state.processo.estados))
          updateNestedAnexo(state.processo.estados, transicaoId, parecerId, anexo, url);

        if (Array.isArray(state.processo.htransicoes))
          updateNestedAnexo(state.processo.htransicoes, transicaoId, parecerId, anexo, url);

        if (state.processo.estado_processo && Array.isArray(state.processo.estado_processo.pareceres)) {
          const parecerIndex = state.processo.estado_processo.pareceres.findIndex((item) => item.id === parecerId);
          if (parecerIndex !== -1) {
            const { anexos } = state.processo.estado_processo.pareceres[parecerIndex];
            if (Array.isArray(anexos)) {
              const anexoIndex = anexos.findIndex((item) => item.anexo === anexo);
              if (anexoIndex !== -1) anexos[anexoIndex].url = url;
            }
          }
        }
      } else if (transicaoId) {
        if (Array.isArray(state.processo.htransicoes))
          updateDirectAnexo(state.processo.htransicoes, transicaoId, anexo, url);

        if (Array.isArray(state.processo.estados)) updateDirectAnexo(state.processo.estados, transicaoId, anexo, url);
      } else if (Array.isArray(state.processo.anexos)) {
        const index = state.processo.anexos.findIndex((item) => item.anexo === anexo);
        if (index !== -1) state.processo.anexos[index].url = url;
      }
    },

    aceitarSuccess(state, action) {
      if (action.payload.modo === 'serie') {
        state.processo.estado_processo._lock = true;
        state.processo.estado_processo.perfil_id = action.payload.perfilId;
      } else {
        const index = state.processo.estados.findIndex((row) => row.estado_id === action.payload.estadoId);
        if (index !== -1) {
          state.processo.estados[index]._lock = true;
          state.processo.estados[index].perfil_id = action.payload.perfilId;
        }
      }
    },

    alterarBalcaopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      if (index !== -1) state.cartoes[index].balcao_entrega = action.payload.balcao;
    },

    deleteAnexoSuccess(state, action) {
      const { processo: isProcesso, individual, estadoId, parecerId, anexo } = action.payload;

      const updateAnexoStatus = (anexosArray) => {
        if (!Array.isArray(anexosArray)) return;
        const index = anexosArray.findIndex((item) => item.anexo === anexo);
        if (index !== -1) anexosArray[index].ativo = false;
      };

      if (isProcesso) {
        updateAnexoStatus(state.processo?.anexos);
      } else if (individual === 'true') {
        const estado = state.processo?.estados?.find((item) => item.id === estadoId);
        if (estado && Array.isArray(estado.pareceres)) {
          const parecer = estado.pareceres.find((item) => item.id === parecerId);
          if (parecer) updateAnexoStatus(parecer.anexos);
        }
        updateAnexoStatus(state.selectedItem?.anexos);
      } else {
        const estado = state.processo?.estados?.find((item) => item.id === estadoId);
        if (estado) updateAnexoStatus(estado.anexos);
        updateAnexoStatus(state.selectedItem?.anexos);
      }

      state.selectedAnexoId = null;
    },

    selectItem(state, action) {
      state.isOpenModal = true;
      state.selectedItem = action.payload;
    },

    selectParecer(state, action) {
      state.isOpenModal1 = true;
      state.selectedItem = action.payload;
    },

    openModal(state) {
      state.isOpenModal = true;
      state.selectedItem = null;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenModal1 = false;
      state.selectedItem = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, getSuccess, closeModal, selectItem, selectParecer, resetProcesso, alterarBalcaopSuccess } =
  slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    if (item !== 'indicadores arquivos') dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      switch (item) {
        case 'Entradas': {
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', tipo: [] }));
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/agencias/intervalo/${params?.uoId}/${perfilId}?diai=${params?.dataInicio}&diaf=${params?.dataFim}`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Devoluções': {
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: [] }));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_devolvidos?perfil_cc_id=${perfilId}&uo_id=${params?.uoId}&apartir_de=${params?.dataInicio}&ate=${params?.dataFim}`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Por concluir': {
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: [] }));
          const response = await axios.get(`${BASEURLDD}/v1/processos/porconcluir/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Trabalhados': {
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: [] }));
          if (params?.uoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          }
          break;
        }
        case 'arquivos': {
          const response = await axios.get(
            `${BASEURLDD}/v2/arquivos/${perfilId}?apartir_de=${params?.data}&pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'pedidosAcesso': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/pedidos/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'pedidos', dados: response.data }));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'indicadoresArquivo', dados: response.data }));
          break;
        }
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
        ...(params?.estadoId ? { estado_id: params?.estadoId } : null),
        ...(params?.fluxoId ? { fluxo_id: params?.fluxoId } : null),
        ...(params?.perfilId ? { perfil_id: params?.perfilId } : null),
        ...(params?.situacao ? { situacao: params?.situacao } : null),
        ...(params?.fromArquivo ? { em_arquivo: params?.fromArquivo } : null),
        ...(params?.chave ? { search_param: params?.chave } : null),
        ...(params?.conta ? { conta: params?.conta } : null),
        ...(params?.cliente ? { cliente: params?.cliente } : null),
        ...(params?.entidade ? { entidade: params?.entidade } : null),
        ...(params?.noperacao ? { noperacao: params?.noperacao } : null),
        ...(params?.nentrada ? { nentrada: params?.nentrada } : null),
        ...(params?.uo ? { uo_id: params?.uo } : null),
        ...(params?.segmento
          ? { segmento: (params?.segmento === 'Particulares' && 'P') || (params?.segmento === 'Empresas' && 'E') }
          : null),
        ...(params?.dataInicio ? { data_inicio: params?.dataInicio } : null),
        ...(params?.dataFim ? { data_final: params?.dataFim } : null),
      });

      const apiPaths = {
        con: `/v1/indicadores/export/con`,
        pjf: `/v2/processos/historico/pe/financas`,
        Tarefas: `/v2/processos/tarefas/${perfilId}`,
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
      if (item === 'con')
        dispatch(slice.actions.getListaProcessosSuccess({ item: 'dadosControle', objeto: response.data }));
      else dispatch(slice.actions.getListaProcessosSuccess({ item: params?.item || item, ...response.data }));
      params?.afterSuccess?.();
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
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const response = await axios.get(
        `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${perfilId}`,
        options
      );
      if (!response.data?.objeto) return;
      const processo = response.data?.objeto;

      if (processo?.estados?.length === 0) {
        processo.estado_processo = {
          _lock: processo?.preso,
          perfil_id: processo?.perfil_id,
          estado: processo?.estado_atual,
          estado_id: processo?.estado_atual_id,
          data_entrada: processo?.data_ultima_transicao,
        };
      } else if (processo?.estados?.length === 1 && processo?.pareceres_estado?.length === 0) {
        processo.estado_processo = processo.estados[0];
        if (processo.estados[0]?.pareceres?.length > 0) processo.pareceres_estado = processo.estados[0].pareceres;
        processo.estados = [];
      } else if (processo?.estados?.length > 1) {
        processo.estado_processo = processo.estados.find((row) => row?.estado_id === processo.estado_atual_id);
        processo.estados = processo.estados.filter((row) => row?.estado_id !== processo.estado_atual_id);
      }
      const estado = processo?.estado_processo || null;
      processo.perfilAtribuido = estado?.perfil_id || '';
      processo.atribuidoAMim = estado?.perfil_id === perfilId;
      dispatch(slice.actions.getSuccess({ item: 'processo', dados: processo }));

      const anexoPreview = (processo?.anexos || []).filter((item) => item?.ativo).find((row) => !!canPreview(row));
      if (anexoPreview) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch(getAnexo('filePreview', { anexo: { ...anexoPreview, tipo: canPreview(anexoPreview) } }));
      }
      dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: false }));

      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(getInfoProcesso('htransicoes', { id: processo.id }));

      if (estado?._lock && estado?.estado_id && processo?.atribuidoAMim) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        dispatch(getInfoProcesso('destinos', { id: processo?.id, estadoId: estado?.estado_id }));
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
          (item === 'hretencoes' && `${BASEURLDD}/v2/processos/ht_retencoes/${idPerfilId}`) ||
          (item === 'hpendencias' && `${BASEURLDD}/v2/processos/ht_pendencias/${idPerfilId}`) ||
          (item === 'hatribuicoes' && `${BASEURLDD}/v2/processos/ht_atribuicoes/${idPerfilId}`) ||
          (item === 'hversoes' && `${BASEURLDD}/v1/processos/versoes/${perfilId}?processoID=${params?.id}`) ||
          (item === 'hvisualizacoes' &&
            `${BASEURLDD}/v2/processos/visualizacoes/${perfilId}?processo_id=${params?.id}`) ||
          (item === 'destinosDesarquivamento' &&
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/v2/${perfilId}?processo_id=${params?.id}`) ||
          (item === 'destinos' &&
            `${BASEURLDD}/v2/processos/destinos/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`) ||
          (item === 'confidencialidades' &&
            `${BASEURLDD}/v2/processos/confidencialidades?perfil_cc_id=${perfilId}&processo_id=${params?.id}`) ||
          '';

        if (apiUrl) {
          const response = await axios.get(apiUrl, options);
          dispatch(slice.actions.addItemProcesso({ item, dados: response.data.objeto }));
        }
      }
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

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      let url = params?.anexo?.url || '';
      if (!url) {
        const response = await axios.get(
          `${BASEURLDD}/v2/processos/anexo/file/${perfilId}?anexo=${params?.anexo?.anexo}`,
          { ...options, responseType: 'arraybuffer' }
        );
        const blob = await new Blob([response.data], { type: params?.anexo?.conteudo });
        url = await URL.createObjectURL(blob);
        await dispatch(
          slice.actions.getFileSuccess({
            url,
            anexo: params?.anexo?.anexo,
            parecerId: params?.parecerId || '',
            transicaoId: params?.transicaoId || '',
          })
        );
      }
      if (item === 'filePreview')
        await dispatch(slice.actions.getSuccess({ item: 'filePreview', dados: { ...params?.anexo, url } }));
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
      const response = await axios.post(`${BASEURLDD}/v2/processos/${item}/${perfilId}`, dados, options);
      dispatch(slice.actions.getSuccess({ item: 'processo', dados: response?.data?.objeto }));
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
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: params?.mfd });

      if (params?.anexos?.get('anexos')) {
        await axios.patch(
          `${BASEURLDD}/v2/processos/adicionar/anexo/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`,
          params?.anexos,
          options
        );
      }

      const apiUrl =
        // DETALHES
        (item === 'confirmar emissao multiplo' && `${BASEURLDD}/v1/cartoes/validar/emissoes`) ||
        (item === 'arquivar' && `${BASEURLDD}/v2/processos/arquivar/${perfilId}/${params?.id}`) ||
        (item === 'finalizar' && `${BASEURLDD}/v2/processos/finalizar/${perfilId}/${params?.id}`) ||
        (item === 'confirmar emissao por data' && `${BASEURLDD}/v1/cartoes/validar/todas/emissoes`) ||
        (item === 'desarquivar' && `${BASEURLDD}/v2/processos/desarquivar/${perfilId}/${params?.id}`) ||
        (item === 'alterar balcao' && `${BASEURLDD}/v1/cartoes/alterar/balcao/entrega/${params?.id}`) ||
        (item === 'encaminhar serie' && `${BASEURLDD}/v2/processos/encaminhar/serie/${perfilId}/${params?.id}`) ||
        (item === 'domiciliar' && `${BASEURLDD}/v2/processos/domiciliar/${perfilId}?processo_id=${params?.id}`) ||
        (item === 'encaminhar paralelo' && `${BASEURLDD}/v2/processos/encaminhar/paralelo/${perfilId}/${params?.id}`) ||
        (item === 'confirmar rececao multiplo' &&
          `${BASEURLDD}/v1/cartoes/validar/rececoes?balcao=${params?.balcao}`) ||
        (item === 'confirmar emissao por data' &&
          `${BASEURLDD}/v1/cartoes/validar/todas/rececoes?balcao=${params?.balcao}`) ||
        (item === 'anular por balcao e data' &&
          `${BASEURLDD}/v1/cartoes/anular/validacao/todas?emissao=${params?.emissao}`) ||
        (item === 'anular multiplo' &&
          `${BASEURLDD}/v1/cartoes/anular/validacao/listagem?emissao=${params?.emissao}`) ||
        (item === 'parecer individual' &&
          `${BASEURLDD}/v2/processos/parecer/individual/${perfilId}/${params?.processoId}/${params?.id}`) ||
        (item === 'parecer estado' &&
          `${BASEURLDD}/v2/processos/parecer/estado/paralelo/${perfilId}?processo_id=${params?.processoId}`) ||
        (item === 'confidencialidade' &&
          `${BASEURLDD}/v2/processos/confidencia/${perfilId}?processo_id=${params?.processoId}&confidencia_id=${params?.id}`) ||
        (item === 'libertar' &&
          `${BASEURLDD}/v2/processos/abandonar/${perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`) ||
        (item === 'cancelar' &&
          `${BASEURLDD}/v2/processos/fechar/envio/paralelo/${perfilId}?processo_id=${params?.id}&cancelamento=${params?.fechar ? 'false' : 'true'}`) ||
        (item === 'anexo' &&
          `${BASEURLDD}/v2/processos/remover/anexo/${perfilId}?processo_id=${params?.processoId}&anexo=${params?.anexo}&parecer_individual=${!!params?.individual}`) ||
        (item === 'atribuir' &&
          `${BASEURLDD}/v2/processos/atribuicao/mista/${perfilId}?perfil_afeto_id=${params?.id}&processo_id=${params?.processoId}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`) ||
        '';

      if (apiUrl) {
        await axios.patch(apiUrl, dados, options);
        if (item === 'anexo') dispatch(slice.actions.deleteAnexoSuccess({ ...params, perfilId }));
      } else {
        switch (item) {
          case 'processo': {
            await axios.put(`${BASEURLDD}/v2/processos/ei/${perfilId}/${params?.id}`, dados, options);
            break;
          }
          case 'aceitar': {
            await axios.patch(
              `${BASEURLDD}/v2/processos/aceitar/${perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              null,
              options
            );
            dispatch(slice.actions.aceitarSuccess({ ...params, perfilId }));
            if (params?.modo === 'serie') {
              dispatch(slice.actions.addItemProcesso({ item: 'atribuidoAMim', dados: true }));
              dispatch(getInfoProcesso('destinos', { id: params?.id, estadoId: params?.estadoId }));
            }
            break;
          }
          case 'resgatar': {
            const response = await axios.get(
              `${BASEURLDD}/v2/processos/resgatar/${perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.resgatarSuccess(response.data?.objeto));
            break;
          }
          case 'pendencia': {
            await axios.patch(
              `${BASEURLDD}/v2/processos/pender/misto/${perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}`,
              dados,
              options
            );
            break;
          }

          default:
            break;
        }
      }
      params?.afterSuccess?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
