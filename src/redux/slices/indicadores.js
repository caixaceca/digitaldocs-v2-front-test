import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { errorMsg } from '../../utils/normalizeText';

// ----------------------------------------------------------------------

const initialState = {
  error: '',
  isLoading: false,
  fileSystem: [],
  indicadores: [],
  estatisticaCredito: { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] },
};

const slice = createSlice({
  name: 'indicadores',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isLoading = false;
      state.error = '';
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'indicadores':
          state.indicadores = [];
          break;
        case 'estatisticaCredito':
          state.estatisticaCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
          break;

        default:
          break;
      }
    },

    getFyleSystemSuccess(state, action) {
      state.fileSystem = action.payload;
    },

    getIndicadoresSuccess(state, action) {
      state.indicadores = action.payload;
    },

    getEstatisticaCreditoSuccess(state, action) {
      state.estatisticaCredito = action.payload;
    },

    getResumoEstatisticaCreditoSuccess(state, action) {
      const dados =
        (action.payload?.label === 'DCN' && action.payload?.dados?.filter((row) => row?.regiao === 'Norte')) ||
        (action.payload?.label === 'DCS' && action.payload?.dados?.filter((row) => row?.regiao === 'Sul')) ||
        action.payload?.dados;
      state.estatisticaCredito.entrada = dados
        ?.filter((row) => row.fase === 'Entrada')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
      state.estatisticaCredito.aprovado = dados
        ?.filter((row) => row.fase === 'Aprovado')
        ?.map((row) => ({ ...row, montante_aprovado: row?.montante }));
      state.estatisticaCredito.contratado = dados
        ?.filter((row) => row.fase === 'Contratado')
        ?.map((row) => ({ ...row, montante_contratado: row?.montante }));
      state.estatisticaCredito.indeferido = dados
        ?.filter((row) => row.fase === 'Indeferido')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
      state.estatisticaCredito.desistido = dados
        ?.filter((row) => row.fase === 'Desistido')
        ?.map((row) => ({ ...row, montantes: row?.montante }));
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getIndicadores(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    dispatch(slice.actions.resetItem('indicadores'));
    try {
      const options = { headers: { cc: params?.mail } };
      const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${
        params?.dataf ? `dataf=${params?.dataf}&` : ''
      }`;
      switch (item) {
        case 'fileSystem': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/filesystem/${params?.perfilId}`, options);
          dispatch(slice.actions.getFyleSystemSuccess(response.data));
          break;
        }
        case 'data': {
          if (params?.perfilId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/padrao/criacao/${params?.perfilId}?vista=${params?.vista}${
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
          if (params?.estado) {
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/chegaram/num_estado/${params?.estado}${
                query ? `?${query.substr(0, query.length - 1)}` : ''
              }`,
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
        case 'volume': {
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
              query ? `?${query1.substr(0, query1.length - 1)}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'execucao': {
          if (params?.estado || params?.perfil || params?.fluxo) {
            const query = `${params?.estado ? `estadoIDFilter=${params?.estado}&` : ''}${
              params?.fluxo ? `fluxoIDFilter=${params?.fluxo}&` : ''
            }${params?.perfil ? `perfilIDFilter=${params?.perfil}&` : ''}`;
            const response = await axios.get(
              `${BASEURLDD}/v1/indicadores/tempo/execucao/${params?.perfilId}?${query.substr(0, query.length - 1)}`,
              options
            );
            dispatch(slice.actions.getIndicadoresSuccess(response.data));
          }
          break;
        }
        case 'duracao': {
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
        case 'estatisticaCredito': {
          dispatch(slice.actions.resetItem('estatisticaCredito'));
          const pathIds = `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}`;
          const data = `${params?.ano}&mes=${params?.mes}`;
          const entrada =
            params?.fase === 'Entradas' ? await axios.get(`${pathIds}&fase=entrada&ano=${data}`, options) : [];
          const aprovado =
            params?.fase === 'Aprovados' ? await axios.get(`${pathIds}&fase=aprovado&ano=${data}`, options) : [];
          const contratado =
            params?.fase === 'Contratados' ? await axios.get(`${pathIds}&fase=contratado&ano=${data}`, options) : [];
          const indeferido =
            params?.fase === 'Indeferidos' ? await axios.get(`${pathIds}&fase=indeferido&ano=${data}`, options) : [];
          const desistido =
            params?.fase === 'Desistidos' ? await axios.get(`${pathIds}&fase=desistido&ano=${data}`, options) : [];
          dispatch(
            slice.actions.getEstatisticaCreditoSuccess({
              entrada: entrada?.data || [],
              aprovado: aprovado?.data || [],
              contratado: contratado?.data || [],
              indeferido: indeferido?.data || [],
              desistido: desistido?.data || [],
            })
          );
          break;
        }
        case 'resumoEstCredCaixa': {
          dispatch(slice.actions.resetItem('estatisticaCredito'));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/resumo?data_inicio=${params?.dataI}&data_final=${params?.dataF}`,
            options
          );
          dispatch(slice.actions.getResumoEstatisticaCreditoSuccess({ dados: response?.data, label: params?.uoID }));
          break;
        }
        case 'resumoEstCredAg': {
          dispatch(slice.actions.resetItem('estatisticaCredito'));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/resumo/dauo/${params?.uoID}?data_inicio=${params?.dataI}${
              params?.dataF ? `&data_final=${params?.dataF}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getResumoEstatisticaCreditoSuccess({ dados: response?.data, label: params?.uoID }));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
