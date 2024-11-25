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
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  selectedItem: null,
  grupos: [],
  minutas: [],
  funcoes: [],
  produtos: [],
  recursos: [],
  variaveis: [],
  marcadores: [],
  tiposGarantias: [],
  tiposTitulares: [],
  representantes: [],
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
    const { perfilId, mail, accessToken } = state.intranet;
    if (perfilId && mail) {
      try {
        dispatch(slice.actions.setLoading(true));
        const options = { headers: { Authorization: `Bearer ${accessToken}` } };
        const _path =
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos/lista?ativo=`) ||
          (item === 'produtos' && `${BASEURLGAJI9}/v1/produtos/lista?ativo=`) ||
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis/lista?ativo=`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores/lista?ativo=`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos/lista?ativo=`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares/lista?ativo=`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias/lista?ativo=`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/lista?ativo=`) ||
          (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles/lista?pagina=${params?.pagina || 0}&ativo=`) ||
          (item === 'minutas' &&
            `${BASEURLGAJI9}/v1/minutas/lista?em_analise=${params?.emanalise}&em_vigor=${params?.emvigor}&revogado=${params?.revogado}&ativo=`) ||
          (item === 'clausulas' &&
            `${BASEURLGAJI9}/v1/clausulas/lista?tipo_titular_id=${params?.titularId}&tipo_garantia_id=${params?.garantiaId}&componente_id=${params?.componenteId}&ativo=`) ||
          '';
        if (_path) {
          const response = await axios.get(params?.getInativos ? `${_path}true` : _path, options);
          if (params?.getInativos) {
            const response1 = await axios.get(`${_path}false`, options);
            dispatch(slice.actions.getSuccess({ item, dados: [...response.data?.objeto, ...response1.data?.objeto] }));
          } else {
            dispatch(slice.actions.getSuccess({ item, dados: response.data?.objeto }));
          }
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
          (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos`) ||
          (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles`) ||
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas`) ||
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias`) ||
          (item === 'produtos' && `${BASEURLGAJI9}/v1/produtos/importar/one`) ||
          (item === 'produtos' && `${BASEURLGAJI9}/v1/produtos/importar/one`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/definir`) ||
          (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/adicionar/recursos?grupo_id=${params?.id}`) ||
          (item === 'comporMinuta' &&
            `${BASEURLGAJI9}/v1/minutas/compor?minuta_id=${params?.id}&carregar_clausulas_garantias=${params?.carregarClausulas}`) ||
          '';
        if (_path) {
          const response = await axios.post(_path, dados, options);
          if (item === 'fluxo' || item === 'estado') {
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: response.data?.objeto }));
          } else {
            dispatch(slice.actions.createSuccess({ item, item1: params?.item1 || '', dados: response.data?.objeto }));
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
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        dispatch(slice.actions.startSaving());
        const options = { headers: { 'content-type': 'application/json', cc: mail } };
        const _path =
          (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
          (item === 'produtos' && `${BASEURLGAJI9}/v1/produtos/rotular`) ||
          (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas?id=${params?.id}`) ||
          (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles?id=${params?.id}`) ||
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores?id=${params?.id}`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
          (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares?id=${params?.id}`) ||
          (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias?id=${params?.id}`) ||
          (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/update/recurso?id=${params?.id}`) ||
          (item === 'utilizadoresGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
          (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/atualizar?id=${params?.id}`) ||
          (item === 'coposicaoMinuta' && `${BASEURLGAJI9}/v1/minutas/atualizar/composicao?minuta_id=${params?.id}`) ||
          '';

        if (_path) {
          const response = await axios.put(_path, dados, options);
          if (item === 'fluxo' || item === 'estado') {
            dispatch(slice.actions.getSuccess({ item, dados: response.data?.objeto }));
          } else {
            dispatch(slice.actions.updateSuccess({ item, item1: params?.item1 || '', dados: response.data?.objeto }));
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
    const { perfilId, mail, accessToken } = state.intranet;
    if (perfilId && mail) {
      try {
        const options = { headers: { Authorization: accessToken }, withCredentials: true };

        const _path =
          (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
          (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
          (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
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
