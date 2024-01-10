import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { errorMsg } from '../../utils/normalizeText';
import { BASEURLCC, BASEURLDD } from '../../utils/axios';
import { getFileFormat } from '../../utils/getFileFormat';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: false,
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  isLoadingAnexo: false,
  itemId: '',
  tipoItem: '',
  garantiaId: '',
  entidadeId: '',
  anexo: null,
  pedidoCC: null,
  selectedAnexo: null,
  despesas: [],
  destinos: [],
  retencoes: [],
  transicoes: [],
  pendencias: [],
  atribuicoes: [],
  anexosAtivos: [],
  visualizacoes: [],
  anexosProcesso: [],
  anexosNecessarios: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    startLoadingAnexo(state) {
      state.isLoadingAnexo = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    stopLoadingAnexo(state) {
      state.isLoadingAnexo = false;
    },

    startSaving(state) {
      state.isSaving = true;
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
      state.isLoadingAnexo = false;
      state.error = false;
    },

    done(state, action) {
      state.isSaving = false;
      state.done = action.payload;
    },

    resetDone(state) {
      state.isSaving = false;
      state.done = '';
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'pedido cc':
          state.itemId = '';
          state.tipoItem = '';
          state.garantiaId = '';
          state.entidadeId = '';
          state.anexo = null;
          state.pedidoCC = null;
          state.selectedAnexo = null;
          state.destinos = [];
          state.destinos = [];
          state.retencoes = [];
          state.pendencias = [];
          state.transicoes = [];
          state.atribuicoes = [];
          state.anexosAtivos = [];
          state.visualizacoes = [];
          state.anexosProcesso = [];
          state.anexosNecessarios = [];
          break;
        case 'processos':
          state.processos = [];
          break;

        default:
          break;
      }
    },

    getAnexosAtivosSuccess(state, action) {
      state.anexosAtivos = Array.isArray(action.payload)
        ? applySort(action?.payload, getComparator('asc', 'designacao'))
        : [];
    },

    getAnexosProcessoSuccess(state, action) {
      state.anexosProcesso = Array.isArray(action.payload)
        ? applySort(action?.payload, getComparator('asc', 'designacao'))
        : [];
    },

    getAnexosNecessariosSuccess(state, action) {
      state.anexosNecessarios = Array.isArray(action.payload)
        ? applySort(action?.payload, getComparator('asc', 'designacao'))
        : [];
    },

    getPedidoCreditoSuccess(state, action) {
      state.pedidoCC = action?.payload?.processo || null;
      state.destinos = action?.payload?.destinos || null;
    },

    getTransicoesSuccess(state, action) {
      state.transicoes = action?.payload || [];
    },

    getVisualizacoesSuccess(state, action) {
      state.visualizacoes = action?.payload || [];
    },

    getRetencoesSuccess(state, action) {
      state.retencoes = action?.payload || [];
    },

    getAtribuicoesSuccess(state, action) {
      state.atribuicoes = action?.payload || [];
    },

    getPendenciasSuccess(state, action) {
      state.pendencias = action?.payload || [];
    },

    getDespesasSuccess(state, action) {
      state.despesas = Array.isArray(action.payload)
        ? applySort(action?.payload, getComparator('asc', 'designacao'))
        : [];
    },

    updatePedidoCCSucess(state, action) {
      state.pedidoCC = action.payload;
    },

    aceitarProcessoSuccess(state, action) {
      state.pedidoCC.preso = true;
      state.pedidoCC.perfil_id = action.payload?.dados?.perfilId;
      state.destinos = action.payload?.destinos || [];
    },

    parecerSuccess(state, action) {
      const index = state?.pedidoCC?.estados?.[0]?.pareceres?.findIndex(
        (row) => Number(row.id) === Number(action.payload.id)
      );
      if (index === 0 || index) {
        state.pedidoCC.estados[0].pareceres[index].validado = action.payload.validado;
        state.pedidoCC.estados[0].pareceres[index].descritivo = action.payload.descritivo;
        state.pedidoCC.estados[0].pareceres[index].validado_em = action.payload.validado ? new Date() : null;
        state.pedidoCC.estados[0].pareceres[index].parecer_favoravel = action.payload?.parecer === 'Favorável';
      }
      state.selectedItem = null;
      state.isOpenModal = false;
    },

    deleteAnexoProcessoSuccess(state, action) {
      const index = state?.pedidoCC?.anexos?.findIndex((row) => Number(row.id) === Number(action.payload.itemId));
      if (index === 0 || index) {
        state.pedidoCC.anexos[index].ativo = false;
      }
    },

    deleteDespesaSuccess(state, action) {
      const index = state?.pedidoCC?.despesas?.findIndex((row) => Number(row.id) === Number(action.payload.itemId));
      if (index === 0 || index) {
        state.pedidoCC.despesas[index].ativo = false;
      }
    },

    deleteGarantiaSuccess(state, action) {
      const index = state?.pedidoCC?.garantias?.findIndex((row) => Number(row.id) === Number(action.payload.itemId));
      if (index === 0 || index) {
        state.pedidoCC.garantias[index].ativo = false;
      }
    },

    deleteEntidadeSuccess(state, action) {
      state.pedidoCC.entidades = state.pedidoCC.entidades.filter((row) => row.id !== action.payload.itemId);
    },

    deleteResponsabilidadeSuccess(state, action) {
      const index = state?.pedidoCC?.outros_creditos?.findIndex(
        (row) => Number(row.id) === Number(action.payload.itemId)
      );
      if (index === 0 || index) {
        state.pedidoCC.outros_creditos[index].ativo = false;
      }
    },

    deleteAnexoGarantiaSuccess(state, action) {
      const index = state.pedidoCC.garantias.findIndex((row) => Number(row.id) === Number(action.payload.garantiaId));
      const index1 = state.pedidoCC.garantias[index].anexos.findIndex(
        (row) => Number(row.id) === Number(action.payload.itemId)
      );
      state.pedidoCC.garantias[index].anexos[index1].ativo = false;
    },

    deleteAnexoEntidadeSuccess(state, action) {
      const index = state.pedidoCC.entidades.findIndex((row) => Number(row.id) === Number(action.payload.entidadeId));
      const index1 = state.pedidoCC.entidades[index].anexos.findIndex(
        (row) => Number(row.id) === Number(action.payload.itemId)
      );
      state.pedidoCC.entidades[index].anexos[index1].ativo = false;
    },

    openModal(state) {
      state.isOpenModal = true;
    },

    selectItem(state, action) {
      state.selectedItem = action.payload;
    },

    selectAnexo(state, action) {
      state.isOpenModal = true;
      state.selectedAnexo = action.payload;
    },

    deleteAnexo(state, action) {
      state.itemId = action?.payload?.itemId;
      state.garantiaId = action?.payload?.garantiaId;
      state.entidadeId = action?.payload?.entidadeId;
      state.tipoItem = action?.payload?.tipoItem;
    },

    getAnexoSuccess(state, action) {
      state.anexo = action.payload;
    },

    closeModal(state) {
      state.anexo = null;
      state.selectedItem = null;
      state.selectedAnexo = null;
      state.isOpenModal = false;
    },

    closeModalAnexo(state) {
      state.itemId = '';
      state.garantiaId = '';
      state.entidadeId = '';
      state.tipoItem = '';
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, closeModal, closeModalAnexo, deleteAnexo, selectItem } = slice.actions;

