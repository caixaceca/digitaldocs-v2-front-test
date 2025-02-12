import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
//
import { getAccessToken } from './intranet';
import { selectUtilizador, headerOptions, actionGet, hasError } from './sliceActions';

// Estado inicial
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
    resetEstCredito(state) {
      state.resumoEstCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
      state.estCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    getResumoEstatisticaCreditoSuccess(state, action) {
      const { uoId, dados: allDados = [] } = action.payload || {};
      let dados = allDados;
      if (uoId === -2) {
        dados = dados.filter((row) => row?.regiao === 'Norte');
      } else if (uoId === -3) {
        dados = dados.filter((row) => row?.regiao === 'Sul');
      }

      const transform = (fase, montanteKey) =>
        dados.filter((row) => row.fase === fase).map((row) => ({ ...row, [montanteKey]: row?.montante }));

      state.resumoEstCredito.entrada = transform('Entrada', 'montantes');
      state.resumoEstCredito.aprovado = transform('Aprovado', 'montante_aprovado');
      state.resumoEstCredito.contratado = transform('Contratado', 'montante_contratado');
      state.resumoEstCredito.indeferido = transform('Indeferido', 'montantes');
      state.resumoEstCredito.desistido = transform('Desistido', 'montantes');
    },
  },
});

// Reducer
export default slice.reducer;
export const { resetEstCredito } = slice.actions;

// Função auxiliar para construir query strings a partir de um objeto
const buildQueryString = (paramsObj) => {
  const queryString = new URLSearchParams(paramsObj).toString();
  return queryString ? `?${queryString}` : '';
};

// Função auxiliar para despachar sucesso
const dispatchSuccess = (dispatch, item, data) => {
  dispatch(slice.actions.getSuccess({ item, dados: data }));
};

