import { listaFreguesias } from '../../../../../_mock/_others';

// ---------------------------------------------------------------------------------------------------------------------

export const seguroSchema = {
  tipo: null,
  seguradora: null,
  valor: '',
  premio: '',
  apolice: '',
  periodicidade: '',
  percentagem_cobertura: '',
};

// ---------------------------------------------------------------------------------------------------------------------

export const tituloSchema = {
  valor_titulo: '',
  tipo_titulo: null,
  numero_cliente: '',
  numero_titulos: '',
  percentagem_cobertura: '',
  nome_entidade_emissora: '',
  nome_instituicao_registo: '',
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const imovelSchema = {
  zona: '',
  rua: '',
  descritivo: '',
  numero_porta: '',
  nip: '',
  area: '',
  valor_pvt: '',
  numero_andar: '',
  numero_matriz: '',
  matriz_predial: '',
  identificacao_fracao: '',
  percentagem_cobertura: '',
  numero_descricao_predial: '',
  freguesia: null,
  tipo_matriz: null,
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const veiculoSchema = {
  nura: '',
  marca: '',
  valor: '',
  modelo: '',
  valor_pvt: '',
  matricula: '',
  ano_fabrico: '',
  percentagem_cobertura: '',
  donos: [],
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export function construirSchemaImoveis(dados = []) {
  const seguros = (rows) =>
    rows?.map((row) => ({ ...row, tipo: { id: row?.tipo_seguro_id, label: row?.tipo_seguro } }));

  return dados?.map((row) => {
    const freg = listaFreguesias?.find(
      ({ ilha, freguesia }) => ilha === row?.morada?.ilha && freguesia === row?.morada?.freguesia
    );

    return {
      ...row,
      ...(row?.morada
        ? {
            rua: row?.morada?.rua ?? '',
            zona: row?.morada?.zona ?? '',
            descritivo: row?.morada?.descritivo ?? '',
            numero_porta: row?.morada?.numero_porta ?? '',
            freguesia: freg ? { ...freg, label: freg.freguesia } : null,
          }
        : null),
      seguros: Array.isArray(row?.seguros) ? seguros(row.seguros) : [],
      donos: Array.isArray(row?.donos)
        ? row.donos.map((d) => ({ numero_entidade: d.numero ?? d.numero_entidade ?? '' }))
        : [],
    };
  });
}
