import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { API_SUPORTE_CLIENTE_URL } from '../../utils/apisUrl';
//
import {
  hasError,
  actionGet,
  doneSucess,
  actionCreate,
  actionUpdate,
  actionDelete,
  headerOptions,
} from './sliceActions';
import { getAccessToken } from './intranet';

// ---------------------------------------------------------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  modalSuporte: '',
  isEdit: false,
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  utilizador: null,
  indicadores: null,
  selectedItem: null,
  faq: [],
  slas: [],
  slasUo: [],
  tickets: [],
  prompts: [],
  pesquisa: [],
  assuntos: [],
  respostas: [],
  categorias: [],
  utilizadores: [],
  departamentos: [],
};

const slice = createSlice({
  name: 'suporte',
  initialState,
  reducers: {
    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    createSuccess(state, action) {
      actionCreate(state, action.payload);
    },

    updateSuccess(state, action) {
      actionUpdate(state, action.payload);
    },

    deleteSuccess(state, action) {
      actionDelete(state, action.payload);
    },

    changeProp(state, action) {
      const { id, value, assign } = action.payload;
      const prop = assign ? 'current_user_name' : 'status';
      const index = state.tickets.findIndex(({ id: idRow }) => idRow === id);
      if (index !== -1) state.tickets[index][prop] = assign ? value?.label : value?.id;
    },

    changeCustomer(state, action) {
      if (state.selectedItem) state.selectedItem.customer = action.payload;
    },

    toogleItem(state, action) {
      const { id, item, active } = action.payload;
      if (item === 'prompts') state.prompts = state.prompts?.map((row) => ({ ...row, active: false }));
      const index = state[item].findIndex(({ id: idRow }) => idRow === id);
      if (index !== -1) state[item][index].active = active;
    },

    setModal(state, action) {
      state.isEdit = !!action?.payload?.isEdit;
      state.modalSuporte = action?.payload?.modal || '';
      state.selectedItem = action?.payload?.dados || null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { setModal, getSuccess } = slice.actions;

// ---------------------------------------------------------------------------------------------------------------------

export function getInSuporte(item, params) {
  return async (dispatch) => {
    if (!params?.notLoading) dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.reset) dispatch(slice.actions.getSuccess({ item, dados: params?.reset?.dados }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/all`) ||
        (item === 'slas' && `/api/v1/slas/all`) ||
        (item === 'assuntos' && `/api/subjects/all`) ||
        (item === 'utilizadores' && `/api/v1/users/all`) ||
        (item === 'slasUo' && `/api/v1/department-sla/all`) ||
        (item === 'departamentos' && `/api/v1/departments/all`) ||
        (item === 'categorias' && `/api/v1/faq-categories/all`) ||
        (item === 'prompts' && `/api/v1/mail-scan-presets/all`) ||
        (item === 'ticket' && `/api/v1/tickets/get/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/all`) ||
        (item === 'presets' && `/api/v1/mail-scan-presets/${params?.id}`) ||
        (item === 'utilizador' && `/api/v1/users/employee/${params?.id}`) ||
        (item === 'prompt' && `/api/v1/mail-scan-presets/generate-prompt`) ||
        (item === 'pesquisa' && `/api/v1/tickets/search?query=${params?.query}`) ||
        (item === 'indicadores' &&
          `/api/v1/indicators/all?year=${params?.year}${params?.month ? `&month=${params?.month}` : ''}${
            params?.department ? `&department=${params?.department}` : ''
          }`) ||
        (item === 'tickets' &&
          `/api/v1/tickets/all${params?.department ? `?departmentId=${params?.department}` : ''}${
            params?.status ? `${params?.department ? '&' : '?'}status=${params?.status}` : ''
          }`) ||
        '';
      if (apiUrl) {
        const headers = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.get(`${API_SUPORTE_CLIENTE_URL}${apiUrl}`, headers);

        const dados = response.data?.payload;
        dispatch(slice.actions.getSuccess({ item: params?.item || item, dados }));
        if (params?.msg) doneSucess(params, dispatch, slice.actions.getSuccess);
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function createInSuporte(item, body, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const options = headerOptions({ accessToken, mail: '', ct: true, mfd: item === 'add-message' });
      if (item === 'add-message') delete options.headers['content-type'];

      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/new`) ||
        (item === 'slas' && `/api/v1/slas/create`) ||
        (item === 'assuntos' && `/api/subjects/create`) ||
        (item === 'utilizadores' && `/api/v1/users/register`) ||
        (item === 'slasUo' && `/api/v1/department-sla/create`) ||
        (item === 'departamentos' && `/api/v1/departments/new`) ||
        (item === 'categorias' && `/api/v1/faq-categories/create`) ||
        (item === 'prompts' && `/api/v1/mail-scan-presets/create`) ||
        (item === 'respostas' && `/api/v1/standardized-response/create`) ||
        (item === 'add-message' && `/api/v1/ticket-messages/create/${params?.id}`) ||
        '';

      if (apiUrl) {
        const response = await axios.post(`${API_SUPORTE_CLIENTE_URL}${apiUrl}`, body, options);
        const dados = response.data?.payload;
        dispatch(slice.actions.createSuccess({ item: params?.item || item, item1: params?.item1 || '', dados }));
      }

      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function updateInSuporte(item, body, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });

      if (item === 'core-validation') {
        // const response = await axios.patch(`${API_SUPORTE_CLIENTE_URL}${apiUrl}`, body, options);
        body = JSON.stringify({ coreBankingAccountValidation: false, coreBankingEmailValidation: false, ...body });
      }

      if (params?.message && (item === 'assign' || item === 'change-department' || item === 'change-status')) {
        const opt = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: true });
        await axios.post(`${API_SUPORTE_CLIENTE_URL}/api/v1/ticket-messages/create/${params?.id}`, params.message, opt);
      }

      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/update/${params?.id}`) ||
        (item === 'slas' && `/api/v1/slas/update/${params?.id}`) ||
        (item === 'assuntos' && `/api/subjects/update/${params?.id}`) ||
        (item === 'utilizadores' && `/api/v1/users/update/${params?.id}`) ||
        (item === 'slasUo' && `/api/v1/department-sla/update/${params?.id}`) ||
        (item === 'departamentos' && `/api/v1/departments/update/${params?.id}`) ||
        (item === 'prompts' && `/api/v1/mail-scan-presets/update/${params?.id}`) ||
        (item === 'categorias' && `/api/v1/faq-categories/update/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/update/${params?.id}`) ||
        // toggle
        (item === 'toggle-faq' && `/api/v1/faqs/toggle/${params?.id}`) ||
        (item === 'toggle-utilizadores' && `/api/v1/users/toggle/${params?.id}`) ||
        (item === 'toggle-respostas' && `/api/v1/standardized-response/toggle/${params?.id}`) ||
        (item === 'toggle-prompts' && `/api/v1/mail-scan-presets/toggle-active/${params?.id}`) ||
        // ticket
        (item === 'assign' && `/api/v1/tickets/assign/${params?.id}/${params?.value?.id}`) ||
        (item === 'core-validation' && `/api/v1/customers/validate-core-bank/${params?.id}`) ||
        (item === 'change-department' && `/api/v1/tickets/change-department/${params?.id}/${params?.value?.id}`) ||
        (item === 'change-status' &&
          `/api/v1/tickets/change-status/${params?.id}/${params?.value?.id}?resolved=${!!params?.resolved}`) ||
        '';

      if (apiUrl) {
        const method = params?.patch ? 'patch' : 'put';
        const response = await axios[method](`${API_SUPORTE_CLIENTE_URL}${apiUrl}`, body, options);

        const dados = response.data?.payload;
        if (item?.includes('toggle-')) dispatch(slice.actions.toogleItem(params));
        if (item === 'core-validation') dispatch(slice.actions.changeCustomer(dados));
        else if (params?.getItem) {
          dispatch(slice.actions.getSuccess({ item: params?.getItem, dados }));
          if (item === 'assign' || item === 'change-status') {
            dispatch(slice.actions.changeProp({ assign: item === 'assign', value: params?.value, id: params?.id }));
          } else if (item === 'change-department') {
            dispatch(slice.actions.deleteSuccess({ item: 'tickets', id: params?.id }));
          }
        } else {
          dispatch(slice.actions.updateSuccess({ item: params?.item || item, item1: params?.item1 || '', dados }));
        }
      }

      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function deleteInSuporte(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/delete/${params?.id}`) ||
        (item === 'slas' && `/api/v1/slas/delete/${params?.id}`) ||
        (item === 'assuntos' && `/api/v1/subjects/delete/${params?.id}`) ||
        (item === 'utilizadores' && `/api/v1/users/delete/${params?.id}`) ||
        (item === 'slasUo' && `/api/v1/department-sla/delete/${params?.id}`) ||
        (item === 'departamentos' && `/api/v1/departments/delete/${params?.id}`) ||
        (item === 'categorias' && `/api/v1/faq-categories/delete/${params?.id}`) ||
        (item === 'prompts' && `/api/v1/mail-scan-presets/delete/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/delete/${params?.id}`) ||
        '';

      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        await axios.delete(`${API_SUPORTE_CLIENTE_URL}${apiUrl}`, options);
        dispatch(slice.actions.deleteSuccess({ item, item1: params?.item1 || '', id: params?.id }));
      }
      doneSucess(params, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
