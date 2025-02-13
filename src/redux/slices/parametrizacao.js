import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD, BASEURLCC } from '../../utils/axios';
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
  garantias: [],
  documentos: [],
  meusFluxos: [],
  meusacessos: [],
  notificacoes: [],
  regrasEstado: [],
  perfisEstado: [],
  meusAmbientes: [],
  destinatarios: [],
  estadosPerfil: [],
  regrasTransicao: [],
  motivosPendencia: [],
  motivosTransicao: [],
  colaboradoresEstado: [],
  colaboradoresGestor: [],
};

const slice = createSlice({
  name: 'parametrizacao',
  initialState,
  reducers: {
    getMeusAmbientesSuccess(state, action) {
      const ambientes = applySort(action?.payload ?? [], getComparator('asc', 'nome')).map((item) => ({
        ...item,
        id: item.estado_id,
      }));

      state.meusAmbientes = ambientes;
      state.meuAmbiente = ambientes.find((row) => row.padrao) ?? ambientes[0];
      state.meusFluxos = applySort(state.meuAmbiente?.fluxos ?? [], getComparator('asc', 'assunto')).map((item) => ({
        ...item,
        id: item.fluxo_id,
      }));
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
      state.meusFluxos = applySort(action.payload?.fluxos ?? [], getComparator('asc', 'assunto')).map((item) => ({
        ...item,
        id: item.fluxo_id,
      }));
      state.meuFluxo = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, getSuccess, closeModal, changeMeuAmbiente } = slice.actions;

// ----------------------------------------------------------------------

export function getFromParametrizacao(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        // DETALHES
        (item === 'fluxo' && `${BASEURLDD}/v1/fluxos/${params?.id}/${perfilId}`) ||
        (item === 'estado' && `${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'origem' && `${BASEURLDD}/v1/origens/${params?.id}/${perfilId}`) ||
        (item === 'acesso' && `${BASEURLDD}/v1/acessos/${perfilId}/${params?.id}`) ||
        (item === 'documento' && `${BASEURLDD}/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'motivoTransicao' && `${BASEURLDD}/v1/motivos_transicoes/detalhe/${perfilId}?id=${params?.id}`) ||
        (item === 'despesa' && `${BASEURLDD}/v1/despesas/tipos/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'grantia' &&
          `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/${params?.id}?perfil_cc_id=${perfilId}`) ||
        (item === 'checklistitem' &&
          `${BASEURLDD}/v1/tipos_documentos/checklist/detail?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        // LISTA
        (item === 'linhas' && `${BASEURLDD}/v1/linhas/${perfilId}`) ||
        (item === 'fluxos' && `${BASEURLDD}/v1/fluxos/${perfilId}`) ||
        (item === 'estados' && `${BASEURLDD}/v1/estados/${perfilId}`) ||
        (item === 'origens' && `${BASEURLDD}/v1/origens/${perfilId}`) ||
        (item === 'acessos' && `${BASEURLDD}/v1/acessos?perfilID=${perfilId}`) ||
        (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/all/${perfilId}`) ||
        (item === 'notificacoes' && `${BASEURLDD}/v1/notificacoes/transicao/${params?.id}`) ||
        (item === 'destinatarios' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'regrasEstado' && `${BASEURLCC}/v1/suportes/regra_parecer/estado/${params?.estadoId}`) ||
        (item === 'regrasTransicao' && `${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.id}`) ||
        (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/byperfilid/${params?.estadoId}/${perfilId}`) ||
        (item === 'despesas' &&
          `${BASEURLDD}/v1/despesas/tipos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'documentos' &&
          `${BASEURLDD}/v1/tipos_documentos/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'garantias' &&
          `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/lista?perfil_cc_id=${perfilId}&ativo=${!params?.inativos}`) ||
        (item === 'motivosTransicao' &&
          !!params?.fluxoId &&
          `${BASEURLDD}/v1/motivos_transicoes/lista/${perfilId}?fluxo_id=${params?.fluxoId}&ativo=${!params?.inativos}`) ||
        (item === 'checklist' &&
          `${BASEURLDD}/v1/tipos_documentos/checklist/lista?perfil_cc_id=${perfilId}&fluxo_id=${params?.fluxoId}&ativo=${!params?.inativos}`) ||
        '';
      if (apiUrl) {
        const response = await axios.get(apiUrl, options);
        const label =
          (item === 'estados' && 'nome') ||
          (item === 'fluxos' && 'assunto') ||
          (item === 'motivosPendencia' && 'motivo') ||
          ((item === 'motivosTransicao' || item === 'despesas' || item === 'documentos') && 'designacao') ||
          '';
        dispatch(
          slice.actions.getSuccess({
            item: params?.item || item,
            dados: response?.data?.objeto || response?.data,
            label,
          })
        );
      }

      switch (item) {
        // ---- LISTA --------------------------------------------------------------------------------------------------
        case 'meusacessos': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${perfilId}`, options);
          dispatch(slice.actions.getMeusAcessosSuccess(response.data));
          break;
        }
        case 'meusambientes': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/meusambientes/v2/${perfilId}`, options);
          dispatch(slice.actions.getMeusAmbientesSuccess(response.data.objeto));

          const estadosGestor = response.data?.objeto?.filter((item) => item?.gestor);
          const estadosPromises = estadosGestor.map(async (row) => {
            const estado = axios.get(`${BASEURLDD}/v1/estados/${row?.estado_id}/${perfilId}`, options);
            return estado;
          });
          const estados = await Promise.all(estadosPromises);
          const colaboradoresIds = [perfilId];
          await estados?.forEach((row) => {
            row?.data?.perfis?.forEach((item) => {
              if (!colaboradoresIds?.includes(item?.perfil_id)) colaboradoresIds?.push(item?.perfil_id);
            });
          });
          dispatch(slice.actions.getSuccess({ item: 'colaboradoresGestor', dados: colaboradoresIds }));
          break;
        }
        case 'colaboradoresEstado': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item, dados: response.data.perfis }));
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

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'fluxo' && `${BASEURLDD}/v1/fluxos`) ||
        (item === 'linhas' && `${BASEURLDD}/v1/linhas`) ||
        (item === 'estado' && `${BASEURLDD}/v1/estados`) ||
        (item === 'acessos' && `${BASEURLDD}/v1/acessos`) ||
        (item === 'origens' && `${BASEURLDD}/v1/origens`) ||
        (item === 'acessos' && `${BASEURLDD}/v1/acessos`) ||
        (item === 'clonar fluxo' && `${BASEURLDD}/v1/fluxos`) ||
        (item === 'transicoes' && `${BASEURLDD}/v1/transicoes`) ||
        (item === 'notificacoes' && `${BASEURLDD}/v1/notificacoes`) ||
        (item === 'perfisEstado' && `${BASEURLDD}/v1/estados/asscc/perfis`) ||
        (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil`) ||
        (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}`) ||
        (item === 'motivosTransicao' && `${BASEURLDD}/v1/motivos_transicoes/${perfilId}`) ||
        (item === 'despesas' && `${BASEURLDD}/v1/despesas/tipos?perfil_cc_id=${perfilId}`) ||
        (item === 'regrasEstado' && `${BASEURLCC}/v1/suportes/regra_parecer/estado/default`) ||
        (item === 'documentos' && `${BASEURLDD}/v1/tipos_documentos?perfil_cc_id=${perfilId}`) ||
        (item === 'destinatario' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'checklist' && `${BASEURLDD}/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}`) ||
        (item === 'garantias' && `${BASEURLDD}/v1/tipos_garantias/tipo_garantia?perfil_cc_id=${perfilId}`) ||
        (item === 'regra estado destribuido' &&
          `${BASEURLCC}/v1/suportes/regra_parecer/estado/coru/${params?.estadoId}`) ||
        (item === 'regrasTransicao' &&
          `${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.estadoId}/${params?.transicaoId}`) ||
        '';

      if (apiUrl) {
        const response = await axios.post(apiUrl, dados, options);
        if (item === 'clonar fluxo') {
          if (params?.transicoes?.length > 0)
            await axios.post(
              `${BASEURLDD}/v1/transicoes/multi`,
              JSON.stringify(
                params?.transicoes?.map((row) => ({ ...row, fluxo_id: response?.data?.id, perfilIDCC: perfilId }))
              ),
              options
            );
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/${response?.data?.id}/${perfilId}`, options);
          dispatch(slice.actions.getSuccess({ item: 'fluxo', dados: response.data }));
        } else if (item === 'destinatario') {
          const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
          dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
        } else if (item === 'fluxo' || item === 'estado') {
          dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data }));
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
        (item === 'fluxo' && `${BASEURLDD}/v1/fluxos/${params?.id}`) ||
        (item === 'linhas' && `${BASEURLDD}/v1/linhas/${params?.id}`) ||
        (item === 'estado' && `${BASEURLDD}/v1/estados/${params?.id}`) ||
        (item === 'acessos' && `${BASEURLDD}/v1/acessos/${params?.id}`) ||
        (item === 'origens' && `${BASEURLDD}/v1/origens/${params?.id}`) ||
        (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil`) ||
        (item === 'transicoes' && `${BASEURLDD}/v1/transicoes/${params?.id}`) ||
        (item === 'notificacoes' && `${BASEURLDD}/v1/notificacoes/${params?.id}`) ||
        (item === 'destinatarios' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'motivosTransicao' && `${BASEURLDD}/v1/motivos_transicoes/${perfilId}?id=${params?.id}`) ||
        (item === 'despesas' && `${BASEURLDD}/v1/despesas/tipos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'documentos' && `${BASEURLDD}/v1/tipos_documentos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        (item === 'garantias' &&
          `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/${params?.id}?perfil_cc_id=${perfilId}`) ||
        (item === 'checklist' &&
          `${BASEURLDD}/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
        '';

      if (apiUrl) {
        const response = await axios.put(apiUrl, dados, options);
        if (item === 'fluxo' || item === 'estado') {
          dispatch(slice.actions.getSuccess({ item, dados: response.data }));
        } else {
          dispatch(
            slice.actions.updateSuccess({
              item,
              item1: params?.item1 || '',
              dados: response.data?.objeto || response.data,
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

export function deleteItem(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const apiUrl =
        (item === 'estado' && `${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`) ||
        (item === 'acessos' && `${BASEURLDD}/v1/acessos/${perfilId}/${params?.id}`) ||
        (item === 'origens' && `${BASEURLDD}/v1/origens/${params?.id}/${perfilId}`) ||
        (item === 'transicoes' && `${BASEURLDD}/v1/transicoes/${params?.id}/${perfilId}`) ||
        (item === 'linhas' && `${BASEURLDD}/v1/linhas/${params?.linhaID}/${params?.perfilID}`) ||
        (item === 'destinatarios' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
        (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
        (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil/${perfilId}?peID=${params?.id}`) ||
        '';

      if (apiUrl) {
        await axios.delete(apiUrl, options);
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
