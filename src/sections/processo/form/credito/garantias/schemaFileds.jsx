export const garantiaSchema = {
  valor: '',
  cobertura: '',
  tipo_garantia: null,
  subtipo_garantia: null,
  dps: [],
  predios: [],
  seguros: [],
  titulos: [],
  veiculos: [],
  terrenos: [],
  fiadores: [],
  livrancas: [],
  apartamentos: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const seguroSchema = {
  tipo: null,
  seguradora: null,
  valor: '',
  premio: '',
  apolice: '',
  cobertura: '',
  periodicidade: '',
};

// ---------------------------------------------------------------------------------------------------------------------

export const tituloSchema = {
  tipo: null,
  valor: '',
  registo: '',
  cliente: '',
  emissora: '',
  cobertura: '',
  quantidade: '',
  seguros: [],
};

// ---------------------------------------------------------------------------------------------------------------------

export const imovelSchema = {
  zona: '',
  rua: '',
  porta: '',
  descritivo: '',
  nip: '',
  pvt: '',
  area: '',
  fracao: '',
  predial: '',
  cobertura: '',
  numero_andar: '',
  numero_matriz: '',
  matriz_predial: '',
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
