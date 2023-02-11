import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  done: '',
  error: false,
  ajuda: false,
  perguntas: [],
  notificacoes: [],
  isOpenPergunta: false,
  isOpenSugestao: false,
  selectedPerguntaId: null,
  selectedSugestaoId: null,
  timer: 0,
};

const slice = createSlice({
  name: 'ajuda',
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

    getAjudaSuccess(state, action) {
      state.isLoading = false;
      state.ajuda = action.payload;
    },

    getPerguntasSuccess(state, action) {
      state.isLoading = false;
      state.perguntas = action.payload;
    },

    lerTodasNotificacoesSuccess(state, action) {
      state.isLoading = false;
      state.notificacoes = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { closeSugestao } = slice.actions;

// ----------------------------------------------------------------------

export function getAjuda(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/help/ajuda`, options);
      dispatch(slice.actions.getAjudaSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getPerguntas(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/help/perguntas_frequentes`, options);
      dispatch(slice.actions.getPerguntasSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getNotificacao(id, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      await axios.get(`${BASEURL}/notificacao/${id}`, options);
      const response = await axios.get(`${BASEURL}/notificacao/minhas/notificacoes/alternative`, options);
      dispatch(slice.actions.getNotificacoesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function lerTodasNotificacoes(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Current-Colaborador': mail,
        },
      };
      const data = {};
      await axios.post(`${BASEURL}/notificacao/ler/todas`, data, options);
      const response = await axios.get(`${BASEURL}/notificacao/minhas/notificacoes/alternative`, options);
      dispatch(slice.actions.lerTodasNotificacoesSuccess(response.data));
      dispatch(slice.actions.done('lidas'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function enviarSugestao(pergunta, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'content-type': 'multipart/form-data', 'Current-Colaborador': mail } };
      await axios.post(`${BASEURL}/sugestao/sugestao`, pergunta, options);
      dispatch(slice.actions.done('enviada'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
