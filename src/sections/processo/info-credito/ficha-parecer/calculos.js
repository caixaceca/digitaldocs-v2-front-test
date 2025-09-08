import extenso from 'extenso';
import { add } from 'date-fns';
// utils
import { ptDate, getIdade } from '../../../../utils/formatTime';
import { fCurrency, fShortenNumber, fPercent } from '../../../../utils/formatNumber';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function calcRendimento(rendimento, bruto) {
  if (!rendimento) return 0;

  const renda = bruto
    ? [rendimento.renda_bruto_mensal, rendimento.renda_bruto_mensal_conjuge]
    : [rendimento.renda_liquido_mensal, rendimento.renda_liquido_mensal_conjuge];

  return renda.reduce((sum, val) => sum + Number(val || 0), 0);
}

export function totalDespesas(dados) {
  return dados.reduce((total, item) => total + Number(item.valor), 0);
}

// --------- DSTI ------------------------------------------------------------------------------------------------------

export function calcValorPrestacao(dados) {
  if (!dados?.montante || !dados?.taxa || !dados?.prazo) return 0;

  const { componente, taxa, montante, prazo } = dados;
  const isHabitacao = componente?.toLowerCase()?.includes('habitação');

  const taxaAplicado = isHabitacao ? (1 + taxa / 100) ** (1 / 12) - 1 : taxa / 100 / 12;
  const prestacao = (montante * taxaAplicado) / (1 - (1 / (1 + taxaAplicado)) ** prazo);

  return Number(prestacao.toFixed(0));
}

export function prestacaoDividas(dados = []) {
  return dados?.reduce((total, item) => total + Math.abs(Number(item.valor_prestacao)), 0);
}

export function totalPrestacao(dados) {
  const prestacaoCaixa = prestacaoDividas(dados?.dividas);
  const prestacaoExterna = prestacaoDividas(dados?.dividasExternas);

  return Number(dados?.valorPrestacao) + Number(prestacaoCaixa) + Number(prestacaoExterna);
}

// --------- DSTI ------------------------------------------------------------------------------------------------------

export const responsabilidadesInfo = (responsabilidades) =>
  (responsabilidades || []).reduce(
    (acc, item) => {
      acc.valor += Math.abs(item.valor);
      acc.saldo_divida += Math.abs(item.saldo_divida);
      acc.valor_prestacao += Math.abs(item.valor_prestacao);
      return acc;
    },
    { totais: true, valor: 0, saldo_divida: 0, valor_prestacao: 0 }
  );

export function dividasConsolidadas(responsabilidade, solicitado, prestacao) {
  const caixa = responsabilidadesInfo(responsabilidade?.dividas);
  const externas = responsabilidadesInfo(responsabilidade?.dividasExternas);

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
  const rendimento = calcRendimento(dados?.rendimento);
  return (!dados && '') || (rendimento > 0 && (totalPrestacao(dados) / rendimento) * 100) || 0;
}

export function dstiDisponivel(dados) {
  const limite = limiteDsti(dados?.rendimento);
  const prestacaoCaixa = prestacaoDividas(dados?.dividas);
  const prestacaoExterna = prestacaoDividas(dados?.dividasExternas);

  return limite - (prestacaoCaixa + prestacaoExterna);
}

export function dstiAposContratacao(dados) {
  return dados ? dstiDisponivel(dados) - dados?.valorPrestacao : '';
}

// --------- DSTI CORRIGIDO --------------------------------------------------------------------------------------------

export function dstiCorrigido(dados) {
  const rendimento = calcRendimento(dados?.rendimento);
  return (
    (!dados && '') ||
    (rendimento > 0 && ((totalPrestacao(dados) + totalDespesas(dados?.despesas)) / rendimento) * 100) ||
    0
  );
}

export function limiteDstiCorrigido(dados) {
  const rendimento = calcRendimento(dados?.rendimento);
  return (!dados && '') || (rendimento > 0 && limiteDsti(dados?.rendimento) + rendimento * 0.2) || 0;
}

