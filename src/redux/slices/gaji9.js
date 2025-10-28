import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { GAJI9_API_SERVER } from '../../utils/apisUrl';
import { meusAcessosGaji9 } from '../../utils/formatObject';
//
import {
  hasError,
  actionGet,
  doneSucess,
  actionCreate,
  actionUpdate,
  actionDelete,
  headerOptions,
  actionOpenModal,
  actionCloseModal,
} from './sliceActions';
import { getAccessToken } from './intranet';

// ---------------------------------------------------------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  modalGaji9: '',
  isEdit: false,
  isSaving: false,
  isLoading: false,
  adminGaji9: false,
  isOpenModal: false,
  isLoadingDoc: false,
  credito: null,
  infoPag: null,
  clausula: null,
  infoCaixa: null,
  propostaId: null,
  utilizador: null,
  previewFile: null,
  tipoGarantia: null,
  selectedItem: null,
  clausulaOpcional: null,
  estadoMinutas: localStorage.getItem('estadoMinutas') || 'Em análise',
  grupos: [],
  minutas: [],
  funcoes: [],
  creditos: [],
  recursos: [],
  contratos: [],
  variaveis: [],
  segmentos: [],
  freguesias: [],
  marcadores: [],
  componentes: [],
  finalidades: [],
  tiposSeguros: [],
  tiposImoveis: [],
  tiposTitulos: [],
  tiposGarantias: [],
  tiposTitulares: [],
  representantes: [],
  representsBalcao: [],
};

