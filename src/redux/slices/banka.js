import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
import { BASEURLDD } from '../../utils/axios';
import { errorMsg } from '../../utils/formatText';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  isSaving: false,
  isLoading: false,
  isOpenModal: false,
  dadosComValores: false,
  numEntidade: '',
  numProposta: '',
  contratos: [],
  contrato: null,
  entidade: null,
  selectItem: null,
  infoContrato: {
    dadosGerente: {
      nome: 'IVANDRO PINTO FORTES ÉVORA',
      estadocivil: 'SOLTEIRO',
      regimecasamento: '',
      conjuge: '',
      freguesia: 'SANTO ANDRÉ - PORTO NOVO',
      tipoidentificacao: 'CARTÃO NACIONAL DE IDENTIFICAÇÃO',
      docidentificao: '19941115M001G',
      localemissaodocident: 'PRAIA',
      dataemissaodocident: '01-01-2022',
      nif: '138545189',
      morada: 'PRAIA - PALMAREJO',
    },
    dadosCliente: {
      nome: 'BRYAN FRIERE FORTES',
      estadocivil: 'SOLTEIRO',
      regimecasamento: '',
      conjuge: '',
      freguesia: 'NOSSA SEHORA DA GRAÇA - PRAIA',
      tipoidentificacao: 'CARTÃO NACIONAL DE IDENTIFICAÇÃO',
      docidentificao: '20210423M001G',
      localemissaodocident: 'PRAIA',
      dataemissaodocident: '09-11-2023',
      nif: '135468445',
      morada: 'PRAIA - PALMAREJO',
      email: 'bryan.fortes@gmail.com',
    },
    fiadores: [
      {
        nome: 'JOEL FRIERE FORTES',
        estadocivil: 'CASADO',
        regimecasamento: 'COMUNHÃO DE BENS',
        conjuge: 'CIBEL LEIDA FREIRE FORTES',
        freguesia: 'NOSSA SEHORA DA GRAÇA - PRAIA',
        tipoidentificacao: 'CARTÃO NACIONAL DE IDENTIFICAÇÃO',
        docidentificao: '20230924M001G',
        localemissaodocident: 'PRAIA',
        dataemissaodocident: '15-04-2024',
        nif: '135468445',
        morada: 'PRAIA - PALMAREJO',
        email: 'joel.fortes@gmail.com',
      },
      {
        nome: 'ALICE HELENA MONTEIRO CARDOSO',
        estadocivil: 'SOLTEIRA',
        regimecasamento: '',
        conjuge: '',
        freguesia: 'NOSSA SEHORA DA GRAÇA - PRAIA',
        tipoidentificacao: 'CARTÃO NACIONAL DE IDENTIFICAÇÃO',
        docidentificao: '20181123F001G',
        localemissaodocident: 'PRAIA',
        dataemissaodocident: '10-12-2021',
        nif: '135468445',
        morada: 'PRAIA - PALMAREJO',
        email: 'alice.helena@gmail.com',
      },
    ],
    valor_solicitado: '500.000,00 CVE',
    valor_solicitado_extenso: 'Quinhentos mil escudos',
    meses_vencimento: '3',
    prazo_reembolso: '36',
    prazo_reembolso_por_extenso: 'Trinta e Seis',
    taxa: '2.5',
    taxa_por_extenso: 'Dois vírgula Cinco',
    taxa_desconto: '',
    taxa_com_desconto: '',
    taxa_desconto_por_extenso: '',
    taeg: '12.236',
    taeg_por_extenso: 'Doze vírgula Duzentos e Trinta e Seis',
    total_despesas: '24.811,00 CVE',
    total_despesas_por_extenso: 'Vinte e Quatro Mil, Oitocentos e Onze Escudos',
    juros: '21.739.00 CVE',
    imposto_fiscal: '1.322.00 CVE',
    comissoes_iniciais: '1.750,00 CVE',
    conta_credito: '3929767210001',
    conta_debito: '3929767210001',
    comissao_abertura: '1.75',
    comissao_abertura_por_extenso: 'Um vírgula Setenta e Cinco',
    data_vencimento_prestacao: '30-06-2024',
    renda: '2.536,00 CVE',
    renda_por_extenso: 'Dois mil, Quinhentos e Trinta e Seis Escudos',
    data_emissao_documento: '15-06-2024',
    imposto_selo_utilizacao: 'incide sobre o capital utilizado',
  },
};

const slice = createSlice({
  name: 'banka',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    startSaving(state) {
      state.isSaving = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    setDone(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.done = action.payload;
    },

    setError(state, action) {
      state.isSaving = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    resetItem(state, action) {
      switch (action.payload) {
        case 'entidade':
          state.entidade = null;
          break;
        case 'infoContrato':
          // state.infoContrato = null;
          break;

        default:
          break;
      }
    },

    changeNumEntidade(state, action) {
      state.numEntidade = action.payload;
    },

    changeNumProposta(state, action) {
      state.numProposta = action.payload;
    },

    changeDadosView(state, action) {
      state.dadosComValores = action.payload;
    },

    getentidadeSuccess(state, action) {
      state.entidade = action.payload;
    },

    getContratoSuccess(state, action) {
      state.contrato = action.payload;
    },

    openModal(state) {
      state.isOpenModal = true;
    },

    selectItem(state, action) {
      state.selectedItem = action.payload;
    },

    closeModal(state) {
      state.isOpenModal = false;
      state.selectedItem = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openModal, selectItem, closeModal, changeNumEntidade, changeNumProposta, changeDadosView } =
  slice.actions;

// ----------------------------------------------------------------------

export function getFromBanka(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'entidade': {
          dispatch(slice.actions.resetItem('entidade'));
          const response = await axios.get(
            `http://172.17.8.78:9900/api/v1/banka/consultar/entidade/${params?.perfilId}?entidade=${params?.numEntidade}`,
            options
          );
          dispatch(slice.actions.getentidadeSuccess(response.data.objeto));
          break;
        }
        case 'contratos': {
          dispatch(slice.actions.resetItem('infoContrato'));
          const response = await fetch('/assets/contratos.json');
          const data = await response.json();
          dispatch(
            slice.actions.getContratoSuccess(
              data?.find((row) => row?.tipo === params?.tipo && row?.modelo === params?.modelo)
            )
          );
          break;
        }

        default:
          break;
      }
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

export function createItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      switch (item) {
        case 'acesso': {
          const response = await axios.post(`${BASEURLDD}/v1/acessos`, dados, options);
          dispatch(slice.actions.createAcessoSuccess(response.data));
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

export function updateItem(item, dados, params) {
  return async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const options = { headers: { 'content-type': 'application/json', cc: params?.mail } };
      switch (item) {
        case 'acesso': {
          const response = await axios.put(`${BASEURLDD}/v1/acessos/${params?.id}`, dados, options);
          dispatch(slice.actions.updateAcessoSuccess(response.data));
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
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
        case 'acesso': {
          await axios.delete(`${BASEURLDD}/v1/acessos/${params?.perfilId}/${params?.id}`, options);
          dispatch(slice.actions.deleteAcessoSuccess({ id: params?.id }));
          break;
        }

        default:
          break;
      }
      doneSucess(params?.msg, dispatch);
    } catch (error) {
      hasError(error, dispatch);
    }
  };
}

// ----------------------------------------------------------------------

async function doneSucess(msg, dispatch) {
  if (msg) {
    dispatch(slice.actions.setDone(msg));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setDone(''));
}

async function hasError(error, dispatch) {
  dispatch(slice.actions.setError(errorMsg(error)));
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch(slice.actions.setError(''));
}
