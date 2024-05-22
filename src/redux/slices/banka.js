import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { errorMsg } from '../../utils/normalizeText';
import { BASEURLDD } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  dadosComValores: false,
  numEntidade: '',
  entidade: null,
  selectItem: null,
};

const slice = createSlice({
  name: 'banka',
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
        case 'entidade':
          state.entidade = null;
          break;

        default:
          break;
      }
    },

    changeNumEntidade(state, action) {
      state.numEntidade = action.payload;
    },

    changeDadosView(state, action) {
      state.dadosComValores = action.payload;
    },

    getentidadeSuccess(state, action) {
      state.entidade = action.payload;
    },

    openModal(state) {
      state.isOpenModal = true;
    },

    openModalItem(state) {
      state.isOpenModal = true;
    },

    selectItem(state, action) {
      state.selectedItem = action.payload;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.selectedItem = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, selectItem, closeModal, changeNumEntidade, changeDadosView } = slice.actions;

// ----------------------------------------------------------------------

export function getFromBanka(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'entidade': {
          dispatch(slice.actions.resetItem('entidade'));
          const response = await axios.get(
            `http://172.17.8.78:9900/api/v1/banka/consultar/entidade/${params?.perfilId}?entidade=${params?.numEntidade}`,
            options
          );
          dispatch(slice.actions.getentidadeSuccess(response.data.objeto));
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
