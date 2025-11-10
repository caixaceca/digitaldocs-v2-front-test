import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { SUPORTE_CLIENTE_API_SERVER } from '../../utils/apisUrl';
//
import {
  hasError,
  actionGet,
  doneSucess,
  actionCreate,
  actionUpdate,
  actionDelete,
  headerOptions,
  selectUtilizador,
} from './sliceActions';
// import { getAccessToken } from './intranet';

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
  tickets: [],
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
  return async (dispatch, getState) => {
    if (!params?.notLoading) dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.reset) dispatch(slice.actions.getSuccess({ item, dados: params?.reset?.dados }));

    try {
      // const accessToken = await getAccessToken();
      const { idColaborador } = selectUtilizador(getState()?.intranet || {});
      // console.log(accessToken);
      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/all`) ||
        (item === 'slas' && `/api/v1/slas/all`) ||
        (item === 'assuntos' && `/api/subjects/all`) ||
        (item === 'utilizadores' && `/api/v1/users/all`) ||
        (item === 'departamentos' && `/api/v1/departments/all`) ||
        (item === 'categorias' && `/api/v1/faq-categories/all`) ||
        (item === 'ticket' && `/api/v1/tickets/get/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/all`) ||
        (item === 'utilizador' && `/api/v1/users/employee/${params?.id}`) ||
        (item === 'indicadores' &&
          `/api/v1/indicators/all?year=${params?.year}${params?.month ? `&month=${params?.month}` : ''}${params?.department ? `&department=${params?.department}` : ''}`) ||
        (item === 'tickets' &&
          `/api/v1/tickets/all${params?.department ? `?departmentId=${params?.department}` : ''}${params?.status ? `${params?.department ? '&' : '?'}status=${params?.status}` : ''}`) ||
        '';
      if (apiUrl) {
        const headers = headerOptions({ accessToken: idColaborador, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.get(`${SUPORTE_CLIENTE_API_SERVER}${apiUrl}`, headers);

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
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      // const accessToken = await getAccessToken();
      const { idColaborador } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken: idColaborador, mail: '', ct: true, mfd: item === 'add-message' });
      if (item === 'add-message') delete options.headers['content-type'];

      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/new`) ||
        (item === 'slas' && `/api/v1/slas/create`) ||
        (item === 'assuntos' && `/api/subjects/create`) ||
        (item === 'utilizadores' && `/api/v1/users/register`) ||
        (item === 'departamentos' && `/api/v1/departments/new`) ||
        (item === 'categorias' && `/api/v1/faq-categories/create`) ||
        (item === 'respostas' && `/api/v1/standardized-response/create`) ||
        (item === 'add-message' && `/api/v1/ticket-messages/create/${params?.id}`) ||
        '';

      if (apiUrl) {
        if (params?.status === 'OPEN' && item === 'add-message') {
          const paramss = { id: params?.id, value: { id: 'IN_PROGRESS', label: 'Em análise' } };
          await dispatch(updateInSuporte('change-status', '', { getItem: 'selectedItem', patch: true, ...paramss }));
        }

        const response = await axios.post(`${SUPORTE_CLIENTE_API_SERVER}${apiUrl}`, body, options);
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
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      // const accessToken = await getAccessToken();
      const { idColaborador } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken: idColaborador, mail: '', cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/update/${params?.id}`) ||
        (item === 'slas' && `/api/v1/slas/update/${params?.id}`) ||
        (item === 'assuntos' && `/api/subjects/update/${params?.id}`) ||
        (item === 'utilizadores' && `/api/v1/users/update/${params?.id}`) ||
        (item === 'departamentos' && `/api/v1/departments/update/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/update/${params?.id}`) ||
        (item === 'categorias' && `/api/v1/faq-categories/update/{id}?id=${params?.id}`) ||
        // ticket
        (item === 'assign' && `/api/v1/tickets/assign/${params?.id}/${params?.value?.id}`) ||
        (item === 'change-department' && `/api/v1/tickets/change-department/${params?.id}/${params?.value?.id}`) ||
        (item === 'change-status' &&
          `/api/v1/tickets/change-status/${params?.id}/${params?.value?.id}?resolved=${!!params?.resolved}`) ||
        '';

      if (apiUrl) {
        if (params?.status === 'OPEN' && item !== 'change-status') {
          const paramss = { id: params.id, value: { id: 'IN_PROGRESS', label: 'Em análise' } };
          await dispatch(updateInSuporte('change-status', '', { getItem: 'selectedItem', patch: true, ...paramss }));
        }

        const method = params?.patch ? 'patch' : 'put';
        const response = await axios[method](`${SUPORTE_CLIENTE_API_SERVER}${apiUrl}`, body, options);

        const dados = response.data?.payload;
        if (params?.getItem) {
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
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      // const accessToken = await getAccessToken();
      const { idColaborador } = selectUtilizador(getState()?.intranet || {});
      const apiUrl =
        (item === 'faq' && `/api/v1/faqs/delete/${params?.id}`) ||
        (item === 'slas' && `/api/v1/slas/delete/${params?.id}`) ||
        (item === 'assuntos' && `/api/v1/subjects/delete/${params?.id}`) ||
        (item === 'utilizadores' && `/api/v1/users/delete/${params?.id}`) ||
        (item === 'departamentos' && `/api/v1/departments/delete/${params?.id}`) ||
        (item === 'categorias' && `/api/v1/faq-categories/delete/${params?.id}`) ||
        (item === 'respostas' && `/api/v1/standardized-response/delete/${params?.id}`) ||
        '';

      if (apiUrl) {
        const options = headerOptions({ accessToken: idColaborador, mail: '', cc: true, ct: false, mfd: false });
        await axios.delete(`${SUPORTE_CLIENTE_API_SERVER}${apiUrl}`, options);

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
