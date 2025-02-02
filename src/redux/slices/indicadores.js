import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { errorMsg } from '../../utils/formatText';

// ----------------------------------------------------------------------

const initialState = {
  error: '',
  totalP: null,
  isLoading: false,
  fileSystem: [],
  indicadores: [],
  estCredito: { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] },
  resumoEstCredito: { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] },
};

const slice = createSlice({
  name: 'indicadores',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    setError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    resetItem(state, action) {
      const { item } = action.payload;
      if (item === 'estCredito') {
        state.resumoEstCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
        state.estCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
      } else {
        state[item] = action.payload?.tipo === 'array' ? [] : null;
      }
    },

    getTotalProcessosSuccess(state, action) {
      state.totalP = action.payload;
    },

    getFyleSystemSuccess(state, action) {
      state.fileSystem = action.payload;
    },

    getIndicadoresSuccess(state, action) {
      state.indicadores = action.payload;
    },

    getEstatisticaCreditoSuccess(state, action) {
      state.estCredito = action.payload;
    },

    getResumoEstatisticaCreditoSuccess(state, action) {
      const dados =
        (action.payload?.uoId === -2 && action.payload?.dados?.filter((row) => row?.regiao === 'Norte')) ||
        (action.payload?.uoId === -3 && action.payload?.dados?.filter((row) => row?.regiao === 'Sul')) ||
        action.payload?.dados;
      state.resumoEstCredito.entrada = dados
        ?.filter((row) => row.fase === 'Entrada')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
      state.resumoEstCredito.aprovado = dados
        ?.filter((row) => row.fase === 'Aprovado')
        ?.map((row) => ({ ...row, montante_aprovado: row?.montante }));
      state.resumoEstCredito.contratado = dados
        ?.filter((row) => row.fase === 'Contratado')
        ?.map((row) => ({ ...row, montante_contratado: row?.montante }));
      state.resumoEstCredito.indeferido = dados
        ?.filter((row) => row.fase === 'Indeferido')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
      state.resumoEstCredito.desistido = dados
        ?.filter((row) => row.fase === 'Desistido')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { resetItem, setLoading } = slice.actions;

// ----------------------------------------------------------------------

export function getIndicadores(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.setLoading(true));
    dispatch(slice.actions.resetItem({ item: 'indicadores', tipo: 'array' }));
    try {
      const options = { headers: { cc: params?.mail } };
      const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${params?.dataf ? `dataf=${params?.dataf}&` : ''}`;
      const uo = params?.uo && params?.agrEntradas === 'Balcão' ? `&uo_id=${params?.uo}` : '';
      const estado = params?.estado && params?.agrEntradas === 'Estado' ? `&estado_id=${params?.estado}` : '';
      switch (item) {
        case 'totalP': {
          const response = await axios.get(`${BASEURLDD}/v2/indicadores/default/${params?.perfilId}`, options);
          dispatch(slice.actions.getTotalProcessosSuccess(response.data.objeto));
          break;
        }
        case 'fileSystem': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/filesystem/${params?.perfilId}`, options);
          dispatch(slice.actions.getFyleSystemSuccess(response.data));
          break;
        }
        case 'data': {
          if (params?.perfilId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/padrao/criacao/${params?.perfilId}?vista=${params?.periodo?.toLowerCase()}${
                params?.uo ? `&uoID=${params?.uo}` : ''
              }${params?.perfil ? `&perfilID1=${params?.perfil}` : ''}`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data));
          }
          break;
        }
        case 'criacao': {
          if (params?.uo) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/entrada/${params?.uo}${
                query ? `?${query.substr(0, query.length - 1)}` : ''
              }`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          }
          break;
        }
        case 'entradas': {
          if ((params?.agrEntradas === 'Estado' && params?.estado) || params?.balcao) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/chegaram/${params?.agrEntradas === 'Estado' ? 'num_estado' : 'num_balcao'}/${
                params?.agrEntradas === 'Estado' ? params?.estado : params?.balcao
              }${query ? `?${query.substr(0, query.length - 1)}` : ''}`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          }
          break;
        }
        case 'trabalhados': {
          if (params?.estado) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/trabalhado/${params?.estado}${
                query ? `?${query.substr(0, query.length - 1)}` : ''
              }`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          }
          break;
        }
        case 'devolucoes': {
          if (params?.estado) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/devolucao${params?.origem === 'Interna' ? '/interno' : ''}/${
                params?.estado
              }${query ? `?${query.substr(0, query.length - 1)}` : ''}`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          }
          break;
        }
        case 'origem': {
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/top/criacao/${params?.perfilId}?escopo=${params?.agrupamento}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'tipos': {
          const query1 = `${params?.uo ? `uoID=${params?.uo}&` : ''}${
            params?.perfil ? `perfilPID=${params?.perfil}&` : ''
          }${query}`;
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/fluxo/${params?.perfilId}${
              query1 ? `?${query1.substr(0, query1.length - 1)}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'execucao': {
          if (params?.estado || params?.perfil || params?.fluxo) {
            const query1 = `${params?.estado ? `estadoIDFilter=${params?.estado}&` : ''}${
              params?.fluxo ? `fluxoIDFilter=${params?.fluxo}&` : ''
            }${params?.perfil ? `perfilIDFilter=${params?.perfil}&` : ''}`;
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/tempo/execucao/${params?.perfilId}?${query1.substr(0, query1.length - 1)}`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data));
          }
          break;
        }
        case 'conclusao': {
          const perfil = params?.perfil ? `&perfilPID=${params?.perfil}` : '';
          const fluxo = params?.fluxo ? `&fluxoID=${params?.fluxo}` : '';
          const datai = params?.datai ? `&datai=${params?.datai}` : '';
          const dataf = params?.dataf ? `&dataf=${params?.dataf}` : '';
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/duracao/${params?.perfilId}?de=${params?.momento}${perfil}${fluxo}${datai}${dataf}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'equipa': {
          const uo = params?.agrEntradas === 'Balcão' && params?.uo ? `&uo_id=${params?.uo}` : '';
          const estado = params?.agrEntradas === 'Estado' && params?.estado ? `&estado_id=${params?.estado}` : '';
          const response = await axios.get(
            `${BASEURLDD}/v2/indicadores/duracao/${params?.perfilId}?ano=${params?.ano}${uo}${estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'estCreditoMensal': {
          const pathIds = `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}`;
          const data = `${params?.ano}&mes=${params?.mes}`;
          const response = await Promise.all([
            axios.get(`${pathIds}&fase=entrada&ano=${data}`, options),
            axios.get(`${pathIds}&fase=aprovado&ano=${data}`, options),
            axios.get(`${pathIds}&fase=contratado&ano=${data}`, options),
            axios.get(`${pathIds}&fase=indeferido&ano=${data}`, options),
            axios.get(`${pathIds}&fase=desistido&ano=${data}`, options),
            axios.get(
              `${BASEURLDD}/v1/indicadores/resumo${params?.uoID > 0 ? `/dauo/${params?.uoID}` : ''}${params?.intervalo}`,
              options
            ),
          ]);
          dispatch(
            slice.actions.getEstatisticaCreditoSuccess({
              entrada: response?.[0]?.data || [],
              aprovado: response?.[1]?.data || [],
              contratado: response?.[2]?.data || [],
              indeferido: response?.[3]?.data || [],
              desistido: response?.[4]?.data || [],
            })
          );
          dispatch(
            slice.actions.getResumoEstatisticaCreditoSuccess({ dados: response?.[5]?.data, uoId: params?.uoID })
          );
          break;
        }
        case 'estCreditoIntervalo': {
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/resumo${params?.uoID > 0 ? `/dauo/${params?.uoID}` : ''}${params?.intervalo}`,
            options
          );
          dispatch(slice.actions.getResumoEstatisticaCreditoSuccess({ dados: response?.data, uoId: params?.uoID }));
          break;
        }
        case 'entradaTrabalhado': {
          const response = await axios.get(
            `${BASEURLDD}/v2/indicadores/racio/es/anual/default/${params?.perfilId}?ano=${params?.ano}&distinto=${params?.entrada}${uo}${estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'totalTrabalhados': {
          const perfil = params?.perfil ? `&perfil_id=${params?.perfil}` : '';
          const response = await axios.get(
            `${BASEURLDD}/v2/indicadores/racio/unidirecional/fluxo/anual/${params?.perfilId}?ano=${params?.ano}&entrada=${params?.entrada}${uo}${estado}${perfil}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'acao': {
          const perfil = params?.perfil ? `&perfil_id=${params?.perfil}` : '';
          const response = await axios.get(
            `${BASEURLDD}/v2/indicadores/racio/unidirecional/anual/${params?.perfilId}?ano=${params?.ano}&entrada=${params?.entrada}${uo}${estado}${perfil}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'colaboradores': {
          const response = await axios.get(
            `${BASEURLDD}/v2/indicadores/racio/es/anual/individual/${params?.perfilId}?ano=${params?.ano}${uo}${estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.setLoading(false));
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

async function hasError(error, dispatch) {
  dispatch(slice.actions.setError(errorMsg(error)));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setError(''));
}
