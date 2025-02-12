// utils
import { errorMsg } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function actionGet(state, payload) {
  if (!payload || !payload?.item) return;

  const { item, dados, label } = payload;

  switch (item) {
    case 'cc':
      state.dateUpdate = new Date();
      state.perfilId = dados?.perfil_id || '';
      state[item] = { ...dados, perfil: state.perfil };
      break;

    case 'creditos':
      state.creditos = dados === 'reset' ? [] : [...(state.creditos || []), ...(dados?.objeto || [])];
      state.infoPag = { proximo_cursor: dados?.proximo_cursor || null, ha_mais: dados?.ha_mais || null };
      break;

    default:
      state[item] = label ? dadosLabel(dados, label) : dados;
      break;
  }
}

export function actionCreate(state, payload) {
  if (!payload || !payload.item) return;

  const { item, item1, dados } = payload;

  if (Array.isArray(dados)) {
    if (item1) {
      state[item1] = state[item1] || {};
      state[item1][item] = [...(state[item1][item] || []), ...dados];
    } else {
      state[item] = [...(state[item] || []), ...dados];
    }
  } else if (item1) {
    state[item1] = state[item1] || {};
    state[item1][item] = state[item1][item] || [];
    state[item1][item].push(dados);
  } else {
    state[item] = state[item] || [];
    state[item].push(dados);
  }
}

export function actionUpdate(state, payload) {
  if (!payload?.item || !payload?.dados?.id) return;

  const { item, item1, dados } = payload;
  const target = item1 ? state?.[item1]?.[item] : state?.[item];

  if (!Array.isArray(target)) return;

  const index = target.findIndex((row) => row.id === dados.id);

  if (index > -1) {
    const updatedArray = [...target];
    updatedArray[index] = dados;

    if (item1) state[item1] = { ...state[item1], [item]: updatedArray };
    else state[item] = updatedArray;
  }
}

export function actionDelete(state, payload) {
  if (!payload?.item || !payload?.id) return;

  const { item, item1, id, desativar } = payload;
  const target = item1 ? state?.[item1]?.[item] : state?.[item];

  if (!Array.isArray(target)) return;

  if (item1) state[item1][item] = target.filter((row) => row.id !== id);
  else if (desativar) {
    const index = target.findIndex((row) => row.id === id);
    state[item][index].ativo = false;
  } else state[item] = target.filter((row) => row.id !== id);
}

export function actionOpenModal(state, payload) {
  if (payload === 'view') state.isOpenView = true;
  else {
    state.isOpenModal = true;
    state.isEdit = payload === 'update';
  }
}

export function actionCloseModal(state) {
  state.isOpenView = false;
  state.isOpenModal = false;
  state.selectedItem = null;
}

// ----------------------------------------------------------------------

export async function doneSucess(msg, dispatch, action) {
  if (msg) dispatch(action({ item: 'done', dados: msg }));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(action({ item: 'done', dados: '' }));
}

export async function hasError(error, dispatch, action) {
  dispatch(action({ item: 'error', dados: errorMsg(error) }));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(action({ item: 'error', dados: '' }));
}

// ----------------------------------------------------------------------

function dadosLabel(dados, item) {
  return applySort(
    dados?.map((row) => ({ ...row, label: row?.[item] })),
    getComparator('asc', 'label')
  );
}

// ----------------------------------------------------------------------

export function headerOptions({ accessToken, mail = '', cc, ct, mfd }) {
  if (cc) {
    return {
      headers: {
        cc: mail,
        Authorization: `Bearer ${accessToken}`,
        ...(ct ? { 'content-type': mfd ? 'multipart/form-data' : 'application/json' } : {}),
      },
    };
  }

  return {
    headers: {
      'Current-Colaborador': mail,
      Authorization: `Bearer ${accessToken}`,
      ...(ct ? { 'content-type': mfd ? 'multipart/form-data' : 'application/json' } : {}),
    },
  };
}

// ----------------------------------------------------------------------

export const selectUtilizador = (state) => {
  if (!state) return {};

  const { mail, perfilId, cc } = state;
  const idColaborador = cc ? cc.id : null;

  return { mail, perfilId, idColaborador };
};
