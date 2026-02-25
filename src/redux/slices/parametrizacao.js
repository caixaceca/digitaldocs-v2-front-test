import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { API_FORMINGA_URL } from '../../utils/apisUrl';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
//
import {
  hasError,
  actionGet,
  doneSucess,
  actionCreate,
  actionUpdate,
  actionDelete,
  headerOptions,
  actionOpenModal,
  selectUtilizador,
  actionCloseModal,
} from './sliceActions';
import { getAccessToken } from './intranet';

// ---------------------------------------------------------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  modalParams: '',
  isEdit: false,
  isAdmin: false,
  decisor: false,
  isSaving: false,
  isLoading: false,
  isOpenView: false,
  isOpenModal: false,
  isAuditoria: false,
  confirmarCartoes: false,
  arquivarProcessos: false,
  fluxo: null,
  acesso: null,
  estado: null,
  origem: null,
  meuFluxo: null,
  meuAmbiente: null,
  estadoRegra: null,
  selectedItem: null,
  fluxos: [],
  linhas: [],
  estados: [],
  acessos: [],
  origens: [],
  despesas: [],
  checklist: [],
  documentos: [],
  meusFluxos: [],
  meusacessos: [],
  componentes: [],
  notificacoes: [],
  perfisEstado: [],
  tiposTitular: [],
  meusAmbientes: [],
  destinatarios: [],
  estadosPerfil: [],
  motivosPendencia: [],
  motivosTransicao: [],
  colaboradoresEstado: [],
};

