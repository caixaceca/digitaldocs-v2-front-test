import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/apisUrl';
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
  regrasEstado: [],
  perfisEstado: [],
  tiposTitular: [],
  meusAmbientes: [],
  destinatarios: [],
  estadosPerfil: [],
  tiposGarantia: [],
  regrasTransicao: [],
  motivosPendencia: [],
  motivosTransicao: [],
  colaboradoresEstado: [],
};

const slice = createSlice({
  name: 'parametrizacao',
  initialState,
  reducers: {
    getMeusAmbientesSuccess(state, action) {
      if (action?.payload?.length === 0) return;
      const ambientes = applySort(action?.payload, getComparator('asc', 'nome')).map((item) => ({
        ...item,
        id: item.estado_id,
      }));
      const meuAmbiente = ambientes.find((row) => row.padrao) ?? ambientes[0];

      state.meusAmbientes = ambientes;
      state.meuAmbiente = meuAmbiente;
      state.meusFluxos = meusFluxos(meuAmbiente?.fluxos ?? []);
    },

    getMeusAcessosSuccess(state, action) {
      if (!action.payload || action.payload?.length === 0) return;

      action.payload?.forEach(({ objeto, acesso }) => {
        const chave = `${objeto}-${acesso}`;
        if (!state.meusacessos.includes(chave)) state.meusacessos.push(chave);

        if (chave === 'auditoria-100') state.isAuditoria = true;
        if (chave === 'rececao-cartoes-110') state.confirmarCartoes = true;
        if (chave === 'arquivar-processo-110') state.arquivarProcessos = true;
        if (chave === 'Todo-111' || chave === 'Todo-110') state.isAdmin = true;
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

    changeMeuAmbiente(state, action) {
      state.meuAmbiente = action.payload;
      state.meusFluxos = meusFluxos(action.payload?.fluxos ?? []);
      state.meuFluxo = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, getSuccess, closeModal, changeMeuAmbiente } = slice.actions;

// ----------------------------------------------------------------------

export function geParamsUtil() {
  return async (dispatch) => {
    dispatch(getFromParametrizacao('meusambientes'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromParametrizacao('meusacessos'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromParametrizacao('fluxos'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromParametrizacao('estados'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromParametrizacao('origens'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromParametrizacao('motivosPendencia'));
  };
}

export function getFromParametrizacao(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

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
        (item === 'documento' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'motivoTransicao' && `/v1/motivos_transicoes/detalhe/${perfilId}?id=${params?.id}`) ||
        (item === 'despesa' && `/v1/despesas/tipos/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'checklistitem' &&
          `/v1/tipos_documentos/checklist/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        // LISTA
        (item === 'linhas' && `/v1/linhas/${perfilId}`) ||
        (item === 'fluxos' && `/v1/fluxos/${perfilId}`) ||
        (item === 'estados' && `/v1/estados/${perfilId}`) ||
        (item === 'origens' && `/v1/origens/${perfilId}`) ||
        (item === 'acessos' && `/v1/acessos?perfilID=${perfilId}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/all/${perfilId}`) ||
        (item === 'meusacessos' && `/v1/acessos?perfilID=${perfilId}`) ||
        (item === 'componentes' && `/v2/processos/componentes/${perfilId}`) ||
        (item === 'meusambientes' && `/v1/fluxos/meusambientes/v2/${perfilId}`) ||
        (item === 'notificacoes' && `/v1/notificacoes/transicao/${params?.id}`) ||
        (item === 'tiposTitular' && `/v2/processos/tipos_titulares/${perfilId}`) ||
        (item === 'tiposGarantia' && `/v2/processos/tipos_garantias/${perfilId}`) ||
        (item === 'colaboradoresEstado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'regrasTransicao' && `/v1/suportes/regra_parecer/transicao/${params?.id}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/byperfilid/${params?.estadoId}/${perfilId}`) ||
        (item === 'despesas' && `/v1/despesas/tipos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'documentos' && `/v1/tipos_documentos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'motivosTransicao' &&
          !!params?.fluxoId &&
          `/v1/motivos_transicoes/lista/${perfilId}?fluxo_id=${params?.fluxoId}&ativo=${!params?.inativos}`) ||
        (item === 'checklist' &&
          `/v1/tipos_documentos/checklist/lista?perfil_cc_id=${perfilId}&fluxo_id=${params?.fluxoId}&ativo=${!params?.inativos}`) ||
        '';
      if (apiUrl) {
        const response = await axios.get(`${BASEURLDD}${apiUrl}`, options);
        const label =
          (item === 'estados' && 'nome') ||
          (item === 'fluxos' && 'assunto') ||
          (item === 'motivosPendencia' && 'motivo') ||
          ((item === 'motivosTransicao' || item === 'despesas' || item === 'documentos') && 'designacao') ||
          '';
        if (item === 'meusacessos') dispatch(slice.actions.getMeusAcessosSuccess(response.data));
        else if (item === 'meusambientes') dispatch(slice.actions.getMeusAmbientesSuccess(response.data.objeto));
        else if (item === 'colaboradoresEstado')
          dispatch(slice.actions.getSuccess({ item, dados: response?.data?.perfis || [] }));
        else
          dispatch(
            slice.actions.getSuccess({
              item: params?.item || item,
              dados: response?.data?.objeto || response?.data,
              label,
            })
          );
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'fluxo' && `/v1/fluxos`) ||
        (item === 'linhas' && `/v1/linhas`) ||
        (item === 'estado' && `/v1/estados`) ||
        (item === 'acessos' && `/v1/acessos`) ||
        (item === 'origens' && `/v1/origens`) ||
        (item === 'acessos' && `/v1/acessos`) ||
        (item === 'clonar fluxo' && `/v1/fluxos`) ||
        (item === 'transicoes' && `/v1/transicoes`) ||
        (item === 'notificacoes' && `/v1/notificacoes`) ||
        (item === 'perfisEstado' && `/v1/estados/asscc/perfis`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}`) ||
        (item === 'motivosTransicao' && `/v1/motivos_transicoes/${perfilId}`) ||
        (item === 'despesas' && `/v1/despesas/tipos?perfil_cc_id=${perfilId}`) ||
        (item === 'regrasEstado' && `/v1/suportes/regra_parecer/estado/default`) ||
        (item === 'documentos' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}`) ||
        (item === 'destinatario' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'checklist' && `/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}`) ||
        (item === 'regra estado destribuido' && `/v1/suportes/regra_parecer/estado/coru/${params?.estadoId}`) ||
        (item === 'regrasTransicao' &&
          `/v1/suportes/regra_parecer/transicao/${params?.estadoId}/${params?.transicaoId}`) ||
        '';

      if (apiUrl) {
        const response = await axios.post(`${BASEURLDD}${apiUrl}`, dados, options);
        if (item === 'clonar fluxo') {
          if (params?.transicoes?.length > 0)
            await axios.post(
              `${BASEURLDD}/v1/transicoes/multi`,
              JSON.stringify(
                params?.transicoes?.map((row) => ({ ...row, fluxo_id: response?.data?.id, perfilIDCC: perfilId }))
              ),
              options
            );
          const fluxo = await axios.get(`${BASEURLDD}/v1/fluxos/${response?.data?.id}/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'fluxo', dados: fluxo.data }));
        } else if (item === 'destinatario') {
          const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
          dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
        } else if (item === 'fluxo' || item === 'estado') {
          dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data }));
        } else if (item === 'acessos') {
          dispatch(slice.actions.createSuccess({ item, dados: response.data }));
        } else if (item !== 'regra estado destribuido') {
          dispatch(
            slice.actions.createSuccess({
              item1: params?.item1 || '',
              item: item === 'perfisEstado' ? 'perfis' : item,
              dados: (item === 'perfisEstado' && JSON.parse(dados)?.perfis) || response.data?.objeto || response.data,
            })
          );
        }
      }
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

      const apiUrl =
        (item === 'fluxo' && `/v1/fluxos/${params?.id}`) ||
        (item === 'linhas' && `/v1/linhas/${params?.id}`) ||
        (item === 'estado' && `/v1/estados/${params?.id}`) ||
        (item === 'acessos' && `/v1/acessos/${params?.id}`) ||
        (item === 'origens' && `/v1/origens/${params?.id}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil`) ||
        (item === 'transicoes' && `/v1/transicoes/${params?.id}`) ||
        (item === 'notificacoes' && `/v1/notificacoes/${params?.id}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'motivosTransicao' && `/v1/motivos_transicoes/${perfilId}?id=${params?.id}`) ||
        (item === 'despesas' && `/v1/despesas/tipos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'documentos' && `/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'checklist' && `/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        '';

      if (apiUrl) {
        const response = await axios.put(`${BASEURLDD}${apiUrl}`, dados, options);
        const dadosR = (item === 'acessos' && response.data) || response.data?.objeto || response.data || null;
        if (item === 'fluxo' || item === 'estado') dispatch(slice.actions.getSuccess({ item, dados: dadosR }));
        else dispatch(slice.actions.updateSuccess({ item, item1: params?.item1 || '', dados: dadosR }));
      }
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
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        (item === 'estado' && `/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'acessos' && `/v1/acessos/${perfilId}/${params?.id}`) ||
        (item === 'origens' && `/v1/origens/${params?.id}/${perfilId}`) ||
        (item === 'transicoes' && `/v1/transicoes/${params?.id}/${perfilId}`) ||
        (item === 'linhas' && `/v1/linhas/${params?.linhaID}/${params?.perfilID}`) ||
        (item === 'destinatarios' && `/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'estadosPerfil' && `/v1/estados/asscc/perfil/${perfilId}?peID=${params?.id}`) ||
        '';

      if (apiUrl) {
        await axios.delete(`${BASEURLDD}${apiUrl}`, options);
        dispatch(
          slice.actions.deleteSuccess({
            item,
            id: params?.id,
            item1: params?.item1 || '',
            destaivar: item === 'destinatario',
          })
        );
      }

      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export const meusFluxos = (fluxos) =>
  applySort(fluxos ?? [], getComparator('asc', 'assunto')).map((item) => ({ ...item, id: item.fluxo_id }));
