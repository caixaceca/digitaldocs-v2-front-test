import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';
// utils
// hooks
import { actionGet, actionReset, hasError, actionResponseMsg } from './sliceActions';

// ----------------------------------------------------------------------

const initialState = {
  done: '',
  error: '',
  isLoading: false,
  dadosComValores: false,
  numEntidade: '',
  numProposta: '',
  contrato: null,
  entidade: null,
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
    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    responseMsg(state, action) {
      actionResponseMsg(state, action.payload);
    },

    getSuccess(state, action) {
      actionGet(state, action.payload);
    },

    resetItem(state, action) {
      actionReset(state, action.payload);
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getFromBanka(item, params) {
  return async (dispatch) => {
    dispatch(slice.actions.setLoading(true));
    try {
      const options = { headers: { cc: params?.mail } };
      switch (item) {
        case 'entidade': {
          dispatch(slice.actions.resetItem({ item }));
          const response = await axios.get(
            `http://172.17.8.78:9900/api/v1/banka/consultar/entidade/${params?.perfilId}?entidade=${params?.numEntidade}`,
            options
          );
          dispatch(slice.actions.getSuccess({ item: 'entidade', dados: response.data.objeto }));
          break;
        }
        case 'contrato': {
          const response = await fetch('/assets/contratos.json');
          const data = await response.json();
          dispatch(
            slice.actions.getSuccess({
              item: 'contrato',
              dados: data?.find((row) => row?.tipo === params?.tipo && row?.modelo === params?.modelo),
            })
          );
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
