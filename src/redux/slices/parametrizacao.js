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
  actionReset,
  actionCreate,
  actionUpdate,
  actionDelete,
  actionOpenModal,
  actionCloseModal,
  actionResponseMsg,
} from './sliceActions';

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
  anexos: [],
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
  regrasAnexos: [],
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
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    responseMsg(state, action) {
      actionResponseMsg(state, action.payload);
    },

    resetItem(state, action) {
      actionReset(state, action.payload);
    },

    getMeusAmbientesSuccess(state, action) {
      const ambientes = applySort(action?.payload || [], getComparator('asc', 'nome'))?.map((item) => ({
        ...item,
        id: item?.estado_id,
      }));
      state.meusAmbientes = ambientes;
      const currentAmbiente = ambientes?.find((row) => row?.padrao) || ambientes?.[0];
      state.meuAmbiente = currentAmbiente;
      state.meusFluxos = applySort(currentAmbiente?.fluxos || [], getComparator('asc', 'assunto'))?.map((item) => ({
        ...item,
        id: item?.fluxo_id,
      }));
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
        if (acesso === 'auditoria-100') {
          state.isAuditoria = true;
        }
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
      state.meusFluxos = applySort(action.payload?.fluxos || [], getComparator('asc', 'assunto'))?.map((item) => ({
        ...item,
        id: item?.fluxo_id,
      }));
      state.meuFluxo = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, resetItem, getSuccess, closeModal, changeMeuAmbiente } = slice.actions;

// ----------------------------------------------------------------------