export function getIndicadores(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    dispatch(slice.actions.getSuccess({ item: 'indicadores', dados: [] }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const dateQuery = buildQueryString({
        ...(params?.datai && { datai: params?.datai }),
        ...(params?.dataf && { dataf: params?.dataf }),
      });
      const uoQuery = params?.uo && params?.agrEntradas === 'Balcão' ? params?.uo : null;
      const estadoQuery = params?.estado && params?.agrEntradas === 'Estado' ? params?.estado : null;

      switch (item) {
        case 'totalP': {
          const url = `${BASEURLDD}/v2/indicadores/default/${perfilId}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, item, response.data.objeto);
          break;
        }
        case 'fileSystem': {
          const url = `${BASEURLDD}/v1/indicadores/filesystem/${perfilId}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, item, response.data);
          break;
        }
        case 'data': {
          const queryParams = {
            vista: params?.periodo?.toLowerCase(),
            ...(params?.uo && { uoID: params?.uo }),
            ...(params?.perfil && { perfilID1: params?.perfil }),
          };
          const url = `${BASEURLDD}/v1/indicadores/padrao/criacao/${perfilId}${buildQueryString(queryParams)}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data);
          break;
        }
        case 'criacao': {
          if (params?.uo) {
            const url = `${BASEURLDD}/v1/indicadores/entrada/${params?.uo}${dateQuery}`;
            const response = await axios.get(url, options);
            dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          }
          break;
        }
        case 'entradas': {
          if ((params?.agrEntradas === 'Estado' && params?.estado) || params?.balcao) {
            const key = params?.agrEntradas === 'Estado' ? 'num_estado' : 'num_balcao';
            const idValue = params?.agrEntradas === 'Estado' ? params?.estado : params?.balcao;
            const url = `${BASEURLDD}/v1/indicadores/chegaram/${key}/${idValue}${dateQuery}`;
            const response = await axios.get(url, options);
            dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          }
          break;
        }
        case 'trabalhados': {
          if (params?.estado) {
            const url = `${BASEURLDD}/v1/indicadores/trabalhado/${params?.estado}${dateQuery}`;
            const response = await axios.get(url, options);
            dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          }
          break;
        }
        case 'devolucoes': {
          if (params?.estado) {
            const interno = params?.origem === 'Interna' ? '/interno' : '';
            const url = `${BASEURLDD}/v1/indicadores/devolucao${interno}/${params?.estado}${dateQuery}`;
            const response = await axios.get(url, options);
            dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          }
          break;
        }
        case 'origem': {
          const url = `${BASEURLDD}/v1/indicadores/top/criacao/${perfilId}${buildQueryString({ escopo: params?.agrupamento })}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data);
          break;
        }
        case 'tipos': {
          const queryParams = {
            ...(params?.uo && { uoID: params?.uo }),
            ...(params?.perfil && { perfilPID: params?.perfil }),
            ...(params?.datai && { datai: params?.datai }),
            ...(params?.dataf && { uoID: params?.dataf }),
          };
          const url = `${BASEURLDD}/v1/indicadores/fluxo/${perfilId}${buildQueryString(queryParams)}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data);
          break;
        }
        case 'execucao': {
          if (params?.estado || params?.perfil || params?.fluxo) {
            const queryParams = {
              ...(params?.estado && { estadoIDFilter: params?.estado }),
              ...(params?.fluxo && { fluxoIDFilter: params?.fluxo }),
              ...(params?.perfil && { perfilIDFilter: params?.perfil }),
            };
            const url = `${BASEURLDD}/v1/indicadores/tempo/execucao/${perfilId}${buildQueryString(queryParams)}`;
            const response = await axios.get(url, options);
            dispatchSuccess(dispatch, 'indicadores', response.data);
          }
          break;
        }
        case 'conclusao': {
          const queryParams = {
            de: params?.momento,
            ...(params?.perfil && { perfilPID: params?.perfil }),
            ...(params?.fluxo && { fluxoID: params?.fluxo }),
            ...(params?.datai && { datai: params?.datai }),
            ...(params?.dataf && { dataf: params?.dataf }),
          };
          const url = `${BASEURLDD}/v1/indicadores/duracao/${perfilId}${buildQueryString(queryParams)}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data);
          break;
        }
        case 'equipa': {
          const queryParams = {
            ano: params?.ano,
            ...(params?.agrEntradas === 'Balcão' && uoQuery && { uo_id: uoQuery }),
            ...(params?.agrEntradas === 'Estado' && estadoQuery && { estado_id: estadoQuery }),
          };
          const url = `${BASEURLDD}/v2/indicadores/duracao/${perfilId}${buildQueryString(queryParams)}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          break;
        }
        case 'estCreditoMensal': {
          const basePath = `${BASEURLDD}/v1/indicadores/estatistica/credito/${perfilId}`;
          const uoParam = `uoID=${params?.uoID}`;
          const dataString = `${params?.ano}&mes=${params?.mes}`;
          const requests = [
            axios.get(`${basePath}?${uoParam}&fase=entrada&ano=${dataString}`, options),
            axios.get(`${basePath}?${uoParam}&fase=aprovado&ano=${dataString}`, options),
            axios.get(`${basePath}?${uoParam}&fase=contratado&ano=${dataString}`, options),
            axios.get(`${basePath}?${uoParam}&fase=indeferido&ano=${dataString}`, options),
            axios.get(`${basePath}?${uoParam}&fase=desistido&ano=${dataString}`, options),
            axios.get(
              `${BASEURLDD}/v1/indicadores/resumo${params?.uoID > 0 ? `/dauo/${params?.uoID}` : ''}${params?.intervalo}`,
              options
            ),
          ];
          const responses = await Promise.all(requests);
          dispatchSuccess(dispatch, 'estCredito', {
            entrada: responses[0].data || [],
            aprovado: responses[1].data || [],
            contratado: responses[2].data || [],
            indeferido: responses[3].data || [],
            desistido: responses[4].data || [],
          });
          dispatch(
            slice.actions.getResumoEstatisticaCreditoSuccess({
              dados: responses[5].data,
              uoId: params?.uoID,
            })
          );
          break;
        }
        case 'estCreditoIntervalo': {
          const url = `${BASEURLDD}/v1/indicadores/resumo${params?.uoID > 0 ? `/dauo/${params?.uoID}` : ''}${params?.intervalo}`;
          const response = await axios.get(url, options);
          dispatch(
            slice.actions.getResumoEstatisticaCreditoSuccess({
              dados: response.data,
              uoId: params?.uoID,
            })
          );
          break;
        }
        case 'entradaTrabalhado': {
          const queryParams = {
            ano: params?.ano,
            distinto: params?.entrada,
            ...(uoQuery && { uo_id: params?.uo }),
            ...(estadoQuery && { estado_id: params?.estado }),
          };
          const url = `${BASEURLDD}/v2/indicadores/racio/es/anual/default/${perfilId}${buildQueryString(queryParams)}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data);
          break;
        }
        case 'totalTrabalhados': {
          const queryParams = {
            ano: params?.ano,
            entrada: params?.entrada,
            ...(uoQuery && { uo_id: params?.uo }),
            ...(estadoQuery && { estado_id: params?.estado }),
            ...(params?.perfil && { perfil_id: params?.perfil }),
          };
          const url = `${BASEURLDD}/v2/indicadores/racio/unidirecional/fluxo/anual/${perfilId}${buildQueryString(
            queryParams
          )}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          break;
        }
        case 'acao': {
          const queryParams = {
            ano: params?.ano,
            entrada: params?.entrada,
            ...(uoQuery && { uo_id: params?.uo }),
            ...(estadoQuery && { estado_id: params?.estado }),
            ...(params?.perfil && { perfil_id: params?.perfil }),
          };
          const url = `${BASEURLDD}/v2/indicadores/racio/unidirecional/anual/${perfilId}${buildQueryString(
            queryParams
          )}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          break;
        }
        case 'colaboradores': {
          const queryParams = {
            ano: params?.ano,
            ...(uoQuery && { uo_id: params?.uo }),
            ...(estadoQuery && { estado_id: params?.estado }),
          };
          const url = `${BASEURLDD}/v2/indicadores/racio/es/anual/individual/${perfilId}${buildQueryString(
            queryParams
          )}`;
          const response = await axios.get(url, options);
          dispatchSuccess(dispatch, 'indicadores', response.data.objeto);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}
