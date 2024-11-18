// utils
import { errorMsg } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function actionGet(state, payload) {
  if (payload.label) {
    state[payload.item] = dadosLabel(payload?.dados, payload.label);
  } else {
    state[payload.item] = payload?.dados;
  }
}

export function actionCreate(state, payload) {
  if (Array.isArray(payload.dados) && payload.item1) {
    state[payload.item1][payload.item] = [...state[payload.item1][payload.item], ...payload.dados];
  } else if (Array.isArray(payload.dados)) {
    state[payload.item] = [...state[payload.item], ...payload.dados];
  } else if (payload.item1) {
    state[payload.item1][payload.item].push(payload.dados);
  } else {
    state[payload.item].push(payload.dados);
  }
}

export function actionUpdate(state, payload) {
  if (payload.item1) {
    const index = state?.[payload.item1]?.[payload.item].findIndex((row) => row.id === payload.dados.id);
    if (index > -1) {
      state[payload.item1][payload.item][index] = payload.dados;
    }
  } else {
    const index = state?.[payload.item].findIndex((row) => row.id === payload.dados.id);
    if (index > -1) {
      state[payload.item][index] = payload.dados;
    }
  }
}

export function actionDelete(state, payload) {
  if (payload.item1) {
    state[payload.item1][payload.item] = state[payload.item1][payload.item].filter((row) => row.id !== payload.id);
  } else if (payload.desativar) {
    const index = state[payload.item].findIndex((row) => row.id === payload.id);
    state[payload.item][index].ativo = false;
  } else {
    state[payload.item] = state[payload.item].filter((row) => row.id !== payload.id);
  }
}

export function actionOpenModal(state, payload) {
  if (payload === 'view') {
    state.isOpenView = true;
  } else {
    state.isOpenModal = true;
    state.isEdit = payload === 'update';
  }
}

export function actionCloseModal(state) {
  state.isOpenView = false;
  state.isOpenModal = false;
  state.selectedItem = null;
}

export function actionReset(state, payload) {
  state[payload.item] = payload?.tipo === 'array' ? [] : null;
}

export function actionResponseMsg(state, payload) {
  state.isSaving = false;
  state.isLoading = false;
  state[payload.item] = payload.msg;
}

// ----------------------------------------------------------------------

export async function doneSucess(msg, dispatch, action) {
  if (msg) {
    dispatch(action({ item: 'done', msg }));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(action({ item: 'done', msg: '' }));
}

export async function hasError(error, dispatch, action) {
  dispatch(action({ item: 'error', msg: errorMsg(error) }));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(action({ item: 'error', msg: '' }));
}

// ----------------------------------------------------------------------

function dadosLabel(dados, item) {
  return applySort(
    dados?.map((row) => ({ ...row, label: row?.[item] })),
    getComparator('asc', 'label')
  );
}
