import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

// utils
import { BASEURLDD } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  fluxoId: '',
  estadoId: '',
  processoId: '',
  previewType: '',
  isAdmin: false,
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  isOpenParecer: false,
  isLoadingAnexo: false,
  iAmInGrpGerente: false,
  isOpenModalAnexo: false,
  isOpenModalDesariquivar: false,
  anexo: null,
  fluxo: null,
  acesso: null,
  estado: null,
  origem: null,
  meuFluxo: null,
  processo: null,
  transicao: null,
  filePreview: null,
  meuAmbiente: null,
  selectedItem: null,
  anexoParecer: null,
  estadoFilter: null,
  selectedAnexoId: null,
  selectedParecer: null,
  selectedMeuEstado: null,
  indicadoresArquivo: null,
  fluxos: [],
  linhas: [],
  versoes: [],
  estados: [],
  origens: [],
  acessos: [],
  pesquisa: [],
  arquivos: [],
  entradas: [],
  processos: [],
  ambientes: [],
  fileSystem: [],
  transicoes: [],
  meusFluxos: [],
  meusEstados: [],
  meusacessos: [],
  trabalhados: [],
  porConcluir: [],
  indicadores: [],
  visualizacoes: [],
  meusAmbientes: [],
  meusProcessos: [],
  pedidosAcesso: [],
  trabalhadosUo: [],
  entradasCredito: [],
  motivosPendencias: [],
  creditosAprovados: [],
  creditosDesistidos: [],
  creditosIndeferidos: [],
  colaboradoresEstado: [],
  creditosContratados: [],
  destinosDesarquivamento: [],
};

