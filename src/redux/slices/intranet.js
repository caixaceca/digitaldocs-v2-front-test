import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
//
import { callMsGraph } from '../../graph';
import { loginRequest } from '../../config';
// utils
import { errorMsg } from '../../utils/normalizeText';
import { BASEURL, BASEURLSLIM } from '../../utils/axios';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

const initialState = {
  error: false,
  isSaving: false,
  isLoading: false,
  isOpenDisposicao: false,
  done: '',
  mail: '',
  perfil: {},
  msalProfile: {},
  cc: null,
  frase: null,
  ajuda: null,
  documento: null,
  accessToken: null,
  uos: [],
  links: [],
  perfis: [],
  myGroups: [],
  perguntas: [],
  myAplicacoes: [],
  notificacoes: [],
  certificacoes: [],
  colaboradores: [],
};

const slice = createSlice({
  name: 'intranet',
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
      state.isLoading = false;
      state.isSaving = false;
      state.error = false;
    },

    done(state, action) {
      state.isSaving = false;
      state.done = action.payload;
    },

    resetDone(state) {
      state.isLoading = false;
      state.done = '';
    },

    getCurrrentDisposicaoSuccess(state, action) {
      if (action.payload === null) {
        state.isOpenDisposicao = true;
      }
    },

    getCertificacoesSuccess(state, action) {
      state.certificacoes = action.payload;
    },

    getFraseAtivaSuccess(state, action) {
      state.frase = action.payload;
    },

    getMyAplicacoesSuccess(state, action) {
      state.myAplicacoes = action.payload;
    },

    getLinksSuccess(state, action) {
      state.links = applySort(action.payload, getComparator('asc', 'nome'));
    },

    getUosSuccess(state, action) {
      state.uos = applySort(action.payload, getComparator('asc', 'label'));
    },

    getAjudaSuccess(state, action) {
      state.ajuda = action.payload;
    },

    getPerguntasSuccess(state, action) {
      state.perguntas = action.payload;
    },

    getColaboradoresSuccess(state, action) {
      state.colaboradores = applySort(
        action.payload?.filter((row) => row?.is_active)?.map((row) => ({ ...row, nome: row?.perfil?.displayName })),
        getComparator('asc', 'label')
      );
    },

    getCurrentColaboradorSuccess(state, action) {
      state.cc = action.payload;
    },

    getPerfisSuccess(state, action) {
      state.perfis = action.payload;
    },

    getMsalProfileSuccess(state, action) {
      state.msalProfile = action.payload;
      state.mail = action.payload.mail;
    },

    getProfileSuccess(state, action) {
      state.perfil = action.payload;
      state.myGroups = action.payload?.grupos;
    },

    getAccessTokenSuccess(state, action) {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },

    getDocumentoSuccess(state, action) {
      state.documento = action.payload;
    },

    createDisposicaoSuccess(state) {
      state.isOpenDisposicao = false;
    },

    closeDisposicao(state) {
      state.isOpenDisposicao = false;
    },

    resetItem(state) {
      state.documento = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { closeDisposicao, resetItem } = slice.actions;

// ----------------------------------------------------------------------

export function AzureIntranetHandShake(instance, accounts) {
  return async (dispatch) => {
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
      console.log(errorMsg(error));
    }
  };
}

export function AuthenticateColaborador(tokendeacesso, msalcolaborador) {
  return async (dispatch) => {
    try {
      const options = { headers: { Authorization: tokendeacesso }, withCredentials: true };
      const response = await axios.post(`${BASEURL}/perfil/msal`, msalcolaborador, options);
      dispatch(slice.actions.getProfileSuccess(response.data));
    } catch (error) {
      console.log(errorMsg(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getFromIntranet(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': params?.mail } };
      switch (item) {
        case 'disposicao': {
          const response = await axios.get(
            `${BASEURL}/disposicao/by_data/${params?.idColaborador}/${params?.data}`,
            options
          );
          await new Promise((resolve) => setTimeout(resolve, 4000));
          dispatch(slice.actions.getCurrrentDisposicaoSuccess(response.data));
          break;
        }
        case 'certificacao': {
          const response = await axios.get(`${BASEURL}/certificacao`, options);
          dispatch(slice.actions.getCertificacoesSuccess(response.data));
          break;
        }
        case 'frase': {
          const response = await axios.get(`${BASEURL}/frase_semana/ativa`, options);
          dispatch(slice.actions.getFraseAtivaSuccess(response.data));
          break;
        }
        case 'links': {
          const response = await axios.get(`${BASEURL}/aplicacao/links/uteis`, options);
          dispatch(slice.actions.getLinksSuccess(response.data));
          break;
        }
        case 'aplicacoes': {
          const response = await axios.get(`${BASEURL}/aplicacao/aplicacoes/me`, options);
          dispatch(slice.actions.getMyAplicacoesSuccess(response.data));
          break;
        }
        case 'uos': {
          const response = await axios.get(`${BASEURL}/unidade_organica`, options);
          dispatch(slice.actions.getUosSuccess(response.data));
          break;
        }
        case 'ajuda': {
          const response = await axios.get(`${BASEURL}/help/ajuda`, options);
          dispatch(slice.actions.getAjudaSuccess(response.data));
          break;
        }
        case 'perguntas': {
          const response = await axios.get(`${BASEURL}/help/perguntas_frequentes`, options);
          dispatch(slice.actions.getPerguntasSuccess(response.data));
          break;
        }
        case 'colaborador': {
          const response = await axios.get(`${BASEURL}/colaborador/${params?.id}`, options);
          dispatch(slice.actions.getCurrentColaboradorSuccess(response.data));
          break;
        }
        case 'colaboradores': {
          const response = await axios.get(`${BASEURL}/colaborador`, options);
          dispatch(slice.actions.getColaboradoresSuccess(response.data));
          break;
        }
        case 'perfis': {
          const response = await axios.get(`${BASEURL}/perfil`, options);
          dispatch(slice.actions.getPerfisSuccess(response.data));
          break;
        }
        case 'validar doc': {
          dispatch(slice.actions.resetItem());
          const response = await axios.get(
            `${BASEURLSLIM}/api/v1/sniac/doc/info/production?documento=${params?.doc}&deCache=${params?.cache}`,
            options
          );
          dispatch(slice.actions.getDocumentoSuccess(response.data));
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
      const options = { headers: { 'content-type': 'application/json', 'Current-Colaborador': params?.mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', 'Current-Colaborador': params?.mail } };

      switch (item) {
        case 'disposicao': {
          await axios.post(`${BASEURL}/disposicao`, dados, options);
          dispatch(slice.actions.createDisposicaoSuccess());
          break;
        }
        case 'denuncia': {
          await axios.post(`${BASEURL}/denuncia`, dados, options1);
          break;
        }
        case 'sugestao': {
          await axios.post(`${BASEURL}/sugestao/sugestao`, dados, options1);
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
