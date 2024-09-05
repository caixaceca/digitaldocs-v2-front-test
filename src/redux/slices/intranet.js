import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
//
import { callMsGraph } from '../../graph';
import { loginRequest } from '../../config';
// utils
import { errorMsg } from '../../utils/formatText';
import { BASEURL, BASEURLSLIM } from '../../utils/axios';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

const initialState = {
  error: '',
  isSaving: false,
  isLoading: false,
  isOpenDisposicao: false,
  done: '',
  mail: '',
  perfilId: '',
  myStatus: 'PresenceUnknown',
  cc: null,
  frase: null,
  ajuda: null,
  perfil: null,
  documento: null,
  dateUpdate: null,
  accessToken: null,
  msalProfile: null,
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

    setDone(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.done = action.payload;
    },

    setError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    getDisposicaoSuccess(state, action) {
      state.isOpenDisposicao = !action.payload;
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
        getComparator('asc', 'nome')
      );
    },

    getCcSuccess(state, action) {
      state.cc = action.payload;
      state.dateUpdate = new Date();
      state.perfilId = action.payload?.perfil_id || '';
    },

    getPerfisSuccess(state, action) {
      state.perfis = action.payload;
    },

    getMsalProfileSuccess(state, action) {
      state.mail = action.payload?.userPrincipalName;
      state.msalProfile = action.payload;
    },

    getProfileSuccess(state, action) {
      state.perfil = action.payload;
      state.myGroups = action.payload?.grupos;
    },

    getMyStatusSuccess(state, action) {
      state.myStatus = action.payload?.availability;
    },

    getAccessTokenSuccess(state, action) {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },

    getDocumentoSuccess(state, action) {
      state.documento = action.payload;
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

export function acquireToken(instance, account) {
  return async (dispatch) => {
    try {
      instance.acquireTokenSilent({ ...loginRequest, account }).then((response) => {
        dispatch(slice.actions.getAccessTokenSuccess(response.accessToken));
        callMsGraph(response.accessToken).then((response) => {
          dispatch(slice.actions.getMsalProfileSuccess(response));
        });
      });
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function authenticateColaborador(accessToken, msalProfile) {
  return async (dispatch) => {
    try {
      const options = { headers: { Authorization: accessToken }, withCredentials: true };
      const perfil = await axios.post(`${BASEURL}/perfil/msal`, msalProfile, options);
      dispatch(slice.actions.getProfileSuccess(perfil.data));
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

export function getMyStatus(accessToken) {
  return async (dispatch) => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
      const presense = await axios.get(`https://graph.microsoft.com/v1.0/me/presence`, { headers });
      dispatch(slice.actions.getMyStatusSuccess(presense.data));
    } catch (error) {
      hasError(error, dispatch);
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
        case 'cc': {
          const response = await axios.get(`${BASEURL}/colaborador/${params?.id}`, options);
          dispatch(slice.actions.getCcSuccess(response.data));
          break;
        }
        case 'disposicao': {
          const response = await axios.get(`${BASEURL}/disposicao/by_data/${params?.id}/${params?.data}`, options);
          dispatch(slice.actions.getDisposicaoSuccess(response.data));
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
      hasError(error, dispatch);
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
          dispatch(slice.actions.closeDisposicao());
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
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

async function doneSucess(msg, dispatch) {
  if (msg) {
    dispatch(slice.actions.setDone(msg));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setDone(''));
}

async function hasError(error, dispatch) {
  dispatch(slice.actions.setError(errorMsg(error)));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setError(''));
}
