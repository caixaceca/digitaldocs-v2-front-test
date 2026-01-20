import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
//
import { callMsGraph } from '../../graph';
import { loginRequest, msalInstance } from '../../config';
import { addRole, getFromParametrizacao } from './parametrizacao';
import { API_INTRANET_URL, API_SLIM_URL, API_CORENET_URL } from '../../utils/apisUrl';
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
  modalIntranet: '',
  cc: null,
  frase: null,
  ajuda: null,
  perfil: null,
  docPdex: null,
  dateUpdate: null,
  selectedItem: null,
  docIdentificacao: null,
  fichaInformativa: null,
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

    updateFicha(state, action) {
      state.fichaInformativa = { ...state.fichaInformativa, ...action.payload };
    },

    setModal(state, action) {
      state.isEdit = !!action?.payload?.isEdit;
      state.modalIntranet = action?.payload?.modal || '';
      state.selectedItem = action?.payload?.dados || null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getSuccess, updateFicha, setModal } = slice.actions;

// ---------------------------------------------------------------------------------------------------------------------

export function authenticateColaborador() {
  return async (dispatch) => {
    try {
      const accessToken = await getAccessToken();
      const msalProfile = await callMsGraph(accessToken);
      dispatch(slice.actions.getSuccess({ item: 'mail', dados: msalProfile?.userPrincipalName }));
      const perfil = await axios.post(`${API_CORENET_URL}/v2/portal/pfs/msal`, msalProfile, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      localStorage.setItem('accessToken', accessToken);
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
    if (error instanceof InteractionRequiredAuthError || error.errorCode === 'timed_out') {
      try {
        const response = await msalInstance.acquireTokenPopup(tokenRequest);
        return response.accessToken;
      } catch (popupError) {
        const { errorCode } = popupError;
        if (errorCode === 'popup_window_error' || errorCode === 'popup_blocked' || errorCode === 'timed_out') {
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
          axios.get(`${API_CORENET_URL}/v2/portal/cls/load`, { ...options, params: { ativo } })
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
            `/v1/pdex/d2n/pessoa?${params?.numDoc ? `&doc_id=${params?.numDoc}` : ''}${
              params?.nifSearch ? `&nif=${params?.nifSearch}` : ''
            }${params?.nomeSearch ? `&nome=${params?.nomeSearch}` : ''}`) ||
          `/v1/pdex/dados_bb?num_doc=${params?.numDoc}`;
        const response = await axios.get(`${API_CORENET_URL}${apiUrl}`, options);
        dispatch(slice.actions.getSuccess({ item, dados: { ...params, ...response.data?.objeto } }));
      } else {
        const apiUrl =
          (item === 'ajuda' && `${API_INTRANET_URL}/help/ajuda`) ||
          (item === 'frase' && `${API_INTRANET_URL}/frase_semana/ativa`) ||
          (item === 'certificacoes' && `${API_INTRANET_URL}/certificacao`) ||
          (item === 'links' && `${API_INTRANET_URL}/aplicacao/links/uteis`) ||
          (item === 'uos' && `${API_CORENET_URL}/v2/portal/uos/load?ativo=true`) ||
          (item === 'perguntas' && `${API_INTRANET_URL}/help/perguntas_frequentes`) ||
          (item === 'minhasAplicacoes' && `${API_INTRANET_URL}/aplicacao/aplicacoes/me`) ||
          (item === 'documentosAjuda' && `${API_INTRANET_URL}/atc?categoria=documentosAjuda`) ||
          (item === 'cc' && `${API_CORENET_URL}/v2/portal/cls/detail?colaborador_id=${params?.id}`) ||
          (item === 'disposicao' && `${API_INTRANET_URL}/disposicao/by_data/${params?.id}/${params?.data}`) ||
          (item === 'fichaInformativa' && `${API_SLIM_URL}/v1/fichas/dcs/ficha?entidade=${params?.entidade}`) ||
          (item === 'docIdentificacao' &&
            `${API_SLIM_URL}/api/v1/sniac/doc/info/production?documento=${params?.doc}&deCache=${params?.cache}`) ||
          '';
        if (apiUrl) {
          const response = await axios.get(apiUrl, options);
          if (item === 'disposicao') dispatch(slice.actions.getSuccess({ item, dados: !!response.data }));
          else if (item === 'fichaInformativa')
            dispatch(slice.actions.getSuccess({ item, dados: { ...response.data.objeto, numero: params?.entidade } }));
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
        (item === 'denuncia' && `${API_INTRANET_URL}/denuncia`) ||
        (item === 'disposicao' && `${API_INTRANET_URL}/disposicao`) ||
        (item === 'sugestao' && `${API_INTRANET_URL}/sugestao/sugestao`) ||
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
