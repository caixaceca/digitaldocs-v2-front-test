import { add } from 'date-fns';
// utils
import { ptDate, getIdade } from '@/utils/formatTime';
import { getComparator, applySort } from '@/hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function calcRendimento(dados, bruto) {
  if (!dados) return 0;
  const conjuge = !!dados?.conjuge;

  const renda = bruto
    ? [dados.renda_bruto_mensal, conjuge ? dados.renda_bruto_mensal_conjuge : 0]
    : [dados.renda_liquido_mensal, conjuge ? dados.renda_liquido_mensal_conjuge : 0];

  return renda.reduce((sum, val) => sum + Number(val || 0), 0);
}

export function totalDespesas(dados) {
  return dados?.reduce((total, item) => total + Number(item?.valor), 0);
}

// --------- DSTI ------------------------------------------------------------------------------------------------------

export function calcValorPrestacao(dados) {
  if (!dados?.montante || !dados?.taxa || !dados?.prazo) return 0;

  const { taxa, montante, prazo, taxa_equivalente = false } = dados;
  const taxaAplicado = taxa_equivalente ? (1 + taxa / 100) ** (1 / 12) - 1 : taxa / 100 / 12;
  const prestacao = (montante * taxaAplicado) / (1 - (1 / (1 + taxaAplicado)) ** prazo);

  return Number(prestacao.toFixed(0));
}

export function prestacaoDividas(dados = []) {
  return dados?.reduce((total, item) => total + Math.abs(Number(item.valor_prestacao)), 0);
}

export function totalPrestacao(dados) {
  const prestacaoCaixa = prestacaoDividas(dados?.divEf || dados?.dividas || []);
  const prestacaoExterna = prestacaoDividas(dados?.dividasExternas);

  return Number(dados?.valorPrestacao) + Number(prestacaoCaixa) + Number(prestacaoExterna);
}

// --------- RESPONSABILIDADES -----------------------------------------------------------------------------------------

export const responsabilidadesInfo = (dados) =>
  (dados || []).reduce(
    (acc, item) => {
      acc.valor += Math.abs(item.valor);
      acc.saldo_divida += Math.abs(item.saldo_divida);
      acc.valor_prestacao += Math.abs(item.valor_prestacao);
      return acc;
    },
    { totais: true, valor: 0, saldo_divida: 0, valor_prestacao: 0 }
  );

export function dividasConsolidadas(dados, solicitado, prestacao) {
  const caixa = responsabilidadesInfo(dados?.divEf || dados?.dividas || []);
  const externas = responsabilidadesInfo(dados?.dividasExternas || dados?.dividas_externas);

  return {
    valor: caixa?.valor + externas.valor + Number(solicitado || 0),
    saldo_divida: caixa?.saldo_divida + externas.saldo_divida + Number(solicitado || 0),
    valor_prestacao: caixa?.valor_prestacao + externas.valor_prestacao + Number(prestacao || 0),
  };
}

// --------- DSTI ------------------------------------------------------------------------------------------------------

export function limiteDsti(rendimento) {
  return rendimento ? calcRendimento(rendimento) * 0.5 : '';
}

export function percentagemDsti(dados) {
  if (!dados) return '';
  const rendimento = calcRendimento(dados?.rendimento);
  return (rendimento > 0 && (totalPrestacao(dados) / rendimento) * 100) || 0;
}

export function dstiDisponivel(dados) {
  const limite = limiteDsti(dados?.rendimento);
  const prestacaoExterna = prestacaoDividas(dados?.dividasExternas);
  const prestacaoCaixa = prestacaoDividas(dados?.divEf || dados?.dividas || []);

  return limite - (prestacaoCaixa + prestacaoExterna);
}

export function dstiAposContratacao(dados) {
  return dados ? dstiDisponivel(dados) - dados?.valorPrestacao : '';
}

// --------- DSTI CORRIGIDO --------------------------------------------------------------------------------------------

export function dstiCorrigido(dados) {
  if (!dados) return '';
  const rendimento = calcRendimento(dados?.rendimento);
  return (rendimento > 0 && ((totalPrestacao(dados) + totalDespesas(dados?.despesas)) / rendimento) * 100) || 0;
}

export function limiteDstiCorrigido(dados) {
  if (!dados) return '';
  const rendimento = calcRendimento(dados?.rendimento);
  return (rendimento > 0 && limiteDsti(dados?.rendimento) + rendimento * 0.2) || 0;
}

// ---------------------------------------------------------------------------------------------------------------------

