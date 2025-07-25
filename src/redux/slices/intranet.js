import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
import { InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
//
import { callMsGraph } from '../../graph';
import { loginRequest, msalInstance } from '../../config';
import { addRole, getFromParametrizacao } from './parametrizacao';
import { BASEURL, BASEURLSLIM, INTRANETHUBAPI } from '../../utils/apisUrl';
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
  docPdex: null,
  dateUpdate: null,
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
      const perfil = await axios.post(`${INTRANETHUBAPI}/v2/portal/pfs/msal`, msalProfile, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      dispatch(slice.actions.getSuccess({ item: 'perfil', dados: perfil?.data?.objeto }));
      perfil?.data?.objeto?.grupos?.forEach(({ grupo }) => dispatch(addRole(grupo)));
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

export function getInfoInicial(id, inicial) {
  return async (dispatch) => {
    if (!inicial) await dispatch(getFromIntranet('cc', { id }));
    await dispatch(getFromIntranet('colaboradores'));
    await dispatch(getFromIntranet('uos', { label: 'label' }));

    await dispatch(getFromParametrizacao('meusambientes'));
    await dispatch(getFromParametrizacao('meusacessos'));
    await dispatch(getFromParametrizacao('fluxos'));
    await dispatch(getFromParametrizacao('estados'));
    await dispatch(getFromParametrizacao('origens'));

    if (inicial) {
      dispatch(getFromIntranet('frase'));
      await dispatch(getFromIntranet('disposicao', { id, data: format(new Date(), 'yyyy-MM-dd') }));
      await dispatch(getFromIntranet('minhasAplicacoes', { label: 'nome' }));
      await dispatch(getFromIntranet('links', { label: 'nome' }));
      await dispatch(getFromIntranet('certificacoes'));
      await dispatch(getFromParametrizacao('motivosPendencia'));
    }
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
        const requests = [true, false].map((ativo) =>
          axios.get(`${INTRANETHUBAPI}/v2/portal/cls/load`, { ...options, params: { ativo } })
        );

        const responses = await Promise.all(requests);
        const colaboradores = [...(responses[0].data?.objeto || []), ...(responses[1].data?.objeto || [])];
        dispatch(slice.actions.getSuccess({ item, label: 'nome', dados: colaboradores }));

        const ids = colaboradores.map(({ ad_id: id }) => id).filter(Boolean);

        if (ids.length > 0) {
          const presencesApi = `https://graph.microsoft.com/v1.0/communications/getPresencesByUserId`;
          const presencesResponse = await axios.post(presencesApi, { ids }, options);
          const presenceMap = new Map((presencesResponse.data?.value || []).map((p) => [p.id, p]));
          const colabPresence = colaboradores.map((row) => ({ ...row, presence: presenceMap.get(row?.ad_id) || null }));
          dispatch(slice.actions.getSuccess({ item, label: 'nome', dados: colabPresence }));
        }
      } else if (item === 'docPdex') {
        const options = { headers: { Authorization: `Bearer ${accessToken}` } };
        const apiUrl =
          (params?.tipoSearch === 'Pesquisar NIF' && `/v1/pdex/nif?nif=${params?.numDoc}`) ||
          (params?.tipoSearch === 'Pesquisar CNI pelo Nº de BI' && `/v1/pdex/cni_from_bi?num_bi=${params?.numDoc}`) ||
          (params?.tipoSearch === 'Pesquisar Registo Comercial' &&
            `/v1/pdex/registo_comercial?num_doc=${params?.numDoc}`) ||
          (params?.tipoSearch === 'Pesquisar por Doc. ID, NIF ou Nome' &&
            `/v1/pdex/d2n/pessoa?${params?.numDoc ? `&doc_id=${params?.numDoc}` : ''}${params?.nifSearch ? `&nif=${params?.nifSearch}` : ''}${params?.nomeSearch ? `&nome=${params?.nomeSearch}` : ''}`) ||
          `/v1/pdex/dados_bb?num_doc=${params?.numDoc}`;
        const response = await axios.get(`${INTRANETHUBAPI}${apiUrl}`, options);
        dispatch(slice.actions.getSuccess({ item, dados: { ...params, ...response.data?.objeto } }));
      } else {
        const apiUrl =
          (item === 'ajuda' && `${BASEURL}/help/ajuda`) ||
          (item === 'frase' && `${BASEURL}/frase_semana/ativa`) ||
          (item === 'certificacoes' && `${BASEURL}/certificacao`) ||
          (item === 'links' && `${BASEURL}/aplicacao/links/uteis`) ||
          (item === 'perguntas' && `${BASEURL}/help/perguntas_frequentes`) ||
          (item === 'minhasAplicacoes' && `${BASEURL}/aplicacao/aplicacoes/me`) ||
          (item === 'uos' && `${INTRANETHUBAPI}/v2/portal/uos/load?ativo=true`) ||
          (item === 'documentosAjuda' && `${BASEURL}/atc?categoria=documentosAjuda`) ||
          (item === 'cc' && `${INTRANETHUBAPI}/v2/portal/cls/detail?colaborador_id=${params?.id}`) ||
          (item === 'disposicao' && `${BASEURL}/disposicao/by_data/${params?.id}/${params?.data}`) ||
          (item === 'docIdentificacao' &&
            `${BASEURLSLIM}/api/v1/sniac/doc/info/production?documento=${params?.doc}&deCache=${params?.cache}`) ||
          '';
        if (apiUrl) {
          const response = await axios.get(apiUrl, options);
          if (item === 'disposicao') dispatch(slice.actions.getSuccess({ item, dados: !!response.data }));
          else {
            const data = response.data?.objeto || response.data;
            dispatch(slice.actions.getSuccess({ item, dados: data, label: params?.label || '' }));
          }
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
      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
