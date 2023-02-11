import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  certificacoes: [],
};

const slice = createSlice({
  name: 'certificacao',
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

    getCertificacoesSuccess(state, action) {
      state.isLoading = false;
      state.certificacoes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getCertificacoes(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/certificacao`, options);
      dispatch(slice.actions.getCertificacoesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}