export function getFromParametrizacao(item, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        dispatch(slice.actions.setLoading(true));
        const options = { headers: { cc: mail } };

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
                if (!colaboradoresIds?.includes(item?.perfil_id)) {
                  colaboradoresIds?.push(item?.perfil_id);
                }
              });
            });
            dispatch(slice.actions.getSuccess({ item: 'colaboradoresGestor', dados: colaboradoresIds }));
            break;
          }
          case 'acessos': {
            const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${params?.perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item: 'acessos', dados: response.data }));
            break;
          }
          case 'fluxos': {
            const response = await axios.get(`${BASEURLDD}/v1/fluxos/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data, label: 'assunto' }));
            break;
          }
          case 'estados': {
            const response = await axios.get(`${BASEURLDD}/v1/estados/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data, label: 'nome' }));
            break;
          }
          case 'estadosPerfil': {
            const response = await axios.get(
              `${BASEURLDD}/v1/estados/asscc/byperfilid/${params?.estadoId}/${perfilId}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'estadosPerfil', dados: response.data }));
            break;
          }
          case 'colaboradoresEstado': {
            const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.perfis }));
            break;
          }
          case 'regrasEstado': {
            const response = await axios.get(
              `${BASEURLCC}/v1/suportes/regra_parecer/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'origens': {
            const response = await axios.get(`${BASEURLDD}/v1/origens/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data }));
            break;
          }
          case 'anexos': {
            const response = await axios.get(`${BASEURLCC}/v1/anexos/gestao`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'regrasAnexos': {
            const response = await axios.get(`${BASEURLCC}/v1/anexos/regra/byfluxo/${params?.fluxoId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'regrasTransicao': {
            const response = await axios.get(`${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.id}`, options);
            dispatch(slice.actions.getSuccess({ item: 'regrasTransicao', dados: response.data.objeto }));
            break;
          }
          case 'notificacoes': {
            const response = await axios.get(`${BASEURLDD}/v1/notificacoes/transicao/${params?.id}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'destinatarios': {
            const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'motivosPendencia': {
            const response = await axios.get(`${BASEURLDD}/v1/motivos/all/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto, label: 'motivo' }));
            break;
          }
          case 'motivosTransicao': {
            const fluxoId = params?.fluxoId ? `&fluxo_id=${params?.fluxoId}` : '';
            const _path = `${BASEURLDD}/v1/motivos_transicoes/lista/${perfilId}`;
            const ativo = await axios.get(`${_path}?ativo=true${fluxoId}`, options);
            if (params?.gestao) {
              const inativo = await axios.get(`${_path}?ativo=false${fluxoId}`, options);
              dispatch(slice.actions.getSuccess({ item, dados: [...ativo.data.objeto, ...inativo.data.objeto] }));
            } else {
              dispatch(slice.actions.getSuccess({ item, dados: ativo.data.objeto, label: 'designacao' }));
            }
            break;
          }
          case 'linhas': {
            const response = await axios.get(`${BASEURLDD}/v1/linhas/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'despesas': {
            const _path = `${BASEURLDD}/v1/despesas/tipos/lista?perfil_cc_id=${perfilId}`;
            const ativos = await axios.get(`${_path}&ativo=true`, options);
            if (params?.gestao) {
              const inativos = await axios.get(`${_path}&ativo=false`, options);
              dispatch(slice.actions.getSuccess({ item, dados: [...ativos.data.objeto, ...inativos.data.objeto] }));
            } else {
              dispatch(slice.actions.getSuccess({ item, dados: ativos.data.objeto, label: 'designacao' }));
            }
            break;
          }
          case 'garantias': {
            const _path = `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/lista?perfil_cc_id=${perfilId}`;
            const ativos = await axios.get(`${_path}&ativo=true`, options);
            if (params?.gestao) {
              const inativos = await axios.get(`${_path}&ativo=false`, options);
              dispatch(slice.actions.getSuccess({ item, dados: [...ativos.data.objeto, ...inativos.data.objeto] }));
            } else {
              dispatch(slice.actions.getSuccess({ item, dados: ativos.data.objeto, label: 'descritivo' }));
            }
            break;
          }
          case 'documentos': {
            const _path = `${BASEURLDD}/v1/tipos_documentos/lista?perfil_cc_id=${perfilId}`;
            const ativos = await axios.get(`${_path}&ativo=true`, options);
            if (params?.gestao) {
              const inativos = await axios.get(`${_path}&ativo=false`, options);
              dispatch(
                slice.actions.getSuccess({
                  item,
                  label: 'designacao',
                  dados: [...ativos.data.objeto, ...inativos.data.objeto],
                })
              );
            } else {
              dispatch(slice.actions.getSuccess({ item, label: 'designacao	', dados: ativos.data.objeto }));
            }
            break;
          }
          case 'checklist': {
            const _path = `${BASEURLDD}/v1/tipos_documentos/checklist/lista?perfil_cc_id=${perfilId}&fluxo_id=${params?.fluxoId}`;
            const ativos = await axios.get(`${_path}&ativo=true`, options);
            if (params?.gestao) {
              const inativos = await axios.get(`${_path}&ativo=false`, options);
              dispatch(slice.actions.getSuccess({ item, dados: [...ativos.data.objeto, ...inativos.data.objeto] }));
            } else {
              dispatch(slice.actions.getSuccess({ item, label: 'designacao	', dados: ativos.data.objeto }));
            }
            break;
          }

          // ---- OBJETO -------------------------------------------------------------------------------------------------

          case 'acesso': {
            const response = await axios.get(`${BASEURLDD}/v1/acessos/${perfilId}/${params?.id}`, options);
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data }));
            break;
          }
          case 'fluxo': {
            const response = await axios.get(`${BASEURLDD}/v1/fluxos/${params?.id}/${perfilId}`, options);
            dispatch(
              slice.actions.getSuccess({
                dados: response.data,
                item: params?.from === 'listagem' ? 'selectedItem' : item,
              })
            );
            break;
          }
          case 'estado': {
            dispatch(slice.actions.resetItem({ item: 'estado' }));
            const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`, options);
            if (params?.from === 'regrasTransicao') {
              dispatch(slice.actions.getSuccess({ item: 'perfisEstado', dados: response?.data?.perfis || [] }));
            } else {
              dispatch(
                slice.actions.getSuccess({
                  dados: response.data,
                  item: params?.from === 'listagem' ? 'selectedItem' : item,
                })
              );
            }
            break;
          }
          case 'origem': {
            const response = await axios.get(`${BASEURLDD}/v1/origens/${params?.id}/${perfilId}`, options);
            dispatch(
              slice.actions.getSuccess({
                dados: response.data,
                item: params?.from === 'listagem' ? 'selectedItem' : item,
              })
            );
            break;
          }
          case 'motivoTransicao': {
            const response = await axios.get(
              `${BASEURLDD}/v1/motivos_transicoes/detalhe/${perfilId}?id=${params?.id}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data?.objeto }));
            break;
          }
          case 'despesa': {
            const response = await axios.get(
              `${BASEURLDD}/v1/despesas/tipos/detail?perfil_cc_id=${perfilId}&id=${params?.id}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data?.objeto }));
            break;
          }
          case 'garantia': {
            const response = await axios.get(
              `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/${params?.id}?perfil_cc_id=${perfilId}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data?.objeto }));
            break;
          }
          case 'checklistitem': {
            const response = await axios.get(
              `${BASEURLDD}/v1/tipos_documentos/checklist/detail?perfil_cc_id=${perfilId}&id=${params?.id}`,
              options
            );
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data?.objeto }));
            break;
          }
          default:
            break;
        }

        dispatch(slice.actions.setLoading(false));
      } catch (error) {
        hasError(error, dispatch, slice.actions.responseMsg);
      }
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        dispatch(slice.actions.startSaving());
        const options = { headers: { 'content-type': 'application/json', cc: mail } };
        const _path =
          (item === 'fluxo' && `${BASEURLDD}/v1/fluxos`) ||
          (item === 'linhas' && `${BASEURLDD}/v1/linhas`) ||
          (item === 'anexos' && `${BASEURLCC}/v1/anexos`) ||
          (item === 'estado' && `${BASEURLDD}/v1/estados`) ||
          (item === 'acessos' && `${BASEURLDD}/v1/acessos`) ||
          (item === 'origens' && `${BASEURLDD}/v1/origens`) ||
          (item === 'acessos' && `${BASEURLDD}/v1/acessos`) ||
          (item === 'transicoes' && `${BASEURLDD}/v1/transicoes`) ||
          (item === 'regrasAnexos' && `${BASEURLCC}/v1/anexos/regra`) ||
          (item === 'notificacoes' && `${BASEURLDD}/v1/notificacoes`) ||
          (item === 'perfisEstado' && `${BASEURLDD}/v1/estados/asscc/perfis`) ||
          (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil`) ||
          (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}`) ||
          (item === 'motivosTransicao' && `${BASEURLDD}/v1/motivos_transicoes/${perfilId}`) ||
          (item === 'despesas' && `${BASEURLDD}/v1/despesas/tipos?perfil_cc_id=${perfilId}`) ||
          (item === 'regrasEstado' && `${BASEURLCC}/v1/suportes/regra_parecer/estado/default`) ||
          (item === 'checklist' && `${BASEURLDD}/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}`) ||
          (item === 'garantias' && `${BASEURLDD}/v1/tipos_garantias/tipo_garantia?perfil_cc_id=${perfilId}`) ||
          (item === 'regrasTransicao' &&
            `${BASEURLCC}/v1/suportes/regra_parecer/transicao/${params?.estadoId}/${params?.transicaoId}`) ||
          '';

        if (_path) {
          const response = await axios.post(_path, dados, options);
          if (item === 'fluxo' || item === 'estado') {
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data }));
          } else {
            dispatch(
              slice.actions.createSuccess({
                item1: params?.item1 || '',
                item: item === 'perfisEstado' ? 'perfis' : item,
                dados: (item === 'perfisEstado' && JSON.parse(dados)?.perfis) || response.data?.objeto || response.data,
              })
            );
          }
        }

        switch (item) {
          case 'destinatario': {
            await axios.post(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, dados, options);
            const response = await axios.get(`${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`, options);
            dispatch(slice.actions.getSuccess({ item, dados: response.data.objeto }));
            break;
          }
          case 'clonar fluxo': {
            const clone = await axios.post(`${BASEURLDD}/v1/fluxos`, dados, options);
            if (params?.transicoes?.length > 0)
              await axios.post(
                `${BASEURLDD}/v1/transicoes/multi`,
                JSON.stringify(
                  params?.transicoes?.map((row) => ({ ...row, fluxo_id: response?.data?.id, perfilIDCC: perfilId }))
                ),
                options
              );
            const response = await axios.get(`${BASEURLDD}/v1/fluxos/${clone?.data?.id}/${perfilId}`, options);
            dispatch(slice.actions.getSuccess({ item: 'fluxo', dados: response.data }));
            break;
          }
          case 'regra estado destribuido': {
            await axios.post(`${BASEURLCC}/v1/suportes/regra_parecer/estado/coru/${params?.estadoId}`, dados, options);
            break;
          }

          default:
            break;
        }
        doneSucess(params?.msg, dispatch, slice.actions.responseMsg);
      } catch (error) {
        hasError(error, dispatch, slice.actions.responseMsg);
      }
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        const options = { headers: { 'content-type': 'application/json', cc: mail } };
        const _path =
          (item === 'fluxo' && `${BASEURLDD}/v1/fluxos/${params?.id}`) ||
          (item === 'linhas' && `${BASEURLDD}/v1/linhas/${params?.id}`) ||
          (item === 'anexos' && `${BASEURLCC}/v1/anexos/${params?.id}`) ||
          (item === 'acessos' && `${BASEURLDD}/v1/acessos/${params?.id}`) ||
          (item === 'estado' && `${BASEURLDD}/v1/estados/${params?.id}`) ||
          (item === 'origens' && `${BASEURLDD}/v1/origens/${params?.id}`) ||
          (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil`) ||
          (item === 'transicoes' && `${BASEURLDD}/v1/transicoes/${params?.id}`) ||
          (item === 'notificacoes' && `${BASEURLDD}/v1/notificacoes/${params?.id}`) ||
          (item === 'regrasAnexos' && `${BASEURLCC}/v1/anexos/regra/${params?.id}`) ||
          (item === 'destinatarios' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
          (item === 'motivosTransicao' && `${BASEURLDD}/v1/motivos_transicoes/${perfilId}?id=${params?.id}`) ||
          (item === 'despesas' && `${BASEURLDD}/v1/despesas/tipos?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
          (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
          (item === 'garantias' &&
            `${BASEURLDD}/v1/tipos_garantias/tipo_garantia/${params?.id}?perfil_cc_id=${perfilId}`) ||
          (item === 'checklist' &&
            `${BASEURLDD}/v1/tipos_documentos/checklist?perfil_cc_id=${perfilId}&id=${params?.id}`) ||
          '';

        if (_path) {
          dispatch(slice.actions.startSaving());
          const response = await axios.put(_path, dados, options);
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
        doneSucess(params?.msg, dispatch, slice.actions.responseMsg);
      } catch (error) {
        hasError(error, dispatch, slice.actions.responseMsg);
      }
    }
  };
}

// ----------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        const options = { headers: { cc: mail } };
        const _path =
          (item === 'anexos' && `${BASEURLCC}/v1/anexos/${params?.id}`) ||
          (item === 'regrasAnexos' && `${BASEURLCC}/v1/anexos/regra/${params?.id}`) ||
          (item === 'acessos' && `${BASEURLDD}/v1/acessos/${perfilId}/${params?.id}`) ||
          (item === 'estado' && `${BASEURLDD}/v1/estados/${params?.id}/${perfilId}`) ||
          (item === 'origens' && `${BASEURLDD}/v1/origens/${params?.id}/${perfilId}`) ||
          (item === 'transicoes' && `${BASEURLDD}/v1/transicoes/${params?.id}/${perfilId}`) ||
          (item === 'linhas' && `${BASEURLDD}/v1/linhas/${params?.linhaID}/${params?.perfilID}`) ||
          (item === 'destinatarios' && `${BASEURLDD}/v1/notificacoes/destinatarios/${params?.id}`) ||
          (item === 'motivosPendencia' && `${BASEURLDD}/v1/motivos/${perfilId}?motivoID=${params?.id}`) ||
          (item === 'estadosPerfil' && `${BASEURLDD}/v1/estados/asscc/perfil/${perfilId}?peID=${params?.id}`) ||
          '';

        if (_path) {
          dispatch(slice.actions.startSaving());
          await axios.delete(_path, options);
          dispatch(
            slice.actions.deleteSuccess({
              item,
              id: params?.id,
              item1: params?.item1 || '',
              destaivar: item === 'anexos' || item === 'regra anexo' || item === 'destinatario',
            })
          );
        }

        doneSucess(params?.msg, dispatch, slice.actions.responseMsg);
      } catch (error) {
        hasError(error, dispatch, slice.actions.responseMsg);
      }
    }
  };
}
