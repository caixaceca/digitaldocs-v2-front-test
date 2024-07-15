import axios from 'axios';
import { format } from 'date-fns';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { errorMsg } from '../../utils/normalizeText';
import { canPreview, b64toBlob } from '../../utils/getFileFormat';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  urlBlob: '',
  isSaving: false,
  isLoading: false,
  isLoadingP: false,
  isOpenModal: false,
  isOpenParecer: false,
  isLoadingAnexo: false,
  isOpenModalAnexo: false,
  isOpenModalDesariquivar: false,
  pjfInfo: null,
  processo: null,
  filePreview: null,
  pesquisaInfo: null,
  fileDownload: null,
  selectedItem: null,
  anexoParecer: null,
  itemSelected: null,
  processosInfo: null,
  selectedAnexoId: null,
  indicadoresArquivo: null,
  con: [],
  pjf: [],
  cartoes: [],
  pesquisa: [],
  arquivos: [],
  entradas: [],
  processos: [],
  porConcluir: [],
  trabalhados: [],
  pedidosAcesso: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    startLoadingP(state) {
      state.isLoadingP = true;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    startLoadingAnexo(state) {
      state.isLoadingAnexo = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    hasError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingAnexo = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingP = false;
      state.error = '';
    },

    done(state, action) {
      state.isSaving = false;
      state.done = action.payload;
      state.isLoadingAnexo = false;
    },

    resetDone(state) {
      state.done = '';
      state.isSaving = false;
      state.isLoading = false;
      state.isLoadingP = false;
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'processo':
          state.processo = null;
          state.filePreview = null;
          state.fileDownload = null;
          state.isLoadingAnexo = false;
          break;
        case 'processos':
          state.processos = [];
          state.processosInfo = null;
          break;
        case 'entradas':
          state.entradas = [];
          break;
        case 'pesquisa':
          state.pesquisa = [];
          state.pesquisaInfo = null;
          break;
        case 'trabalhados':
          state.trabalhados = [];
          break;
        case 'cartoes':
          state.cartoes = [];
          break;
        case 'con':
          state.con = [];
          break;
        case 'pjf':
          state.pjf = [];
          state.pjfInfo = null;
          break;

        default:
          break;
      }
    },

    getProcessosSuccess(state, action) {
      state.processosInfo = action.payload.paginacao;
      state.processos = [...state.processos, ...action.payload.objeto];
    },

    getEntradasSuccess(state, action) {
      state.entradas = action.payload;
    },

    getPorConcluirSuccess(state, action) {
      state.porConcluir = action.payload;
    },

    getArquivosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getTrabalhadosSuccess(state, action) {
      state.trabalhados = action.payload;
    },

    getPedidosAcessoSuccess(state, action) {
      state.pedidosAcesso = action.payload;
    },

    getIndicadoresArquivoSuccess(state, action) {
      state.indicadoresArquivo = action.payload;
    },

    getCartoesSuccess(state, action) {
      state.cartoes = action.payload?.map((row) => ({ ...row, numero: row?.numero?.substring(9, 15) }));
    },

    getConSuccess(state, action) {
      state.con = action.payload;
    },

    getPjfSuccess(state, action) {
      state.pjfInfo = action.payload.paginacao;
      state.pjf = [...state.pjf, ...action.payload.objeto];
    },

    getProcessoSuccess(state, action) {
      if (action.payload?.estados?.length === 0) {
        action.payload.estado_processo = {
          _lock: action.payload?.preso,
          perfil_id: action.payload?.perfil_id,
          estado: action.payload?.estado_atual,
          estado_id: action.payload?.estado_atual_id,
          data_entrada: action.payload?.data_ultima_transicao,
        };
      } else if (action.payload?.estados?.length === 1 && action.payload?.pareceres_estado?.length === 0) {
        action.payload.estado_processo = action.payload?.estados[0];
        action.payload.estados = [];
      } else if (action.payload?.estados?.length > 1) {
        action.payload.estado_processo = action.payload.estados?.find(
          (row) => row?.estado_id === action.payload.estado_atual_id
        );
        action.payload.estados = action.payload.estados?.filter(
          (row) => row?.estado_id !== action.payload.estado_atual_id
        );
      }
      state.processo = action.payload;
      state.isLoadingP = false;
    },

    getPesquisaSuccess(state, action) {
      state.pesquisaInfo = action.payload.paginacao;
      state.pesquisa = [...state.pesquisa, ...action.payload.objeto];
    },

    addItemProcesso(state, action) {
      state.processo = { ...state.processo, ...action.payload };
    },

    getDestinosDesarquivamentoSuccess(state, action) {
      state.isOpenModalDesariquivar = true;
      state.processo = { ...state.processo, ...action.payload };
    },

    getArquivadosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getCartaoSuccess(state, action) {
      state.selectedItem = action.payload;
    },

    getAnexoParecerSuccess(state, action) {
      state.anexoParecer = action.payload;
    },

    resgatarSuccess(state, action) {
      state.isLoadingP = false;
      state.processo.preso = true;
      state.processo.perfil_id = action.payload.perfil_id;
      state.processo.estado_atual = action.payload.estado_atual;
      state.processo.estado_atual_id = action.payload.estado_atual_id;
      state.processo.data_ultima_transicao = action.payload.data_ultima_transicao;
      state.processo.htransicoes.push({
        resgate: true,
        modo: 'Seguimento',
        data_saida: new Date(),
        data_entrada: new Date(),
        observacao: 'RESGATE DO PROCESSO',
        perfil_id: action.payload.perfil_id,
      });
    },

    selectFile(state, action) {
      switch (action?.payload?.item) {
        case 'infoPreview':
          state.filePreview = { ...action?.payload?.dados };
          break;
        case 'infoDownload':
          state.fileDownload = action?.payload?.dados;
          break;
        case 'filePreview':
          state.isLoadingAnexo = false;
          state.filePreview = { ...action?.payload?.dados, ...state.filePreview };
          break;
        case 'fileDownload':
          state.isLoadingAnexo = false;
          state.fileDownload = { ...action?.payload?.dados, ...state.fileDownload };
          break;

        default:
          break;
      }
    },

    aceitarSuccess(state, action) {
      if (action.payload.modo === 'serie') {
        state.processo.estado_processo._lock = true;
        state.processo.estado_processo.perfil_id = action.payload.perfilId;
      } else {
        const index = state.processo.estados.findIndex((row) => row.estado_id === action.payload.estadoId);
        state.processo.estados[index]._lock = true;
        state.processo.estados[index].perfil_id = action.payload.perfilId;
      }
    },

    createProcessoSuccess(state, action) {
      state.processo = action.payload;
    },

    parecerSuccess(state) {
      state.isOpenModal = false;
      state.selectedItem = null;
    },

    confirmarCartaoDopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      if (index === 0 || index) {
        state.cartoes[index].confirmacao_dop = true;
        state.cartoes[index].confirmado_por_dop = action.payload.perfilId;
        state.cartoes[index].data_confirmacao_dop = format(new Date(), 'yyyy-MM-dd');
      }
    },

    alterarBalcaopSuccess(state, action) {
      const index = state.cartoes.findIndex((row) => row.id === action.payload.id);
      state.cartoes[index].balcao_entrega = action.payload.balcao;
    },

    deleteAnexoProcessoSuccess(state, action) {
      const index = state?.processo?.anexos?.findIndex((row) => row.id === action.payload);
      if (index === 0 || index) {
        state.processo.anexos[index].ativo = false;
        state.isOpenModalAnexo = false;
        state.selectedAnexoId = null;
      }
    },

    deleteAnexoParecerSuccess(state, action) {
      const index = state.processo.pareceres_estado.findIndex((row) => row.id === action.payload.parecerId);
      if (index) {
        const index1 = state.processo.pareceres_estado[index].anexos.findIndex((row) => row.id === action.payload.id);
        if (index1) {
          state.processo.pareceres_estado[index].anexos[index1].ativo = false;
        }
      }
      const index2 = state.selectedItem.anexos.findIndex((row) => row.id === action.payload.id);
      if (index2) {
        state.selectedItem.anexos[index2].ativo = false;
      }
      state.isOpenModalAnexo = false;
      state.selectedAnexoId = null;
    },

    selectItem(state, action) {
      state.isOpenModal = true;
      state.selectedItem = action.payload;
    },

    openModal(state) {
      state.selectedItem = null;
      state.isOpenModal = true;
    },

    openDetalhes(state) {
      state.isOpenModalDesariquivar = true;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenModalDesariquivar = false;
      state.selectedItem = null;
    },

    selectAnexo(state, action) {
      state.isOpenModalAnexo = true;
      state.selectedAnexoId = action.payload;
    },

    closeModalAnexo(state) {
      state.isOpenModalAnexo = false;
      state.selectedAnexoId = null;
    },

    selectParecer(state, action) {
      state.itemSelected = action.payload;
      state.isOpenParecer = true;
    },

    closeParecer(state) {
      state.isOpenParecer = false;
      state.itemSelected = null;
    },

    resetAnexo(state) {
      state.anexoParecer = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  resetItem,
  openModal,
  selectFile,
  closeModal,
  selectItem,
  resetAnexo,
  selectAnexo,
  openDetalhes,
  closeParecer,
  selectParecer,
  closeModalAnexo,
  addItemProcesso,
} = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch) => {
    if (
      item !== 'hversoes' &&
      item !== 'hvisualizacoes' &&
      item !== 'destinos' &&
      item !== 'destinosDesarquivamento' &&
      item !== 'htransicoes' &&
      item !== 'hretencoes' &&
      item !== 'hpendencias' &&
      item !== 'hatribuicoes'
    ) {
      dispatch(slice.actions.resetItem('processo'));
    }
    if (
      item !== 'destinos' &&
      item !== 'destinosDesarquivamento' &&
      item !== 'htransicoes' &&
      item !== 'indicadores arquivos'
    ) {
      dispatch(slice.actions.startLoading());
    }
    try {
      const options = { headers: { cc: params?.mail } };
      const query = `${params?.perfilId}?pagina=${params?.pagina || 0}${
        params?.estadoId > 0 ? `&estado_id=${params?.estadoId}` : ''
      }${params?.estadoId > 0 && params?.fluxoId > 0 ? `&fluxo_id=${params?.fluxoId}` : ''}${
        params?.segmento ? `&segmento=${params?.segmento === 'Particulares' ? 'P' : 'E'}` : ''
      }`;
      switch (item) {
        case 'destinos': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/destinos/${params?.perfilId}/${params?.id}?estado_id=${params?.estadoId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ destinos: response.data.objeto }));
          break;
        }
        case 'Tarefas': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/tarefas/${query}`, options);
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Retidos': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/tarefas/retidas/${query}`, options);
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Pendentes': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/tarefas/pendentes/${query}`, options);
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Atribuídos': {
          const response = await axios.get(`${BASEURLDD}/v2/processos/tarefas/atribuidas/${query}`, options);
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Finalizados': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/tarefas/situacao/${params?.perfilId}?pagina=${params?.pagina}&situacao=finalizado`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Executados': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/tarefas/situacao/${params?.perfilId}?pagina=${params?.pagina}&situacao=executado`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'Agendados': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/tarefas/situacao/${params?.perfilId}?pagina=${params?.pagina}&situacao=agendado`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'pesquisa global': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/pesquisa/base/${params?.perfilId}?pagina=${params?.pagina || 0}&search_param=${
              params?.chave
            }&em_historico=${params?.historico ? 'true' : 'false'}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'pesquisa avancada': {
          dispatch(slice.actions.resetItem('pesquisa'));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/pesquisa/especifica/${params?.perfilId}?em_historico=${
              params?.historico ? 'true' : 'false'
            }&pagina=${params?.pagina || 0}${params?.uo ? `&uo_id=${params?.uo?.id}` : ''}${
              params?.entrada ? `&nentrada=${params?.entrada}` : ''
            }${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${
              params?.conta ? `&conta=${params?.conta}` : ''
            }${params?.cliente ? `&cliente=${params?.cliente}` : ''}${
              params?.entidade ? `&entidade=${params?.entidade}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'htransicoes': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_transicoes/${params?.id}?perfil_cc_id=${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ htransicoes: response.data.objeto }));
          break;
        }
        case 'hretencoes': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_retencoes/${params?.id}?perfil_cc_id=${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hretencoes: response.data.objeto }));
          break;
        }
        case 'hpendencias': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_pendencias/${params?.id}?perfil_cc_id=${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hpendencias: response.data.objeto }));
          break;
        }
        case 'hatribuicoes': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/ht_atribuicoes/${params?.id}?perfil_cc_id=${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hatribuicoes: response.data.objeto }));
          break;
        }
        case 'hvisualizacoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/visualizacoes/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hvisualizacoes: response.data }));
          break;
        }
        case 'hversoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/versoes/${params?.perfilId}?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.addItemProcesso({ hversoes: response.data }));
          break;
        }
        case 'destinosDesarquivamento': {
          const response = await axios.get(
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/${params?.processoId}`,
            options
          );
          dispatch(slice.actions.getDestinosDesarquivamentoSuccess({ destinosDesarquivamento: response.data.objeto }));
          break;
        }
        case 'Entradas': {
          dispatch(slice.actions.resetItem('entradas'));
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/agencias/intervalo/${params?.uoId}/${params?.perfilId}?diai=${
              params?.dataInicio
            }${params?.dataFim ? `&diaf=${params?.dataFim}` : ''}`,
            options
          );
          dispatch(slice.actions.getEntradasSuccess(response.data.objeto));
          break;
        }
        case 'Por concluir': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/porconcluir/${params?.perfilId}`, options);
          dispatch(slice.actions.getPorConcluirSuccess(response.data.objeto));
          break;
        }
        case 'Trabalhados': {
          if (params?.uoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getTrabalhadosSuccess(response.data.objeto));
          }
          break;
        }
        case 'arquivados': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/${params?.perfilId}`, options);
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'pedidosAcesso': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/pedidos/${params?.perfilId}`, options);
          dispatch(slice.actions.getPedidosAcessoSuccess(response.data));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${params?.perfilId}`, options);
          dispatch(slice.actions.getIndicadoresArquivoSuccess(response.data));
          break;
        }
        case 'Emissão': {
          dispatch(slice.actions.resetItem('cartoes'));
          const response = await axios.get(
            `${BASEURLDD}/v1/cartoes/emitidas?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getCartoesSuccess(response.data));
          break;
        }
        case 'Receção': {
          dispatch(slice.actions.resetItem('cartoes'));
          const response = await axios.get(
            `${BASEURLDD}/v1/cartoes/recebidas?balcao=${params?.uoId}&data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getCartoesSuccess(response.data));
          break;
        }
        case 'con': {
          dispatch(slice.actions.resetItem('con'));
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/export/con?data_inicio=${params?.dataInicio}${
              params?.dataFim ? `&data_final=${params?.dataFim}` : ''
            }`,
            options
          );
          dispatch(slice.actions.getConSuccess(response.data));
          break;
        }
        case 'pjf': {
          if (params?.reset) {
            dispatch(slice.actions.resetItem('pjf'));
          }
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/historico/pe/financas?pagina=${params?.pagina}`,
            options
          );
          dispatch(slice.actions.getPjfSuccess(response.data));
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

// ----------------------------------------------------------------------

export function getItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    dispatch(slice.actions.startLoadingP());
    dispatch(slice.actions.resetItem('processo'));
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'processo': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/detalhes/${params?.id}?perfil_cc_id=${params?.perfilId}`,
            options
          );
          // const response = await axios.get(
          //   `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
          //   options
          // );
          // dispatch(slice.actions.getProcessoSuccess(response.data));
          dispatch(slice.actions.getProcessoSuccess(response.data?.objeto));
          const dados = response?.data?.objeto?.anexos?.filter((item) => item?.ativo)?.find((row) => !!canPreview(row));
          if (dados) {
            dispatch(slice.actions.selectFile({ item: 'infoPreview', dados: { ...dados, tipo: canPreview(dados) } }));
          }
          break;
        }
        case 'prevnext': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/prev/next/${params?.perfilId}/${params?.estadoId}/${params?.processoId}?next=${params?.next}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
          const dados = response?.data?.anexos?.filter((item) => item?.ativo)?.find((row) => !!canPreview(row));
          if (dados) {
            dispatch(slice.actions.selectFile({ item: 'infoPreview', dados: { ...dados, tipo: canPreview(dados) } }));
          }
          break;
        }
        case 'cartao': {
          const response = await axios.get(`${BASEURLDD}/v1/cartoes/validar/emissoes/detalhe/${params?.id}`, options);
          dispatch(slice.actions.getCartaoSuccess(response.data));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      if (item === 'prevnext') {
        dispatch(slice.actions.hasError(`Sem mais processos disponíveis no estado ${params?.estado}`));
      } else {
        dispatch(slice.actions.hasError(errorMsg(error)));
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getAnexo(item, params) {
  return async (dispatch) => {
    if (item !== 'anexoParecer' && item !== 'fileDownload') {
      dispatch(slice.actions.startLoadingAnexo());
    }
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'filePreview': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${params?.anexo?.anexo}`, options);
          const url = URL?.createObjectURL(b64toBlob(response?.data?.ficheiro));
          dispatch(slice.actions.selectFile({ item: 'filePreview', dados: { url } }));
          break;
        }
        case 'fileDownload': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${params?.anexo?.anexo}`, options);
          const blob = b64toBlob(response?.data?.ficheiro, params?.anexo?.conteudo);
          dispatch(slice.actions.selectFile({ item: 'fileDownload', dados: { blob } }));
          await new Promise((resolve) => setTimeout(resolve, 1000));
          dispatch(slice.actions.selectFile({ item: 'infoDownload', dados: null }));
          break;
        }
        case 'anexoParecer': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/parecer/${params?.anexo?.anexo}`, options);
          dispatch(slice.actions.getAnexoParecerSuccess({ ...response.data, anexo: params?.anexo?.anexo }));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      if (item === 'filePreview') {
        dispatch(slice.actions.resetItem('filePreview'));
      }
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', cc: params?.mail } };

      switch (item) {
        case 'processo interno': {
          const response = await axios.post(`${BASEURLDD}/v2/processos/interno/${params?.perfilId}`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.objeto));
          break;
        }
        case 'processo externo': {
          const response = await axios.post(`${BASEURLDD}/v2/processos/externo/${params?.perfilId}`, dados, options1);
          dispatch(slice.actions.createProcessoSuccess(response?.data?.objeto));
          break;
        }
        case 'pedir acesso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/pedir/acesso/${params?.perfilId}/${params?.id}`, '', options);
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', cc: params?.mail } };

      switch (item) {
        case 'processo': {
          await axios.put(`${BASEURLDD}/v2/processos/ei/${params?.perfilId}/${params?.id}`, dados, options1);
          break;
        }
        case 'encaminhar serie': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/encaminhar/serie/${params?.perfilId}/${params?.id}`,
            dados,
            options1
          );
          if (params?.colocarPendente) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/aceitar/${params?.perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              null,
              options
            );
            await axios.patch(
              `${BASEURLDD}/v2/processos/pender/misto/${params?.perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}`,
              params?.pendencia,
              options
            );
          }
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/atribuicao/mista/${params?.perfilId}?perfil_afeto_id=${params?.atribuir}&processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              '',
              options
            );
          }
          break;
        }
        case 'encaminhar paralelo': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/encaminhar/paralelo/${params?.perfilId}/${params?.id}`,
            dados,
            options
          );
          break;
        }
        case 'arquivar': {
          if (params?.anexos?.get('anexos')) {
            await axios.post(`${BASEURLDD}/v1/processos/adicionar/anexos/${params?.id}`, params?.anexos, options1);
          }
          await axios.patch(`${BASEURLDD}/v2/processos/arquivar/${params?.perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'desarquivar': {
          await axios.patch(`${BASEURLDD}/v2/processos/desarquivar/${params?.perfilId}/${params?.id}`, dados, options);
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'parecer individual': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/${params?.perfilId}/${params?.processoId}/${params?.id}`,
            dados,
            options1
          );
          dispatch(slice.actions.parecerSuccess());
          break;
        }
        case 'parecer estado': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/parecer/estado/paralelo/${params?.perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          dispatch(slice.actions.parecerSuccess());
          break;
        }
        case 'aceitar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/aceitar/${params?.perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          dispatch(slice.actions.aceitarSuccess(params));
          break;
        }
        case 'resgatar': {
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/resgatar/${params?.perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            options
          );
          dispatch(slice.actions.resgatarSuccess(response.data?.objeto));
          const dados = response?.data?.objeto?.anexos?.filter((item) => item?.ativo)?.find((row) => !!canPreview(row));
          if (dados) {
            dispatch(slice.actions.selectFile({ item: 'infoPreview', dados: { ...dados, tipo: canPreview(dados) } }));
          }
          break;
        }
        case 'dar aceso': {
          await axios.post(`${BASEURLDD}/v1/arquivos/dar/acesso/${params?.id}`, dados, options);
          break;
        }
        case 'atribuir': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/atribuicao/mista/${params?.perfilId}?perfil_afeto_id=${params?.id}&processo_id=${params?.processoId}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            '',
            options
          );
          break;
        }
        case 'cancelar': {
          await axios.patch(`${BASEURLDD}/v1/processos/cancelar/${params?.id}`, dados, options);
          break;
        }
        case 'fechar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/fechar/envio/paralelo/${params?.perfilId}?processo_id=${params?.id}`,
            dados,
            options
          );
          break;
        }
        case 'finalizar': {
          await axios.patch(`${BASEURLDD}/v2/processos/finalizar/${params?.perfilId}/${params?.id}`, dados, options);
          break;
        }
        case 'abandonar': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/abandonar/${params?.perfilId}/${params?.id}?fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
            null,
            options
          );
          break;
        }
        case 'pendencia': {
          await axios.patch(
            `${BASEURLDD}/v2/processos/pender/misto/${params?.perfilId}?processo_id=${params?.id}&fluxo_id=${params?.fluxoId}`,
            dados,
            options
          );
          if (params?.atribuir) {
            await axios.patch(
              `${BASEURLDD}/v2/processos/atribuicao/mista/${params?.perfilId}?perfil_afeto_id=${params?.perfilId}&processo_id=${params?.id}&fluxo_id=${params?.fluxoId}&estado_id=${params?.estadoId}`,
              '',
              options
            );
          }
          dispatch(slice.actions.closeModal());
          break;
        }
        case 'alterar balcao': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/alterar/balcao/entrega/${params?.id}`, dados, options);
          dispatch(slice.actions.alterarBalcaopSuccess({ id: params?.id, balcao: params?.balcao }));
          break;
        }
        case 'confirmar emissao multiplo': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/emissoes`, dados, options);
          break;
        }
        case 'confirmar emissao por data': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/todas/emissoes`, dados, options);
          break;
        }
        case 'confirmar rececao multiplo': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/rececoes?balcao=${params?.balcao}`, dados, options);
          break;
        }
        case 'confirmar rececao por data': {
          await axios.patch(`${BASEURLDD}/v1/cartoes/validar/todas/rececoes?balcao=${params?.balcao}`, dados, options);
          break;
        }
        case 'anular por balcao e data': {
          await axios.patch(
            `${BASEURLDD}/v1/cartoes/anular/validacao/todas?emissao=${params?.emissao}`,
            dados,
            options
          );
          break;
        }
        case 'anular multiplo': {
          await axios.patch(
            `${BASEURLDD}/v1/cartoes/anular/validacao/listagem?emissao=${params?.emissao}`,
            dados,
            options
          );
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'processo': {
          await axios.delete(`${BASEURLDD}/v1/processos/delete/${params?.perfilId}/${params?.processoId}`, options);
          break;
        }
        case 'anexoParecer': {
          await axios.delete(
            `${BASEURLDD}/v1/processos/parecer/remover/anexos/${params?.perfilId}/${params?.parecerId}/${params?.id}`,
            options
          );
          dispatch(slice.actions.deleteAnexoParecerSuccess({ id: params?.id, parecerId: params?.parecerId }));
          break;
        }
        case 'anexo processo': {
          await axios.delete(
            `${BASEURLDD}/v1/processos/remover/anexos/${params?.perfilId}/${params?.processoId}/${params?.id}`,
            options
          );
          dispatch(slice.actions.deleteAnexoProcessoSuccess(params?.id));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.msg));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(errorMsg(error)));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
