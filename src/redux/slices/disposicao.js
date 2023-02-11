import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  done: '',
  error: false,
  disposicao: null,
  isOpenDisposicao: false,
};

const slice = createSlice({
  name: 'disposicao',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isLoading = false;
      state.error = false;
    },

    done(state, action) {
      state.isLoading = false;
      state.done = action.payload;
    },

    resetDone(state) {
      state.isLoading = false;
      state.done = '';
    },

    getCurrrentDisposicaoSuccess(state, action) {
      if (action.payload === null) {
        state.isOpenDisposicao = true;
      } else {
        state.disposicao = action.payload;
      }
    },

    createDisposicaoSuccess(state, action) {
      state.disposicao = action.payload;
      state.isOpenDisposicao = false;
    },

    closeDisposicao(state) {
      state.isOpenDisposicao = false;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { closeDisposicao } = slice.actions;

// ----------------------------------------------------------------------

export function getDisposicao(idColaborador, data, mail) {
  return async (dispatch) => {
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/disposicao/by_data/${idColaborador}/${data}`, options);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      dispatch(slice.actions.getCurrrentDisposicaoSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail?.msg || 'Ocorreu um erro...'));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function createDisposicao(disposicao, mail) {
  return async (dispatch) => {
    try {
      const options = {
        headers: {
          'content-type': 'application/json',
          'Current-Colaborador': mail,
        },
      };
      const response = await axios.post(`${BASEURL}/disposicao`, disposicao, options);
      dispatch(slice.actions.createDisposicaoSuccess(response.data));
      dispatch(slice.actions.done('disposicao'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}