// --------------------------------------------------------------------------------------------------------------------------------------------

export function getFromCC(item, params) {
  return async (dispatch) => {
    if (item === 'anexo') {
      dispatch(slice.actions.startLoadingAnexo());
    } else {
      dispatch(slice.actions.startLoading());
    }
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'pedido cc': {
          dispatch(slice.actions.resetItem('pedido cc'));
          const processo = await axios.get(
            `${BASEURLCC}/v1/creditos/funcionario/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          if (processo.data.objeto?.preso && processo.data.objeto?.perfil_id === params?.perfilId) {
            const destinos = await axios.get(
              `${BASEURLCC}/v1/creditos/funcionario/destinos/${params?.perfilId}?processoID=${params?.id}`,
              options
            );
            dispatch(
              slice.actions.getPedidoCreditoSuccess({ processo: processo.data.objeto, destinos: destinos.data.objeto })
            );
          } else {
            dispatch(slice.actions.getPedidoCreditoSuccess({ processo: processo.data.objeto, destinos: [] }));
          }
          break;
        }
        case 'anexo': {
          dispatch(slice.actions.selectAnexo(params?.anexo));
          const response = await axios.get(
            `${BASEURLCC}/v1/creditos/anexos/ficheiro?filename=${params?.anexo?.anexo}&anexo_processo=${params?.processo}`,
            options
          );
          dispatch(
            slice.actions.getAnexoSuccess({
              anexo: response?.data?.objeto,
              preview: getFileFormat(params?.anexo?.anexo),
            })
          );
          break;
        }
        case 'transicoes': {
          const response = await axios.get(`${BASEURLCC}/v1/creditos/historico/transicoes/${params?.id}`, options);
          dispatch(slice.actions.getTransicoesSuccess(response.data.objeto));
          break;
        }
        case 'visualizacoes': {
          const response = await axios.get(`${BASEURLCC}/v1/creditos/historico/visualizacoes/${params?.id}`, options);
          dispatch(slice.actions.getVisualizacoesSuccess(response.data.objeto));
          break;
        }
        case 'retencoes': {
          const response = await axios.get(`${BASEURLCC}/v1/creditos/historico/retencoes/${params?.id}`, options);
          dispatch(slice.actions.getRetencoesSuccess(response.data.objeto));
          break;
        }
        case 'pendencias': {
          const response = await axios.get(`${BASEURLCC}/v1/creditos/historico/pendencias/${params?.id}`, options);
          dispatch(slice.actions.getPendenciasSuccess(response.data.objeto));
          break;
        }
        case 'atribuicoes': {
          const response = await axios.get(`${BASEURLCC}/v1/creditos/historico/atribuicoes/${params?.id}`, options);
          dispatch(slice.actions.getAtribuicoesSuccess(response.data.objeto));
          break;
        }
        case 'despesas': {
          const response = await axios.get(`${BASEURLCC}/v1/suportes/designacao/despesas/ativas`, options);
          dispatch(slice.actions.getDespesasSuccess(response.data.objeto));
          break;
        }
        case 'anexos ativos': {
          const response = await axios.get(`${BASEURLCC}/v1/anexos/ativos`, options);
          dispatch(slice.actions.getAnexosAtivosSuccess(response.data.objeto));
          break;
        }
        case 'anexos processo': {
          const response = await axios.get(
            `${BASEURLCC}/v1/creditos/anexos/necessario?fluxo_id=${params?.fluxoId}`,
            options
          );
          dispatch(slice.actions.getAnexosProcessoSuccess(response.data.objeto));
          break;
        }
        case 'anexos necessarios': {
          const response = await axios.get(
            `${BASEURLCC}/v1/creditos/anexos/necessario?fluxo_id=${params?.fluxoId}${
              params?.transicaoId ? `&transicao_id=${params?.transicaoId}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getAnexosNecessariosSuccess(response.data.objeto));
          break;
        }

        default:
          break;
      }
      if (item === 'anexo') {
        dispatch(slice.actions.stopLoadingAnexo());
      } else {
        dispatch(slice.actions.stopLoading());
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
      // const options1 = { headers: { 'content-type': 'multipart/form-data', cc: params?.mail } };
      switch (item) {
        case 'encaminhar': {
          await axios.post(
            `${BASEURLCC}/v1/creditos/funcionario/encaminhar/${params?.perfilId}/${params?.id}/${params?.fluxoId}`,
            dados,
            options
          );
          break;
        }
        case 'arquivar': {
          await axios.patch(`${BASEURLDD}/v1/processos/arquivar/${params?.id}`, dados, options);
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg || ''));
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
        case 'pedido credito': {
          const processo = await axios.put(
            `${BASEURLCC}/v1/creditos/funcionario/${params?.id}/${params?.perfilId}/${params?.estadoId}`,
            dados,
            options1
          );
          dispatch(slice.actions.updatePedidoCCSucess(processo.data.objeto));
          break;
        }
        case 'encaminhar': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/funcionario/encaminhar/${params?.perfilId}/${params?.processoId}/${params?.fluxoId}`,
            dados,
            options
          );
          // dispatch(slice.actions.getColaboradorSuccess(response.data));
          break;
        }
        case 'parecer': {
          await axios.patch(`${BASEURLCC}/v1/creditos/funcionario/dar_parecer`, dados, options);
          dispatch(slice.actions.parecerSuccess(params?.values));
          break;
        }
        case 'responsabilidade': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/outrocr/processo/${params?.perfilId}/${params?.itemId}/${params?.processoId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteResponsabilidadeSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'garantia': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/garantia/processo/${params?.perfilId}/${params?.itemId}/${params?.processoId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteGarantiaSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'entidade': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/entidade/processo/${params?.perfilId}/${params?.itemId}/${params?.processoId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteEntidadeSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'despesa': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/despesa/processo/${params?.perfilId}/${params?.itemId}/${params?.processoId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteDespesaSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'anexo processo': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/anexo/processo/${params?.perfilId}/${params?.itemId}/${params?.processoId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteAnexoProcessoSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'anexo garantia': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/anexo/garantia/${params?.perfilId}/${params?.itemId}/${params?.garantiaId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteAnexoGarantiaSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'anexo entidade': {
          await axios.patch(
            `${BASEURLCC}/v1/creditos/remover/anexo/entidade/${params?.perfilId}/${params?.itemId}/${params?.entidadeId}`,
            null,
            options
          );
          dispatch(slice.actions.deleteAnexoEntidadeSuccess(params));
          dispatch(slice.actions.closeModalAnexo());
          break;
        }
        case 'aceitar': {
          await axios.patch(`${BASEURLDD}/v1/processos/aceitar/${params?.id}`, dados, options);
          const destinos = await axios.get(
            `${BASEURLCC}/v1/creditos/funcionario/destinos/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.aceitarProcessoSuccess({ dados: params, destinos: destinos.data.objeto }));
          break;
        }
        case 'abandonar': {
          await axios.patch(`${BASEURLDD}/v1/processos/abandonar/${params?.id}`, dados, options);
          break;
        }
        case 'resgatar': {
          const response = await axios.post(
            `${BASEURLCC}/v1/creditos/funcionario/resgate/${params?.id}`,
            dados,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data.objeto));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg || ''));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
