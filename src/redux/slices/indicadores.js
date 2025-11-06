import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { DDOCS_API_SERVER } from '../../utils/apisUrl';
//
import { getAccessToken } from './intranet';
import { selectUtilizador, headerOptions, actionGet, hasError } from './sliceActions';

// Estado inicial
const initialState = {
  error: '',
  isLoading: false,
  totalP: null,
  posicaoAtual: null,
  indicadoresArquivo: null,
  moeda: localStorage.getItem('moedaEst') || 'Conto',
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
      state.estCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
      state.resumoEstCredito = { entrada: [], aprovado: [], contratado: [], indeferido: [], desistido: [] };
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    setMoeda(state, action) {
      state.moeda = action.payload;
      localStorage.setItem('moedaEst', action.payload);
    },

    getResumoSuccess(state, action) {
      const { uoId, dados: allDados = [] } = action.payload || {};
      let dados = allDados;
      if (uoId === -2) dados = dados.filter(({ regiao }) => regiao === 'Norte');
      else if (uoId === -3) dados = dados.filter(({ regiao }) => regiao === 'Sul');

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

// Actions
export const { getSuccess, setMoeda } = slice.actions;

export function getIndicadores(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (item === 'totalP') await new Promise((resolve) => setTimeout(resolve, 1000));
    if (item === 'posicaoAtual') dispatch(slice.actions.getSuccess({ item: 'posicaoAtual', dados: null }));

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });

      const queryParams = new URLSearchParams({
        ...(params?.de ? { de: params?.de } : null),
        ...(params?.ano ? { ano: params?.ano } : null),
        ...(params?.entrada ? { entrada: params?.entrada } : null),
        ...(params?.distinto ? { distinto: params?.distinto } : null),
        ...(params?.vista ? { vista: params?.vista?.toLowerCase() } : null),
        ...(params?.uoId && params?.uoKey ? { [params.uoKey]: params?.uoId } : null),
        ...(params?.escopo ? { escopo: params?.escopo } : null),
        ...(params?.fluxoId && params?.fluxoKey ? { [params.fluxoKey]: params?.fluxoId } : null),
        ...(params?.estadoId && params?.estadoKey ? { [params.estadoKey]: params?.estadoId } : null),
        ...(params?.perfilId && params?.perfilKey ? { [params.perfilKey]: params?.perfilId } : null),
        ...(params?.dataInicial ? { datai: params?.dataInicial } : null),
        ...(params?.dataFinal ? { dataf: params?.dataFinal } : null),
      });

      const apiPaths = {
        tipos: `/v1/indicadores/fluxo/${perfilId}`,
        totalP: `/v2/indicadores/default/${perfilId}`,
        equipa: `/v2/indicadores/duracao/${perfilId}`,
        posicaoAtual: `/v2/indicadores/posicao/atual`,
        conclusao: `/v1/indicadores/duracao/${perfilId}`,
        origem: `/v1/indicadores/top/criacao/${perfilId}`,
        criacao: `/v1/indicadores/entrada/${params?.uoId}`,
        data: `/v1/indicadores/padrao/criacao/${perfilId}`,
        fileSystem: `/v1/indicadores/filesystem/${perfilId}`,
        execucao: `/v1/indicadores/tempo/execucao/${perfilId}`,
        trabalhados: `/v1/indicadores/trabalhado/${params?.estadoId}`,
        acao: `/v2/indicadores/racio/unidirecional/anual/${perfilId}`,
        indicadoresArquivo: `/v1/indicadores/arquivo/mini/${perfilId}`,
        colaboradores: `/v2/indicadores/racio/es/anual/individual/${perfilId}`,
        entradaTrabalhado: `/v2/indicadores/racio/es/anual/default/${perfilId}`,
        entradas: `/v1/indicadores/chegaram/${params?.destino}/${params?.destinoId}`,
        totalTrabalhados: `/v2/indicadores/racio/unidirecional/fluxo/anual/${perfilId}`,
        devolucoes: `/v1/indicadores/devolucao${params?.origem === 'Interna' ? '/interno' : ''}/${params?.estadoId}`,
      };

      const apiUrl = apiPaths[item] || '';
      if (!apiUrl) return;

      const response = await axios.get(`${DDOCS_API_SERVER}${apiUrl}?${queryParams}`, options);
      dispatch(
        slice.actions.getSuccess({ item: params?.item || 'indicadores', dados: response.data?.objeto || response.data })
      );
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

export function getEstatisticaCredito(item, params) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    dispatch(slice.actions.resetEstCredito());

    try {
      const accessToken = await getAccessToken();
      const { mail, perfilId } = selectUtilizador(getState()?.intranet || {});
      const options = headerOptions({ accessToken, mail, cc: true, ct: false, mfd: false });
      const urlResumo = `${DDOCS_API_SERVER}/v1/indicadores/resumo${params?.uoID > 0 ? `/dauo/${params?.uoID}` : ''}${params?.intervalo}`;

      switch (item) {
        case 'estCreditoMensal': {
          const uoParam = `uoID=${params?.uoID}`;
          const dataString = `${params?.ano}&mes=${params?.mes}`;
          const basePath = `${DDOCS_API_SERVER}/v1/indicadores/estatistica/credito/${perfilId}`;

          if (params?.uoID > 0) {
            const requests = [
              axios.get(`${basePath}?${uoParam}&fase=entrada&ano=${dataString}`, options),
              axios.get(`${basePath}?${uoParam}&fase=aprovado&ano=${dataString}`, options),
              axios.get(`${basePath}?${uoParam}&fase=contratado&ano=${dataString}`, options),
              axios.get(`${basePath}?${uoParam}&fase=indeferido&ano=${dataString}`, options),
              axios.get(`${basePath}?${uoParam}&fase=desistido&ano=${dataString}`, options),
              axios.get(urlResumo, options),
            ];
            const responses = await Promise.all(requests);

            dispatch(
              slice.actions.getSuccess({
                item: 'estCredito',
                dados: {
                  entrada: responses[0].data || [],
                  aprovado: responses[1].data || [],
                  contratado: responses[2].data || [],
                  indeferido: responses[3].data || [],
                  desistido: responses[4].data || [],
                },
              })
            );
            dispatch(slice.actions.getResumoSuccess({ dados: responses[5].data, uoId: params?.uoID }));
          } else {
            const response = await axios.get(urlResumo, options);
            dispatch(slice.actions.getResumoSuccess({ dados: response.data, uoId: params?.uoID }));
          }
          break;
        }
        case 'estCreditoIntervalo': {
          const response = await axios.get(urlResumo, options);
          dispatch(slice.actions.getResumoSuccess({ dados: response.data, uoId: params?.uoID }));
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
