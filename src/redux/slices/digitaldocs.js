import axios from 'axios';
import { format, add } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { errorMsg } from '../../utils/normalizeText';
import { BASEURLDD } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  previewType: '',
  isSaving: false,
  isLoading: false,
  isLoadingP: false,
  isOpenModal: false,
  isOpenParecer: false,
  isLoadingAnexo: false,
  isOpenModalAnexo: false,
  arquivarProcessos: false,
  isOpenModalDesariquivar: false,
  anexo: null,
  totalP: null,
  anexoCC: null,
  processo: null,
  filePreview: null,
  selectedItem: null,
  anexoParecer: null,
  itemSelected: null,
  selectedAnexoId: null,
  indicadoresArquivo: null,
  con: [],
  versoes: [],
  cartoes: [],
  pesquisa: [],
  arquivos: [],
  entradas: [],
  processos: [],
  porConcluir: [],
  trabalhados: [],
  transicoesCC: [],
  visualizacoes: [],
  pedidosAcesso: [],
  destinosDesarquivamento: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    startLoadingP(state) {
      state.isLoadingP = true;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    startLoadingAnexo(state) {
      state.isLoadingAnexo = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingAnexo = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingP = false;
      state.error = '';
    },

    done(state, action) {
      state.isSaving = false;
      state.done = action.payload;
      state.isLoadingAnexo = false;
    },

    resetDone(state) {
      state.done = '';
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingP = false;
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'processo':
          state.anexo = null;
          state.processo = null;
          state.filePreview = null;
          state.previewType = '';
          state.isLoadingAnexo = false;
          state.versoes = [];
          state.visualizacoes = [];
          break;
        case 'processos':
          state.processos = [];
          break;
        case 'entradas':
          state.entradas = [];
          break;
        case 'pesquisa':
          state.pesquisa = [];
          break;
        case 'trabalhados':
          state.trabalhados = [];
          break;
        case 'cartoes':
          state.cartoes = [];
          break;
        case 'con':
          state.con = [];
          break;

        default:
          break;
      }
    },

    getProcessosSuccess(state, action) {
      state.processos = action.payload;
    },

    getEntradasSuccess(state, action) {
      state.entradas = action.payload;
    },

    getPorConcluirSuccess(state, action) {
      state.porConcluir = action.payload;
    },

    getArquivosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getTrabalhadosSuccess(state, action) {
      state.trabalhados = action.payload;
    },

    getPedidosAcessoSuccess(state, action) {
      state.pedidosAcesso = action.payload;
    },

    getMeusProcessosSuccess(state, action) {
      state.totalP = action.payload;
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

    getProcessoSuccess(state, action) {
      state.processo = action.payload;
      state.isLoadingP = false;
    },

    getPesquisaSuccess(state, action) {
      state.pesquisa = action.payload;
    },

    getVisualizacoesSuccess(state, action) {
      state.visualizacoes = action.payload;
    },

    getVersoesSuccess(state, action) {
      state.versoes = action.payload;
    },

    getDestinosDesarquivamentoSuccess(state, action) {
      state.isOpenModalDesariquivar = true;
      state.destinosDesarquivamento = action.payload;
    },

    getArquivadosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getCartaoSuccess(state, action) {
      state.selectedItem = action.payload;
    },

    getAnexoSuccess(state, action) {
      state.isLoadingAnexo = false;
      state.anexo = action.payload;
    },

    getAnexoParecerSuccess(state, action) {
      state.anexoParecer = action.payload;
    },

    getanexoFilePreviewSuccess(state, action) {
      state.isLoadingAnexo = false;
      state.filePreview = action.payload.file;
      state.previewType = action.payload.type;
    },

    getTransicoesSuccess(state, action) {
      state.transicoesCC = action?.payload || [];
    },

    aceitarSuccess(state, action) {
      state.processo.is_lock = true;
      state.processo.perfil_id = action.payload.perfilId;
      state.processo.hprisoes.push({
        preso_em: `${format(new Date(), 'yyyy-MM-dd')}T${format(add(new Date(), { hours: 1 }), 'HH:mm:ss')}.823+00:00`,
        perfil_id: action.payload.perfilId,
        solto_em: null,
        por: null,
      });
    },

    createProcessoSuccess(state, action) {
      state.processo = action.payload;
    },

    parecerSuccess(state) {
      state.isOpenModal = false;
      state.selectedItem = null;
    },

    parecerEstSuccess(state, action) {
      const index = state?.processo?.pareceres_estado?.findIndex((row) => Number(row.id) === Number(action.payload.id));
      if (index === 0 || index) {
        state.processo.pareceres_estado[index].validado = action.payload.validado;
        state.processo.pareceres_estado[index].descritivo = action.payload.descritivo;
        state.processo.pareceres_estado[index].validado_em = action.payload.validado ? new Date() : null;
        state.processo.pareceres_estado[index].parecer_favoravel = action.payload?.parecer === 'Favorável';
      }
    },

    updateProcessoSuccess(state, action) {
      state.processo = action.payload;
      state.previewType = '';
      state.filePreview = null;
    },

    processoPendenteSuccess(state, action) {
      if (action.payload.from === 'tarefas') {
        state.processos = state.processos.filter((row) => row.id !== action.payload.id);
      }
      state.isOpenModal = false;
      state.selectedItem = null;
    },

    confirmarCartaoDopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      if (index === 0 || index) {
        state.cartoes[index].confirmacao_dop = true;
        state.cartoes[index].confirmado_por_dop = action.payload.perfilId;
        state.cartoes[index].data_confirmacao_dop = format(new Date(), 'yyyy-MM-dd');
      }
    },

    alterarBalcaopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      state.cartoes[index].balcao_entrega = action.payload.balcao;
    },

    deleteAnexoProcessoSuccess(state, action) {
      const index = state?.processo?.anexos?.findIndex((row) => row.id === action.payload);
      if (index === 0 || index) {
        state.processo.anexos[index].is_ativo = false;
        state.isOpenModalAnexo = false;
        state.selectedAnexoId = null;
        state.previewType = '';
        state.filePreview = null;
      }
    },

    deleteAnexoParecerSuccess(state, action) {
      const index = state.processo.pareceres.findIndex((row) => row.id === action.payload.parecerId);
      state.processo.pareceres[index].anexos = state.processo.pareceres[index].anexos.filter(
        (row) => row.id !== action.payload.id
      );
      state.selectedItem.anexos = state.selectedItem.anexos.filter((row) => row.id !== action.payload.id);
    },

    desarquivarProcessoSuccess(state) {
      state.destinosDesarquivamento = [];
    },

    selectItem(state, action) {
      state.isOpenModal = true;
      state.selectedItem = action.payload;
    },

    openModal(state) {
      state.selectedItem = null;
      state.isOpenModal = true;
    },

    openDetalhes(state) {
      state.isOpenModalDesariquivar = true;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenModalDesariquivar = false;
      state.selectedItem = null;
      state.destinosDesarquivamento = [];
    },

    selectAnexo(state, action) {
      state.isOpenModalAnexo = true;
      state.selectedAnexoId = action.payload;
    },

    closeModalAnexo(state) {
      state.isOpenModalAnexo = false;
      state.selectedAnexoId = null;
    },

    selectParecer(state, action) {
      state.itemSelected = action.payload;
      state.isOpenParecer = true;
    },

    closeParecer(state) {
      state.isOpenParecer = false;
      state.itemSelected = null;
    },

    resetAnexo(state) {
      state.anexo = null;
      state.anexoParecer = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  resetItem,
  openModal,
  closeModal,
  selectItem,
  resetAnexo,
  selectAnexo,
  openDetalhes,
  closeParecer,
  selectParecer,
  closeModalAnexo,
} = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch) => {
    if (item !== 'meusprocessos' && item !== 'destinosDesarquivamento') {
      dispatch(slice.actions.startLoading());
    }
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'tarefas': {
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'finalizados': {
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'executados': {
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'agendados': {
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'pendentes': {
          if (params?.estadoId === -1) {
            const response = await axios.get(`${BASEURLDD}/v1/processos/pendencias/${params?.perfilId}`, options);
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/pendencias/estado/${params?.estadoId}/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/pendencias/ef/${params?.estadoId}/${params?.perfilId}?fluxoID=${params?.fluxoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'atribuidos': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/minhastarefas/afetos/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'retidos': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/minhastarefas/retidoseq/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'meusprocessos': {
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/default/${params?.fluxoId}/${params?.estadoId}/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getMeusProcessosSuccess(response.data));
          break;
        }
        case 'pesquisa': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('pesquisa'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/search/${params?.perfilId}?chave=${params?.chave}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'pesquisa v2': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('pesquisa'));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/search/${params?.perfilId}?uoID=${params?.uoID}&chave=${params?.chave}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'pesquisa avancada': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('pesquisa'));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/search/interno/${params?.perfilID}?uoID=${params?.uoID}${
              params?.nentrada ? `&nentrada=${params?.nentrada}` : ''
            }${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${
              params?.conta ? `&conta=${params?.conta}` : ''
            }${params?.cliente ? `&cliente=${params?.cliente}` : ''}${
              params?.entidade ? `&entidade=${params?.entidade}` : ''
            }${params?.perfilDono ? `&perfilDono=${params?.perfilDono}` : ''}${
              params?.datai ? `&datai=${params?.datai}` : ''
            }${params?.dataf ? `&dataf=${params?.dataf}` : ''}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'visualizacoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/visualizacoes/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getVisualizacoesSuccess(response.data));
          break;
        }
        case 'versoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/versoes/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getVersoesSuccess(response.data));
          break;
        }
        case 'destinosDesarquivamento': {
          const response = await axios.get(
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/${params?.processoId}`,
            options
          );
          dispatch(slice.actions.getDestinosDesarquivamentoSuccess(response.data.objeto));
          break;
        }
        case 'entradas': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('entradas'));
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/agencias/intervalo/${params?.uoId}/${params?.perfilId}?diai=${
              params?.dataInicio
            }${params?.dataFim ? `&diaf=${params?.dataFim}` : ''}`,
            options
          );
          dispatch(slice.actions.getEntradasSuccess(response.data.objeto));
          break;
        }
        case 'porconcluir': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(`${BASEURLDD}/v1/processos/porconcluir/${params?.perfilId}`, options);
          dispatch(slice.actions.getPorConcluirSuccess(response.data.objeto));
          break;
        }
        case 'trabalhados': {
          dispatch(slice.actions.resetItem('processo'));
          if (params?.uoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getTrabalhadosSuccess(response.data.objeto));
          }
          break;
        }
        case 'arquivados': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/${params?.perfilId}`, options);
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'pedidosAcesso': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/pedidos/${params?.perfilId}`, options);
          dispatch(slice.actions.getPedidosAcessoSuccess(response.data));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${params?.perfilId}`, options);
          dispatch(slice.actions.getIndicadoresArquivoSuccess(response.data));
          break;
        }
        case 'Emissão': {
          dispatch(slice.actions.resetItem('cartoes'));
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
          dispatch(slice.actions.resetItem('cartoes'));
          const response = await axios.get(
            `${BASEURLDD}/v1/cartoes/recebidas?balcao=${params?.uoId}&data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getCartoesSuccess(response.data));
          break;
        }
        case 'con': {
          dispatch(slice.actions.resetItem('con'));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/export/con?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getConSuccess(response.data));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'processo': {
          dispatch(slice.actions.startLoadingP());
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'prevnext': {
          dispatch(slice.actions.startLoadingP());
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/prev/next/${params?.perfilId}/${params?.estadoId}/${params?.processoId}?next=${params?.next}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
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
      if (item === 'processo') {
        dispatch(slice.actions.resetItem('processo'));
      }
      if (item === 'prevnext') {
        dispatch(slice.actions.hasError(`Sem mais processos disponíveis no estado ${params?.estado}`));
      } else {
        dispatch(slice.actions.hasError(errorMsg(error)));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getAnexo(item, anexo, type, mail) {
  return async (dispatch) => {
    if (item !== 'anexoParecer') {
      dispatch(slice.actions.startLoadingAnexo());
    }
    try {
      const options = { headers: { cc: mail } };
      switch (item) {
        case 'filepreview': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${anexo}`, options);
          dispatch(slice.actions.getanexoFilePreviewSuccess({ file: response.data, type }));
          break;
        }
        case 'anotherone': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${anexo}`, options);
          dispatch(slice.actions.getAnexoSuccess(response.data));
          break;
        }
        case 'anexoParecer': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/parecer/${anexo?.anexo}`, options);
          dispatch(slice.actions.getAnexoParecerSuccess({ ...response.data, anexo }));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
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
          const response = await axios.post(`${BASEURLDD}/v1/processos/interno`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.processo));
          break;
        }
        case 'processo externo': {
          const response = await axios.post(`${BASEURLDD}/v1/processos/externo`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.processo));
          break;
        }
        case 'encaminhar': {
          if (params?.haveAnexos) {
            await axios.post(`${BASEURLDD}/v1/processos/adicionar/anexos/${params?.id}`, params?.anexos, options1);
          }
          await axios.post(`${BASEURLDD}/v1/processos/encaminhar/${params?.id}`, dados, options);
          if (params?.pender) {
            await axios.patch(`${BASEURLDD}/v1/processos/aceitar/${params?.id}`, params?.aceitar, options);
            await axios.patch(
              `${BASEURLDD}/v1/processos/pender?processoID=${params?.id}&perfilID=${params?.perfilId}`,
              params?.pendencia,
              options
            );
          }
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v1/processos/afetar/${params?.id}?perfilID=${params?.perfilId}&perfilIDAfeto=${params?.atribuir}`,
              '',
              options
            );
          }
          break;
        }
        case 'pedir acesso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/pedir/acesso/${params?.perfilId}/${params?.id}`, '', options);
          break;
        }
        case 'arquivar': {
          if (params?.haveA) {
            await axios.post(`${BASEURLDD}/v1/processos/adicionar/anexos/${params?.id}`, params?.anexos, options1);
          }
          await axios.patch(`${BASEURLDD}/v1/processos/arquivar/${params?.id}`, dados, options);
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
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
          const response = await axios.put(
            `${BASEURLDD}/v1/processos/ei/pro/${params?.id}/${params?.perfilId}`,
            dados,
            options1
          );
          dispatch(slice.actions.updateProcessoSuccess(response?.data?.processo));
          break;
        }
        case 'parecer': {
          await axios.patch(`${BASEURLDD}/v1/processos/parecer/${params?.processoId}`, dados, options1);
          dispatch(slice.actions.parecerSuccess());
          break;
        }
        case 'parecer estado': {
          await axios.patch(`${BASEURLDD}/v1/processos/dar_parecer/estado`, dados, options);
          dispatch(slice.actions.parecerEstSuccess(params?.values));
          break;
        }
        case 'aceitar': {
          await axios.patch(`${BASEURLDD}/v1/processos/aceitar/${params?.processoId}`, dados, options);
          dispatch(slice.actions.aceitarSuccess(params));
          break;
        }
        case 'dar aceso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/dar/acesso/${params?.id}`, dados, options);
          break;
        }
        case 'atribuir': {
          await axios.patch(
            `${BASEURLDD}/v1/processos/afetar/${params?.processoID}?perfilID=${params?.perfilID}&perfilIDAfeto=${params?.perfilIDAfeto}&fluxo_id=${params?.fluxoId}`,
            '',
            options
          );
          break;
        }
        case 'cancelar': {
          await axios.patch(`${BASEURLDD}/v1/processos/cancelar/${params?.id}`, dados, options);
          dispatch(slice.actions.startLoadingP());
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'fechar': {
          await axios.patch(`${BASEURLDD}/v1/processos/parecer/fechar/${params?.id}`, dados, options);
          dispatch(slice.actions.startLoadingP());
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'resgatar': {
          dispatch(slice.actions.startLoadingP());
          const response = await axios.patch(`${BASEURLDD}/v1/processos/resgate/${params?.id}`, dados, options);
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'finalizar': {
          await axios.patch(`${BASEURLDD}/v1/processos/finalizar/${params?.id}`, dados, options);
          break;
        }
        case 'abandonar': {
          await axios.patch(`${BASEURLDD}/v1/processos/abandonar/${params?.id}`, dados, options);
          break;
        }
        case 'desarquivar': {
          await axios.patch(`${BASEURLDD}/v1/processos/desarquivar/${params?.id}`, dados, options);
          dispatch(slice.actions.desarquivarProcessoSuccess());
          break;
        }
        case 'pendencia': {
          if (params?.aceitar) {
            await axios.patch(`${BASEURLDD}/v1/processos/aceitar/${params?.id}`, params?.formDataAceitar, options);
          }
          await axios.patch(
            `${BASEURLDD}/v1/processos/pender?processoID=${params?.id}&perfilID=${params?.perfilId}`,
            dados,
            options
          );
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v1/processos/afetar/${params?.id}?perfilID=${params?.perfilId}&perfilIDAfeto=${params?.perfilId}&fluxo_id=${params?.fluxoId}`,
              '',
              options
            );
          }
          dispatch(slice.actions.processoPendenteSuccess(params));
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

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'processo': {
          await axios.delete(`${BASEURLDD}/v1/processos/delete/${params?.perfilId}/${params?.processoId}`, options);
          break;
        }
        case 'anexoParecer': {
          await axios.delete(
            `${BASEURLDD}/v1/processos/parecer/remover/anexos/${params?.perfilId}/${params?.parecerId}/${params?.id}`,
            options
          );
          dispatch(slice.actions.deleteAnexoParecerSuccess({ id: params?.id, parecerId: params?.parecerId }));
          break;
        }
        case 'anexo processo': {
          await axios.delete(
            `${BASEURLDD}/v1/processos/remover/anexos/${params?.perfilId}/${params?.processoId}/${params?.id}`,
            options
          );
          dispatch(slice.actions.deleteAnexoProcessoSuccess(params?.id));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
