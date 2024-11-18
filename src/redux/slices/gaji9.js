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
  produtos: [],
  titulares: [],
  garantias: [],
  marcadores: [],
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
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        dispatch(slice.actions.setLoading(true));
        const options = { headers: { cc: mail } };
        const _path =
          (item === 'produtos' && `${BASEURLGAJI9}/api/v1/produtos/lista?ativo=`) ||
          (item === 'variaveis' && `${BASEURLGAJI9}/api/v1/variaveis/lista?ativo=`) ||
          (item === 'marcadores' && `${BASEURLGAJI9}/api/v1/marcadores/lista?ativo=`) ||
          (item === 'titulares' && `${BASEURLGAJI9}/api/v1/tipos_titulares/lista?ativo=`) ||
          (item === 'garantias' && `${BASEURLGAJI9}/api/v1/tipos_garantias/lista?ativo=`) ||
          (item === 'lausulas' &&
            `${BASEURLGAJI9}/api/v1/clausulas/lista?tipo_titular_id=${params?.titularId}&tipo_garantia_id=${params?.garantiaId}&componente_id=${params?.componenteId}&ativo=`) ||
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
          (item === 'fluxo' && `${BASEURLGAJI9}/v1/fluxos`) ||
          (item === 'linhas' && `${BASEURLGAJI9}/v1/linhas`) ||
          (item === 'anexos' && `${BASEURLGAJI9}/v1/anexos`) ||
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
          (item === 'fluxo' && `${BASEURLGAJI9}/v1/fluxos/${params?.id}`) ||
          (item === 'linhas' && `${BASEURLGAJI9}/v1/linhas/${params?.id}`) ||
          (item === 'anexos' && `${BASEURLGAJI9}/v1/anexos/${params?.id}`);

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
    const { perfilId, mail } = state.intranet;
    if (perfilId && mail) {
      try {
        const options = { headers: { cc: mail } };
        const _path =
          (item === 'anexos' && `${BASEURLGAJI9}/v1/anexos/${params?.id}`) ||
          (item === 'regrasAnexos' && `${BASEURLGAJI9}/v1/anexos/regra/${params?.id}`) ||
          (item === 'acessos' && `${BASEURLGAJI9}/v1/acessos/${perfilId}/${params?.id}`) ||
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
