import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { downloadDoc } from '../../utils/formatFile';
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
  con: [],
  pjf: [],
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
      state.processosInfo = null;
      state.objectURLs.forEach(URL.revokeObjectURL);
    },

    getProcessosSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.processos = [...state.processos, ...action.payload.objeto];
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

    getPjfSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.pjf = [...state.pjf, ...action.payload.objeto];
    },

    getProcessoSuccess(state, action) {
      if (!action.payload) return;

      if (action.payload?.estados?.length === 0) {
        action.payload.estado_processo = {
          _lock: action.payload?.preso,
          perfil_id: action.payload?.perfil_id,
          estado: action.payload?.estado_atual,
          estado_id: action.payload?.estado_atual_id,
          data_entrada: action.payload?.data_ultima_transicao,
        };
      } else if (action.payload?.estados?.length === 1 && action.payload?.pareceres_estado?.length === 0) {
        action.payload.estado_processo = action.payload?.estados[0];
        if (action.payload?.estados[0]?.pareceres?.length > 0) {
          action.payload.pareceres_estado = action.payload?.estados[0]?.pareceres;
        }
        action.payload.estados = [];
      } else if (action.payload?.estados?.length > 1) {
        action.payload.estado_processo = action.payload.estados?.find(
          (row) => row?.estado_id === action.payload.estado_atual_id
        );
        action.payload.estados = action.payload.estados?.filter(
          (row) => row?.estado_id !== action.payload.estado_atual_id
        );
      }
      state.processo = action.payload;
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
        state.processo.estados[index]._lock = true;
        state.processo.estados[index].perfil_id = action.payload.perfilId;
      }
    },

    confirmarCartaoDopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      if (index !== -1) {
        state.cartoes[index].confirmacao_dop = true;
        state.cartoes[index].confirmado_por_dop = action.payload.perfilId;
        state.cartoes[index].data_confirmacao_dop = format(new Date(), 'yyyy-MM-dd');
      }
    },

    alterarBalcaopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      if (index !== -1) {
        state.cartoes[index].balcao_entrega = action.payload.balcao;
      }
    },

    restaurarSuccess(state, action) {
      state.selectedAnexoId = null;
      state.processo.historico = false;
      state.pesquisa = state.pesquisa.filter((row) => Number(row.id) !== Number(action.payload));
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
      state.selectedItem = null;
      state.isOpenModal = true;
    },

    openDetalhes(state) {
      state.isOpenModal1 = true;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenModal1 = false;
      state.selectedItem = null;
    },

    selectAnexo(state, action) {
      state.selectedAnexoId = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  openModal,
  getSuccess,
  closeModal,
  selectItem,
  selectAnexo,
  openDetalhes,
  selectParecer,
  resetProcesso,
} = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    if (item !== 'indicadores arquivos') dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      // LISTA DE PROCESSOS
      if (item === 'Tarefas' || item === 'Retidos' || item === 'Pendentes' || item === 'Atribuídos') {
        const pathItem = `/v2/processos/tarefas/${item === 'Retidos' ? 'retidas/' : ''}${item === 'Pendentes' ? 'pendentes/' : ''}${item === 'Atribuídos' ? 'atribuidas/' : ''}${perfilId}?pagina=`;
        const query = `${(item === 'Retidos' || item === 'Atribuídos') && params?.colaboradorId ? `&perfil_id=${params?.colaboradorId}` : ''}${params?.estadoId ? `&estado_id=${params?.estadoId}` : ''}${params?.estadoId && params?.fluxoId ? `&fluxo_id=${params?.fluxoId}` : ''}${params?.segmento ? `&segmento=${params?.segmento === 'Particulares' ? 'P' : 'E'}` : ''}`;
        const response = await axios.get(`${BASEURLDD}${pathItem}${params?.pagina || 0}${query}`, options);
        const dados = response.data;
        if (response?.data?.paginacao?.total_paginas === 2 && response?.data?.paginacao?.proxima_pagina === 1) {
          const response1 = await axios.get(`${BASEURLDD}${pathItem}${1}${query}`, options);
          dados.paginacao = response1?.data?.paginacao;
          dados.objeto.push(...response1?.data?.objeto);
        }
        dispatch(slice.actions.getProcessosSuccess(dados));
      }
      // LISTA DE PROCESSOS ESPECÍFICOS
      if (item === 'Finalizados' || item === 'Executados' || item === 'Agendados') {
        const apiUrl = `${BASEURLDD}/v2/processos/tarefas/situacao/${perfilId}?pagina=`;
        const _item = (item === 'Finalizados' && 'finalizado') || (item === 'Executados' && 'executado') || 'agendado';
        const response = await axios.get(`${apiUrl}${params?.pagina}&situacao=${_item}`, options);
        const dados = response.data;
        if (response?.data?.paginacao?.total_paginas === 2 && response?.data?.paginacao?.proxima_pagina === 1) {
          const response1 = await axios.get(`${apiUrl}${1}&situacao=${_item}`, options);
          dados.paginacao = response1?.data?.paginacao;
          dados.objeto.push(...response1?.data?.objeto);
        }
        dispatch(slice.actions.getProcessosSuccess(dados));
      }
      // PESQUISA LISTA DE PROCESSOS
      if (item === 'pesquisa global' || item === 'pesquisa avancada') {
        const response = await axios.get(
          `${BASEURLDD}/v2/processos/pesquisa/${item === 'pesquisa global' ? 'base' : 'especifica'}/${perfilId}?pagina=${params?.pagina || 0}&em_historico=${params?.historico}${params?.chave ? `&search_param=${params?.chave}` : ''}${params?.uo?.id ? `&uo_id=${params?.uo?.id}` : ''}${params?.entrada ? `&nentrada=${params?.entrada}` : ''}${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${params?.conta ? `&conta=${params?.conta}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.entidade ? `&entidade=${params?.entidade}` : ''}`,
          options
        );
        const dados = response.data;
        if (response?.data?.paginacao?.total_paginas === 2 && response?.data?.paginacao?.proxima_pagina === 1) {
          const response1 = await axios.get(
            `${BASEURLDD}/v2/processos/pesquisa/${item === 'pesquisa global' ? 'base' : 'especifica'}/${perfilId}?pagina=${1}&em_historico=${params?.historico}${params?.chave ? `&search_param=${params?.chave}` : ''}${params?.uo?.id ? `&uo_id=${params?.uo?.id}` : ''}${params?.entrada ? `&nentrada=${params?.entrada}` : ''}${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${params?.conta ? `&conta=${params?.conta}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.entidade ? `&entidade=${params?.entidade}` : ''}`,
            options
          );
          dados.paginacao = response1?.data?.paginacao;
          dados.objeto.push(...response1?.data?.objeto);
        }
        dispatch(slice.actions.getPesquisaSuccess(dados));
      }

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
        case 'restauros': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_restauro?perfil_cc_id=${perfilId}${params?.datai ? `&datai=${params?.datai}` : ''}${params?.dataf ? `&dataf=${params?.dataf}` : ''}&pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getArquivosSuccess(response.data));
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
        case 'con': {
          dispatch(slice.actions.getSuccess({ item: 'con', dados: [] }));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/export/con?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'con', dados: response.data }));
          break;
        }
        case 'pjf': {
          if (params?.pagina === 0) {
            dispatch(slice.actions.getSuccess({ item: 'pjf', dados: [] }));
          }
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/historico/pe/financas?pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getPjfSuccess(response.data));
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

