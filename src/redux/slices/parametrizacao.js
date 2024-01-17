import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { errorMsg } from '../../utils/normalizeText';
import { BASEURLDD, BASEURLCC } from '../../utils/axios';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  isEdit: false,
  isAdmin: false,
  isSaving: false,
  isLoading: false,
  isOpenView: false,
  isOpenModal: false,
  iAmInGrpGerente: false,
  confirmarCartoes: false,
  fluxo: null,
  acesso: null,
  estado: null,
  origem: null,
  meuFluxo: null,
  transicao: null,
  meuAmbiente: null,
  estadoRegra: null,
  selectedItem: null,
  notificacaoId: null,
  fluxos: [],
  linhas: [],
  anexos: [],
  estados: [],
  acessos: [],
  origens: [],
  despesas: [],
  transicoes: [],
  meusFluxos: [],
  meusacessos: [],
  notificacoes: [],
  regrasEstado: [],
  regrasAnexos: [],
  perfisEstado: [],
  meusAmbientes: [],
  destinatarios: [],
  estadosPerfil: [],
  regrasTransicao: [],
  motivosPendencias: [],
  colaboradoresEstado: [],
};

const slice = createSlice({
  name: 'parametrizacao',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isSaving = false;
      state.isLoading = false;
      state.error = '';
    },

    done(state, action) {
      state.isSaving = false;
      state.done = action.payload;
    },

    resetDone(state) {
      state.done = '';
      state.isSaving = false;
      state.isLoading = false;
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'fluxo':
          state.fluxo = null;
          break;
        case 'estado':
          state.estado = null;
          break;
        case 'estadoParecer':
          state.estadoRegra = null;
          state.regrasEstado = [];
          break;

        default:
          break;
      }
    },

    getFluxosSuccess(state, action) {
      state.fluxos = applySort(action.payload, getComparator('asc', 'assunto'));
    },

    getFluxoSuccess(state, action) {
      state.fluxo = action.payload;
    },

    getMeusAmbientesSuccess(state, action) {
      state.meusAmbientes = action.payload;
      const grpGerent = action.payload?.find((row) => row?.nome?.includes('Gerência'));
      const grpAtend = action.payload?.find((row) => row?.nome?.includes('Atendimento'));
      const currentAmbiente =
        action.payload?.find((row) => row?.id === Number(localStorage.getItem('meuAmbiente'))) ||
        action.payload?.find((row) => row?.id === grpGerent?.id) ||
        action.payload?.find((row) => row?.id === grpAtend?.id) ||
        action.payload?.[0];
      state.iAmInGrpGerente = !!grpGerent;
      state.meuAmbiente = currentAmbiente;
      state.meusFluxos = applySort(currentAmbiente?.fluxos, getComparator('asc', 'assunto')) || [];
      state.meuFluxo = currentAmbiente?.fluxos?.[0] || null;
    },

    getMeusAcessosSuccess(state, action) {
      action.payload?.forEach((row) => {
        const acesso = `${row.objeto}-${row.acesso}`;
        if (!state.meusacessos.includes(acesso)) {
          state.meusacessos.push(acesso);
        }
        if (acesso === 'Todo-111' || acesso === 'Todo-110') {
          state.isAdmin = true;
        }
        if (acesso === 'rececao-cartoes-110') {
          state.confirmarCartoes = true;
        }
        if (acesso === 'arquivar-processo-110') {
          state.arquivarProcessos = true;
        }
      });
    },

    getAcessosSuccess(state, action) {
      state.acessos = action.payload;
    },

    getAcessoSuccess(state, action) {
      state.acesso = action.payload;
    },

    getEstadosSuccess(state, action) {
      state.estados = applySort(action.payload, getComparator('asc', 'nome'));
    },

    getEstadoSuccess(state, action) {
      state.estado = action.payload;
    },

    getPerfisEstadoSuccess(state, action) {
      state.perfisEstado = action.payload;
    },

    getColaboradoresEstadoSuccess(state, action) {
      state.colaboradoresEstado = action.payload?.perfis;
    },

    getEstadosPerfilSuccess(state, action) {
      state.estadosPerfil = action.payload;
    },

    getTransicaoSuccess(state, action) {
      state.transicao = action.payload;
    },

    getOrigemSuccess(state, action) {
      state.origem = action.payload;
    },

    getOrigensSuccess(state, action) {
      state.origens = action.payload;
    },

    getMotivosPendenciasSuccess(state, action) {
      state.motivosPendencias = action.payload;
    },

    getLinhasSuccess(state, action) {
      state.linhas = action.payload;
    },

    getDespesasSuccess(state, action) {
      state.despesas = action.payload;
    },

    getAnexosSuccess(state, action) {
      state.anexos = action.payload || [];
    },

    getRegrasAnexosSuccess(state, action) {
      state.regrasAnexos = action.payload || [];
    },

    getRegrasEstadoSuccess(state, action) {
      state.regrasEstado = action.payload;
    },

    getRegrasTransicaoSuccess(state, action) {
      state.regrasTransicao = action.payload;
    },

    getEstadoRegraSuccess(state, action) {
      state.estadoRegra = action.payload;
    },

    getNotificacoesSuccess(state, action) {
      state.notificacaoId = null;
      state.notificacoes = action.payload;
    },

    getDestinatariosSuccess(state, action) {
      state.destinatarios = action.payload;
    },

    createAcessoSuccess(state, action) {
      state.acessos.push(action.payload);
    },

    createOrigemSuccess(state, action) {
      state.origens.push(action.payload);
    },

    createLinhaSuccess(state, action) {
      state.linhas.push(action.payload);
    },

    createNotificacaoSuccess(state, action) {
      state.notificacoes.push(action.payload);
    },

    createDestinatarioSuccess(state, action) {
      state.destinatarios.push(action.payload);
    },

    createMotivoPendenciaSuccess(state, action) {
      state.motivosPendencias.push(action.payload);
    },

    createRegrasEstadoSuccess(state, action) {
      state.regrasEstado.push(action.payload);
    },

    createRegraAnexoSuccess(state, action) {
      state.regrasAnexos.push(action.payload);
    },

    createTransicaoSuccess(state, action) {
      state.fluxo.transicoes?.push(action.payload);
    },

    createDespesaSuccess(state, action) {
      state.despesas.push(action.payload);
    },

    createAnexoSuccess(state, action) {
      state.anexos.push(action.payload);
    },

    updateAcessoSuccess(state, action) {
      const index = state.acessos.findIndex((row) => row.id === action.payload.id);
      state.acessos[index] = action.payload;
    },

    updateMotivoPendenciaSuccess(state, action) {
      const index = state.motivosPendencias.findIndex((row) => row.id === action.payload.id);
      state.motivosPendencias[index] = action.payload;
    },

    updateTransicaoSuccess(state, action) {
      const index = state.fluxo.transicoes.findIndex((row) => row.id === action.payload.id);
      state.fluxo.transicoes[index] = action.payload;
    },

    updateOrigemSuccess(state, action) {
      const index = state.origens.findIndex((row) => row.id === action.payload.id);
      state.origens[index] = action.payload;
    },

    updateLinhaSuccess(state, action) {
      const index = state.linhas.findIndex((row) => row.id === action.payload.id);
      state.linhas[index] = action.payload;
    },

    updateNotificacaoSuccess(state, action) {
      const index = state.notificacoes.findIndex((row) => row.id === action.payload.id);
      state.notificacoes[index] = action.payload;
    },

    updateDestinatarioSuccess(state, action) {
      const index = state.destinatarios.findIndex((row) => row.id === action.payload.id);
      state.destinatarios[index] = action.payload;
    },

    updateAnexoSuccess(state, action) {
      const index = state.anexos.findIndex((row) => row.id === action.payload.id);
      state.anexos[index] = action.payload;
    },

    updateRegraAnexoSuccess(state, action) {
      const index = state.regrasAnexos.findIndex((row) => row.id === action.payload.id);
      state.regrasAnexos[index] = action.payload;
    },

    updateDespesaSuccess(state, action) {
      const index = state.despesas.findIndex((row) => row.id === action.payload.id);
      state.despesas[index] = action.payload;
    },

    deleteAcessoSuccess(state, action) {
      state.acessos = state.acessos.filter((row) => row.id !== action.payload.id);
    },

    deleteFluxoSuccess(state, action) {
      const index = state.fluxos.findIndex((row) => row.id === action.payload.id);
      state.fluxos[index].is_ativo = false;
    },

    deleteTransicaoSuccess(state, action) {
      state.fluxo.transicoes = state.fluxo.transicoes.filter((row) => row.id !== action.payload);
    },

    deleteMotivoPendenciaSuccess(state, action) {
      state.motivosPendencias = state.motivosPendencias.filter((row) => row.id !== action.payload.id);
    },

    deleteLinhaSuccess(state, action) {
      state.linhas = state.linhas.filter((row) => row.id !== action.payload.id);
    },

    deleteEstadoSuccess(state, action) {
      state.estados = state.estados.filter((row) => row.id !== action.payload.id);
    },

    deleteEstadoPerfilSuccess(state, action) {
      state.estadosPerfil = state.estadosPerfil.filter((row) => row.id !== action.payload.id);
    },

    deletePerfilFromEstadoSuccess(state, action) {
      state.estado.perfis = state.estado.perfis.filter((row) => row.peid !== action.payload.id);
    },

    deleteOrigemSuccess(state, action) {
      state.origens = state.origens.filter((row) => row.id !== action.payload.id);
    },

    deleteDespesaSuccess(state, action) {
      const index = state.despesas.findIndex((row) => row.id === action.payload.id);
      state.despesas[index].ativo = false;
    },

    deleteAnexoSuccess(state, action) {
      const index = state.anexos.findIndex((row) => row.id === action.payload.id);
      state.anexos[index].ativo = false;
    },

    deleteRegraAnexoSuccess(state, action) {
      const index = state.regrasAnexos.findIndex((row) => row.id === action.payload.id);
      state.regrasAnexos[index].ativo = false;
    },

    deleteDestinatarioSuccess(state, action) {
      const index = state.destinatarios.findIndex((row) => row.id === action.payload.id);
      state.destinatarios[index].ativo = false;
    },

    openModal(state, action) {
      switch (action.payload) {
        case 'add':
          state.isEdit = false;
          state.isOpenModal = true;
          break;
        case 'update':
          state.isEdit = true;
          state.isOpenModal = true;
          break;
        case 'view':
          state.isEdit = true;
          state.isOpenView = true;
          break;

        default:
          break;
      }
    },

    openModalItem(state) {
      state.isOpenModal = true;
    },

    selectItem(state, action) {
      state.selectedItem = action.payload;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenView = false;
      state.selectedItem = null;
    },

    changeMeuAmbiente(state, action) {
      state.meuAmbiente = action.payload;
      state.meusFluxos = action.payload?.fluxos;
      state.meuFluxo = action.payload?.fluxos?.[0];
    },

    changeMeuFluxo(state, action) {
      state.meuFluxo = action.payload;
    },

    setNotificacaoId(state, action) {
      state.notificacaoId = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  openModal,
  resetItem,
  selectItem,
  closeModal,
  openModalItem,
  changeMeuFluxo,
  setNotificacaoId,
  changeMeuAmbiente,
} = slice.actions;

