import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  myAplicacoes: [],
  links: [],
};

const slice = createSlice({
  name: 'aplicacao',
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

    getMyAplicacoesSuccess(state, action) {
      state.isLoading = false;
      state.myAplicacoes = action.payload;
    },

    getLinksSuccess(state, action) {
      state.isLoading = false;
      state.links = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getMyAplicacoes(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/aplicacao/aplicacoes/me`, options);
      dispatch(slice.actions.getMyAplicacoesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getLinks(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/aplicacao/links/uteis`, options);
      dispatch(slice.actions.getLinksSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}
