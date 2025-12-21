export default function composeGarantiaPayload(form) {
  return {
    valor_garantia: String(form?.valor ?? ''),
    tipo_garantia_id: form?.tipo_garantia?.id ?? null,
    percentagem_cobertura: String(form?.cobertura ?? ''),
    subtipo_garantia_id: form?.subtipo_garantia?.id ?? null,

    metadados: {
      fiadores: (form?.fiadores ?? []).map(mapFiador),
      livrancas: (form?.livrancas ?? []).map(mapLivranca),
      seguros: (form?.seguros ?? []).map(mapSeguro),
      contas: (form?.dps ?? []).map(mapContas),

      imoveis: [
        {
          predios: (form?.predios ?? []).map(mapPredio),
          terrenos: (form?.terrenos ?? []).map(mapTerreno),
          veiculos: (form?.veiculos ?? []).map(mapVeiculo),
          apartamentos: (form?.apartamentos ?? []).map(mapApartamento),
        },
      ],

      titulos: (form?.titulos ?? []).map(mapTitulo),
    },
  };
}

// Mapeadores principais ---------------------------------------------------------------------------------------------------------------------

function mapFiador(fiador) {
  return { numero_entidade: fiador?.numero ?? '', nome_entidade: fiador?.nome ?? '' };
}

function mapLivranca(livranca) {
  return { numero_livranca: livranca?.numero ?? '' };
}

function mapSeguro(seguro) {
  return {
    apolice: seguro?.apolice ?? '',
    valor: String(seguro?.valor ?? ''),
    seguradora: seguro?.seguradora ?? '',
    premio: String(seguro?.premio ?? ''),
    tipo_seguro: seguro?.tipo?.label ?? '',
    tipo_seguro_id: seguro?.tipo?.id ?? null,
    periodicidade: seguro?.periodicidade ?? '',
    percentagem_cobertura: String(seguro?.cobertura ?? ''),
  };
}

function mapContas(dps) {
  return {
    saldo: '',
    moeda: '',
    prazo: null,
    balcao: null,
    data_inicio: '',
    data_vencimento: '',
    data_constituicao: '',
    numero_conta: dps?.numero ?? '',
    percentagem_cobertura: String(dps?.cobertura ?? ''),
    donos: [],
  };
}

// Veículos ---------------------------------------------------------------------------------------------------------------------

function mapVeiculo(veiculo) {
  return {
    nura: veiculo?.nura,
    marca: veiculo?.marca,
    modelo: veiculo?.modelo,
    matricula: veiculo?.matricula,
    valor: String(veiculo?.valor ?? ''),
    valor_pvt: String(veiculo?.pvt ?? ''),
    ano_fabrico: String(veiculo?.ano_fabrico),
    percentagem_cobertura: String(veiculo?.cobertura ?? ''),
    seguros: (veiculo?.seguros ?? []).map(mapSeguro),
    donos: (veiculo?.donos ?? []).map(mapDono),
  };
}

// Imóveis ---------------------------------------------------------------------------------------------------------------------

function mapPredio(predio) {
  return {
    nip: predio?.nip ?? '',
    valor_pvt: String(predio?.pvt ?? ''),
    tipo_matriz: predio?.tipo_matriz ?? '',
    numero_matriz: predio?.numero_matriz ?? '',
    numero_descricao_predial: predio?.predial ?? '',
    percentagem_cobertura: String(predio?.cobertura ?? ''),
    morada: mapMorada(predio),
    seguros: (predio?.seguros ?? []).map(mapSeguro),
    donos: (predio?.donos ?? []).map(mapDono),
  };
}

function mapApartamento(ap) {
  return {
    nip: ap?.nip ?? '',
    tipo_matriz: ap?.tipo_matriz ?? '',
    numero_andar: ap?.numero_andar ?? '',
    identificacao_fracao: ap?.fracao ?? '',
    matriz_predial: ap?.matriz_predial ?? '',
    numero_descricao_predial: ap?.predial ?? '',
    percentagem_cobertura: String(ap?.cobertura ?? ''),
    valor_pvt: String(ap?.pvt ?? ''),
    morada: mapMorada(ap),
    seguros: (ap?.seguros ?? []).map(mapSeguro),
    donos: (ap?.donos ?? []).map(mapDono),
  };
}

function mapTerreno(terreno) {
  return {
    nip: terreno?.nip ?? '',
    area: terreno?.area ?? '',
    valor_pvt: String(terreno?.pvt ?? ''),
    tipo_matriz: terreno?.tipo_matriz ?? '',
    numero_matriz: terreno?.numero_matriz ?? '',
    numero_descricao_predial: terreno?.predial ?? '',
    percentagem_cobertura: String(terreno?.cobertura ?? ''),
    morada: mapMorada(terreno),
    seguros: (terreno?.seguros ?? []).map(mapSeguro),
    donos: (terreno?.donos ?? []).map(mapDono),
  };
}

// Títulos ---------------------------------------------------------------------------------------------------------------------

function mapTitulo(ttitulo) {
  return {
    tipo_titulo_id: 0,
    tipo_titulo: ttitulo?.tipo ?? '',
    numero_cliente: ttitulo?.cliente ?? '',
    valor_titulo: String(ttitulo?.valor ?? ''),
    nome_entidade_emissora: ttitulo?.emissora ?? '',
    nome_instituicao_registo: ttitulo?.registo ?? '',
    numero_titulos: String(ttitulo?.quantidade ?? ''),
    percentagem_cobertura: String(ttitulo?.cobertura ?? ''),
    seguros: (ttitulo?.seguros ?? []).map(mapSeguro),
    donos: [],
  };
}

// Utilitários ---------------------------------------------------------------------------------------------------------------------

function mapMorada(morada) {
  return {
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    numero_porta: morada?.porta ?? '',
    ilha: morada?.freguesia?.ilha ?? '',
    descritivo: morada?.descritivo ?? '',
    concelho: morada?.freguesia?.concelho ?? '',
    freguesia: morada?.freguesia?.freguesia ?? '',
  };
}

function mapDono(dono) {
  return { numero: dono?.numero ?? '', nome: dono?.nome ?? '' };
}