// ---------------------------------------------------------------------------------------------------------------------

export function extractClientes(data = []) {
  const totaisPorMoedaMap = new Map();

  const {
    saldos,
    titulos,
    dividas,
    clientes,
    restruturacoes,
    irregularidades,
    garantiasPrestadas,
    garantiasRecebidas,
  } = data.reduce(
    (acc, cliente) => {
      // clientes
      acc.clientes.push({
        balcao: cliente?.balcao,
        cliente: cliente?.cliente,
        relacao: cliente?.relacao,
        titular: cliente?.titular,
        titularidade: cliente?.titularidade,
        data_abertura: cliente?.data_abertura,
      });

      // saldos
      (cliente.saldos || []).forEach((saldo) => {
        acc.saldos.push(saldo);
        totaisPorMoedaMap.set(saldo.moeda, (totaisPorMoedaMap.get(saldo.moeda) || 0) + saldo.saldo);
      });

      // titulos
      (cliente.titulos || []).forEach((titulo) => acc.titulos.push(titulo));

      // responsabilidades
      (cliente.responsabilidades || []).forEach((resp) => {
        if (resp?.classe === 'Garantias Prestadas') acc.garantiasPrestadas.push(resp);
        else if (resp?.classe === 'Garantias Recebidas') acc.garantiasRecebidas.push(resp);
        else {
          acc.dividas.push(resp);
          if (resp?.maior_irregularidade && resp?.maior_irregularidade !== resp?.situacao) {
            acc.irregularidades.push(resp);
          }
        }
      });

      // restruturações
      if (cliente.com_historico_restruturacao) {
        acc.restruturacoes.push({ cliente: cliente?.cliente, data: cliente?.data_referencia_restruturacao });
      }

      return acc;
    },
    {
      saldos: [],
      titulos: [],
      dividas: [],
      clientes: [],
      restruturacoes: [],
      irregularidades: [],
      garantiasPrestadas: [],
      garantiasRecebidas: [],
    }
  );

  const totalSaldoPorMoeda = Array.from(totaisPorMoedaMap, ([moeda, saldo]) => ({ moeda, saldo, totais: true }));

  return {
    saldos,
    dividas,
    titulos,
    restruturacoes,
    irregularidades,
    garantiasPrestadas,
    garantiasRecebidas,
    totalSaldoPorMoeda,
    clientes: applySort(clientes, getComparator('asc', 'relacao')),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

export function movimentosConta(movimentos) {
  const movimentosDebito = [];
  const movimentosCredito = [];
  const totaisDebitoConta = new Map();
  const totaisCreditoConta = new Map();

  movimentos.forEach((row) => {
    if (row?.valor > 0) {
      movimentosCredito.push(row);
      const totalAtual = totaisCreditoConta.get(row?.conta) || 0;
      totaisCreditoConta.set(row.conta, totalAtual + row.valor);
    } else {
      movimentosDebito.push(row);
      const totalAtual = totaisDebitoConta.get(row?.conta) || 0;
      totaisDebitoConta.set(row.conta, totalAtual + row.valor);
    }
  });

  const totaisDebConta = Array.from(totaisDebitoConta.entries()).map(([conta, valor]) => ({ conta, valor }));
  const totaisCredConta = Array.from(totaisCreditoConta.entries()).map(([conta, valor]) => ({ conta, valor }));

  return { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta };
}

// ---------------------------------------------------------------------------------------------------------------------

export function dividaList(origem, tipo, dividas = []) {
  if (!origem || !tipo) return [];

  return dividas.filter(({ origem: rowOrigem, tipo: rowTipo }) => rowOrigem === origem && rowTipo === tipo);
}

// ---------------------------------------------------------------------------------------------------------------------

export function textParecer(ficha) {
  const { dividas = [] } = ficha || {};

  const avalesCaixa = dividaList('Caixa', 'Aval', dividas);
  const avalesOutros = dividaList('Outros', 'Aval', dividas);
  const dividasCaixa = dividaList('Caixa', 'Divida', dividas);
  const dividasOutros = dividaList('Outros', 'Divida', dividas);

  const dividasText = [
    { qtd: dividasCaixa.length, cred: true, caixa: true },
    { qtd: dividasOutros.length, cred: true, caixa: false },
    { qtd: avalesCaixa.length, cred: false, caixa: true },
    { qtd: avalesOutros.length, cred: false, caixa: false },
  ]
    .map(({ qtd, cred, caixa }) => qntResponsa(qtd, cred, caixa))
    .filter(Boolean)
    .join('');

  const dsti = percentagemDsti(ficha);
  const dsticorigiso = dstiCorrigido(ficha);

  const textDividas =
    dividasCaixa.length === 0 && dividasOutros.length === 0 && avalesCaixa.length === 0 && avalesOutros.length === 0
      ? 'O cliente não tem crédito ativo nem responsabilidade como fiador/avalista em créditos a terceiros.'
      : `O cliente apresenta as seguintes responsabilidades financeiras:\n${dividasText}`;

  return `${ficha?.titular ?? 'NOME DO CLIENTE'}${ficha?.rendimento?.nome_conjuge ? ` e ${ficha?.rendimento?.nome_conjuge}` : ''}, cliente nº ${ficha?.cliente ?? 'Nº DE CLIENTE'} desde "MÊS de ANO", com salário domiciliado na Caixa. É funcionário(a) do(a) "EMPRESA/INSTITUIÇÃO" desde "MÊS de ANO", auferindo um vencimento mensal bruto de ${fCurrency(
    calcRendimento(ficha?.rendimento, true)
  )}.\n\nO cliente solicita um crédito no valor de ${fCurrency(ficha?.proposta?.montante)}, correspondente a ${fShortenNumber(
    ficha?.proposta?.montante / calcRendimento(ficha?.rendimento, true)
  )} vezes o seu salário, destinado a ${ficha?.credito?.finalidade ?? 'FINALIDADE'}. O crédito proposto tem as seguintes condições:\n- Prazo de amortização: ${ficha?.proposta?.prazo_amortizacao ?? 'XX'} meses;\n- Taxa de juros: ${fPercent(ficha?.proposta?.taxa_juro)};\n- Prestação mensal: ${fCurrency(ficha?.valorPrestacao)};
  \nSituação Financeira\n${textDividas}\nAnálise da Solvabilidade\n- Conforme ficha de avaliação de solvabilidade, o DSTI é de ${fPercent(dsti)}, o DSTI Corrigido é de ${fPercent(dsticorigiso)}, indicando que o cliente ${dsti > 50 || dsticorigiso > 70 ? 'está fora' : 'ainda se encontra dentro'} do limite de esforço recomendado;\n- Apresenta como garantia ${ficha?.credito?.garantia}, o que fortalece a proposta do crédito.
  \nPelo exposto, somos de parecer "FAVORÁVEL/NÃO FAVORÁVEL" à contratação do crédito, considerando o cumprimento dos critérios de avaliação e o enquadramento da cliente dentro do perfil de risco aceitável. No entanto, a aprovação final deverá ser submetida para apreciação superior para melhor análise e decisão.`;
}

export function qntResponsa(qtd, cred, caixa) {
  if (!qtd || qtd <= 0) return '';
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const local = caixa ? 'na Caixa, em situação "SITUAÇÃO"' : 'em outros bancos, em situação "SITUAÇÃO"';
  const plural = qtd > 1 ? 's' : '';
  const tipo = cred
    ? `${extenso(qtd)} crédito${plural} ativo${plural} ${local}`
    : `responsabilidade como Avalista/Fiador em ${extenso(qtd)} crédito${plural} ${local}`;

  return `- ${capitalize(tipo)};\n`;
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