const slice = createSlice({
  name: 'gaji9',
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

    setContratado(state, action) {
      state.credito.contratado = action.payload;
    },

    setModal(state, action) {
      state.isEdit = !!action?.payload?.isEdit;
      state.modalGaji9 = action?.payload?.item || '';
      state.selectedItem = action?.payload?.dados || null;
    },

    openModal(state, action) {
      actionOpenModal(state, action.payload);
    },

    closeModal(state) {
      actionCloseModal(state);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, setModal, getSuccess, closeModal } = slice.actions;

// ---------------------------------------------------------------------------------------------------------------------

export function getInfoGaji(item) {
  return async (dispatch) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromGaji9('tiposTitulares'));
    if (item !== 'credito') dispatch(getFromGaji9('segmentos'));
    if (item !== 'credito') dispatch(getFromGaji9('componentes'));
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function getFromGaji9(item, params) {
  return async (dispatch) => {
    if (!params?.notLoading) dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    if (params?.reset) dispatch(slice.actions.getSuccess({ item, dados: params?.reset?.dados }));

    try {
      const accessToken = await getAccessToken();
      // console.log(accessToken);
      const apiUrl =
        // DETALHES
        (item === 'infoCaixa' && `/v1/suportes/instituicao`) ||
        (item === 'minuta' && `/v1/minutas/detail?id=${params?.id}`) ||
        (item === 'grupo' && `/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'variavel' && `/v1/variaveis/detail?id=${params?.id}`) ||
        (item === 'clausula' && `/v1/clausulas/detail?id=${params?.id}`) ||
        (item === 'freguesia' && `/v1/divisoes/detail?id=${params?.id}`) ||
        (item === 'marcador' && `/v1/marcadores/detail?id=${params?.id}`) ||
        (item === 'recurso' && `/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'finalidade' && `/v1/suportes/finalidade?id=${params?.id}`) ||
        (item === 'tipoSeguro' && `/v1/tipos_seguros/detail?id=${params?.id}`) ||
        (item === 'tipoImovel' && `/v1/suportes/tipo_imovel?id=${params?.id}`) ||
        (item === 'segmento' && `/v1/clausulas/segmentos/${params?.id}/detail`) ||
        (item === 'tipoTitular' && `/v1/tipos_titulares/detail?id=${params?.id}`) ||
        (item === 'tipoGarantia' && `/v1/tipos_garantias/detail?id=${params?.id}`) ||
        (item === 'representante' && `/v1/acs/representantes/detail?id=${params?.id}`) ||
        (item === 'grupo recurso' && `/v1/acs/grupos/recurso/detail?id=${params?.id}`) ||
        (item === 'credito' && `/v1/suportes/creditos/detail?credito_id=${params?.id}`) ||
        (item === 'entidade' && `/v1/suportes/entidades/detail?entidade_id=${params?.id}`) ||
        (item === 'gerarDocumento' && `/v1/minutas/gerar/documento?minuta_id=${params?.id}`) ||
        (item === 'representsBalcao' && `/v1/acs/representantes/credito?balcao=${params?.balcao}`) ||
        ((item === 'utilizador' || item === 'funcao') && `/v1/acs/grupos/utilizador?utilizador_id=${params?.id}`) ||
        (item === 'proposta' &&
          `/v1/suportes/creditos/carregar/proposta?numero_proposta=${params?.proposta}&credibox=${!!params?.credibox}`) ||
        // LISTA
        (item === 'importar componentes' && `/v1/produtos/importar`) ||
        (item === 'tiposTitulos' && `/v1/suportes/creditos/tipos/titulos`) ||
        (item === 'grupos' && `/v1/acs/grupos/lista?ativo=${!params?.inativos}`) ||
        (item === 'funcoes' && `/v1/acs/roles/lista?ativo=${!params?.inativos}`) ||
        (item === 'freguesias' && `/v1/divisoes/lista?ativo=${!params?.inativos}`) ||
        (item === 'variaveis' && `/v1/variaveis/lista?ativo=${!params?.inativos}`) ||
        (item === 'contratos' && `/v1/contratos/credito?credito_id=${params?.id}`) ||
        (item === 'componentes' && `/v1/produtos/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposSeguros' && `/v1/tipos_seguros?ativo=${!params?.inativos}`) ||
        (item === 'marcadores' && `/v1/marcadores/lista?ativo=${!params?.inativos}`) ||
        (item === 'recursos' && `/v1/acs/recursos/lista?ativo=${!params?.inativos}`) ||
        (item === 'segmentos' && `/v1/clausulas/segmentos/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposTitulares' && `/v1/tipos_titulares/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposGarantias' && `/v1/tipos_garantias/lista?ativo=${!params?.inativos}`) ||
        (item === 'finalidades' && `/v1/suportes/finalidade/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposImoveis' && `/v1/suportes/tipo_imovel/lista?ativo=${!params?.inativos}`) ||
        (item === 'representantes' && `/v1/acs/representantes/lista?ativo=${!params?.inativos}`) ||
        (item === 'minutas' &&
          `/v1/minutas/lista?em_analise=${params?.emAnalise}&em_vigor=${params?.emVigor}&revogado=${params?.revogado}&ativo=${!params?.inativos}`) ||
        (item === 'creditos' &&
          `/v1/suportes/creditos/localizar?cursor=${params?.cursor || 0}${params?.balcao ? `&balcao=${params?.balcao}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.codigo ? `&codigo=${params?.codigo}` : ''}${params?.proposta ? `&numero_proposta=${params?.proposta}` : ''}`) ||
        (item === 'clausulas' &&
          `/v1/clausulas/lista?ativo=${!params?.inativos}&situacao=${params?.situacao}${params?.solta ? `&solta=true` : ''}${params?.caixa ? `&seccao_id_caixa=true` : ''}${params?.identificacao ? `&seccao_id=true` : ''}${params?.titularId ? `&tipo_titular_id=${params?.titularId}` : ''}${params?.garantiaId ? `&tipo_garantia_id=${params?.garantiaId}` : ''}${params?.segmentoId ? `&segmento_id=${params?.segmentoId}` : ''}`) ||
        '';
      if (apiUrl) {
        if (params?.reset)
          dispatch(slice.actions.getSuccess({ item, dados: item === 'creditos' ? 'reset' : params?.reset?.val }));

        const headers = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.get(`${GAJI9_API_SERVER}${apiUrl}`, headers);

        if (item === 'grupo') {
          const uts = await axios.get(`${GAJI9_API_SERVER}/v1/acs/grupos/utilizadores?grupo_id=${params?.id}`, headers);
          const dados = { ...response.data?.objeto, utilizadores: uts.data?.objeto };
          dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados }));
        } else if (item === 'funcao' || item === 'utilizador') {
          if (item === 'utilizador' && response.data?.objeto?.utilizador?._role === 'ADMIN')
            dispatch(slice.actions.getSuccess({ item: 'adminGaji9', dados: true }));
          const acessos = meusAcessosGaji9(response.data?.objeto?.grupos);
          dispatch(
            slice.actions.getSuccess({
              item: params?.item || item,
              dados: { ...response.data?.objeto?.utilizador, grupos: response.data?.objeto?.grupos || [], acessos },
            })
          );
        } else if (item === 'proposta') dispatch(getSuccess({ item: 'propostaId', dados: response?.data?.objeto?.id }));
        else {
          const dados = (item === 'creditos' && response.data) || response.data?.clausula || response.data?.objeto;
          dispatch(slice.actions.getSuccess({ item: params?.item || item, dados }));
        }

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

export function getDocumento(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'previewFile', dados: null }));
    dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: true }));
    dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: params }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'contrato' && `/v1/contratos/download?codigo=${params?.codigo}`) ||
        (item === 'minutav2' &&
          `/v2/minutas/documento/preview?restrito=${params?.restrito}&rascunho=${params?.rascunho}`) ||
        (item === 'gerar-contrato' &&
          `/v2/contratos/gerar?credito_id=${params?.creditoId}&representante_id=${params?.representanteId}`) ||
        (item === 'preview-contrato' &&
          `/v2/suportes/creditos/previsualizar/contrato?credito_id=${params?.creditoId}&representante_id=${params?.representanteId}`) ||
        (item === 'minuta' &&
          `/v1/minutas/documento/preview?id=${params?.id}${params?.taxa ? `&taxa_juros_negociado=${params?.taxa}` : ''}${params?.prazo ? `&prazo=${params?.prazo}` : ''}${params?.montante ? `&montante=${params?.montante}` : ''}&isento_comissao=${params?.isento}&com_representante=${params?.representante}`) ||
        '';
      if (apiUrl) {
        const headers = {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(item === 'minutav2' ? { 'content-type': 'application/json' } : {}),
          },
        };
        const response =
          item === 'gerar-contrato' || item === 'minutav2'
            ? await axios.post(
                `${GAJI9_API_SERVER}${apiUrl}`,
                item === 'minutav2' ? JSON.stringify(params) : null,
                headers
              )
            : await axios.get(`${GAJI9_API_SERVER}${apiUrl}`, headers);
        const blob = new Blob([response.data], { type: params?.tipo_conteudo });
        const fileUrl = URL.createObjectURL(blob);
        dispatch(slice.actions.getSuccess({ item: 'previewFile', dados: fileUrl }));
        if (item === 'gerar-contrato') {
          dispatch(getFromGaji9('contratos', { id: params?.creditoId }));
          dispatch(slice.actions.setContratado(true));
        }
      }
    } catch (error) {
      let errorMessage = 'Erro ao carregar o ficheiro';

      if (error.response && error.response.data) {
        try {
          const uint8Array = new Uint8Array(error.response.data);
          const decodedString = new TextDecoder('ISO-8859-1').decode(uint8Array);
          errorMessage = JSON.parse(decodedString)?.mensagem || errorMessage;
        } catch (parseError) {
          errorMessage = error.message;
        }
      } else if (error.message) errorMessage = error.message;

      hasError({ message: errorMessage }, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: false }));
    }
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });

      const apiUrl =
        (item === 'grupos' && `/v1/acs/grupos`) ||
        (item === 'funcoes' && `/v1/acs/roles`) ||
        (item === 'clausulas' && `/v2/clausulas`) ||
        (item === 'variaveis' && `/v1/variaveis`) ||
        (item === 'freguesias' && `/v1/divisoes`) ||
        (item === 'marcadores' && `/v1/marcadores`) ||
        (item === 'recursos' && `/v1/acs/recursos`) ||
        (item === 'tiposSeguros' && `/v1/tipos_seguros`) ||
        (item === 'segmentos' && `/v1/clausulas/segmentos`) ||
        (item === 'infoCaixa' && `/v1/suportes/instituicao`) ||
        (item === 'tiposTitulares' && `/v1/tipos_titulares`) ||
        (item === 'tiposGarantias' && `/v1/tipos_garantias`) ||
        (item === 'finalidades' && `/v1/suportes/finalidade`) ||
        (item === 'tiposImoveis' && `/v1/suportes/tipo_imovel`) ||
        (item === 'componentes' && `/v1/produtos/importar/one`) ||
        (item === 'colaboradorGrupo' && `/v1/acs/utilizadores/grupo`) ||
        (item === 'representantes' && `/v1/acs/representantes/definir`) ||
        (item === 'condicionalCl' && `/v1/clausulas/c2c/${params?.id}`) ||
        (item === 'finalidadesSeg' && `/v1/clausulas/segmentos/${params?.id}/finalidades`) ||
        (item === 'componentesSeg' && `/v1/clausulas/segmentos/${params?.id}/componentes`) ||
        (item === 'segmentosCl' && `/v1/clausulas/assoc/segmentos?clausula_id=${params?.id}`) ||
        (item === 'subtipos' && `/v1/tipos_garantias/subtipos?tipo_id=${params?.garantiaId}`) ||
        (item === 'recursosGrupo' && `/v1/acs/grupos/adicionar/recursos?grupo_id=${params?.id}`) ||
        (item === 'tiposTitularesCl' && `/v1/clausulas/tipo_titulares?clausula_id=${params?.id}`) ||
        (item === 'intervenientes' && `/v1/suportes/creditos/intervenientes?credito_id=${params?.id}`) ||
        (item === 'balcoes' && `/v1/acs/representantes/acumular/balcao?representante_id=${params?.repId}`) ||
        (item === 'seguro-garantia' &&
          `/v1/suportes/creditos/seguros_garantia?credito_id=${params?.creditoId}&garantia_id=${params?.garantiaId}`) ||
        '';
      if (apiUrl) {
        const response = await axios.post(`${GAJI9_API_SERVER}${apiUrl}`, dados, options);
        if (params?.getItem)
          dispatch(getSuccess({ item: params?.getItem, dados: response.data?.objeto || response.data?.clausula }));
        else if (params?.getList) dispatch(getFromGaji9(item, { id: params?.id }));
        else {
          const dados = response.data?.clausula || response.data?.objeto || null;
          dispatch(
            slice.actions.createSuccess({
              item: params?.item || item,
              item1: params?.item1 || '',
              dados: (item === 'colaboradorGrupo' && JSON.parse(dados)) || dados,
            })
          );
        }
      }

      if (item === 'condicionaisCl') {
        const requisicoes = dados.map(async (row) => {
          const ausencia = axios.post(
            `${GAJI9_API_SERVER}/v1/clausulas/c2c/${params?.id}`,
            JSON.stringify(row),
            options
          );
          return ausencia;
        });
        const responses = await Promise.all(requisicoes);
        dispatch(getSuccess({ item: 'clausula', dados: responses[responses.length - 1].data?.clausula || null }));
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

export function updateItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });
      const apiUrl =
        (item === 'variaveis' && `/v1/variaveis`) ||
        (item === 'componentes' && `/v1/produtos/rotular`) ||
        (item === 'prg' && `/v1/acs/grupos/remover/recurso`) ||
        (item === 'funcoes' && `/v1/acs/roles?id=${params?.id}`) ||
        (item === 'clausulas' && `/v2/clausulas?id=${params?.id}`) ||
        (item === 'freguesias' && `/v1/divisoes?id=${params?.id}`) ||
        (item === 'marcadores' && `/v1/marcadores?id=${params?.id}`) ||
        (item === 'grupos' && `/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'segmentos' && `/v1/clausulas/segmentos/${params?.id}`) ||
        (item === 'tiposSeguros' && `/v1/tipos_seguros?id=${params?.id}`) ||
        (item === 'recursos' && `/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'tiposTitulares' && `/v1/tipos_titulares?id=${params?.id}`) ||
        (item === 'tiposGarantias' && `/v1/tipos_garantias?id=${params?.id}`) ||
        (item === 'infoCaixa' && `/v1/suportes/instituicao?id=${params?.id}`) ||
        (item === 'finalidades' && `/v1/suportes/finalidade?id=${params?.id}`) ||
        (item === 'tiposImoveis' && `/v1/suportes/tipo_imovel?id=${params?.id}`) ||
        (item === 'credito' && `/v1/suportes/creditos?credito_id=${params?.id}`) ||
        (item === 'colaboradorGrupo' && `/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
        (item === 'recursosGrupo' && `/v1/acs/grupos/update/recurso?id=${params?.id}`) ||
        (item === 'utilizadoresGrupo' && `/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
        (item === 'datas contrato' && `/v1/contratos/entrega?codigo=${params?.codigo}`) ||
        (item === 'representantes' && `/v1/acs/representantes/atualizar?id=${params?.id}`) ||
        (item === 'subtipos' &&
          `/v1/tipos_garantias/subtipos?tipo_id=${params?.garantiaId}&subtipo_id=${params?.id}`) ||
        (item === 'balcoes' &&
          `/v1/acs/representantes/acumular/balcao?id=${params?.id}&representante_id=${params?.repId}`) ||
        (item === 'seguro-garantia' &&
          `/v1/suportes/creditos/seguros_garantia?seguro_id=${params?.id}&credito_id=${params?.creditoId}&garantia_id=${params?.garantiaId}`) ||
        '';

      if (apiUrl) {
        if (params?.patch) {
          if (item === 'datas contrato') {
            if (dados?.data_entrega) await axios.patch(`${GAJI9_API_SERVER}${apiUrl}`, dados.data_entrega, options);
            if (dados?.data_recebido)
              await axios.patch(
                `${GAJI9_API_SERVER}/v1/contratos/recebido?codigo=${params?.codigo}`,
                dados.data_recebido,
                options
              );
            await dispatch(getFromGaji9('contratos', { id: params?.creditoId }));
          } else {
            const response = await axios.patch(`${GAJI9_API_SERVER}${apiUrl}`, dados, options);
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: null }));
            dispatch(slice.actions.getSuccess({ item: params?.getItem || item, dados: response.data?.objeto || null }));
          }
        } else {
          const response = await axios.put(`${GAJI9_API_SERVER}${apiUrl}`, dados, options);
          if (item === 'prg') dispatch(getFromGaji9('grupo', { id: params?.grupoId }));
          else if (params?.getItem)
            dispatch(getSuccess({ item: params?.getItem, dados: response.data?.clausula || response.data?.objeto }));
          else {
            const dadosItem =
              (item === 'colaboradorGrupo' && JSON.parse(dados)) ||
              (item === 'componentes' && params?.values) ||
              response.data?.clausula ||
              response.data?.objeto ||
              null;
            dispatch(
              slice.actions.updateSuccess({ item: params?.item || item, item1: params?.item1 || '', dados: dadosItem })
            );
          }
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

export function deleteItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'clausulas' && `/v1/clausulas?id=${params?.id}`) ||
        (item === 'grupos' && `/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'segmentos' && `/v1/clausulas/segmentos/${params?.id}`) ||
        (item === 'tiposSeguros' && `/v1/tipos_seguros?id=${params?.id}`) ||
        (item === 'recursos' && `/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'finalidades' && `/v1/suportes/finalidade?id=${params?.id}`) ||
        (item === 'tiposImoveis' && `/v1/suportes/tipo_imovel?id=${params?.id}`) ||
        (item === 'credito' && `/v1/suportes/creditos/proposta?credito_id=${params?.id}`) ||
        (item === 'condicionalCl' && `/v1/clausulas/c2c/${params?.id}?id=${params?.itemId}`) ||
        (item === 'finalidadeSeg' && `/v1/clausulas/segmentos/${params?.itemId}/finalidades/${params?.id}`) ||
        (item === 'componenteSeg' && `/v1/clausulas/segmentos/${params?.itemId}/componentes/${params?.id}`) ||
        (item === 'segmentoCl' && `/v1/clausulas/assoc/segmentos/${params?.itemId}?clausula_id=${params?.id}`) ||
        (item === 'tipoTitularCl' && `/v1/clausulas/tipo_titulares/${params?.itemId}?clausula_id=${params?.id}`) ||
        (item === 'contratos' && `/v1/contratos/credito?credito_id=${params?.creditoId}&contrato_id=${params?.id}`) ||
        (item === 'subtipos' &&
          `/v1/tipos_garantias/subtipos?tipo_id=${params?.garantiaId}&subtipo_id=${params?.id}`) ||
        (item === 'balcoes' &&
          `/v1/acs/representantes/acumular/balcao?id=${params?.id}&representante_id=${params?.repId}`) ||
        (item === 'intervenientes' &&
          `/v1/suportes/creditos/intervenientes?credito_id=${params?.id}&participante_id=${params?.numero}`) ||
        (item === 'seguro-garantia' &&
          `/v1/suportes/creditos/seguros_garantia?seguro_id=${params?.id}&credito_id=${params?.creditoId}&garantia_id=${params?.garantiaId}`) ||
        '';

      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.delete(`${GAJI9_API_SERVER}${apiUrl}`, options);
        if (item === 'contratos') dispatch(slice.actions.setContratado(false));
        else if (params?.getItem)
          dispatch(getSuccess({ item: params?.getItem, dados: response.data?.objeto || response.data?.clausula }));
        else {
          const desativar = item === 'balcoes';
          dispatch(slice.actions.deleteSuccess({ item, item1: params?.item1 || '', id: params?.id, desativar }));
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