// ----------------------------------------------------------------------

export function getFromParametrizacao(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'meusacessos': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${params?.perfilId}`, options);
          dispatch(slice.actions.getMeusAcessosSuccess(response.data));
          break;
        }
        case 'acessos': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${params?.perfilId}`, options);
          dispatch(slice.actions.getAcessosSuccess(response.data));
          break;
        }
        case 'acesso': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos/${params?.perfilId}/${params?.id}`, options);
          dispatch(slice.actions.selectItem(response.data));
          break;
        }
        case 'fluxos': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/${params?.perfilId}`, options);
          dispatch(slice.actions.getFluxosSuccess(response.data));
          break;
        }
        case 'fluxo': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'listagem') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getFluxoSuccess(response.data));
          }
          break;
        }
        case 'ambientes': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/meusambientes/${params?.perfilId}`, options);
          dispatch(slice.actions.getMeusAmbientesSuccess(response.data));
          break;
        }
        case 'transicao': {
          const response = await axios.get(`${BASEURLDD}/v1/transicoes/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'listagem') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getTransicaoSuccess(response.data));
          }
          break;
        }
        case 'origens': {
          const response = await axios.get(`${BASEURLDD}/v1/origens/${params?.perfilId}`, options);
          dispatch(slice.actions.getOrigensSuccess(response.data));
          break;
        }
        case 'origem': {
          const response = await axios.get(`${BASEURLDD}/v1/origens/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'listagem') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getOrigemSuccess(response.data));
          }
          break;
        }
        case 'motivos': {
          const response = await axios.get(`${BASEURLDD}/v1/motivos/all/${params?.perfilId}`, options);
          dispatch(slice.actions.getMotivosPendenciasSuccess(response.data.objeto));
          break;
        }
        case 'linhas': {
          const response = await axios.get(`${BASEURLDD}/v1/linhas/${params?.perfilId}`, options);
          dispatch(slice.actions.getLinhasSuccess(response.data.objeto));
          break;
        }
        case 'despesas': {
          const response = await axios.get(`${BASEURLCC}/v1/suportes/designacao/despesas/gestao`, options);
          dispatch(slice.actions.getDespesasSuccess(response.data.objeto));
          break;
        }
        case 'estados': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.perfilId}`, options);
          dispatch(slice.actions.getEstadosSuccess(response.data));
          break;
        }
        case 'estado': {
          dispatch(slice.actions.resetItem('estado'));
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'listagem') {
            dispatch(slice.actions.selectItem(response.data));
          } else if (params?.from === 'regras transicao') {
            dispatch(slice.actions.getPerfisEstadoSuccess(response?.data?.perfis || []));
          } else {
            dispatch(slice.actions.getEstadoSuccess(response.data));
          }
          break;
        }
        case 'anexos': {
          const response = await axios.get(`${BASEURLCC}/v1/anexos/gestao`, options);
          dispatch(slice.actions.getAnexosSuccess(response.data.objeto));
          break;
        }
        case 'regrasAnexos': {
          const response = await axios.get(`${BASEURLCC}/v1/anexos/regra/byfluxo/${params?.fluxoId}`, options);
          dispatch(slice.actions.getRegrasAnexosSuccess(response.data.objeto));
          break;
        }
        case 'estadosPerfil': {
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${params?.estadoId}/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getEstadosPerfilSuccess(response.data));
          break;
        }
        case 'regrasEstado': {
          const response = await axios.get(
            `${BASEURLCC}/v1/suportes/regra_parecer/estado/${params?.estadoId}`,
            options
          );
          dispatch(slice.actions.getRegrasEstadoSuccess(response.data.objeto));
          break;
        }
        case 'regrasTransicao': {
          const response = await axios.get(`${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.id}`, options);
          dispatch(slice.actions.getRegrasTransicaoSuccess(response.data.objeto));
          break;
        }
        case 'colaboradoresEstado': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.getColaboradoresEstadoSuccess(response.data));
          break;
        }
        case 'notificacoes': {
          const response = await axios.get(`${BASEURLDD}/v1/notificacoes/transicao/${params?.id}`, options);
          dispatch(slice.actions.getNotificacoesSuccess(response.data.objeto));
          break;
        }
        case 'destinatarios': {
          const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
          dispatch(slice.actions.getDestinatariosSuccess(response.data.objeto));
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

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      switch (item) {
        case 'acesso': {
          const response = await axios.post(`${BASEURLDD}/v1/acessos`, dados, options);
          dispatch(slice.actions.createAcessoSuccess(response.data));
          break;
        }
        case 'fluxo': {
          const response = await axios.post(`${BASEURLDD}/v1/fluxos`, dados, options);
          dispatch(slice.actions.selectItem(response.data));
          break;
        }
        case 'clonar fluxo': {
          const response = await axios.post(`${BASEURLDD}/v1/fluxos`, dados, options);
          const transicoes = [];
          params?.transicoes?.forEach((row) => {
            transicoes.push({
              modo: row?.modo,
              to_alert: row?.to_alert,
              fluxo_id: response?.data?.id,
              perfilIDCC: params?.perfilId,
              hasopnumero: row?.hasopnumero,
              prazoemdias: row?.prazoemdias,
              is_paralelo: row?.is_paralelo,
              estado_final_id: row?.estado_final_id,
              estado_inicial_id: row?.estado_inicial_id,
              is_after_devolucao: row?.is_after_devolucao,
              arqhasopnumero: row?.arqhasopnumero || false,
            });
          });
          await axios.post(`${BASEURLDD}/v1/transicoes/multi`, JSON.stringify(transicoes), options);
          dispatch(slice.actions.selectItem(response.data));
          break;
        }
        case 'transicao': {
          const response = await axios.post(`${BASEURLDD}/v1/transicoes`, dados, options);
          dispatch(slice.actions.createTransicaoSuccess(response.data));
          break;
        }
        case 'origem': {
          const response = await axios.post(`${BASEURLDD}/v1/origens`, dados, options);
          dispatch(slice.actions.createOrigemSuccess(response.data));
          break;
        }
        case 'linha': {
          const response = await axios.post(`${BASEURLDD}/v1/linhas`, dados, options);
          dispatch(slice.actions.createLinhaSuccess(response.data.objeto));
          break;
        }
        case 'Despesa': {
          const response = await axios.post(`${BASEURLCC}/v1/suportes/designacao/despesa`, dados, options);
          dispatch(slice.actions.createDespesaSuccess(response.data.objeto));
          break;
        }
        case 'estado': {
          const response = await axios.post(`${BASEURLDD}/v1/estados`, dados, options);
          dispatch(slice.actions.selectItem(response.data));
          break;
        }
        case 'estadoPerfil': {
          await axios.post(`${BASEURLDD}/v1/estados/asscc/perfil`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${JSON.parse(dados)?.perfil_id}/${
              JSON.parse(dados)?.perfil_id_cc
            }`,
            options
          );
          dispatch(slice.actions.getEstadosPerfilSuccess(response.data));
          break;
        }
        case 'perfisEstado': {
          await axios.post(`${BASEURLDD}/v1/estados/asscc/perfis`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/${JSON.parse(dados)?.estado_id}/${JSON.parse(dados)?.perfil_id_cc}`,
            options
          );
          dispatch(slice.actions.getEstadoSuccess(response.data));
          break;
        }
        case 'motivo pendencia': {
          const response = await axios.post(`${BASEURLDD}/v1/motivos/${params?.perfilId}`, dados, options);
          dispatch(slice.actions.createMotivoPendenciaSuccess(response.data.objeto));
          break;
        }
        case 'Anexo': {
          const response = await axios.post(`${BASEURLCC}/v1/anexos`, dados, options);
          dispatch(slice.actions.createAnexoSuccess(response.data.objeto));
          break;
        }
        case 'regra anexo': {
          const response = await axios.post(`${BASEURLCC}/v1/anexos/regra`, dados, options);
          dispatch(slice.actions.createRegraAnexoSuccess(response.data.objeto));
          break;
        }
        case 'regra estado': {
          const response = await axios.post(`${BASEURLCC}/v1/suportes/regra_parecer/estado/default`, dados, options);
          dispatch(slice.actions.getRegrasEstadoSuccess(response.data.objeto));
          break;
        }
        case 'regra estado destribuido': {
          const response = await axios.post(
            `${BASEURLCC}/v1/suportes/regra_parecer/estado/coru/${params?.estadoId}`,
            dados,
            options
          );
          dispatch(slice.actions.createRegraAnexoSuccess(response.data.objeto));
          break;
        }
        case 'regras transicao': {
          const response = await axios.post(
            `${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.estadoId}/${params?.transicaoId}`,
            dados,
            options
          );
          dispatch(slice.actions.getRegrasTransicaoSuccess(response.data.objeto));
          break;
        }
        case 'notificacao': {
          const response = await axios.post(`${BASEURLDD}/v1/notificacoes`, dados, options);
          dispatch(slice.actions.createNotificacaoSuccess(response.data.objeto));
          break;
        }
        case 'destinatario': {
          await axios.post(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, dados, options);
          const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
          dispatch(slice.actions.getDestinatariosSuccess(response.data.objeto));
          break;
        }

        default:
          break;
      }
      if (params?.msg) {
        dispatch(slice.actions.done(params?.msg));
      }
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
      switch (item) {
        case 'acesso': {
          const response = await axios.put(`${BASEURLDD}/v1/acessos/${params?.id}`, dados, options);
          dispatch(slice.actions.updateAcessoSuccess(response.data));
          break;
        }
        case 'fluxo': {
          await axios.put(`${BASEURLDD}/v1/fluxos/${params?.id}`, dados, options);
          break;
        }
        case 'estado': {
          await axios.put(`${BASEURLDD}/v1/estados/${params?.id}`, dados, options);
          break;
        }
        case 'estadoPerfil': {
          await axios.put(`${BASEURLDD}/v1/estados/asscc/perfil`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${JSON.parse(dados)?.perfil_id}/${
              JSON.parse(dados)?.perfil_id_cc
            }`,
            options
          );
          dispatch(slice.actions.getEstadosPerfilSuccess(response.data));
          break;
        }
        case 'transicao': {
          const response = await axios.put(`${BASEURLDD}/v1/transicoes/${params?.id}`, dados, options);
          dispatch(slice.actions.updateTransicaoSuccess(response.data));
          break;
        }
        case 'origem': {
          const response = await axios.put(`${BASEURLDD}/v1/origens/${params?.id}`, dados, options);
          dispatch(slice.actions.updateOrigemSuccess(response.data));
          break;
        }
        case 'motivo pendencia': {
          const response = await axios.put(
            `${BASEURLDD}/v1/motivos/${params?.perfilId}?motivoID=${params?.id}`,
            dados,
            options
          );
          dispatch(slice.actions.updateMotivoPendenciaSuccess(response.data.objeto));
          break;
        }
        case 'linha': {
          const response = await axios.put(`${BASEURLDD}/v1/linhas/${params?.id}`, dados, options);
          dispatch(slice.actions.updateLinhaSuccess(response.data.objeto));
          break;
        }
        case 'notificacao': {
          const response = await axios.put(`${BASEURLDD}/v1/notificacoes/${params?.id}`, dados, options);
          dispatch(slice.actions.updateNotificacaoSuccess(response.data.objeto));
          break;
        }
        case 'destinatario': {
          const response = await axios.put(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, dados, options);
          dispatch(slice.actions.updateDestinatarioSuccess(response.data.objeto));
          break;
        }
        case 'Despesa': {
          const response = await axios.put(`${BASEURLCC}/v1/suportes/designacao/despesa/${params?.id}`, dados, options);
          dispatch(slice.actions.updateDespesaSuccess(response.data.objeto));
          break;
        }
        case 'Anexo': {
          const response = await axios.put(`${BASEURLCC}/v1/anexos/${params?.id}`, dados, options);
          dispatch(slice.actions.updateAnexoSuccess(response.data.objeto));
          break;
        }
        case 'regra anexo': {
          const response = await axios.put(`${BASEURLCC}/v1/anexos/regra/${params?.id}`, dados, options);
          dispatch(slice.actions.updateRegraAnexoSuccess(response.data.objeto));
          break;
        }

        default:
          break;
      }
      if (params?.msg) {
        dispatch(slice.actions.done(params?.msg));
      }
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
        case 'acesso': {
          await axios.delete(`${BASEURLDD}/v1/acessos/${params?.perfilId}/${params?.id}`, options);
          dispatch(slice.actions.deleteAcessoSuccess({ id: params?.id }));
          break;
        }
        case 'fluxo': {
          await axios.delete(`${BASEURLDD}/v1/fluxos/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteFluxoSuccess({ id: params?.id }));
          break;
        }
        case 'estado': {
          await axios.delete(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteEstadoSuccess({ id: params?.id }));
          break;
        }
        case 'transicao': {
          await axios.delete(`${BASEURLDD}/v1/transicoes/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteTransicaoSuccess(params?.id));
          break;
        }
        case 'estadoPerfil': {
          await axios.delete(`${BASEURLDD}/v1/estados/asscc/perfil/${params?.perfilId}?peID=${params?.id}`, options);
          dispatch(slice.actions.deleteEstadoPerfilSuccess({ id: params?.id }));
          break;
        }
        case 'origem': {
          await axios.delete(`${BASEURLDD}/v1/origens/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteOrigemSuccess({ id: params?.id }));
          break;
        }
        case 'motivo pendencia': {
          await axios.delete(`${BASEURLDD}/v1/motivos/${params?.perfilId}?motivoID=${params?.id}`, options);
          dispatch(slice.actions.deleteMotivoPendenciaSuccess({ id: params?.id }));
          break;
        }
        case 'linha': {
          await axios.delete(`${BASEURLDD}/v1/linhas/${params?.linhaID}/${params?.perfilID}`, options);
          dispatch(slice.actions.deleteLinhaSuccess({ id: params?.id }));
          break;
        }
        case 'Despesa': {
          await axios.delete(`${BASEURLCC}/v1/suportes/designacao/despesa/${params?.id}`, options);
          dispatch(slice.actions.deleteDespesaSuccess({ id: params?.id }));
          break;
        }
        case 'Anexo': {
          await axios.delete(`${BASEURLCC}/v1/anexos/${params?.id}`, options);
          dispatch(slice.actions.deleteAnexoSuccess({ id: params?.id }));
          break;
        }
        case 'regra anexo': {
          await axios.delete(`${BASEURLCC}/v1/anexos/regra/${params?.id}`, options);
          dispatch(slice.actions.deleteRegraAnexoSuccess({ id: params?.id }));
          break;
        }
        case 'destinatario': {
          await axios.delete(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
          dispatch(slice.actions.deleteDestinatarioSuccess({ id: params?.id }));
          break;
        }

        default:
          break;
      }
      if (params?.msg) {
        dispatch(slice.actions.done(params?.msg));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
