import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
import { InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
//
import { callMsGraph } from '../../graph';
import { addRole } from './parametrizacao';
import { loginRequest, msalInstance } from '../../config';
// utils
import { BASEURL, BASEURLSLIM, INTRANETHUBAPI } from '../../utils/apisUrl';
// hooks
import { hasError, actionGet, doneSucess, headerOptions, selectUtilizador } from './sliceActions';

// ---------------------------------------------------------------------------------------------------------------------

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
  dateUpdate: null,
  documentoPdex: null,
  docIdentificacao: null,
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
    getSuccess(state, action) {
      actionGet(state, action.payload);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getSuccess } = slice.actions;

// ---------------------------------------------------------------------------------------------------------------------

export function authenticateColaborador() {
  return async (dispatch) => {
    try {
      const accessToken = await getAccessToken();
      const msalProfile = await callMsGraph(accessToken);
      dispatch(slice.actions.getSuccess({ item: 'mail', dados: msalProfile?.userPrincipalName }));
      // const perfil = await axios.post(`${BASEURL}/perfil/msal`, msalProfile, {
      const perfil = await axios.post(`${INTRANETHUBAPI}/v2/portal/perfis/msal`, msalProfile, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      dispatch(slice.actions.getSuccess({ item: 'perfil', dados: perfil.data?.objeto }));
      perfil.data?.objeto?.grupos?.forEach(({ grupo }) => dispatch(addRole(grupo)));
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    }
  };
}

export async function getAccessToken() {
  const activeAccount = msalInstance.getActiveAccount();

  if (!activeAccount) {
    msalInstance.loginRedirect(loginRequest);
    return null;
  }

  const tokenRequest = { ...loginRequest, account: activeAccount };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup(tokenRequest);
        return response.accessToken;
      } catch (popupError) {
        if (
          popupError instanceof BrowserAuthError &&
          (popupError.errorCode === 'popup_window_error' || popupError.errorCode === 'popup_blocked')
        ) {
          msalInstance.acquireTokenRedirect(tokenRequest);
          return null;
        }
        throw popupError;
      }
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

export function getInfoIntranet(id) {
  return async (dispatch) => {
    dispatch(getFromIntranet('disposicao', { id, data: format(new Date(), 'yyyy-MM-dd') }));
    dispatch(getFromIntranet('frase'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(getFromIntranet('colaboradores'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(getFromIntranet('minhasAplicacoes', { label: 'nome' }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(getFromIntranet('links', { label: 'nome' }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(getFromIntranet('uos', { label: 'label' }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    dispatch(getFromIntranet('certificacoes'));
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getFromIntranet(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.reset) dispatch(slice.actions.getSuccess({ item, dados: params?.reset?.dados }));

    try {
      const accessToken = await getAccessToken();
      const { mail } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: false, ct: false, mfd: false });

      if (item === 'colaboradores') {
        const colaboradores = await axios.get(`${BASEURL}/colaborador`, options);
        const perfis = await axios.get(`${BASEURL}/perfil`, options);
        const colaboradoresPerfis = colaboradores.data
          // ?.filter(({ is_active: ativo }) => ativo)
          ?.map((row) => ({
            ...row,
            email: row?.perfil?.mail,
            nome: row?.perfil?.displayName,
            perfil: perfis?.data?.find(({ id }) => Number(id) === Number(row?.perfil_id)) || row?.perfil,
          }));
        dispatch(slice.actions.getSuccess({ item, dados: colaboradoresPerfis, label: 'nome' }));

        // USERS PRESENCE
        const ids = perfis?.data?.filter(({ id_aad: idAd }) => idAd)?.map(({ id_aad: id }) => id);
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
                presence: presences.data?.value?.find(({ id }) => id === row?.perfil?.id_aad) || null,
              })),
            })
          );
        }
      } else if (item === 'documentoPdex') {
        const options = { headers: { Authorization: `Bearer ${accessToken}` } };
        const apiUrl =
          (params?.tipoSearch === 'NIF' && '/v1/pdex/nif?nif=') ||
          (params?.tipoSearch === 'REGISTO COMERCIAL' && '/v1/pdex/registo_comercial?num_doc=') ||
          '/v1/pdex/dados_bb?num_doc=';
        const response = await axios.get(`${INTRANETHUBAPI}${apiUrl}${params?.numeroSearch}`, options);
        dispatch(slice.actions.getSuccess({ item, dados: { ...params, ...response.data?.objeto } }));
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
          (item === 'documentosAjuda' && `${BASEURL}/atc?categoria=documentosAjuda`) ||
          (item === 'disposicao' && `${BASEURL}/disposicao/by_data/${params?.id}/${params?.data}`) ||
          (item === 'docIdentificacao' &&
            `${BASEURLSLIM}/api/v1/sniac/doc/info/production?documento=${params?.doc}&deCache=${params?.cache}`) ||
          '';
        if (apiUrl) {
          const response = await axios.get(apiUrl, options);
          if (item === 'disposicao') dispatch(slice.actions.getSuccess({ item, dados: !!response.data }));
          else dispatch(slice.actions.getSuccess({ item, dados: response.data, label: params?.label || '' }));
        }
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));
    if (item === 'disposicao') dispatch(slice.actions.getSuccess({ item, dados: true }));

    try {
      const accessToken = await getAccessToken();
      const { mail } = selectUtilizador(getState()?.intranet || {});
      const apiUrl =
        (item === 'denuncia' && `${BASEURL}/denuncia`) ||
        (item === 'disposicao' && `${BASEURL}/disposicao`) ||
        (item === 'sugestao' && `${BASEURL}/sugestao/sugestao`) ||
        '';
      if (apiUrl) {
        const options = headerOptions({ accessToken, mail, cc: false, ct: true, mfd: item !== 'disposicao' });
        await axios.post(apiUrl, dados, options);
      }
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