export function getInfoProcesso(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const idPerfilId = `${params?.id}?perfil_cc_id=${perfilId}`;
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      if (item === 'htransicoes') {
        const [htTransicoesRes, htDomiciliosRes, htRestauroRes] = await Promise.all([
          axios.get(`${BASEURLDD}/v2/processos/ht_transicoes/${idPerfilId}`, options),
          axios.get(`${BASEURLDD}/v2/processos/ht_domicilios/${idPerfilId}`, options),
          axios.get(
            `${BASEURLDD}/v2/processos/ht_restauro/processo?perfil_cc_id=${perfilId}&processo_id=${params?.id}`,
            options
          ),
        ]);

        const htTransicoes = htTransicoesRes?.data?.objeto ?? [];
        const htDomicilios = htDomiciliosRes?.data?.objeto ?? [];
        const htRestauro = htRestauroRes?.data?.objeto ?? [];

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

        const transformRestauro = (row) => ({
          modo: 'Restauro',
          perfil_id: row?.criador,
          id: `restauro_${row?.id}`,
          data_saida: row?.criado_em,
          observacao: row?.observacao,
        });

        const ht = [...htTransicoes, ...htDomicilios.map(transformDomicilio), ...htRestauro.map(transformRestauro)];
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
          (item === 'destinos' &&
            `${BASEURLDD}/v2/processos/destinos/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`) ||
          (item === 'confidencialidades' &&
            `${BASEURLDD}/v2/processos/confidencialidades?perfil_cc_id=${perfilId}&processo_id=${params?.id}`) ||
          (item === 'destinosDesarquivamento' &&
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/v2/${perfilId}?processo_id=${params?.id}`) ||
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

export function getProcesso(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.resetProcesso());
    dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      switch (item) {
        case 'processo': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${perfilId}&from_historico=${params?.historico}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess({ ...response.data?.objeto, historico: params?.historico }));
          break;
        }
        case 'prevnext': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/next/prev/${perfilId}?processo_id=${params?.id}&estado_id=${params?.estadoId}&next=${params?.next}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data?.objeto));
          break;
        }

        default:
          break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (item === 'prevnext')
        hasError(
          { message: `Sem mais processos disponíveis no estado ${params?.estado}` },
          dispatch,
          slice.actions.getSuccess
        );
      else hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoadingP', dados: false }));
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
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: false });
      const options1 = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: true });

      switch (item) {
        case 'processo': {
          await axios.put(`${BASEURLDD}/v2/processos/ei/${perfilId}/${params?.id}`, dados, options1);
          break;
        }
        case 'encaminhar serie': {
          await axios.patch(`${BASEURLDD}/v2/processos/encaminhar/serie/${perfilId}/${params?.id}`, dados, options1);
          break;
        }
        case 'encaminhar paralelo': {
          await axios.patch(`${BASEURLDD}/v2/processos/encaminhar/paralelo/${perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'arquivar': {
          if (params?.anexos?.get('anexos')) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/adicionar/anexo/${perfilId}/${params?.id}?estado_id=${params?.estadoId}`,
              params?.anexos,
              options1
            );
          }
          await axios.patch(`${BASEURLDD}/v2/processos/arquivar/${perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'desarquivar': {
          await axios.patch(`${BASEURLDD}/v2/processos/desarquivar/${perfilId}/${params?.id}`, dados, options);
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'restaurar': {
          await axios.post(
            `${BASEURLDD}/v2/processos/restaurar/from/historico/${perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          dispatch(slice.actions.restaurarSuccess(params?.id));
          break;
        }
        case 'parecer individual': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/individual/${perfilId}/${params?.processoId}/${params?.id}`,
            dados,
            options1
          );
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'parecer estado': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/estado/paralelo/${perfilId}?processo_id=${params?.processoId}`,
            dados,
            options1
          );
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'aceitar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/aceitar/${perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          dispatch(slice.actions.aceitarSuccess(params));
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
        case 'dar aceso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/dar/acesso/${params?.id}`, dados, options);
          break;
        }
        case 'atribuir': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/atribuicao/mista/${perfilId}?perfil_afeto_id=${params?.id}&processo_id=${params?.processoId}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            '',
            options
          );
          break;
        }
        case 'cancelar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/fechar/envio/paralelo/${perfilId}?processo_id=${params?.id}&cancelamento=${params?.fechar ? 'false' : 'true'}`,
            dados,
            options
          );
          break;
        }
        case 'finalizar': {
          await axios.patch(`${BASEURLDD}/v2/processos/finalizar/${perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'libertar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/abandonar/${perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          break;
        }
        case 'domiciliar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/domiciliar/${perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          break;
        }
        case 'pendencia': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/pender/misto/${perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}`,
            dados,
            options
          );
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/atribuicao/mista/${perfilId}?perfil_afeto_id=${perfilId}&processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              '',
              options
            );
          }
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'alterar balcao': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/alterar/balcao/entrega/${params?.id}`, dados, options);
          dispatch(slice.actions.alterarBalcaopSuccess({ id: params?.id, balcao: params?.balcao }));
          break;
        }
        case 'confirmar emissao multiplo': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/emissoes`, dados, options);
          break;
        }
        case 'confirmar emissao por data': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/todas/emissoes`, dados, options);
          break;
        }
        case 'confirmar rececao multiplo': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/rececoes?balcao=${params?.balcao}`, dados, options);
          break;
        }
        case 'confirmar rececao por data': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/todas/rececoes?balcao=${params?.balcao}`, dados, options);
          break;
        }
        case 'anular por balcao e data': {
          await axios.patch(
            `${BASEURLDD}/v1/cartoes/anular/validacao/todas?emissao=${params?.emissao}`,
            dados,
            options
          );
          break;
        }
        case 'anular multiplo': {
          await axios.patch(
            `${BASEURLDD}/v1/cartoes/anular/validacao/listagem?emissao=${params?.emissao}`,
            dados,
            options
          );
          break;
        }
        case 'anexo': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/remover/anexo/${perfilId}?processo_id=${params?.processoId}&anexo=${params?.anexo}&parecer_individual=${params?.individual}`,
            dados,
            options
          );
          dispatch(slice.actions.deleteAnexoSuccess(params));
          break;
        }
        case 'confidencialidade': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/confidencia/${perfilId}?processo_id=${params?.processoId}&confidencia_id=${params?.id}`,
            dados,
            options
          );
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/confidencialidades?perfil_cc_id=${perfilId}&processo_id=${params?.processoId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ item: 'confidencialidades', dados: response.data.objeto }));
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
