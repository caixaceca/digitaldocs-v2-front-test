export default function composeGarantiaPayload(form, chaveMeta) {
  const metadados = chaveMeta && metaBuilders[chaveMeta] ? metaBuilders[chaveMeta](form) : {};

  return {
    tipo_garantia_id: form?.tipo_garantia?.id ?? null,
    subtipo_garantia_id: form?.subtipo_garantia?.id ?? null,
    percentagem_cobertura: String(form?.percentagem_cobertura ?? ''),
    metadados,
  };
}

const metaBuilders = {
  fiadores: (form) => ({ fiadores: (form?.fiadores ?? []).map(mapFiador) }),
  livrancas: (form) => ({ livrancas: (form?.livrancas ?? []).map(mapLivranca) }),
  seguros: (form) => ({ seguros: (form?.seguros ?? []).map(mapSeguro) }),
  contas: (form) => ({ contas: (form?.contas ?? []).map(mapContas) }),
  titulos: (form) => ({ titulos: (form?.titulos ?? []).map(mapTitulo) }),
  predios: (form) => ({ imoveis: { predios: (form?.predios ?? []).map(mapPredio) } }),
  terrenos: (form) => ({ imoveis: { terrenos: (form?.terrenos ?? []).map(mapTerreno) } }),
  veiculos: (form) => ({ imoveis: { veiculos: (form?.veiculos ?? []).map(mapVeiculo) } }),
  apartamentos: (form) => ({ imoveis: { apartamentos: (form?.apartamentos ?? []).map(mapApartamento) } }),
};

// Mapeadores principais -----------------------------------------------------------------------------------------------

function mapFiador(fiador) {
  return { numero_entidade: fiador?.numero_entidade ?? '' };
}

function mapLivranca(livranca) {
  return { numero_livranca: livranca?.numero_livranca ?? '' };
}

function mapSeguro(seguro) {
  return {
    apolice: seguro?.apolice ?? '',
    valor: String(seguro?.valor ?? ''),
    seguradora: seguro?.seguradora ?? '',
    premio: String(seguro?.premio ?? ''),
    tipo_seguro_id: seguro?.tipo?.id ?? null,
    periodicidade: seguro?.periodicidade ?? '',
    percentagem_cobertura: String(seguro?.percentagem_cobertura ?? ''),
  };
}

function mapContas(contas) {
  return {
    numero_conta: contas?.numero_conta ?? '',
    percentagem_cobertura: String(contas?.percentagem_cobertura ?? ''),
  };
}

// Veículos ------------------------------------------------------------------------------------------------------------

function mapVeiculo(veiculo) {
  return {
    nura: veiculo?.nura,
    marca: veiculo?.marca,
    modelo: veiculo?.modelo,
    matricula: veiculo?.matricula,
    valor: String(veiculo?.valor ?? ''),
    ano_fabrico: String(veiculo?.ano_fabrico),
    valor_pvt: String(veiculo?.valor_pvt ?? ''),
    donos: (veiculo?.donos ?? []).map(mapDono),
    seguros: (veiculo?.seguros ?? []).map(mapSeguro),
    percentagem_cobertura: String(veiculo?.percentagem_cobertura ?? ''),
  };
}

// Imóveis -------------------------------------------------------------------------------------------------------------

function mapPredio(predio) {
  return {
    nip: predio?.nip ?? '',
    tipo_matriz: predio?.tipo_matriz ?? '',
    valor_pvt: String(predio?.valor_pvt ?? ''),
    numero_matriz: predio?.numero_matriz ?? '',
    numero_descricao_predial: predio?.numero_descricao_predial ?? '',
    percentagem_cobertura: String(predio?.percentagem_cobertura ?? ''),
    morada: mapMorada(predio),
    donos: (predio?.donos ?? []).map(mapDono),
    seguros: (predio?.seguros ?? []).map(mapSeguro),
  };
}

function mapApartamento(ap) {
  return {
    nip: ap?.nip ?? '',
    tipo_matriz: ap?.tipo_matriz ?? '',
    numero_andar: ap?.numero_andar ?? '',
    valor_pvt: String(ap?.valor_pvt ?? ''),
    matriz_predial: ap?.matriz_predial ?? '',
    identificacao_fracao: ap?.identificacao_fracao ?? '',
    numero_descricao_predial: ap?.numero_descricao_predial ?? '',
    percentagem_cobertura: String(ap?.percentagem_cobertura ?? ''),
    morada: mapMorada(ap),
    seguros: (ap?.seguros ?? []).map(mapSeguro),
    donos: (ap?.donos ?? []).map(mapDono),
  };
}

function mapTerreno(terreno) {
  return {
    nip: terreno?.nip ?? '',
    area: terreno?.area ?? '',
    tipo_matriz: terreno?.tipo_matriz ?? '',
    numero_matriz: terreno?.numero_matriz ?? '',
    valor_pvt: String(terreno?.valor_pvt ?? ''),
    numero_descricao_predial: terreno?.numero_descricao_predial ?? '',
    percentagem_cobertura: String(terreno?.percentagem_cobertura ?? ''),
    morada: mapMorada(terreno),
    donos: (terreno?.donos ?? []).map(mapDono),
    seguros: (terreno?.seguros ?? []).map(mapSeguro),
  };
}

// Títulos -------------------------------------------------------------------------------------------------------------

function mapTitulo(titulo) {
  return {
    codigo: titulo?.codigo ?? '',
    numero_cliente: titulo?.numero_cliente ?? '',
    percentagem_cobertura: String(titulo?.percentagem_cobertura ?? ''),
    seguros: (titulo?.seguros ?? []).map(mapSeguro),
  };
}

// Utilitários ---------------------------------------------------------------------------------------------------------

function mapMorada(morada) {
  return {
    rua: morada?.rua ?? '',
    zona: morada?.zona ?? '',
    ilha: morada?.freguesia?.ilha ?? '',
    descritivo: morada?.descritivo ?? '',
    numero_porta: morada?.numero_porta ?? '',
    concelho: morada?.freguesia?.concelho ?? '',
    freguesia: morada?.freguesia?.freguesia ?? '',
  };
}

function mapDono(dono) {
  return { numero: dono?.numero_entidade ?? '' };
}
