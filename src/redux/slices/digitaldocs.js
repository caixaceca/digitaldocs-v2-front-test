import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { errorMsg } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

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
    startLoading(state) {
      state.isLoading = true;
    },

    loadingProcesso(state, action) {
      state.isLoadingP = action.payload;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    loadingPreview(state, action) {
      state.isLoadingPreview = action.payload;
    },

    loadingFile(state, action) {
      state.isLoadingFile = action.payload;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    setDone(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.done = action.payload;
    },

    setError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingP = false;
      state.isLoadingFile = '';
      state.isLoadingPreview = false;
      state.error = action.payload;
    },

    resetItem(state, action) {
      const { item } = action.payload;
      state[action.payload.item] = action.payload?.tipo === 'array' ? [] : null;
      if (action.payload.item === 'processo') {
        state.filePreview = null;
        state.objectURLs.forEach(URL.revokeObjectURL);
        state.objectURLs = [];
      }
      if (item === 'processo' || item === 'pesquisa' || item === 'arquivos' || item === 'pjf') {
        state.processosInfo = null;
      }
    },

    getProcessosSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.processos = [...state.processos, ...action.payload.objeto];
    },

    getSuccess(state, action) {
      switch (action.payload.item) {
        case 'dadosControle':
          state.dadosControle = action.payload.dados;
          break;

        default:
          break;
      }
    },

    getPedidosAcessoSuccess(state, action) {
      state.pedidos = action.payload;
    },

    getArquivosSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.arquivos = [...state.arquivos, ...action.payload.objeto];
    },

    getIndicadoresArquivoSuccess(state, action) {
      state.indicadoresArquivo = action.payload;
    },

    getCartoesSuccess(state, action) {
      state.cartoes = action.payload?.map((row) => ({ ...row, numero: row?.numero?.substring(9, 15) }));
    },

    getConSuccess(state, action) {
      state.con = action.payload;
    },

    getPjfSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.pjf = [...state.pjf, ...action.payload.objeto];
    },

    getProcessoSuccess(state, action) {
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

    addItemProcesso(state, action) {
      if (state?.processo?.id) {
        state.processo = { ...state.processo, ...action.payload };
      }
    },

    getArquivadosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getCartaoSuccess(state, action) {
      state.selectedItem = action.payload;
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

    getFilePreviewSuccess(state, action) {
      state.filePreview = action?.payload;
    },

    getFileSuccess(state, action) {
      if (action.payload.url) {
        state.objectURLs.push(action.payload.url);
      }
      if (state.processo) {
        if (action?.payload?.parecerId && action?.payload?.transicaoId) {
          const index = state?.processo?.estados?.findIndex((row) => row.id === action.payload.transicaoId);
          if (index !== -1) {
            const index1 = state.processo.estados[index].pareceres?.findIndex(
              (row) => row.id === action.payload.parecerId
            );
            if (index1 !== -1) {
              const index2 = state.processo.estados[index].pareceres[index1].anexos.findIndex(
                (row) => row?.anexo === action.payload.anexo
              );
              if (index2 !== -1) {
                state.processo.estados[index].pareceres[index1].anexos[index2].url = action.payload.url;
              }
            }
          }
          const index3 = state?.processo?.htransicoes?.findIndex((row) => row.id === action.payload.transicaoId);
          if (index3 !== -1) {
            const index4 = state.processo.htransicoes[index3].pareceres?.findIndex(
              (row) => row.id === action.payload.parecerId
            );
            if (index4 !== -1) {
              const index5 = state.processo.htransicoes[index3].pareceres[index4].anexos.findIndex(
                (row) => row?.anexo === action.payload.anexo
              );
              if (index5 !== -1) {
                state.processo.htransicoes[index3].pareceres[index4].anexos[index5].url = action.payload.url;
              }
            }
          }
          if (state.processo?.estado_processo?.pareceres) {
            const index6 = state.processo.estado_processo.pareceres?.findIndex(
              (row) => row.id === action.payload.parecerId
            );
            if (index6 !== -1) {
              const index7 = state.processo.estado_processo.pareceres[index6]?.anexos.findIndex(
                (row) => row?.anexo === action.payload.anexo
              );
              if (index7 !== -1) {
                state.processo.estado_processo.pareceres[index6].anexos[index7].url = action.payload.url;
              }
            }
          }
        } else if (action?.payload?.transicaoId) {
          const index = state?.processo?.htransicoes?.findIndex((row) => row.id === action.payload.transicaoId);
          if (index !== -1) {
            const index1 = state.processo.htransicoes[index].anexos.findIndex(
              (row) => row?.anexo === action.payload.anexo
            );
            if (index1 !== -1) {
              state.processo.htransicoes[index].anexos[index1].url = action.payload.url;
            }
          }
          const index2 = state?.processo?.estados?.findIndex((row) => row.id === action.payload.transicaoId);
          if (index2 !== -1) {
            const index3 = state.processo.estados[index2].anexos.findIndex(
              (row) => row?.anexo === action.payload.anexo
            );
            if (index3 !== -1) {
              state.processo.estados[index2].anexos[index3].url = action.payload.url;
            }
          }
        } else {
          const index = state?.processo?.anexos?.findIndex((row) => row?.anexo === action.payload.anexo);
          if (index !== -1) {
            state.processo.anexos[index].url = action.payload.url;
          }
        }
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

    createProcessoSuccess(state, action) {
      state.processo = action.payload;
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
      if (action?.payload?.processo) {
        const index = state?.processo?.anexos?.findIndex((row) => row.anexo === action.payload?.anexo);
        if (index !== -1) {
          state.processo.anexos[index].ativo = false;
        }
      } else if (action.payload?.individual === 'true') {
        const index1 = state.processo?.estados?.findIndex((row) => row.id === action.payload.estadoId);
        if (index1 !== -1) {
          const index2 = state.processo.estados[index1]?.pareceres.findIndex(
            (row) => row.id === action.payload.parecerId
          );
          if (index2 !== -1) {
            const index3 = state.processo.estados[index1].pareceres[index2].anexos.findIndex(
              (row) => row.anexo === action.payload.anexo
            );
            if (index3 !== -1) {
              state.processo.estados[index1].pareceres[index2].anexos[index3].ativo = false;
            }
          }
        }
        const indexSI = state?.selectedItem?.anexos?.findIndex((row) => row.anexo === action.payload.anexo);
        if (indexSI !== -1) {
          state.selectedItem.anexos[indexSI].ativo = false;
        }
      } else {
        const index4 = state.processo?.estados?.findIndex((row) => row.id === action.payload.estadoId);
        if (index4 !== -1) {
          const index5 = state.processo.estados[index4]?.anexos.findIndex((row) => row.anexo === action.payload.anexo);
          if (index5 !== -1) {
            state.processo.estados[index4].anexos[index5].ativo = false;
          }
        }
        const indexSI = state?.selectedItem?.anexos?.findIndex((row) => row.anexo === action.payload.anexo);
        if (indexSI !== -1) {
          state.selectedItem.anexos[indexSI].ativo = false;
        }
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
export const { resetItem, openModal, closeModal, selectItem, selectAnexo, openDetalhes, selectParecer } = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch) => {
    if (
      item !== 'hversoes' &&
      item !== 'destinos' &&
      item !== 'hretencoes' &&
      item !== 'htransicoes' &&
      item !== 'hpendencias' &&
      item !== 'hatribuicoes' &&
      item !== 'hvisualizacoes' &&
      item !== 'confidencialidades' &&
      item !== 'destinosDesarquivamento'
    ) {
      dispatch(slice.actions.resetItem({ item: 'processo' }));
    }

    if ((item === 'pesquisa global' || item === 'pesquisa avancada') && !params?.pagina) {
      await dispatch(slice.actions.resetItem({ item: 'processo' }));
    }

    if (
      item !== 'destinos' &&
      item !== 'htransicoes' &&
      item !== 'indicadores arquivos' &&
      item !== 'destinosDesarquivamento'
    ) {
      dispatch(slice.actions.startLoading());
    }

    try {
      const options = { headers: { cc: params?.mail } };
      const idPerfilId = `${params?.id}?perfil_cc_id=${params?.perfilId}`;
      // LISTA DE PROCESSOS
      if (item === 'Tarefas' || item === 'Retidos' || item === 'Pendentes' || item === 'Atribuídos') {
        const pathItem = `/v2/processos/tarefas/${item === 'Retidos' ? 'retidas/' : ''}${item === 'Pendentes' ? 'pendentes/' : ''}${item === 'Atribuídos' ? 'atribuidas/' : ''}${params?.perfilId}?pagina=`;
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
        const _path = `${BASEURLDD}/v2/processos/tarefas/situacao/${params?.perfilId}?pagina=`;
        const _item = (item === 'Finalizados' && 'finalizado') || (item === 'Executados' && 'executado') || 'agendado';
        const response = await axios.get(`${_path}${params?.pagina}&situacao=${_item}`, options);
        const dados = response.data;
        if (response?.data?.paginacao?.total_paginas === 2 && response?.data?.paginacao?.proxima_pagina === 1) {
          const response1 = await axios.get(`${_path}${1}&situacao=${_item}`, options);
          dados.paginacao = response1?.data?.paginacao;
          dados.objeto.push(...response1?.data?.objeto);
        }
        dispatch(slice.actions.getProcessosSuccess(dados));
      }
      // PESQUISA LISTA DE PROCESSOS
      if (item === 'pesquisa global' || item === 'pesquisa avancada') {
        const response = await axios.get(
          `${BASEURLDD}/v2/processos/pesquisa/${item === 'pesquisa global' ? 'base' : 'especifica'}/${params?.perfilId}?pagina=${params?.pagina || 0}&em_historico=${params?.historico}${params?.chave ? `&search_param=${params?.chave}` : ''}${params?.uo?.id ? `&uo_id=${params?.uo?.id}` : ''}${params?.entrada ? `&nentrada=${params?.entrada}` : ''}${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${params?.conta ? `&conta=${params?.conta}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.entidade ? `&entidade=${params?.entidade}` : ''}`,
          options
        );
        const dados = response.data;
        if (response?.data?.paginacao?.total_paginas === 2 && response?.data?.paginacao?.proxima_pagina === 1) {
          const response1 = await axios.get(
            `${BASEURLDD}/v2/processos/pesquisa/${item === 'pesquisa global' ? 'base' : 'especifica'}/${params?.perfilId}?pagina=${1}&em_historico=${params?.historico}${params?.chave ? `&search_param=${params?.chave}` : ''}${params?.uo?.id ? `&uo_id=${params?.uo?.id}` : ''}${params?.entrada ? `&nentrada=${params?.entrada}` : ''}${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${params?.conta ? `&conta=${params?.conta}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.entidade ? `&entidade=${params?.entidade}` : ''}`,
            options
          );
          dados.paginacao = response1?.data?.paginacao;
          dados.objeto.push(...response1?.data?.objeto);
        }
        dispatch(slice.actions.getPesquisaSuccess(dados));
      }

      switch (item) {
        case 'destinos': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/destinos/${params?.perfilId}/${params?.id}?estado_id=${params?.estadoId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ destinos: response.data.objeto }));
          break;
        }
        case 'htransicoes': {
          const transicoes = await Promise.all([
            axios.get(`${BASEURLDD}/v2/processos/ht_transicoes/${idPerfilId}`, options),
            axios.get(`${BASEURLDD}/v2/processos/ht_domicilios/${idPerfilId}`, options),
            axios.get(
              `${BASEURLDD}/v2/processos/ht_restauro/processo?perfil_cc_id=${params?.perfilId}&processo_id=${params?.id}`,
              options
            ),
          ]);
          const ht = [
            ...(transicoes?.[0]?.data?.objeto?.length > 0 ? transicoes?.[0]?.data?.objeto : []),
            ...(transicoes?.[1]?.data?.objeto?.length > 0
              ? transicoes?.[1]?.data?.objeto?.map((row) => ({
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
                }))
              : []),
            ...(transicoes?.[2]?.data?.objeto?.length > 0
              ? transicoes?.[2]?.data?.objeto?.map((row) => ({
                  modo: 'Restauro',
                  perfil_id: row?.criador,
                  id: `restauro_${row?.id}`,
                  data_saida: row?.criado_em,
                  observacao: row?.observacao,
                }))
              : []),
          ];
          dispatch(slice.actions.addItemProcesso({ htransicoes: applySort(ht, getComparator('desc', 'data_saida')) }));
          break;
        }
        case 'hretencoes': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/ht_retencoes/${idPerfilId}`, options);
          dispatch(slice.actions.addItemProcesso({ hretencoes: response.data.objeto }));
          break;
        }
        case 'hpendencias': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/ht_pendencias/${idPerfilId}`, options);
          dispatch(slice.actions.addItemProcesso({ hpendencias: response.data.objeto }));
          break;
        }
        case 'hatribuicoes': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/ht_atribuicoes/${idPerfilId}`, options);
          dispatch(slice.actions.addItemProcesso({ hatribuicoes: response.data.objeto }));
          break;
        }
        case 'hvisualizacoes': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/visualizacoes/${params?.perfilId}?processo_id=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hvisualizacoes: response.data.objeto }));
          break;
        }
        case 'confidencialidades': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/confidencialidades?perfil_cc_id=${params?.perfilId}&processo_id=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ confidencialidades: response.data.objeto }));
          break;
        }
        case 'hversoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/versoes/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hversoes: response.data }));
          break;
        }
        case 'destinosDesarquivamento': {
          dispatch(slice.actions.openDetalhes());
          const response = await axios.get(
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/v2/${params?.perfilId}?processo_id=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ destinosDesarquivamento: response.data.objeto }));
          break;
        }
        case 'Entradas': {
          dispatch(slice.actions.resetItem({ item: 'dadosControle', tipo: 'array' }));
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/agencias/intervalo/${params?.uoId}/${params?.perfilId}?diai=${params?.dataInicio}&diaf=${params?.dataFim}`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Devoluções': {
          dispatch(slice.actions.resetItem({ item: 'dadosControle', tipo: 'array' }));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_devolvidos?perfil_cc_id=${params?.perfilId}&uo_id=${params?.uoId}&apartir_de=${params?.dataInicio}&ate=${params?.dataFim}`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Por concluir': {
          dispatch(slice.actions.resetItem({ item: 'dadosControle', tipo: 'array' }));
          const response = await axios.get(`${BASEURLDD}/v1/processos/porconcluir/${params?.perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'dadosControle', dados: response.data.objeto }));
          break;
        }
        case 'Trabalhados': {
          dispatch(slice.actions.resetItem({ item: 'dadosControle', tipo: 'array' }));
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
            `${BASEURLDD}/v2/arquivos/${params?.perfilId}?apartir_de=${params?.data}&pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'pedidosAcesso': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/pedidos/${params?.perfilId}`, options);
          dispatch(slice.actions.getPedidosAcessoSuccess(response.data));
          break;
        }
        case 'restauros': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_restauro?perfil_cc_id=${params?.perfilId}${params?.datai ? `&datai=${params?.datai}` : ''}${params?.dataf ? `&dataf=${params?.dataf}` : ''}&pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${params?.perfilId}`, options);
          dispatch(slice.actions.getIndicadoresArquivoSuccess(response.data));
          break;
        }
        case 'Emissão': {
          dispatch(slice.actions.resetItem({ item: 'cartoes', tipo: 'array' }));
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
          dispatch(slice.actions.resetItem({ item: 'cartoes', tipo: 'array' }));
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
          dispatch(slice.actions.resetItem({ item: 'con', tipo: 'array' }));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/export/con?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getConSuccess(response.data));
          break;
        }
        case 'pjf': {
          if (params?.pagina === 0) {
            dispatch(slice.actions.resetItem({ item: 'pjf', tipo: 'array' }));
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
          dispatch(slice.actions.getCartaoSuccess(response.data));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

export function getProcesso(item, params) {
  return async (dispatch) => {
    await dispatch(slice.actions.resetItem({ item: 'processo' }));
    dispatch(slice.actions.loadingProcesso(true));
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'processo': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${params?.perfilId}&from_historico=${params?.historico}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess({ ...response.data?.objeto, historico: params?.historico }));
          break;
        }
        case 'prevnext': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/next/prev/${params?.perfilId}?processo_id=${params?.id}&estado_id=${params?.estadoId}&next=${params?.next}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data?.objeto));
          break;
        }

        default:
          break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(slice.actions.loadingProcesso(false));
    } catch (error) {
      if (item === 'prevnext') {
        dispatch(slice.actions.setError(`Sem mais processos disponíveis no estado ${params?.estado}`));
      } else {
        dispatch(slice.actions.setError(errorMsg(error)));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.setError(''));
      dispatch(slice.actions.resetItem({ item: 'processo' }));
    }
  };
}

// ----------------------------------------------------------------------

export function getAnexo(item, params) {
  return async (dispatch) => {
    if (item === 'filePreview') {
      dispatch(slice.actions.loadingPreview(true));
    }
    dispatch(slice.actions.loadingFile(params?.anexo?.anexo));
    try {
      const options = { headers: { cc: params?.mail } };
      let url = params?.anexo?.url || '';
      if (!url) {
        const response = await axios.get(
          `${BASEURLDD}/v2/processos/anexo/file/${params?.perfilId}?anexo=${params?.anexo?.anexo}`,
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
      if (item === 'filePreview') {
        await dispatch(slice.actions.getFilePreviewSuccess({ ...params?.anexo, url }));
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = params?.anexo?.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      if (item === 'filePreview') {
        dispatch(slice.actions.loadingPreview(false));
      }
      dispatch(slice.actions.loadingFile(''));
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', cc: params?.mail } };

      switch (item) {
        case 'processo interno': {
          const response = await axios.post(`${BASEURLDD}/v2/processos/interno/${params?.perfilId}`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.objeto));
          break;
        }
        case 'processo externo': {
          const response = await axios.post(`${BASEURLDD}/v2/processos/externo/${params?.perfilId}`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.objeto));
          break;
        }
        case 'pedir acesso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/pedir/acesso/${params?.perfilId}/${params?.id}`, '', options);
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', cc: params?.mail } };

      switch (item) {
        case 'processo': {
          await axios.put(`${BASEURLDD}/v2/processos/ei/${params?.perfilId}/${params?.id}`, dados, options1);
          break;
        }
        case 'encaminhar serie': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/encaminhar/serie/${params?.perfilId}/${params?.id}`,
            dados,
            options1
          );
          break;
        }
        case 'encaminhar paralelo': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/encaminhar/paralelo/${params?.perfilId}/${params?.id}`,
            dados,
            options
          );
          break;
        }
        case 'arquivar': {
          if (params?.anexos?.get('anexos')) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/adicionar/anexo/${params?.perfilId}/${params?.id}?estado_id=${params?.estadoId}`,
              params?.anexos,
              options1
            );
          }
          await axios.patch(`${BASEURLDD}/v2/processos/arquivar/${params?.perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'desarquivar': {
          await axios.patch(`${BASEURLDD}/v2/processos/desarquivar/${params?.perfilId}/${params?.id}`, dados, options);
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'restaurar': {
          await axios.post(
            `${BASEURLDD}/v2/processos/restaurar/from/historico/${params?.perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          dispatch(slice.actions.restaurarSuccess(params?.id));
          break;
        }
        case 'parecer individual': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/individual/${params?.perfilId}/${params?.processoId}/${params?.id}`,
            dados,
            options1
          );
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'parecer estado': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/estado/paralelo/${params?.perfilId}?processo_id=${params?.processoId}`,
            dados,
            options1
          );
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'aceitar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/aceitar/${params?.perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          dispatch(slice.actions.aceitarSuccess(params));
          break;
        }
        case 'resgatar': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/resgatar/${params?.perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
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
            `${BASEURLDD}/v2/processos/atribuicao/mista/${params?.perfilId}?perfil_afeto_id=${params?.id}&processo_id=${params?.processoId}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            '',
            options
          );
          break;
        }
        case 'cancelar': {
          const idPerfilId = `${params?.id}?perfil_cc_id=${params?.perfilId}`;
          await axios.patch(
            `${BASEURLDD}/v2/processos/fechar/envio/paralelo/${params?.perfilId}?processo_id=${params?.id}&cancelamento=${params?.fechar ? 'false' : 'true'}`,
            dados,
            options
          );
          const processo = await axios.get(`${BASEURLDD}/v2/processos/detalhes/${idPerfilId}`, options);
          dispatch(slice.actions.getProcessoSuccess(processo.data?.objeto));
          const htransicoes = await axios.get(`${BASEURLDD}/v2/processos/ht_transicoes/${idPerfilId}`, options);
          dispatch(
            slice.actions.addItemProcesso({
              htransicoes: applySort(htransicoes?.data?.objeto || [], getComparator('desc', 'data_saida')),
            })
          );
          break;
        }
        case 'finalizar': {
          await axios.patch(`${BASEURLDD}/v2/processos/finalizar/${params?.perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'libertar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/abandonar/${params?.perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          break;
        }
        case 'domiciliar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/domiciliar/${params?.perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          break;
        }
        case 'pendencia': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/pender/misto/${params?.perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}`,
            dados,
            options
          );
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/atribuicao/mista/${params?.perfilId}?perfil_afeto_id=${params?.perfilId}&processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
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
            `${BASEURLDD}/v2/processos/remover/anexo/${params?.perfilId}?processo_id=${params?.processoId}&anexo=${params?.anexo}&parecer_individual=${params?.individual}`,
            dados,
            options
          );
          dispatch(slice.actions.deleteAnexoSuccess(params));
          break;
        }
        case 'confidencialidade': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/confidencia/${params?.perfilId}?processo_id=${params?.processoId}&confidencia_id=${params?.id}`,
            dados,
            options
          );
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/confidencialidades?perfil_cc_id=${params?.perfilId}&processo_id=${params?.processoId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ confidencialidades: response.data.objeto }));
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

async function doneSucess(msg, dispatch) {
  if (msg) {
    dispatch(slice.actions.setDone(msg));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setDone(''));
}

async function hasError(error, dispatch) {
  dispatch(slice.actions.setError(errorMsg(error)));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setError(''));
}