export function extractClientes(data) {
  const totaisPorMoedaMap = new Map();

  const inicial = {
    saldos: [],
    titulos: [],
    dividas: [],
    clientes: [],
    restruturacoes: [],
    irregularidades: [],
    garantiasPrestadas: [],
    garantiasRecebidas: [],
  };

  const resultado = data.reduce((acc, cliente) => {
    // Clientes
    acc.clientes.push({
      balcao: cliente?.balcao,
      cliente: cliente?.cliente,
      relacao: cliente?.relacao,
      titular: cliente?.titular,
      titularidade: cliente?.titularidade,
      data_abertura: cliente?.data_abertura,
    });

    (cliente.saldos || []).forEach((s) => {
      acc.saldos.push(s);
      const valor = Number(s.saldo) || 0;
      totaisPorMoedaMap.set(s.moeda, (totaisPorMoedaMap.get(s.moeda) || 0) + valor);
    });

    // Títulos
    if (cliente.titulos) acc.titulos.push(...cliente.titulos);

    // Responsabilidades
    (cliente.responsabilidades || []).forEach((resp) => {
      if (resp?.classe === 'Garantias Prestadas') acc.garantiasPrestadas.push(resp);
      else if (resp?.classe === 'Garantias Recebidas') acc.garantiasRecebidas.push(resp);
      else {
        acc.dividas.push(resp);
        if (resp?.maior_irregularidade && resp?.maior_irregularidade !== resp?.situacao) acc.irregularidades.push(resp);
      }
    });

    // Restruturações
    if (cliente.com_historico_restruturacao) {
      acc.restruturacoes.push({ cliente: cliente?.cliente, data: cliente?.data_referencia_restruturacao });
    }

    return acc;
  }, inicial);

  const totalSaldoPorMoeda = Array.from(totaisPorMoedaMap, ([moeda, saldo]) => ({ moeda, saldo, totais: true }));
  return { ...resultado, totalSaldoPorMoeda, clientes: applySort(resultado.clientes, getComparator('asc', 'relacao')) };
}

// ---------------------------------------------------------------------------------------------------------------------

export function movimentosConta(movimentos) {
  const movimentosDebito = [];
  const movimentosCredito = [];
  const totaisDebitoConta = new Map();
  const totaisCreditoConta = new Map();

  const extrairValor = (val) => {
    if (typeof val === 'object' && val !== null) return Number(val.parsedValue) || 0;
    return Number(val) || 0;
  };

  movimentos.forEach((row) => {
    const valorNumerico = extrairValor(row?.valor);
    const rowProcessada = { ...row, valor: valorNumerico };

    if (valorNumerico > 0) {
      movimentosCredito.push(rowProcessada);
      const totalAtual = totaisCreditoConta.get(row.conta) || 0;
      totaisCreditoConta.set(row.conta, totalAtual + valorNumerico);
    } else {
      movimentosDebito.push(rowProcessada);
      const totalAtual = totaisDebitoConta.get(row.conta) || 0;
      totaisDebitoConta.set(row.conta, totalAtual + valorNumerico);
    }
  });

  const totaisDebConta = Array.from(totaisDebitoConta.entries()).map(([conta, valor]) => ({ conta, valor }));
  const totaisCredConta = Array.from(totaisCreditoConta.entries()).map(([conta, valor]) => ({ conta, valor }));

  return { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta };
}

// ---------------------------------------------------------------------------------------------------------------------

export function idadeReforma(sexo) {
  if (!sexo) return 65; // default
  return sexo.toLowerCase().startsWith('f') ? 60 : 65;
}

export function idadeCliente(dataNascimento) {
  if (!dataNascimento) return 0;

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiff = hoje.getMonth() - nascimento.getMonth();

  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
}

// ---------------------------------------------------------------------------------------------------------------------

export function docInfo(doc, tipo) {
  return doc ? `${tipo ? `${tipo} - ` : ''}${doc}` : '';
}

export function colorDoc(data, ficha) {
  return (
    (new Date(data) < new Date() && '#FF4842') ||
    (new Date(data) < add(new Date(), { months: 1 }) && '#ff9800') ||
    (ficha && '#444') ||
    ''
  );
}

export function dataNascimento(data) {
  return data ? `${ptDate(data)} - ${getIdade(data, new Date())}` : '';
}

export function estadoCivil(estado, regime) {
  return estado ? `${estado}${regime ? ` - ${regime}` : ''}` : '';
}
