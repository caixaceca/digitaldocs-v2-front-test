import axios from 'axios';
import { add } from 'date-fns';
import { useMsal } from '@azure/msal-react';
import { createSlice } from '@reduxjs/toolkit';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
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
  myStatus: '',
  cc: null,
  frase: null,
  ajuda: null,
  perfil: null,
  documento: null,
  accessToken: null,
  msalProfile: null,
  dateUpdate: new Date(),
  uos: [],
  links: [],
  perfis: [],
  usersIds: [],
  myGroups: [],
  perguntas: [],
  notificacoes: [],
  certificacoes: [],
  colaboradores: [],
  minhasAplicacoes: [],
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

    getMinhasAplicacoesSuccess(state, action) {
      state.minhasAplicacoes = applySort(action.payload, getComparator('asc', 'nome'));
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

    getPresencesSuccess(state, action) {
      state.usersIds = action.payload.allUsers;
      state.myStatus =
        action.payload.presencesEmail?.find(
          (item) => item?.email?.toLowerCase() === action.payload?.mail?.toLowerCase()
        )?.availability || 'PresenceUnknown';
      const colaboradorPresence = state.colaboradores?.map((row) => ({
        ...row,
        presence:
          action.payload.presencesEmail?.find((item) => item?.email?.toLowerCase() === row?.perfil?.mail?.toLowerCase())
            ?.availability || 'PresenceUnknown',
      }));
      state.colaboradores = colaboradorPresence;
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

    resetItem(state, action) {
      state[action.payload.item] = action.payload?.tipo === 'array' ? [] : null;
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
      const response = await instance.acquireTokenSilent({ ...loginRequest, account });
      dispatch(slice.actions.getAccessTokenSuccess(response.accessToken));
      const userProfile = await callMsGraph(response.accessToken);
      dispatch(slice.actions.getMsalProfileSuccess(userProfile));
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        instance.loginRedirect({ ...loginRequest });
      } else {
        hasError(error, dispatch);
      }
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

// ----------------------------------------------------------------------

export function getFromIntranet(item, params) {
  return async (dispatch, getState) => {
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
          dispatch(slice.actions.getMinhasAplicacoesSuccess(response.data));
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
          const state = getState();
          const response = await axios.get(`${BASEURL}/colaborador`, options);
          dispatch(slice.actions.getColaboradoresSuccess(response.data));

          /// REVALIDADE TOKEN
          if (add(new Date(state?.intranet?.dateUpdate), { minutes: 5 }) < new Date()) {
            const { instance, accounts } = useMsal();
            await dispatch(acquireToken(instance, accounts[0]));
          }

          // USERS PRESENCE
          const headers = {
            Authorization: `Bearer ${state?.intranet?.accessToken}`,
            'Content-Type': 'application/json',
          };
          let allUsers = state.intranet.usersIds;
          if (allUsers?.length === 0) {
            let nextLink = `https://graph.microsoft.com/v1.0/users`;
            while (nextLink) {
              // eslint-disable-next-line no-await-in-loop
              const response = await axios.get(nextLink, { headers });
              allUsers = [...allUsers, ...response.data.value];
              nextLink = response.data['@odata.nextLink'];
            }
          }
          const presences = await axios.post(
            `https://graph.microsoft.com/v1.0/communications/getPresencesByUserId`,
            { ids: allUsers?.map((row) => row?.id) },
            { headers }
          );
          const presencesEmail = presences.data?.value?.map((row) => ({
            ...row,
            email: allUsers?.find((item) => item.id === row?.id).userPrincipalName,
          }));
          // if (allUsers?.length === 0) {
          //   const response = await axios.get(`${BASEURL}/perfil`, options);
          //   allUsers = response?.data;
          // }

          // const presences = await axios.post(
          //   `https://graph.microsoft.com/v1.0/communications/getPresencesByUserId`,
          //   { ids: allUsers?.filter((item) => item?.id_aad)?.map((row) => row?.id_aad) },
          //   { headers }
          // );
          // const presencesEmail = presences.data?.value?.map((row) => ({
          //   ...row,
          //   email: allUsers?.find((item) => item.id_aad === row?.id).userPrincipalName,
          // }));
          dispatch(slice.actions.getPresencesSuccess({ allUsers, presencesEmail, mail: params?.mail }));
          break;
        }
        case 'perfis': {
          const response = await axios.get(`${BASEURL}/perfil`, options);
          dispatch(slice.actions.getPerfisSuccess(response.data));
          break;
        }
        case 'validar doc': {
          dispatch(slice.actions.resetItem({ item: 'documento' }));
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
