import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { format, add } from 'date-fns';
import { loginRequest } from '../../config';
import { callMsGraph } from '../../graph';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  mail: '',
  done: '',
  error: false,
  isLoading: false,
  perfil: {},
  msalProfile: {},
  perfis: [],
  colaboradores: [],
  accessToken: null,
  currentColaborador: null,
};

const slice = createSlice({
  name: 'colaborador',
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

    getColaboradoresSuccess(state, action) {
      state.isLoading = false;
      state.colaboradores = action.payload;
      state.aniversariantes = action?.payload?.filter(
        (colaborador) =>
          format(add(new Date(colaborador.data_cel_aniv), { hours: 2 }), 'MM') ===
          format(add(new Date(), { hours: 2 }), 'MM')
      );
    },

    resetColaborador(state) {
      state.colaborador = null;
    },

    getCurrentColaboradorSuccess(state, action) {
      state.isLoading = false;
      state.currentColaborador = action.payload;
    },

    getPerfisSuccess(state, action) {
      state.isLoading = false;
      state.perfis = action.payload;
    },

    getMsalProfileSuccess(state, action) {
      state.isLoading = false;
      state.msalProfile = action.payload;
      state.mail = action.payload.mail;
    },

    getProfileSuccess(state, action) {
      state.isLoading = false;
      state.perfil = action.payload;
    },

    getAccessTokenSuccess(state, action) {
      state.isLoading = false;
      state.accessToken = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { resetColaborador } = slice.actions;

// ----------------------------------------------------------------------

export function AzureIntranetHandShake(instance, accounts) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })
        .then((response) => {
          dispatch(slice.actions.getAccessTokenSuccess(response.accessToken));
          callMsGraph(response.accessToken).then((response) => {
            dispatch(slice.actions.getMsalProfileSuccess(response));
          });
        });
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

export function AuthenticateColaborador(tokendeacesso, msalcolaborador) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { Authorization: tokendeacesso }, withCredentials: true };
      const response = await axios.post(`${BASEURL}/perfil/msal`, msalcolaborador, options);
      dispatch(slice.actions.getProfileSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getColaboradores(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/colaborador`, options);
      dispatch(slice.actions.getColaboradoresSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getCurrentColaborador(id, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/colaborador/${id}`, options);
      dispatch(slice.actions.getCurrentColaboradorSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getPerfis(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/perfil`, options);
      dispatch(slice.actions.getPerfisSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
