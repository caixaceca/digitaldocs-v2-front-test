import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLGAJI9 } from '../../utils/apisUrl';
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

// ----------------------------------------------------------------------

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
  minutaId: null,
  infoCaixa: null,
  utilizador: null,
  previewFile: null,
  selectedItem: null,
  minutaContrato: null,
  estadoMinutas: localStorage.getItem('estadoMinutas') || 'Em análise',
  grupos: [],
  minutas: [],
  funcoes: [],
  creditos: [],
  recursos: [],
  contratos: [],
  variaveis: [],
  freguesias: [],
  marcadores: [],
  componentes: [],
  tiposGarantias: [],
  tiposTitulares: [],
  representantes: [],
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

// ----------------------------------------------------------------------

export function getInfoGaji(item) {
  return async (dispatch) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(getFromGaji9('componentes'));
    dispatch(getFromGaji9('tiposTitulares'));
    if (item === 'gestao') dispatch(getFromGaji9('funcoes'));
    if (item !== 'credito') dispatch(getFromGaji9('tiposGarantias'));
  };
}

// ----------------------------------------------------------------------

export function getFromGaji9(item, params) {
  return async (dispatch) => {
    if (!params?.notLoading) dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: true }));
    try {
      const accessToken = await getAccessToken();
      // console.log(accessToken);
      const apiUrl =
        // DETALHES
        (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao`) ||
        (item === 'minuta' && `${BASEURLGAJI9}/v1/minutas/detail?id=${params?.id}`) ||
        (item === 'grupo' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'variavel' && `${BASEURLGAJI9}/v1/variaveis/detail?id=${params?.id}`) ||
        (item === 'clausula' && `${BASEURLGAJI9}/v1/clausulas/detail?id=${params?.id}`) ||
        (item === 'freguesia' && `${BASEURLGAJI9}/v1/divisoes/detail?id=${params?.id}`) ||
        (item === 'marcador' && `${BASEURLGAJI9}/v1/marcadores/detail?id=${params?.id}`) ||
        (item === 'recurso' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'tipoTitular' && `${BASEURLGAJI9}/v1/tipos_titulares/detail?id=${params?.id}`) ||
        (item === 'tipoGarantia' && `${BASEURLGAJI9}/v1/tipos_garantias/detail?id=${params?.id}`) ||
        (item === 'representante' && `${BASEURLGAJI9}/v1/acs/representantes/detail?id=${params?.id}`) ||
        (item === 'grupo recurso' && `${BASEURLGAJI9}/v1/acs/grupos/recurso/detail?id=${params?.id}`) ||
        (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos/detail?credito_id=${params?.id}`) ||
        (item === 'entidade' && `${BASEURLGAJI9}/v1/suportes/entidades/detail?entidade_id=${params?.id}`) ||
        (item === 'gerarDocumento' && `${BASEURLGAJI9}/v1/minutas/gerar/documento?minuta_id=${params?.id}`) ||
        (item === 'minutaContrato' && `${BASEURLGAJI9}/v1/suportes/creditos/minuta?credito_id=${params?.id}`) ||
        ((item === 'utilizador' || item === 'funcao') &&
          `${BASEURLGAJI9}/v1/acs/grupos/utilizador?utilizador_id=${params?.id}`) ||
        (item === 'proposta' &&
          `${BASEURLGAJI9}/v1/suportes/creditos/carregar/proposta?numero_proposta=${params?.proposta}&credibox=${!!params?.credibox}`) ||
        // LISTA
        (item === 'importar componentes' && `${BASEURLGAJI9}/v1/produtos/importar`) ||
        (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos/lista?ativo=${!params?.inativos}`) ||
        (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles/lista?ativo=${!params?.inativos}`) ||
        (item === 'freguesias' && `${BASEURLGAJI9}/v1/divisoes/lista?ativo=${!params?.inativos}`) ||
        (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis/lista?ativo=${!params?.inativos}`) ||
        (item === 'contratos' && `${BASEURLGAJI9}/v1/contratos/credito?credito_id=${params?.id}`) ||
        (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/lista?ativo=${!params?.inativos}`) ||
        (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores/lista?ativo=${!params?.inativos}`) ||
        (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares/lista?ativo=${!params?.inativos}`) ||
        (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias/lista?ativo=${!params?.inativos}`) ||
        (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/lista?ativo=${!params?.inativos}`) ||
        (item === 'minutas' &&
          `${BASEURLGAJI9}/v1/minutas/lista?em_analise=${params?.emAnalise}&em_vigor=${params?.emVigor}&revogado=${params?.revogado}&ativo=${!params?.inativos}`) ||
        (item === 'creditos' &&
          `${BASEURLGAJI9}/v1/suportes/creditos/localizar?cursor=${params?.cursor || 0}${params?.balcao ? `&balcao=${params?.balcao}` : ''}${params?.cliente ? `&cliente=${params?.cliente}` : ''}${params?.codigo ? `&codigo=${params?.codigo}` : ''}${params?.proposta ? `&numero_proposta=${params?.proposta}` : ''}`) ||
        (item === 'clausulas' &&
          `${BASEURLGAJI9}/v1/clausulas/lista?ativo=${!params?.inativos}${params?.solta ? `&solta=true` : ''}${params?.condicional ? `&condicional=true` : ''}${params?.caixa ? `&seccao_id_caixa=true` : ''}${params?.identificacao ? `&seccao_id=true` : ''}${params?.titularId ? `&tipo_titular_id=${params?.titularId}` : ''}${params?.garantiaId ? `&tipo_garantia_id=${params?.garantiaId}` : ''}${params?.componenteId ? `&componente_id=${params?.componenteId}` : ''}`) ||
        '';
      if (apiUrl) {
        if (params?.reset)
          dispatch(slice.actions.getSuccess({ item, dados: item === 'creditos' ? 'reset' : params?.reset?.val }));

        const headers = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.get(apiUrl, headers);

        if (item === 'grupo') {
          const uts = await axios.get(`${BASEURLGAJI9}/v1/acs/grupos/utilizadores?grupo_id=${params?.id}`, headers);
          const dados = { ...response.data?.objeto, utilizadores: uts.data?.objeto };
          dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados }));
        } else if (item === 'funcao' || item === 'utilizador') {
          if (item === 'utilizador' && response.data?.objeto?.utilizador?._role === 'ADMIN')
            dispatch(slice.actions.getSuccess({ item: 'adminGaji9', dados: true }));
          dispatch(
            slice.actions.getSuccess({
              item: params?.item || item,
              dados: {
                ...response.data?.objeto?.utilizador,
                grupos: response.data?.objeto?.grupos || [],
                acessos: meusAcessosGaji9(response.data?.objeto?.grupos),
              },
            })
          );
        } else if (item === 'proposta') dispatch(getSuccess({ item: 'minutaId', dados: response?.data?.objeto?.id }));
        else {
          const dados = (item === 'creditos' && response.data) || response.data?.clausula || response.data?.objeto;
          dispatch(slice.actions.getSuccess({ item: params?.item || item, dados }));
        }

        if (params?.msg) doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
        params?.onClose?.();
      }
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isLoading', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function getDocumento(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'previewFile', dados: null }));
    dispatch(slice.actions.getSuccess({ item: 'isLoadingDoc', dados: true }));
    dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: params }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'contrato' && `${BASEURLGAJI9}/v1/contratos/download?codigo=${params?.codigo}`) ||
        (item === 'gerar-contrato' &&
          `${BASEURLGAJI9}/v1/contratos/gerar?credito_id=${params?.creditoId}&minuta_id=${params?.minutaId}&representante_id=${params?.representanteId}&cache=${params?.cache}`) ||
        (item === 'preview-contrato' &&
          `${BASEURLGAJI9}/v1/suportes/creditos/previsualizar/contrato?credito_id=${params?.creditoId}&minuta_id=${params?.minutaId}&representante_id=${params?.representanteId}&cache=${params?.cache}`) ||
        (item === 'minuta' &&
          `${BASEURLGAJI9}/v1/minutas/documento/preview?id=${params?.id}${params?.taxa ? `&taxa_juros_negociado=${params?.taxa}` : ''}${params?.prazo ? `&prazo=${params?.prazo}` : ''}${params?.montante ? `&montante=${params?.montante}` : ''}&isento_comissao=${params?.isento}&com_representante=${params?.representante}`) ||
        '';
      if (apiUrl) {
        const headrs = { responseType: 'arraybuffer', headers: { Authorization: `Bearer ${accessToken}` } };
        const response =
          item === 'gerar-contrato' ? await axios.post(apiUrl, null, headrs) : await axios.get(apiUrl, headrs);
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

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas`) ||
        (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos`) ||
        (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles`) ||
        (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas`) ||
        (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
        (item === 'freguesias' && `${BASEURLGAJI9}/v1/divisoes`) ||
        (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores`) ||
        (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos`) ||
        (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao`) ||
        (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares`) ||
        (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias`) ||
        (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/importar/one`) ||
        (item === 'colaboradorGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo`) ||
        (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/definir`) ||
        (item === 'clonarMinuta' && `${BASEURLGAJI9}/v1/minutas/com/base?minuta_base_id=${params?.id}`) ||
        (item === 'componentesMinuta' && `${BASEURLGAJI9}/v1/minutas/${params?.id}/componentes_compativeis`) ||
        (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/adicionar/recursos?grupo_id=${params?.id}`) ||
        (item === 'intervenientes' && `${BASEURLGAJI9}/v1/suportes/creditos/intervenientes?credito_id=${params?.id}`) ||
        (item === 'coposicaoMinuta' &&
          `${BASEURLGAJI9}/v1/minutas/compor?minuta_id=${params?.id}&carregar_clausulas_garantias=false`) ||
        (item === 'regrasClausula' &&
          `${BASEURLGAJI9}/v1/minutas/regras?minuta_id=${params?.minutaId}&clausula_id=${params?.clausulaId}`) ||
        '';
      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });
        const response = await axios.post(apiUrl, dados, options);
        if (item === 'regrasClausula') {
          const info = response.data?.objeto?.clausulas?.find(({ clausula_id: cid }) => cid === params?.clausulaId);
          dispatch(getSuccess({ item: 'infoCaixa', dados: info || null }));
          dispatch(getSuccess({ item: 'minuta', dados: response.data?.objeto || null }));
        } else if (params?.getItem) dispatch(getSuccess({ item: params?.getItem, dados: response.data?.objeto }));
        else if (params?.getList) dispatch(getFromGaji9(item, { id: params?.id }));
        else if (item === 'clonarMinuta' || item === 'Versionar' || item === 'minutas')
          dispatch(getSuccess({ item: 'minutaId', dados: response.data?.objeto?.id }));
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
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const options = headerOptions({ accessToken, mail: '', cc: true, ct: true, mfd: false });
      const apiUrl =
        (item === 'variaveis' && `${BASEURLGAJI9}/v1/variaveis`) ||
        (item === 'componentes' && `${BASEURLGAJI9}/v1/produtos/rotular`) ||
        (item === 'prg' && `${BASEURLGAJI9}/v1/acs/grupos/remover/recurso`) ||
        (item === 'minutas' && `${BASEURLGAJI9}/v1/minutas?id=${params?.id}`) ||
        (item === 'funcoes' && `${BASEURLGAJI9}/v1/acs/roles?id=${params?.id}`) ||
        (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
        (item === 'freguesias' && `${BASEURLGAJI9}/v1/divisoes?id=${params?.id}`) ||
        (item === 'marcadores' && `${BASEURLGAJI9}/v1/marcadores?id=${params?.id}`) ||
        (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'Revogar' && `${BASEURLGAJI9}/v1/minutas/revogar?id=${params?.id}`) ||
        (item === 'Publicar' && `${BASEURLGAJI9}/v1/minutas/publicar?id=${params?.id}`) ||
        (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'tiposTitulares' && `${BASEURLGAJI9}/v1/tipos_titulares?id=${params?.id}`) ||
        (item === 'tiposGarantias' && `${BASEURLGAJI9}/v1/tipos_garantias?id=${params?.id}`) ||
        (item === 'infoCaixa' && `${BASEURLGAJI9}/v1/suportes/instituicao?id=${params?.id}`) ||
        (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos?credito_id=${params?.id}`) ||
        (item === 'Versionar' && `${BASEURLGAJI9}/v1/minutas/versionar?minuta_id=${params?.id}`) ||
        (item === 'colaboradorGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
        (item === 'recursosGrupo' && `${BASEURLGAJI9}/v1/acs/grupos/update/recurso?id=${params?.id}`) ||
        (item === 'utilizadoresGrupo' && `${BASEURLGAJI9}/v1/acs/utilizadores/grupo?id=${params?.id}`) ||
        (item === 'datas contrato' && `${BASEURLGAJI9}/v1/contratos/entrega?codigo=${params?.codigo}`) ||
        (item === 'representantes' && `${BASEURLGAJI9}/v1/acs/representantes/atualizar?id=${params?.id}`) ||
        (item === 'removeGarant' && `${BASEURLGAJI9}/v1/minutas/remover/tipos_garantias?id=${params?.id}`) ||
        (item === 'garantiasMinuta' && `${BASEURLGAJI9}/v1/minutas/adicionar/tipos_garantias?id=${params?.id}`) ||
        (item === 'coposicaoMinuta' && `${BASEURLGAJI9}/v1/minutas/atualizar/composicao?minuta_id=${params?.id}`) ||
        (item === 'clausulaMinuta' &&
          `${BASEURLGAJI9}/v1/minutas/atualizar/clausula?minuta_id=${params?.minutaId}&clausula_id=${params?.id}`) ||
        '';

      if (apiUrl) {
        if (params?.patch) {
          if (item === 'datas contrato') {
            if (dados?.data_entrega) await axios.patch(apiUrl, dados.data_entrega, options);
            if (dados?.data_recebido)
              await axios.patch(
                `${BASEURLGAJI9}/v1/contratos/recebido?codigo=${params?.codigo}`,
                dados.data_recebido,
                options
              );
            await dispatch(getFromGaji9('contratos', { id: params?.creditoId }));
          } else {
            const response = await axios.patch(apiUrl, dados, options);
            dispatch(slice.actions.getSuccess({ item: 'selectedItem', dados: null }));
            dispatch(slice.actions.getSuccess({ item: params?.getItem || item, dados: response.data?.objeto || null }));
          }
        } else {
          const response = await axios.put(apiUrl, dados, options);
          if (item === 'prg') dispatch(getFromGaji9('grupo', { id: params?.grupoId }));
          else if (params?.getItem) dispatch(getSuccess({ item: params?.getItem, dados: response.data?.objeto }));
          else if (item === 'Versionar') dispatch(getSuccess({ item: 'minutaId', dados: response.data?.objeto?.id }));
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
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteItem(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: true }));

    try {
      const accessToken = await getAccessToken();
      const apiUrl =
        (item === 'clausulas' && `${BASEURLGAJI9}/v1/clausulas?id=${params?.id}`) ||
        (item === 'grupos' && `${BASEURLGAJI9}/v1/acs/grupos?grupo_id=${params?.id}`) ||
        (item === 'recursos' && `${BASEURLGAJI9}/v1/acs/recursos?recurso_id=${params?.id}`) ||
        (item === 'credito' && `${BASEURLGAJI9}/v1/suportes/creditos/proposta?credito_id=${params?.id}`) ||
        (item === 'clausulaMinuta' && `${BASEURLGAJI9}/v1/minutas/${params?.id}/clausulas/${params?.clausulaId}`) ||
        (item === 'componentesMinuta' &&
          `${BASEURLGAJI9}/v1/minutas/${params?.id}/componentes_compativeis/${params?.componenteId}`) ||
        (item === 'contratos' &&
          `${BASEURLGAJI9}/v1/contratos/credito?credito_id=${params?.creditoId}&contrato_id=${params?.id}`) ||
        (item === 'intervenientes' &&
          `${BASEURLGAJI9}/v1/suportes/creditos/intervenientes?credito_id=${params?.id}&participante_id=${params?.numero}`) ||
        (item === 'eliminarRegra' &&
          `${BASEURLGAJI9}/v1/minutas/regras?minuta_id=${params?.minutaId}&clausula_id=${params?.clausulaId}&clausula_condicional_id=${params?.condicionalId}`) ||
        '';

      if (apiUrl) {
        const options = headerOptions({ accessToken, mail: '', cc: true, ct: false, mfd: false });
        const response = await axios.delete(apiUrl, options);
        if (item === 'contratos') dispatch(slice.actions.setContratado(false));
        if (item === 'eliminarRegra') {
          const info = response.data?.objeto?.clausulas?.find(({ clausula_id: cid }) => cid === params?.clausulaId);
          dispatch(getSuccess({ item: 'infoCaixa', dados: info || null }));
          dispatch(getSuccess({ item: 'minuta', dados: response.data?.objeto || null }));
        } else if (params?.getItem) dispatch(getSuccess({ item: params?.getItem, dados: response.data?.objeto }));
        else dispatch(slice.actions.deleteSuccess({ item, item1: params?.item1 || '', id: params?.id }));
      }
      params?.onClose?.();
      doneSucess(params?.msg, dispatch, slice.actions.getSuccess);
    } catch (error) {
      hasError(error, dispatch, slice.actions.getSuccess);
    } finally {
      dispatch(slice.actions.getSuccess({ item: 'isSaving', dados: false }));
    }
  };
}