const slice = createSlice({
  name: 'parametrizacao',
  initialState,
  reducers: {
    getMeusAmbientes(state, { payload }) {
      const { dados = [], params = null } = payload;
      if (!dados?.length) return;
      let meuAmbiente = null;
      const estados = applySort(dados, getComparator('asc', 'nome')).map((item) => ({ ...item, id: item.estado_id }));

      const idAmbienteSalvo = Number(localStorage.getItem('meuAmbiente'));
      if (idAmbienteSalvo) meuAmbiente = estados.find((a) => a.id === idAmbienteSalvo) || null;
      if (!meuAmbiente && params?.inicial) meuAmbiente = estados.find((a) => a.padrao) || null;
      if (meuAmbiente?.id) localStorage.setItem('meuAmbiente', meuAmbiente.id);
      const fluxosDoAmbiente = meusFluxos(meuAmbiente?.fluxos ?? []);

      const idFluxoSalvo = Number(localStorage.getItem('meuFluxo'));
      const meuFluxo = fluxosDoAmbiente.find((f) => f.id === idFluxoSalvo) || null;

      Object.assign(state, { meusAmbientes: estados, meuAmbiente, meusFluxos: fluxosDoAmbiente, meuFluxo });
    },

    getMeusAcessos(state, action) {
      if (!action.payload || action.payload?.length === 0) return;

      action.payload?.forEach(({ objeto, acesso }) => {
        const chave = `${objeto}-${acesso}`;
        if (!state.meusacessos.includes(chave)) state.meusacessos.push(chave);

        if (chave === 'Todo-111') state.isAdmin = true;
        if (chave === 'auditoria-100') state.isAuditoria = true;
        if (chave === 'rececao-cartoes-110') state.confirmarCartoes = true;
        if (chave === 'arquivar-processo-110') state.arquivarProcessos = true;
      });
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    createSuccess(state, action) {
      actionCreate(state, action.payload);
    },

    updateSuccess(state, action) {
      actionUpdate(state, action.payload);
    },

    deleteSuccess(state, action) {
      actionDelete(state, action.payload);
    },

    openModal(state, action) {
      actionOpenModal(state, action.payload);
    },

    closeModal(state) {
      actionCloseModal(state);
    },

    addRole(state, action) {
      if (!state.meusacessos.includes(action.payload)) state.meusacessos.push(action.payload);
    },

    setModal(state, action) {
      state.isEdit = !!action?.payload?.isEdit;
      state.modalParams = action?.payload?.item || '';
      state.selectedItem = action?.payload?.dados || null;
    },

    changeMeuAmbiente(state, { payload }) {
      state.meuFluxo = null;
      state.meuAmbiente = payload || null;
      state.meusFluxos = meusFluxos(payload?.fluxos || []);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, getSuccess, closeModal, setModal, changeMeuAmbiente, addRole } = slice.actions;

// ---------------------------------------------------------------------------------------------------------------------

export function getFromParametrizacao(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.reset) dispatch(slice.actions.getSuccess({ item, dados: params.reset.val }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        // DETALHES
        (item === 'fluxo' && `/v1/fluxos/${params?.id}/${perfilId}`) ||
        (item === 'estado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'origem' && `/v1/origens/${params?.id}/${perfilId}`) ||
        (item === 'acesso' && `/v1/acessos/${perfilId}/${params?.id}`) ||
        (item === 'motivoTransicao' && `/v1/motivos_transicoes/detalhe?id=${params?.id}`) ||
        (item === 'documento' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'despesa' && `/v1/despesas/tipos/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'checklistitem' &&
          `/v1/tipos_documentos/checklist/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        // LISTA
        (item === 'linhas' && `/v1/linhas/${perfilId}`) ||
        (item === 'fluxos' && `/v1/fluxos/${perfilId}`) ||
        (item === 'estados' && `/v1/estados/${perfilId}`) ||
        (item === 'origens' && `/v1/origens/${perfilId}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/all/${perfilId}`) ||
        (item === 'meusacessos' && `/v1/acessos?perfilID=${perfilId}`) ||
        (item === 'acessos' && `/v1/acessos?perfilID=${params?.perfilId}`) ||
        (item === 'componentes' && `/v2/processos/componentes/${perfilId}`) ||
        (item === 'transicao' && `/v1/transicoes/${params?.id}/${perfilId}`) ||
        (item === 'meusambientes' && `/v2/fluxos/meus-ambientes/${perfilId}`) ||
        (item === 'notificacoes' && `/v1/notificacoes/transicao/${params?.id}`) ||
        (item === 'tiposTitular' && `/v2/processos/tipos_titulares/${perfilId}`) ||
        (item === 'colaboradoresEstado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/byperfilid/${params?.estadoId}/${perfilId}`) ||
        (item === 'despesas' && `/v1/despesas/tipos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'documentos' && `/v1/tipos_documentos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'motivosTransicao' &&
          `/v1/motivos_transicoes/lista?ativo=${!params?.inativos}${`&para_seguimento=${
            params?.modo === 'Seguimento' ? 'true' : 'false'
          }`}${params?.fluxoId ? `&fluxo_id=${params?.fluxoId}` : ''}`) ||
        (item === 'checklist' &&
          `/v1/tipos_documentos/checklist/lista?perfil_cc_id=${perfilId}&fluxo_id=${
            params?.fluxoId
          }&ativo=${!params?.inativos}${params?.transicaoId ? `&transicao_id=${params?.transicaoId}` : ''}`) ||
        '';
      if (apiUrl) {
        const response = await axios.get(`${API_FORMINGA_URL}${apiUrl}`, options);
        const label =
          (item === 'estados' && 'nome') ||
          (item === 'fluxos' && 'assunto') ||
          (item === 'motivosPendencia' && 'motivo') ||
          ((item === 'motivosTransicao' || item === 'despesas' || item === 'documentos') && 'designacao') ||
          '';
        if (item === 'meusacessos') dispatch(slice.actions.getMeusAcessos(response.data));
        else if (item === 'meusambientes')
          dispatch(slice.actions.getMeusAmbientes({ dados: response.data?.objeto || [], params }));
        else if (item === 'colaboradoresEstado') {
          dispatch(slice.actions.getSuccess({ item, dados: response?.data?.objeto?.perfis || [] }));
          dispatch(slice.actions.getSuccess({ item: 'decisor', dados: !!response?.data?.objeto?.is_decisao }));
        } else
          dispatch(
            slice.actions.getSuccess({
              item: params?.item || item,
              dados: response?.data?.objeto || response?.data,
              label,
            })
          );
      }
      params?.onClose?.();
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function createItem(item, body, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'fluxo' && `/v1/fluxos`) ||
        (item === 'linhas' && `/v1/linhas`) ||
        (item === 'acessos' && `/v1/acessos`) ||
        (item === 'origens' && `/v1/origens`) ||
        (item === 'acessos' && `/v1/acessos`) ||
        (item === 'clonar fluxo' && `/v1/fluxos`) ||
        (item === 'notificacoes' && `/v1/notificacoes`) ||
        (item === 'estado' && `/v1/estados/${perfilId}`) ||
        (item === 'perfis' && `/v1/estados/asscc/perfis`) ||
        (item === 'transicoes' && `/v1/transicoes/multi`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil`) ||
        (item === 'motivosTransicao' && `/v1/motivos_transicoes`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}`) ||
        (item === 'despesas' && `/v1/despesas/tipos?perfil_cc_id=${perfilId}`) ||
        (item === 'documentos' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'checklist' && `/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}`) ||
        (item === 'regrasEstado' && `/v1/estados/${params?.estadoId}/regras_pareceres/${perfilId}`) ||
        (item === 'regrasTransicao' && `/v1/transicoes/${params?.estadoId}/regras_parecers/${perfilId}`) ||
        '';

      if (apiUrl) {
        const response = await axios.post(`${API_FORMINGA_URL}${apiUrl}`, body, options);
        if (item === 'clonar fluxo') {
          if (params?.transicoes?.length > 0) {
            const id = response?.data?.id;
            const transicoes = params?.transicoes?.map((row) => ({ ...row, perfilIDCC: perfilId, fluxo_id: id }));
            await axios.post(`${API_FORMINGA_URL}/v1/transicoes/multi`, JSON.stringify(transicoes), options);
          }
          const fluxo = await axios.get(`${API_FORMINGA_URL}/v1/fluxos/${response?.data?.id}/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'fluxo', dados: fluxo.data }));
        } else if (item === 'transicoes' || item === 'destinatarios') {
          dispatch(getFromParametrizacao(item === 'transicoes' ? 'fluxo' : item, { id: params?.id }));
        } else if (params?.getItem) {
          const data = response.data?.objeto || response.data || null;
          dispatch(slice.actions.getSuccess({ item: params?.getItem, dados: data }));
        } else if (item === 'acessos') dispatch(slice.actions.createSuccess({ item, dados: response.data }));
        else if (item === 'perfis') dispatch(getFromParametrizacao('estado', { id: params?.id }));
        else {
          const dados = response.data?.objeto || response.data;
          dispatch(slice.actions.createSuccess({ item, item1: params?.item1 || '', dados }));
        }
      }
      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function updateItem(item, body, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'fluxo' && `/v1/fluxos/${params?.id}`) ||
        (item === 'linhas' && `/v1/linhas/${params?.id}`) ||
        (item === 'acessos' && `/v1/acessos/${params?.id}`) ||
        (item === 'origens' && `/v1/origens/${params?.id}`) ||
        (item === 'transicoes' && `/v1/transicoes/${params?.id}`) ||
        (item === 'notificacoes' && `/v1/notificacoes/${params?.id}`) ||
        (item === 'estado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil?id=${params?.id}`) ||
        (item === 'motivosTransicao' && `/v1/motivos_transicoes?id=${params?.id}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'despesas' && `/v1/despesas/tipos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'documentos' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'checklist' && `/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'regrasEstado' &&
          `/v1/estados/${params?.estadoId}/regras_pareceres/${perfilId}?regra_id=${params?.id}`) ||
        (item === 'regrasTransicao' &&
          `/v1/transicoes/${params?.estadoId}/regras_parecers/${perfilId}?regra_id=${params?.id}`) ||
        '';

      if (apiUrl) {
        const response = await axios.put(`${API_FORMINGA_URL}${apiUrl}`, body, options);
        const dadosR = (item === 'acessos' && response.data) || response.data?.objeto || response.data || null;
        if (item === 'fluxo' || item === 'estado' || params?.getItem)
          dispatch(slice.actions.getSuccess({ item: params?.getItem || item, dados: dadosR }));
        else dispatch(slice.actions.updateSuccess({ item: params?.item || item, item1: params?.item1, dados: dadosR }));
      }
      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        (item === 'notificacoes' && `/v1/notificacoes/${params?.id}`) ||
        (item === 'estado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'acessos' && `/v1/acessos/${perfilId}/${params?.id}`) ||
        (item === 'origens' && `/v1/origens/${params?.id}/${perfilId}`) ||
        (item === 'linhas' && `/v1/linhas/${params?.linhaID}/${perfilId}`) ||
        (item === 'transicoes' && `/v1/transicoes/${params?.id}/${perfilId}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil/${perfilId}?peID=${params?.id}`) ||
        (item === 'regrasEstado' &&
          `/v1/estados/${params?.estadoId}/regras_pareceres/${perfilId}?regra_id=${params?.id}`) ||
        (item === 'regrasTransicao' &&
          `/v1/transicoes/${params?.estadoId}/regras_parecers/${perfilId}?regra_id=${params?.id}`) ||
        '';

      if (apiUrl) {
        const response = await axios.delete(`${API_FORMINGA_URL}${apiUrl}`, options);
        if (params?.getItem) dispatch(slice.actions.getSuccess({ item: params?.getItem, dados: response.data.objeto }));
        {
          const item1 = params?.item1 || '';
          const desativar = item === 'destinatario';
          dispatch(slice.actions.deleteSuccess({ id: params?.id, item: params?.item || item, item1, desativar }));
        }
      }
      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export const meusFluxos = (fluxos) =>
  applySort(
    (fluxos ?? [])?.filter(({ ativo }) => ativo),
    getComparator('asc', 'assunto')
  )?.map((item) => ({ ...item, id: item.fluxo_id }));
