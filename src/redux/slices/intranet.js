import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
//
import { callMsGraph } from '../../graph';
import { loginRequest, msalInstance } from '../../config';
// utils
import { BASEURL, BASEURLSLIM } from '../../utils/axios';
// hooks
import {
  hasError,
  actionGet,
  doneSucess,
  actionReset,
  headerOptions,
  selectUtilizador,
  actionResponseMsg,
} from './sliceActions';

// ----------------------------------------------------------------------

const initialState = {
  isSaving: false,
  isLoading: false,
  disposicao: true,
  done: '',
  mail: '',
  error: '',
  perfilId: '',
  cc: null,
  frase: null,
  ajuda: null,
  perfil: null,
  docIdentificacao: null,
  dateUpdate: new Date(),
  uos: [],
  links: [],
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
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    responseMsg(state, action) {
      actionResponseMsg(state, action.payload);
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    resetItem(state, action) {
      actionReset(state, action.payload);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getSuccess, resetItem } = slice.actions;

// ----------------------------------------------------------------------

export function authenticateColaborador() {
  return async (dispatch) => {
    try {
      const accessToken = await getAccessToken();
      const msalProfile = await callMsGraph(accessToken);
      dispatch(slice.actions.getSuccess({ item: 'mail', dados: msalProfile?.userPrincipalName }));
      const perfil = await axios.post(`${BASEURL}/perfil/msal`, msalProfile, {
        headers: { Authorization: accessToken },
        withCredentials: true,
      });
      dispatch(slice.actions.getSuccess({ item: 'perfil', dados: perfil.data }));
    } catch (error) {
      hasError(error, dispatch, slice.actions.responseMsg);
    }
  };
}

export async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    await msalInstance.loginRedirect(loginRequest);
    throw new Error('Utilizador não está logado.');
  }

  const tokenRequest = { ...loginRequest, account: accounts[0] };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    await msalInstance.acquireTokenRedirect(tokenRequest);
    throw new Error('Redirecionado para login.');
  }
}

// ----------------------------------------------------------------------

export function getFromIntranet(item, params) {
  return async (dispatch, getState) => {
    try {
      dispatch(slice.actions.setLoading(true));
      const accessToken = await getAccessToken();
      const { mail } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: false, ct: false, mfd: false });

      if (item === 'colaboradores') {
        const colaboradores = await axios.get(`${BASEURL}/colaborador`, options);
        const perfis = await axios.get(`${BASEURL}/perfil`, options);
        const colaboradoresPerfis = colaboradores.data
          ?.filter((_) => _?.is_active)
          ?.map((row) => ({
            ...row,
            nome: row?.perfil?.displayName,
            perfil: perfis?.data?.find((item) => Number(item?.id) === Number(row?.perfil_id)) || row?.perfil,
          }));
        dispatch(slice.actions.getSuccess({ item, dados: colaboradoresPerfis, label: 'nome' }));

        // USERS PRESENCE
        const ids = perfis?.data?.filter((row) => row?.id_aad)?.map((item) => item?.id_aad);
        if (ids?.length > 0) {
          const presences = await axios.post(
            `https://graph.microsoft.com/v1.0/communications/getPresencesByUserId`,
            { ids },
            options
          );
          dispatch(
            slice.actions.getSuccess({
              item,
              label: 'nome',
              dados: colaboradoresPerfis?.map((row) => ({
                ...row,
                presence: presences.data?.value?.find((item) => item?.id === row?.perfil?.id_aad) || null,
              })),
            })
          );
        }
      } else {
        const apiUrl =
          (item === 'ajuda' && `${BASEURL}/help/ajuda`) ||
          (item === 'uos' && `${BASEURL}/unidade_organica`) ||
          (item === 'frase' && `${BASEURL}/frase_semana/ativa`) ||
          (item === 'certificacoes' && `${BASEURL}/certificacao`) ||
          (item === 'links' && `${BASEURL}/aplicacao/links/uteis`) ||
          (item === 'cc' && `${BASEURL}/colaborador/${params?.id}`) ||
          (item === 'perguntas' && `${BASEURL}/help/perguntas_frequentes`) ||
          (item === 'minhasAplicacoes' && `${BASEURL}/aplicacao/aplicacoes/me`) ||
          (item === 'disposicao' && `${BASEURL}/disposicao/by_data/${params?.id}/${params?.data}`) ||
          (item === 'docIdentificacao' &&
            `${BASEURLSLIM}/api/v1/sniac/doc/info/production?documento=${params?.doc}&deCache=${params?.cache}`) ||
          '';
        if (apiUrl) {
          const response = await axios.get(apiUrl, options);
          if (item === 'disposicao') {
            dispatch(slice.actions.getSuccess({ item, dados: !!response.data }));
          } else {
            dispatch(slice.actions.getSuccess({ item, dados: response.data, label: params?.label || '' }));
          }
        }
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.responseMsg);
    } finally {
      dispatch(slice.actions.setLoading(false));
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    try {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));
      const accessToken = await getAccessToken();
      const { mail } = selectUtilizador(getState()?.intranet || {});
      const apiUrl =
        (item === 'denuncia' && `${BASEURL}/denuncia`) ||
        (item === 'disposicao' && `${BASEURL}/disposicao`) ||
        (item === 'sugestao' && `${BASEURL}/sugestao/sugestao`) ||
        '';
      if (apiUrl) {
        const options = headerOptions({ accessToken, mail, cc: false, ct: false, mfd: item !== 'disposicao' });
        await axios.post(apiUrl, dados, options);
        if (item === 'disposicao') {
          dispatch(slice.actions.getSuccess({ item, dados: true }));
        }
      }
      doneSucess(params?.msg, dispatch, slice.actions.responseMsg);
    } catch (error) {
      hasError(error, dispatch, slice.actions.responseMsg);
    }
  };
}