const slice = createSlice({
  name: 'digitaldocs',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
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
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'processo':
          state.anexo = null;
          state.processo = null;
          state.filePreview = null;
          state.previewType = '';
          state.isLoadingAnexo = false;
          state.versoes = [];
          state.visualizacoes = [];
          break;
        case 'fluxo':
          state.fluxo = null;
          break;
        case 'estado':
          state.estado = null;
          break;
        case 'processos':
          state.processos = [];
          break;
        case 'indicadores':
          state.indicadores = [];
          break;
        case 'trabalhados':
          state.trabalhados = [];
          break;
        case 'estatisticaCredito':
          state.entradasCredito = [];
          state.creditosAprovados = [];
          state.creditosDesistidos = [];
          state.creditosIndeferidos = [];
          state.creditosContratados = [];
          break;

        default:
          break;
      }
    },

    getProcessosSuccess(state, action) {
      state.processos = action.payload;
    },

    getEntradasSuccess(state, action) {
      state.entradas = action.payload;
    },

    getPorConcluirSuccess(state, action) {
      state.porConcluir = action.payload;
    },

    getIndicadoresSuccess(state, action) {
      state.indicadores = action.payload;
    },

    getEntradaCreditosSuccess(state, action) {
      state.entradasCredito = action.payload;
    },

    getCreditosAprovadosSuccess(state, action) {
      state.creditosAprovados = action.payload;
    },

    getCreditosDesistidosSuccess(state, action) {
      state.creditosDesistidos = action.payload;
    },

    getCreditosIndeferidosSuccess(state, action) {
      state.creditosIndeferidos = action.payload;
    },

    getCreditosContratadosSuccess(state, action) {
      state.creditosContratados = action.payload;
    },

    getTrabalhadosSuccess(state, action) {
      state.trabalhados = action.payload;
    },

    getTrabalhadosUoSuccess(state, action) {
      state.trabalhadosUo = action.payload;
    },

    getArquivosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getPedidosAcessoSuccess(state, action) {
      state.pedidosAcesso = action.payload;
    },

    getMeusProcessosSuccess(state, action) {
      state.meusProcessos = action.payload;
    },

    getIndicadoresArquivoSuccess(state, action) {
      state.indicadoresArquivo = action.payload;
    },

    getFluxosSuccess(state, action) {
      state.fluxos = action.payload;
    },

    getMeusEstadosSuccess(state, action) {
      state.meusEstados = action.payload;
    },

    getProcessoSuccess(state, action) {
      state.processoId = '';
      state.processo = action.payload;
    },

    getAceitarSuccess(state, action) {
      state.processo.is_lock = true;
      state.processo.perfil_id = action.payload.perfilId;
    },

    getAtribuirSuccess(state, action) {
      state.processo.perfil_id = action.payload;
      if (!action.payload) {
        state.processo.is_lock = false;
      }
    },

    getPesquisaSuccess(state, action) {
      state.pesquisa = action.payload;
    },

    getVisualizacoesSuccess(state, action) {
      state.visualizacoes = action.payload;
    },

    getVersoesSuccess(state, action) {
      state.versoes = action.payload;
    },

    getDestinosDesarquivamentoSuccess(state, action) {
      state.isOpenModalDesariquivar = true;
      state.destinosDesarquivamento = action.payload;
    },

    getFyleSystemSuccess(state, action) {
      state.fileSystem = action.payload;
    },

    getEstadosSuccess(state, action) {
      state.estados = action.payload;
    },

    getEstadoSuccess(state, action) {
      state.estadoId = '';
      state.estado = action.payload;
    },

    getColaboradoresEstadoSuccess(state, action) {
      state.colaboradoresEstado = action.payload?.perfis;
    },

    getSelectMeuEstadoSuccess(state, action) {
      const index = state.meusEstados.find((row) => row.id === action.payload.id);
      if (index) {
        state.isOpenModal = true;
        state.selectedMeuEstado = index;
      }
    },

    getOrigemSuccess(state, action) {
      state.origem = action.payload;
    },

    getTransicoesSuccess(state, action) {
      state.transicoes = action.payload;
    },

    getTransicaoSuccess(state, action) {
      state.transicao = action.payload;
    },

    getFluxoSuccess(state, action) {
      state.fluxoId = '';
      state.fluxo = action.payload;
    },

    getMeusAmbientesSuccess(state, action) {
      let grpGerente = false;
      state.meusAmbientes = action.payload;
      const firstAmbiente = action.payload?.find((row) => row?.nome?.includes('Gerência') || row?.id > 0);
      state.estadoFilter = firstAmbiente ? { id: firstAmbiente?.id, label: firstAmbiente?.nome } : null;
      action.payload?.forEach((row, index) => {
        if (row?.nome?.indexOf('Gerência') !== -1) {
          grpGerente = index;
        }
      });
      if (grpGerente) {
        state.iAmInGrpGerente = true;
        state.meuAmbiente = action.payload?.[grpGerente];
        state.meusFluxos = action.payload?.[grpGerente]?.fluxos;
      } else {
        state.meuAmbiente = action.payload?.[0];
        state.meusFluxos = action.payload?.[0]?.fluxos;
      }
      state.meuFluxo = action.payload?.[0]?.fluxos?.[0];
    },

    getAmbientesByPerfilSuccess(state, action) {
      state.ambientes = action.payload;
      state.isOpenModal = true;
    },

    getOrigensSuccess(state, action) {
      state.origens = action.payload;
    },

    getMotivosPendenciasSuccess(state, action) {
      state.motivosPendencias = action.payload;
    },

    getArquivadosSuccess(state, action) {
      state.arquivos = action.payload;
    },

    getAcessosSuccess(state, action) {
      state.acessos = action.payload;
    },

    getLinhasSuccess(state, action) {
      state.linhas = action.payload;
    },

    getMeusAcessosSuccess(state, action) {
      action.payload?.forEach((row) => {
        const acesso = `${row.objeto}-${row.acesso}`;
        if (!state.meusacessos.includes(acesso)) {
          state.meusacessos.push(acesso);
        }
        if (acesso === 'Todo-111' || acesso === 'Todo-110') {
          state.isAdmin = true;
        }
      });
    },

    getAcessoSuccess(state, action) {
      state.acesso = action.payload;
    },

    getAnexoSuccess(state, action) {
      state.isLoadingAnexo = false;
      state.anexo = action.payload;
    },

    getAnexoParecerSuccess(state, action) {
      state.anexoParecer = action.payload;
    },

    getanexoFilePreviewSuccess(state, action) {
      state.isLoadingAnexo = false;
      state.filePreview = action.payload.file;
      state.previewType = action.payload.type;
    },

    createFluxoSuccess(state, action) {
      state.fluxoId = action.payload.id;
    },

    createEstadoSuccess(state, action) {
      state.estadoId = action.payload.id;
    },

    createLinhaSuccess(state, action) {
      state.linhas.push(action.payload);
    },

    createTransicaoSuccess(state, action) {
      state.fluxo.transicoes?.push(action.payload);
    },

    createOrigemSuccess(state, action) {
      state.origens.push(action.payload);
    },

    createMotivoPendenciaSuccess(state, action) {
      state.motivosPendencias.push(action.payload);
    },

    createAcessoSuccess(state, action) {
      state.acessos.push(action.payload);
    },

    createProcessoSuccess(state, action) {
      state.processoId = action.payload;
    },

    updateFluxoSuccess(state, action) {
      state.fluxoId = action.payload.id;
    },

    updateEstadoSuccess(state, action) {
      state.estadoId = action.payload.id;
    },

    updateTransicaoSuccess(state, action) {
      const index = state.fluxo.transicoes.findIndex((row) => row.id === action.payload.id);
      state.fluxo.transicoes[index] = action.payload;
    },

    updateAcessoSuccess(state, action) {
      const index = state.acessos.findIndex((row) => row.id === action.payload.id);
      state.acessos[index] = action.payload;
    },

    patchParecerSuccess(state, action) {
      const index = state.processo.pareceres.findIndex((row) => row.id === action.payload.id);
      const parecer = action.payload.dados.pareceres.find((row) => row.id === action.payload.id);
      state.processo.in_paralelo_mode = action.payload.in_paralelo_mode;
      state.processo.pareceres[index] = parecer;
    },

    updateOrigemSuccess(state, action) {
      const index = state.origens.findIndex((row) => row.id === action.payload.id);
      state.origens[index] = action.payload;
    },

    updateLinhaSuccess(state, action) {
      const index = state.linhas.findIndex((row) => row.id === action.payload.id);
      state.linhas[index] = action.payload;
    },

    updateMotivoPendenciaSuccess(state, action) {
      const index = state.motivosPendencias.findIndex((row) => row.id === action.payload.id);
      state.motivosPendencias[index] = action.payload;
    },

    updateProcessoSuccess(state, action) {
      state.processoId = action.payload;
      state.previewType = '';
      state.filePreview = null;
    },

    deleteEstadoSuccess(state, action) {
      state.isOpenModal = false;
      state.estados = state.estados.filter((row) => row.id !== action.payload.id);
    },

    deleteFluxoSuccess(state, action) {
      state.isOpenModal = false;
      state.fluxos = state.fluxos.filter((row) => row.id !== action.payload.id);
    },

    deleteTransicaoSuccess(state, action) {
      state.isOpenModal = false;
      state.fluxo.transicoes = state.fluxo.transicoes.filter((row) => row.id !== action.payload);
    },

    deleteOrigemSuccess(state, action) {
      state.isOpenModal = false;
      state.origens = state.origens.filter((row) => row.id !== action.payload.id);
    },

    deleteLinhaSuccess(state, action) {
      state.isOpenModal = false;
      state.linhas = state.linhas.filter((row) => row.id !== action.payload.id);
    },

    deleteMotivoPendenciaSuccess(state, action) {
      state.isOpenModal = false;
      state.motivosPendencias = state.motivosPendencias.filter((row) => row.id !== action.payload.id);
    },

    deleteAcessosSuccess(state, action) {
      state.isOpenModal = false;
      state.acessos = state.acessos.filter((row) => row.id !== action.payload.id);
    },

    deleteMeuEstadoSuccess(state, action) {
      state.isOpenModal = false;
      state.meusEstados = state.meusEstados.filter((row) => row.id !== action.payload.id);
    },

    deletePerfilFromEstadoSuccess(state, action) {
      state.estado.perfis = state.estado.perfis.filter((row) => row.peid !== action.payload.id);
      state.isOpenModalAnexo = false;
      state.selectedAnexoId = null;
    },

    deleteAnexoParecerSuccess(state, action) {
      const index = state.processo.pareceres.findIndex((row) => row.id === action.payload.parecerId);
      state.processo.pareceres[index].anexos = state.processo.pareceres[index].anexos.filter(
        (row) => row.id !== action.payload.id
      );
      state.selectedItem.anexos = state.selectedItem.anexos.filter((row) => row.id !== action.payload.id);
    },

    desarquivarProcessoSuccess(state) {
      state.isOpenModal = false;
      state.destinosDesarquivamento = [];
    },

    getDeleteAnexoProcessoSuccess(state, action) {
      const index = state.processo.anexos.findIndex((row) => row.id === action.payload);
      state.processo.anexos[index].is_ativo = false;
      state.isOpenModalAnexo = false;
      state.selectedAnexoId = null;
      state.previewType = '';
      state.filePreview = null;
    },

    selectItem(state, action) {
      state.isOpenModal = true;
      state.selectedItem = action.payload;
    },

    openModal(state) {
      state.selectedItem = null;
      state.isOpenModal = true;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.isOpenModalDesariquivar = false;
      state.estado = null;
      state.selectedItem = null;
      state.selectedMeuEstado = null;
      state.destinosDesarquivamento = [];
    },

    changeMeuAmbiente(state, action) {
      state.meuAmbiente = action.payload;
      state.meusFluxos = action.payload?.fluxos;
      state.meuFluxo = action.payload?.fluxos?.[0];
    },

    changeMeuFluxo(state, action) {
      state.meuFluxo = action.payload;
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
      state.selectedParecer = action.payload;
      state.isOpenParecer = true;
    },

    setEstadoFilter(state, action) {
      state.estadoFilter = action.payload;
    },

    closeParecer(state) {
      state.isOpenParecer = false;
      state.selectedParecer = null;
    },

    resetAnexo(state) {
      state.anexo = null;
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
  closeModal,
  selectItem,
  resetAnexo,
  selectAnexo,
  closeParecer,
  selectParecer,
  changeMeuFluxo,
  closeModalAnexo,
  setEstadoFilter,
  changeMeuAmbiente,
  getSelectMeuEstadoSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

export function getAll(item, params) {
  return async (dispatch) => {
    if (item !== 'visualizacoes' && item !== 'destinosDesarquivamento' && item !== 'versoes') {
      dispatch(slice.actions.startLoading());
    }
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'fluxos': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/${params?.perfilId}`, options);
          dispatch(slice.actions.getFluxosSuccess(response.data));
          break;
        }
        case 'historico fluxo': {
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/historico/${params?.fluxoId}/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getHistoticoFluxoSuccess(response.data));
          break;
        }
        case 'tarefas': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/minhastarefas/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'devolvidosEquipa': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(`${BASEURLDD}/v1/processos/devolucoes/all/${params?.perfilId}`, options);
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/devolucoes/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/devolucoes/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'devolvidosPessoal': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/devolucoespessoais/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/devolucoespessoais/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/devolucoespessoais/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'finalizados': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusfinalizados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'arquivados': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/${params?.perfilId}`, options);
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'executados': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusexecutados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'agendados': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/all/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/estado/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/meusagendados/${params?.fluxoId}/${params?.estadoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'pendentes': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          if (params?.estadoId === -1) {
            const response = await axios.get(`${BASEURLDD}/v1/processos/pendencias/${params?.perfilId}`, options);
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else if (params?.fluxoId === -1) {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/pendencias/estado/${params?.estadoId}/${params?.perfilId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          } else {
            const response = await axios.get(
              `${BASEURLDD}/v1/processos/pendencias/ef/${params?.estadoId}/${params?.perfilId}?fluxoID=${params?.fluxoId}`,
              options
            );
            dispatch(slice.actions.getProcessosSuccess(response.data));
          }
          break;
        }
        case 'atribuidos': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/minhastarefas/afetos/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'retidos': {
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.resetItem('processos'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/minhastarefas/retidoseq/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getProcessosSuccess(response.data));
          break;
        }
        case 'estados': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.perfilId}`, options);
          dispatch(slice.actions.getEstadosSuccess(response.data));
          break;
        }
        case 'ambientes': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/meusambientes/${params?.perfilId}`, options);
          dispatch(slice.actions.getMeusAmbientesSuccess(response.data));
          break;
        }
        case 'ambientesByPerfil': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/meusambientes/${params?.perfilId}`, options);
          dispatch(slice.actions.getAmbientesByPerfilSuccess(response.data));
          break;
        }
        case 'origens': {
          const response = await axios.get(`${BASEURLDD}/v1/origens/${params?.perfilId}`, options);
          dispatch(slice.actions.getOrigensSuccess(response.data));
          break;
        }
        case 'motivos pendencias': {
          const response = await axios.get(`${BASEURLDD}/v1/motivos/all/${params?.perfilId}`, options);
          dispatch(slice.actions.getMotivosPendenciasSuccess(response.data.objeto));
          break;
        }
        case 'acessos': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${params?.perfilId}`, options);
          dispatch(slice.actions.getAcessosSuccess(response.data));
          break;
        }
        case 'meusacessos': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos?perfilID=${params?.perfilId}`, options);
          dispatch(slice.actions.getMeusAcessosSuccess(response.data));
          break;
        }
        case 'meusprocessos': {
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/default/${params?.fluxoId}/${params?.estadoId}/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getMeusProcessosSuccess(response.data));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${params?.perfilId}`, options);
          dispatch(slice.actions.getIndicadoresArquivoSuccess(response.data));
          break;
        }
        case 'meusEstados': {
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${params?.estadoId}/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getMeusEstadosSuccess(response.data));
          break;
        }
        case 'pesquisa': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/search/${params?.perfilId}?chave=${params?.chave}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'pesquisa v2': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/search/${params?.perfilId}?uoID=${params?.uoID}&chave=${params?.chave}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'pesquisa avancada': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v2/processos/search/interno/${params?.perfilID}?uoID=${params?.uoID}${
              params?.nentrada ? `&nentrada=${params?.nentrada}` : ''
            }${params?.noperacao ? `&noperacao=${params?.noperacao}` : ''}${
              params?.conta ? `&conta=${params?.conta}` : ''
            }${params?.cliente ? `&cliente=${params?.cliente}` : ''}${
              params?.entidade ? `&entidade=${params?.entidade}` : ''
            }${params?.perfilDono ? `&perfilDono=${params?.perfilDono}` : ''}${
              params?.datai ? `&datai=${params?.datai}` : ''
            }${params?.dataf ? `&dataf=${params?.dataf}` : ''}`,
            options
          );
          dispatch(slice.actions.getPesquisaSuccess(response.data));
          break;
        }
        case 'visualizacoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/visualizacoes/${params?.perfilId}?processoID=${params?.processoId}`,
            options
          );
          dispatch(slice.actions.getVisualizacoesSuccess(response.data));
          break;
        }
        case 'versoes': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/versoes/${params?.perfilId}?processoID=${params?.processoId}`,
            options
          );
          dispatch(slice.actions.getVersoesSuccess(response.data));
          break;
        }
        case 'destinosDesarquivamento': {
          const response = await axios.get(
            `${BASEURLDD}/v1/arquivos/destinos/desarquivamento/${params?.processoId}`,
            options
          );
          dispatch(slice.actions.getDestinosDesarquivamentoSuccess(response.data.objeto));
          break;
        }
        case 'entradas': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/agencias/intervalo/${params?.uoId}/${params?.perfilId}?diai=${params?.dataInicio}&diaf=${params?.dataFim}`,
            options
          );
          dispatch(slice.actions.getEntradasSuccess(response.data.objeto));
          break;
        }
        case 'porconcluir': {
          dispatch(slice.actions.resetItem('processo'));
          const response = await axios.get(`${BASEURLDD}/v1/processos/porconcluir/${params?.perfilId}`, options);
          dispatch(slice.actions.getPorConcluirSuccess(response.data.objeto));
          break;
        }
        case 'trabalhadosUo': {
          const response = await axios.get(
            `${BASEURLDD}/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`,
            options
          );
          dispatch(slice.actions.getTrabalhadosUoSuccess(response.data.objeto));
          break;
        }
        case 'trabalhados': {
          dispatch(slice.actions.resetItem('processo'));
          if (params?.perfilId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/meustrabalhados/${params?.perfilId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getTrabalhadosSuccess(response.data.objeto));
          } else if (params?.estadoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/trabalhados/estado/${params?.estadoId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getTrabalhadosSuccess(response.data.objeto));
          } else if (params?.uoId) {
            const response = await axios.get(
              `${BASEURLDD}/v1/entradas/trabalhados/uo/${params?.uoId}?qdia=${params?.data}`,
              options
            );
            dispatch(slice.actions.getTrabalhadosSuccess(response.data.objeto));
          }
          break;
        }
        case 'linhas': {
          const response = await axios.get(`${BASEURLDD}/v1/linhas/${params?.perfilId}`, options);
          dispatch(slice.actions.getLinhasSuccess(response.data.objeto));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getIndicadores(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    dispatch(slice.actions.resetItem('indicadores'));
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'fileSystem': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/filesystem/${params?.perfilId}`, options);
          dispatch(slice.actions.getFyleSystemSuccess(response.data));
          break;
        }
        case 'criacao': {
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/padrao/criacao/${params?.perfilId}?vista=${params?.vista}${
              params?.uo ? `&uoID=${params?.uo}` : ''
            }${params?.perfil ? `&perfilID1=${params?.perfil}` : ''}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'entradas': {
          const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${
            params?.dataf ? `dataf=${params?.dataf}&` : ''
          }`;
          const response = await axios.get(
            params?.datai || params?.dataf
              ? `${BASEURLDD}/v1/indicadores/entrada/${params?.uo}?${query.substr(0, query.length - 1)}`
              : `${BASEURLDD}/v1/indicadores/entrada/${params?.uo}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'trabalhados': {
          const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${
            params?.dataf ? `dataf=${params?.dataf}&` : ''
          }`;
          const response = await axios.get(
            params?.datai || params?.dataf
              ? `${BASEURLDD}/v1/indicadores/trabalhado/${params?.estado}?${query.substr(0, query.length - 1)}`
              : `${BASEURLDD}/v1/indicadores/trabalhado/${params?.estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'devolucoesInternas': {
          const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${
            params?.dataf ? `dataf=${params?.dataf}&` : ''
          }`;
          const response = await axios.get(
            params?.datai || params?.dataf
              ? `${BASEURLDD}/v1/indicadores/devolucao/interno/${params?.estado}?${query.substr(0, query.length - 1)}`
              : `${BASEURLDD}/v1/indicadores/devolucao/interno/${params?.estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
          break;
        }
        case 'devolucoesExternas': {
          const query = `${params?.datai ? `datai=${params?.datai}&` : ''}${
            params?.dataf ? `dataf=${params?.dataf}&` : ''
          }`;
          const response = await axios.get(
            params?.datai || params?.dataf
              ? `${BASEURLDD}/v1/indicadores/devolucao/${params?.estado}?${query.substr(0, query.length - 1)}`
              : `${BASEURLDD}/v1/indicadores/devolucao/${params?.estado}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data.objeto));
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
          const query = `${params?.uo ? `uoID=${params?.uo}&` : ''}${
            params?.perfil ? `perfilPID=${params?.perfil}&` : ''
          }${params?.datai ? `datai=${params?.datai}&` : ''}${params?.dataf ? `dataf=${params?.dataf}&` : ''}`;
          const response = await axios.get(
            params?.uo || params?.perfil || params?.datai || params?.dataf
              ? `${BASEURLDD}/v1/indicadores/fluxo/${params?.perfilId}?${query.substr(0, query.length - 1)}`
              : `${BASEURLDD}/v1/indicadores/fluxo/${params?.perfilId}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
          break;
        }
        case 'execucao': {
          const query = `${params?.estado ? `estadoIDFilter=${params?.estado}&` : ''}${
            params?.fluxo ? `fluxoIDFilter=${params?.fluxo}&` : ''
          }${params?.perfil ? `perfilIDFilter=${params?.perfil}&` : ''}`;
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/tempo/execucao/${params?.perfilId}?${query.substr(0, query.length - 1)}`,
            options
          );
          dispatch(slice.actions.getIndicadoresSuccess(response.data));
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
          const response = await axios.get(
            `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}&fase=entrada&ano=${params?.ano}&mes=${params?.mes}`,
            options
          );
          dispatch(slice.actions.getEntradaCreditosSuccess(response.data));
          const aprovado = await axios.get(
            `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}&fase=aprovado&ano=${params?.ano}&mes=${params?.mes}`,
            options
          );
          dispatch(slice.actions.getCreditosAprovadosSuccess(aprovado.data));
          const contratado = await axios.get(
            `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}&fase=contratado&ano=${params?.ano}&mes=${params?.mes}`,
            options
          );
          dispatch(slice.actions.getCreditosContratadosSuccess(contratado.data));
          const indeferido = await axios.get(
            `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}&fase=indeferido&ano=${params?.ano}&mes=${params?.mes}`,
            options
          );
          dispatch(slice.actions.getCreditosIndeferidosSuccess(indeferido.data));
          const desistido = await axios.get(
            `${BASEURLDD}/v1/indicadores/estatistica/credito/${params?.perfilId}?uoID=${params?.uoID}&fase=desistido&ano=${params?.ano}&mes=${params?.mes}`,
            options
          );
          dispatch(slice.actions.getCreditosDesistidosSuccess(desistido.data));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'fluxo': {
          const response = await axios.get(`${BASEURLDD}/v1/fluxos/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'fluxos') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getFluxoSuccess(response.data));
          }
          break;
        }
        case 'processo': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
            options
          );
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'prevnext': {
          const response = await axios.get(
            `${BASEURLDD}/v1/processos/prev/next/${params?.perfilId}/${params?.estadoId}/${params?.nentrada}?next=${params?.next}`,
            options
          );
          dispatch(slice.actions.resetItem('processo'));
          dispatch(slice.actions.getProcessoSuccess(response.data));
          break;
        }
        case 'estado': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'estados') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getEstadoSuccess(response.data));
          }
          break;
        }
        case 'colaboradoresEstado': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.getColaboradoresEstadoSuccess(response.data));
          break;
        }
        case 'meuEstado': {
          const response = await axios.get(`${BASEURLDD}/v1/estados/${params?.estadoId}/${params?.perfilId}`, options);
          if (params?.from === 'meusEstados') {
            dispatch(slice.actions.getSelectMeuEstadoSuccess(response.data));
          } else {
            dispatch(slice.actions.getMeuEstadoSuccess(response.data));
          }
          break;
        }
        case 'origem': {
          const response = await axios.get(`${BASEURLDD}/v1/origens/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'origens') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getOrigemSuccess(response.data));
          }
          break;
        }
        case 'tansicao': {
          const response = await axios.get(`${BASEURLDD}/v1/transicoes/${params?.id}/${params?.perfilId}`, options);
          if (params?.from === 'transicoes') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getTransicaoSuccess(response.data));
          }
          break;
        }
        case 'acesso': {
          const response = await axios.get(`${BASEURLDD}/v1/acessos/${params?.perfilId}/${params?.id}`, options);
          if (params?.from === 'acessos') {
            dispatch(slice.actions.selectItem(response.data));
          } else {
            dispatch(slice.actions.getAcessoSuccess(response.data));
          }
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      if (item === 'processo') {
        dispatch(slice.actions.resetItem('processo'));
      }
      if (item === 'prevnext') {
        dispatch(slice.actions.hasError(`Sem mais processos disponíveis no estado ${params?.estado}`));
      } else {
        dispatch(
          slice.actions.hasError(
            error.response?.data?.error ||
              error.response?.data?.errop ||
              error.response?.data ||
              error?.message ||
              'Ocorreu um erro...'
          )
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getAnexo(item, anexo, type, mail) {
  return async (dispatch) => {
    if (item !== 'anexoParecer') {
      dispatch(slice.actions.startLoadingAnexo());
    }
    try {
      const options = { headers: { cc: mail } };
      switch (item) {
        case 'filepreview': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${anexo}`, options);
          dispatch(slice.actions.getanexoFilePreviewSuccess({ file: response.data, type }));
          break;
        }
        case 'anotherone': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/${anexo}`, options);
          dispatch(slice.actions.getAnexoSuccess(response.data));
          break;
        }
        case 'anexoParecer': {
          const response = await axios.get(`${BASEURLDD}/v1/processos/file/parecer/${anexo?.anexo}`, options);
          dispatch(slice.actions.getAnexoParecerSuccess({ ...response.data, anexo }));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function getArquivos(item, perfilId, mail) {
  return async (dispatch) => {
    try {
      const options = { headers: { cc: mail } };
      switch (item) {
        case 'arquivados': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/${perfilId}`, options);
          dispatch(slice.actions.getArquivosSuccess(response.data));
          break;
        }
        case 'pedidosAcesso': {
          const response = await axios.get(`${BASEURLDD}/v1/arquivos/pedidos/${perfilId}`, options);
          dispatch(slice.actions.getPedidosAcessoSuccess(response.data));
          break;
        }
        case 'indicadores arquivos': {
          const response = await axios.get(`${BASEURLDD}/v1/indicadores/arquivo/mini/${perfilId}`, options);
          dispatch(slice.actions.getIndicadoresArquivoSuccess(response.data));
          break;
        }

        default:
          break;
      }
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
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
        case 'fluxo': {
          const response = await axios.post(`${BASEURLDD}/v1/fluxos`, dados, options);
          dispatch(slice.actions.createFluxoSuccess(response.data));
          break;
        }
        case 'estado': {
          const response = await axios.post(`${BASEURLDD}/v1/estados`, dados, options);
          dispatch(slice.actions.createEstadoSuccess(response.data));
          break;
        }
        case 'transicao': {
          const response = await axios.post(`${BASEURLDD}/v1/transicoes`, dados, options);
          dispatch(slice.actions.createTransicaoSuccess(response.data));
          break;
        }
        case 'linha': {
          const response = await axios.post(`${BASEURLDD}/v1/linhas`, dados, options);
          dispatch(slice.actions.createLinhaSuccess(response.data.objeto));
          break;
        }
        case 'processo interno': {
          const response = await axios.post(`${BASEURLDD}/v1/processos/interno`, dados, options1);
          if (params?.ispendente) {
            await axios.patch(
              `${BASEURLDD}/v1/processos/abandonar/${response?.data?.processo?.id}`,
              JSON.stringify(params?.abandonar),
              options
            );
          }
          dispatch(slice.actions.createProcessoSuccess(response?.data?.processo?.id));
          break;
        }
        case 'processo externo': {
          const response = await axios.post(`${BASEURLDD}/v1/processos/externo`, dados, options1);
          if (params?.ispendente) {
            await axios.patch(
              `${BASEURLDD}/v1/processos/abandonar/${response?.data?.processo?.id}`,
              JSON.stringify(params?.abandonar),
              options
            );
          }
          dispatch(slice.actions.createProcessoSuccess(response?.data?.processo?.id));
          break;
        }
        case 'origem': {
          const response = await axios.post(`${BASEURLDD}/v1/origens`, dados, options);
          dispatch(slice.actions.createOrigemSuccess(response.data));
          break;
        }
        case 'motivo pendencia': {
          const response = await axios.post(`${BASEURLDD}/v1/motivos/${params?.perfilId}`, dados, options);
          dispatch(slice.actions.createMotivoPendenciaSuccess(response.data.objeto));
          break;
        }
        case 'acesso': {
          const response = await axios.post(`${BASEURLDD}/v1/acessos`, dados, options);
          dispatch(slice.actions.createAcessoSuccess(response.data));
          break;
        }
        case 'meuEstado': {
          await axios.post(`${BASEURLDD}/v1/estados/asscc/perfil`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${JSON.parse(dados)?.perfil_id}/${
              JSON.parse(dados)?.perfil_id_cc
            }`,
            options
          );
          dispatch(slice.actions.getMeusEstadosSuccess(response.data));
          break;
        }
        case 'perfisEstado': {
          await axios.post(`${BASEURLDD}/v1/estados/asscc/perfis`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/${JSON.parse(dados)?.estado_id}/${JSON.parse(dados)?.perfil_id_cc}`,
            options
          );
          dispatch(slice.actions.getEstadoSuccess(response.data));
          break;
        }
        case 'encaminhar': {
          if (params?.haveAnexos) {
            await axios.post(`${BASEURLDD}/v1/processos/adicionar/anexos/${params?.id}`, params?.anexos, options1);
          }
          await axios.post(`${BASEURLDD}/v1/processos/encaminhar/${params?.id}`, dados, options);
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.mensagem));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            error?.error ||
            'Ocorreu um erro...'
        )
      );
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
        case 'fluxo': {
          const response = await axios.put(`${BASEURLDD}/v1/fluxos/${params?.id}`, dados, options);
          dispatch(slice.actions.updateFluxoSuccess(response.data));
          break;
        }
        case 'estado': {
          const response = await axios.put(`${BASEURLDD}/v1/estados/${params?.id}`, dados, options);
          dispatch(slice.actions.updateEstadoSuccess(response.data));
          break;
        }
        case 'origem': {
          const response = await axios.put(`${BASEURLDD}/v1/origens/${params?.id}`, dados, options);
          dispatch(slice.actions.updateOrigemSuccess(response.data));
          break;
        }
        case 'linha': {
          const response = await axios.put(`${BASEURLDD}/v1/linhas/${params?.id}`, dados, options);
          dispatch(slice.actions.updateLinhaSuccess(response.data.objeto));
          break;
        }
        case 'motivo pendencia': {
          const response = await axios.put(
            `${BASEURLDD}/v1/motivos/${params?.perfilId}?motivoID=${params?.id}`,
            dados,
            options
          );
          dispatch(slice.actions.updateMotivoPendenciaSuccess(response.data.objeto));
          break;
        }
        case 'transicao': {
          const response = await axios.put(`${BASEURLDD}/v1/transicoes/${params?.id}`, dados, options);
          dispatch(slice.actions.updateTransicaoSuccess(response.data));
          break;
        }
        case 'acesso': {
          const response = await axios.put(`${BASEURLDD}/v1/acessos/${params?.id}`, dados, options);
          dispatch(slice.actions.updateAcessoSuccess(response.data));
          break;
        }
        case 'meuEstado': {
          await axios.put(`${BASEURLDD}/v1/estados/asscc/perfil`, dados, options);
          const response = await axios.get(
            `${BASEURLDD}/v1/estados/asscc/byperfilid/${JSON.parse(dados)?.perfil_id}/${
              JSON.parse(dados)?.perfil_id_cc
            }`,
            options
          );
          dispatch(slice.actions.getMeusEstadosSuccess(response.data));
          break;
        }
        case 'processo': {
          await axios.put(`${BASEURLDD}/v1/processos/ei/pro/${params?.id}/${params?.perfilId}`, dados, options1);
          if (params?.ispendente) {
            await axios.patch(
              `${BASEURLDD}/v1/processos/abandonar/${params?.id}`,
              JSON.stringify(params?.abandonar),
              options
            );
            await axios.patch(
              `${BASEURLDD}/v1/processos/afetar/${params?.id}?perfilID=${params?.perfilId}&perfilIDAfeto=${params?.perfilId}`,
              '',
              options
            );
          }
          dispatch(slice.actions.updateProcessoSuccess(params?.id));
          break;
        }
        case 'parecer': {
          const response = await axios.patch(
            `${BASEURLDD}/v1/processos/parecer/${params?.processoId}`,
            dados,
            options1
          );
          dispatch(slice.actions.patchParecerSuccess({ id: params?.id, dados: response.data }));
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.done(params?.mensagem));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            error?.error ||
            'Ocorreu um erro...'
        )
      );
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
        case 'fluxo': {
          await axios.delete(`${BASEURLDD}/v1/fluxos/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteFluxoSuccess({ id: params?.id }));
          break;
        }
        case 'estado': {
          await axios.delete(`${BASEURLDD}/v1/estados/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteEstadoSuccess({ id: params?.id }));
          break;
        }
        case 'transicao': {
          await axios.delete(`${BASEURLDD}/v1/transicoes/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteTransicaoSuccess(params?.id));
          break;
        }
        case 'origem': {
          await axios.delete(`${BASEURLDD}/v1/origens/${params?.id}/${params?.perfilId}`, options);
          dispatch(slice.actions.deleteOrigemSuccess({ id: params?.id }));
          break;
        }
        case 'linha': {
          await axios.delete(`${BASEURLDD}/v1/linhas/${params?.linhaID}/${params?.perfilID}`, options);
          dispatch(slice.actions.deleteLinhaSuccess({ id: params?.id }));
          break;
        }
        case 'motivo pendencia': {
          await axios.delete(`${BASEURLDD}/v1/motivos/${params?.perfilId}?motivoID=${params?.id}`, options);
          dispatch(slice.actions.deleteMotivoPendenciaSuccess({ id: params?.id }));
          break;
        }
        case 'acesso': {
          await axios.delete(`${BASEURLDD}/v1/acessos/${params?.perfilId}/${params?.id}`, options);
          dispatch(slice.actions.deleteAcessosSuccess({ id: params?.id }));
          break;
        }
        case 'meuEstado': {
          await axios.delete(`${BASEURLDD}/v1/estados/asscc/perfil/${params?.perfilId}?peID=${params?.id}`, options);
          dispatch(slice.actions.deleteMeuEstadoSuccess({ id: params?.id }));
          break;
        }
        case 'perfil from estado': {
          await axios.delete(`${BASEURLDD}/v1/estados/asscc/perfil/${params?.perfilId}?peID=${params?.id}`, options);
          dispatch(slice.actions.deletePerfilFromEstadoSuccess({ id: params?.id }));
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

        default:
          break;
      }
      dispatch(slice.actions.done(params?.mensagem));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function arquivarProcesso(dados, processoId, haveAnexos, anexos, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      const options1 = { headers: { 'content-type': 'multipart/form-data', cc: mail } };
      if (haveAnexos) {
        await axios.post(`${BASEURLDD}/v1/processos/adicionar/anexos/${processoId}`, anexos, options1);
      }
      await axios.patch(`${BASEURLDD}/v1/processos/arquivar/${processoId}`, dados, options);
      dispatch(slice.actions.done('arquivado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function desarquivarProcesso(dados, id, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.patch(`${BASEURLDD}/v1/processos/desarquivar/${id}`, dados, options);
      dispatch(slice.actions.desarquivarProcessoSuccess());
      dispatch(slice.actions.done('desarquivado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function atribuirAcesso(dados, id, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.post(`${BASEURLDD}/v1/arquivos/dar/acesso/${id}`, dados, options);
      dispatch(slice.actions.done('Acesso atribuido'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function deleteAnexo(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'anexo processo': {
          await axios.delete(
            `${BASEURLDD}/v1/processos/remover/anexos/${params?.perfilId}/${params?.processoId}/${params?.id}`,
            options
          );
          dispatch(slice.actions.getDeleteAnexoProcessoSuccess(params?.id));
          break;
        }
        default:
          break;
      }

      dispatch(slice.actions.done(params?.mensagem));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error.response?.data?.error ||
            error.response?.data?.errop ||
            error.response?.data ||
            error?.message ||
            'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function createAssociacaoEstadoPerfil(dados, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = {
        headers: {
          'content-type': 'application/json',
          cc: mail,
        },
      };
      await axios.post(`${BASEURLDD}/v1/estados/asscc/perfil`, dados, options);
    } catch (error) {
      dispatch(slice.actions.hasError(error[0]?.msg || error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function deleteAssociacaoEstadoPerfil(estadoId, perfilId, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { cc: mail } };
      await axios.delete(`${BASEURLDD}/v1/estados/asscc/perfil/${estadoId}/${perfilId}`, options);
    } catch (error) {
      dispatch(slice.actions.hasError(error[0]?.msg || error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function aceitarProcesso(dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      await axios.patch(`${BASEURLDD}/v1/processos/aceitar/${params?.processoId}`, dados, options);
      dispatch(slice.actions.getAceitarSuccess(params));
      dispatch(slice.actions.done('aceitado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error[0]?.msg || error?.response?.data?.detail || error.response?.data?.errop || 'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function pedirAcessoProcesso(perfilId, processoId, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.post(`${BASEURLDD}/v1/arquivos/pedir/acesso/${perfilId}/${processoId}`, '', options);
      dispatch(slice.actions.done('solicitado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error[0]?.msg || error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function abandonarProcesso(dados, processoId, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.patch(`${BASEURLDD}/v1/processos/abandonar/${processoId}`, JSON.stringify(dados), options);
      dispatch(slice.actions.done('abandonado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error[0]?.msg || error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function finalizarProcesso(dados, processoId, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.patch(`${BASEURLDD}/v1/processos/finalizar/${processoId}`, dados, options);
      dispatch(slice.actions.done('finalizado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error[0]?.msg || error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function resgatarProcesso(dados, id, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      const response = await axios.patch(`${BASEURLDD}/v1/processos/resgate/${id}`, dados, options);
      dispatch(slice.actions.getProcessoSuccess(response.data));
      dispatch(slice.actions.done('resgatado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error[0]?.msg || error?.response?.data?.detail || error.response?.data || 'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function cancelarProcesso(dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      await axios.patch(`${BASEURLDD}/v1/processos/cancelar/${params?.id}`, dados, options);
      const response = await axios.get(
        `${BASEURLDD}/v1/processos/byref/${params?.perfilId}/?processoID=${params?.id}`,
        options
      );
      dispatch(slice.actions.getProcessoSuccess(response.data));
      dispatch(slice.actions.done('cancelado'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error[0]?.msg || error?.response?.data?.detail || error.response?.data || 'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}

// ----------------------------------------------------------------------

export function atribuirProcesso(mail, processoID, perfilIDAfeto, perfilID, mensagem) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: mail } };
      await axios.patch(
        `${BASEURLDD}/v1/processos/afetar/${processoID}?perfilID=${perfilID}&perfilIDAfeto=${perfilIDAfeto}`,
        '',
        options
      );
      dispatch(slice.actions.getAtribuirSuccess(perfilIDAfeto));
      dispatch(slice.actions.done(mensagem));
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(
        slice.actions.hasError(
          error[0]?.msg || error?.response?.data?.detail || error.response?.data || 'Ocorreu um erro...'
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(slice.actions.resetError());
    }
  };
}
