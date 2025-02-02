import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLGAJI9 } from '../../utils/axios';
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
  idDelete: false,
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  isLoadingDoc: false,
  credito: null,
  infoPag: null,
  minutaId: null,
  infoCaixa: null,
  previewFile: null,
  selectedItem: null,
  estadoMinutas: localStorage.getItem('estadoMinutas') || 'Em análise',
  grupos: [],
  minutas: [],
  funcoes: [],
  creditos: [],
  recursos: [],
  variaveis: [],
  entidades: [],
  marcadores: [],
  componentes: [],
  tiposGarantias: [],
  tiposTitulares: [],
  representantes: [],
  minutasPublicas: [],
};

const slice = createSlice({
  name: 'gaji9',
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
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, getSuccess, closeModal } = slice.actions;

// ----------------------------------------------------------------------

export function getFromGaji9(item, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken } = state.intranet;
    if (accessToken) {
      // console.log(accessToken);
      try {
        const apiUrl =
          // DETALHES
          (item === 'admin' && `${BASEURLGAJI9}/v1/admin`) ||
          (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao`) ||
          (item === 'funcao' && `${BASEURLGAJI9}/v1/acs/roles?id=${params?.id}`) ||
          (item === 'minuta' && `${BASEURLGAJI9}/v1/minutas/detail?id=${params?.id}`) ||
          (item === 'grupo' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
          (item === 'variavel' && `${BASEURLGAJI9}/v1/variaveis/detail?id=${params?.id}`) ||
          (item === 'clausula' && `${BASEURLGAJI9}/v1/clausulas/detail?id=${params?.id}`) ||
          (item === 'marcador' && `${BASEURLGAJI9}/v1/marcadores/detail?id=${params?.id}`) ||
          (item === 'recurso' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
          (item === 'tipoTitular' && `${BASEURLGAJI9}/v1/tipos_titulares/detail?id=${params?.id}`) ||
          (item === 'tipoGarantia' && `${BASEURLGAJI9}/v1/tipos_garantias/detail?id=${params?.id}`) ||
          (item === 'representante' && `${BASEURLGAJI9}/v1/acs/representantes/detail?id=${params?.id}`) ||
          (item === 'grupo recurso' && `${BASEURLGAJI9}/v1/acs/grupos/recurso/detail?id=${params?.id}`) ||
          (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos/detail?credito_id=${params?.id}`) ||
          (item === 'entidade' && `${BASEURLGAJI9}/v1/suportes/entidades/detail?entidade_id=${params?.id}`) ||
          (item === 'gerarDocumento' && `${BASEURLGAJI9}/v1/minutas/gerar/documento?minuta_id=${params?.id}`) ||
          (item === 'ordenarClausulas' && `${BASEURLGAJI9}/v1/minutas/ordenar/clausulas?minuta_id=${params?.id}`) ||
          (item === 'proposta' &&
            `${BASEURLGAJI9}/v1/suportes/creditos/carregar/proposta?numero_proposta=${params?.proposta}&credibox=${params?.credibox}`) ||
          // LISTA
          (item === 'minutasPublicas' && `${BASEURLGAJI9}/v1/minutas/publicas`) ||
          (item === 'importar componentes' && `${BASEURLGAJI9}/v1/produtos/importar`) ||
          (item === 'gruposUtilizador' && `${BASEURLGAJI9}/v1/acs/grupos/utilizador`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos/lista?ativo=${!params?.inativos}`) ||
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis/lista?ativo=${!params?.inativos}`) ||
          (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/lista?ativo=${!params?.inativos}`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores/lista?ativo=${!params?.inativos}`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos/lista?ativo=${!params?.inativos}`) ||
          (item === 'entidades' && `${BASEURLGAJI9}/v1/suportes/entidades/lista?ativo=${!params?.inativos}`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares/lista?ativo=${!params?.inativos}`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias/lista?ativo=${!params?.inativos}`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/lista?ativo=${!params?.inativos}`) ||
          (item === 'creditos' &&
            `${BASEURLGAJI9}/v1/suportes/creditos/por_balcao?balcao=${params?.balcao}&cursor=${params?.cursor || 0}`) ||
          (item === 'funcoes' &&
            `${BASEURLGAJI9}/v1/acs/roles/lista?pagina=${params?.pagina || 0}&ativo=${!params?.inativos}`) ||
          (item === 'minutas' &&
            `${BASEURLGAJI9}/v1/minutas/lista?em_analise=${params?.emAnalise}&em_vigor=${params?.emVigor}&revogado=${params?.revogado}&ativo=${!params?.inativos}`) ||
          (item === 'searchEntidade' &&
            `${BASEURLGAJI9}/v1/suportes/entidades/search?${Object.entries(params || {})
              .map(([key, value]) => (value ? `${key}=${value}` : ''))
              .filter(Boolean)
              .join('&')}`) ||
          (item === 'clausulas' &&
            `${BASEURLGAJI9}/v1/clausulas/lista?ativo=${!params?.inativos}${params?.solta ? `&solta=true` : ''}${params?.caixa ? `&seccao_id_caixa=true` : ''}${params?.identificacao ? `&seccao_id=true` : ''}${params?.titularId ? `&tipo_titular_id=${params?.titularId}` : ''}${params?.garantiaId ? `&tipo_garantia_id=${params?.garantiaId}` : ''}${params?.componenteId ? `&componente_id=${params?.componenteId}` : ''}`) ||
          '';
        if (apiUrl) {
          if (params?.resetLista) {
            dispatch(slice.actions.resetItem({ item, tipo: 'array' }));
          }
          dispatch(slice.actions.setLoading(true));
          const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

          if (item === 'admin') {
            doneSucess('Bem-vindo(a) a GAJ-i9', dispatch, slice.actions.responseMsg);
          } else if (item === 'grupo') {
            const utilizadores = await axios.get(`${BASEURLGAJI9}/v1/acs/grupos/utilizadores?grupo_id=${params?.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            dispatch(
              slice.actions.getSuccess({
                item: 'selectedItem',
                dados: { ...response.data?.objeto, utilizadores: utilizadores.data?.objeto },
              })
            );
          } else {
            dispatch(
              slice.actions.getSuccess({
                item: params?.item || item,
                dados: (item === 'creditos' && response.data) || response.data?.clausula || response.data?.objeto,
              })
            );
          }
          dispatch(slice.actions.setLoading(false));
        }
        if (params?.msg) {
          doneSucess(params?.msg, dispatch, slice.actions.responseMsg);
        }
      } catch (error) {
        hasError(error, dispatch, slice.actions.responseMsg);
      }
    }
  };
}

// ----------------------------------------------------------------------

export function getDocumento(item, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken } = state.intranet;

    try {
      const apiUrl =
        (item === 'previewFile' && `${BASEURLGAJI9}/v1/minutas/documento/preview?id=${params?.id}`) ||
        (item === 'contrato' &&
          `${BASEURLGAJI9}/v1/suportes/creditos/previsualizar/contrato?credito_id=${params?.creditoId}&minuta_id=${params?.minutaId}`) ||
        '';
      if (apiUrl) {
        dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: true }));
        const response = await axios.get(apiUrl, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const blob = await new Blob([response.data], { type: params?.tipo_conteudo });
        const fileUrl = await URL.createObjectURL(blob);
        dispatch(slice.actions.getSuccess({ item: params?.item || item, dados: fileUrl }));
        dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: false }));
      }
    } catch (error) {
      // hasError(error, dispatch, slice.actions.responseMsg);
      const uint8Array = new Uint8Array(error.response.data);
      const decodedString = new TextDecoder('ISO-8859-1').decode(uint8Array);
      hasError({ message: JSON.parse(decodedString)?.mensagem || 'Erro' }, dispatch, slice.actions.responseMsg);
    }
    dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: false }));
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken } = state.intranet;
    if (accessToken) {
      try {
        const apiUrl =
          (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos`) ||
          (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles`) ||
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas`) ||
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos`) ||
          (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos`) ||
          (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias`) ||
          (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/importar/one`) ||
          (item === 'colaboradorGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/definir`) ||
          (item === 'clonarMinuta' && `${BASEURLGAJI9}/v1/minutas/com/base?minuta_base_id=${params?.id}`) ||
          (item === 'fiadores' && `${BASEURLGAJI9}/v1/suportes/creditos/fiadores?credito_id=${params?.id}`) ||
          (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/adicionar/recursos?grupo_id=${params?.id}`) ||
          (item === 'comporMinuta' &&
            `${BASEURLGAJI9}/v1/minutas/compor?minuta_id=${params?.id}&carregar_clausulas_garantias=${params?.clausulasGarant}`) ||
          '';
        if (apiUrl) {
          dispatch(slice.actions.startSaving());
          const options = { headers: { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' } };
          const response = await axios.post(apiUrl, dados, options);
          if (item === 'colaboradorGrupo') {
            dispatch(
              slice.actions.createSuccess({ item1: 'selectedItem', item: 'utilizadores', dados: JSON.parse(dados) })
            );
          } else if (params?.getSuccess) {
            dispatch(getSuccess({ item: params?.item || item, dados: response.data?.objeto }));
            if (params?.onCancel) params?.onCancel();
          } else if (item === 'clonarMinuta' || item === 'Versionar' || item === 'minutas' || item === 'credito') {
            dispatch(getSuccess({ item: 'minutaId', dados: response.data?.objeto?.id }));
          } else if (item === 'variaveis') {
            dispatch(getFromGaji9(item, { id: params?.id }));
          } else {
            dispatch(
              slice.actions.createSuccess({
                item: params?.item || item,
                item1: params?.item1 || '',
                dados: response.data?.clausula || response.data?.objeto || null,
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

export function updateItem(item, dados, params) {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken } = state.intranet;
    if (accessToken) {
      try {
        dispatch(slice.actions.startSaving());
        const options = { headers: { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' } };
        const apiUrl =
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
          (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/rotular`) ||
          (item === 'prg' && `${BASEURLGAJI9}/v1/acs/grupos/remover/recurso`) ||
          (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas?id=${params?.id}`) ||
          (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles?id=${params?.id}`) ||
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores?id=${params?.id}`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
          (item === 'Revogar' && `${BASEURLGAJI9}/v1/minutas/revogar?id=${params?.id}`) ||
          (item === 'Publicar' && `${BASEURLGAJI9}/v1/minutas/publicar?id=${params?.id}`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares?id=${params?.id}`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias?id=${params?.id}`) ||
          (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao?id=${params?.id}`) ||
          (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos?credito_id=${params?.id}`) ||
          (item === 'Versionar' && `${BASEURLGAJI9}/v1/minutas/versionar?minuta_id=${params?.id}`) ||
          (item === 'colaboradorGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
          (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/update/recurso?id=${params?.id}`) ||
          (item === 'utilizadoresGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/atualizar?id=${params?.id}`) ||
          (item === 'entidades' && `${BASEURLGAJI9}/v1/suportes/entidades/morada?numero=${params?.numero}`) ||
          (item === 'garantiasMinuta' && `${BASEURLGAJI9}/v1/minutas/adicionar/tipos_garantias?id=${params?.id}`) ||
          (item === 'removerGaranMinuta' && `${BASEURLGAJI9}/v1/minutas/remover/tipos_garantias?id=${params?.id}`) ||
          (item === 'coposicaoMinuta' && `${BASEURLGAJI9}/v1/minutas/atualizar/composicao?minuta_id=${params?.id}`) ||
          (item === 'clausulaMinuta' &&
            `${BASEURLGAJI9}/v1/minutas/atualizar/clausula?minuta_id=${params?.minutaId}&clausula_id=2${params?.id}`) ||
          '';

        if (apiUrl) {
          if (params?.patch) {
            const response = await axios.patch(apiUrl, dados, options);
            dispatch(slice.actions.getSuccess({ item: 'idDelete', dados: false }));
            dispatch(slice.actions.getSuccess({ item: params?.item || item, dados: response.data?.objeto || null }));
          } else {
            const response = await axios.put(apiUrl, dados, options);
            if (item === 'prg') {
              await dispatch(getFromGaji9('grupo', { id: params?.grupoId }));
            } else if (item === 'infoCaixa' || item === 'credito') {
              await dispatch(getSuccess({ item, dados: response.data?.objeto }));
              if (params?.onCancel) params?.onCancel();
            } else if (item === 'minutas' || item === 'coposicaoMinuta' || item === 'clausulaMinuta') {
              await dispatch(getSuccess({ item: 'minuta', dados: response.data?.objeto }));
            } else if (item === 'Versionar') {
              await dispatch(getSuccess({ item: 'minutaId', dados: response.data?.objeto?.id }));
            } else if (item === 'variaveis') {
              await dispatch(getFromGaji9(item));
            } else {
              dispatch(
                slice.actions.updateSuccess({
                  item: params?.item || item,
                  item1: params?.item1 || '',
                  dados:
                    (item === 'colaboradorGrupo' && JSON.parse(dados)) ||
                    (item === 'componentes' && params?.values) ||
                    response.data?.clausula ||
                    response.data?.objeto ||
                    null,
                })
              );
            }
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
    const { accessToken } = state.intranet;
    if (accessToken) {
      try {
        const apiUrl =
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
          (item === 'participantes' &&
            `${BASEURLGAJI9}/v1/suportes/creditos/fiadores?credito_id=${params?.id}&numero_entidade=${params?.numero}`) ||
          '';

        if (apiUrl) {
          dispatch(slice.actions.startSaving());
          await axios.delete(apiUrl, { headers: { Authorization: accessToken } });
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
