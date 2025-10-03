import { fMonthYear } from '../../../../utils/formatTime';
import { fCurrency, fNumber, fShortenNumber, fPercent } from '../../../../utils/formatNumber';
import { calcRendimento, percentagemDsti, dstiCorrigido, idadeCliente, idadeReforma } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

export function textParecer(ficha) {
  const {
    dividas = [],
    fiancas = [],
    credito = {},
    proposta = {},
    rendimento = {},
    avales_externas: avalesExterna = [],
    dividas_externas: dividasExterna = [],
    clientes = [],
  } = ficha || {};

  // Seleciona o cliente correto pelo titular
  const titularCliente = clientes.find((c) => c.titular === ficha.titular) || clientes[0];

  const dataAbertura = fMonthYear(titularCliente?.data_abertura) ?? 'DATA DE ABERTURA';
  const historicoReestruturacao = titularCliente?.com_historico_restruturacao
    ? 'apresenta histórico de reestruturações de crédito, fator que poderá influenciar a avaliação de risco'
    : 'não apresenta histórico de reestruturações de crédito relevantes';

  // Percentuais DSTI
  const dsti = percentagemDsti(ficha);
  const dstiCor = dstiCorrigido(ficha);

  // Responsabilidades financeiras
  const { resumoResponsa, detalheResponsa } = gerarResponsabilidades({
    dividas,
    fiancas,
    dividasExterna,
    avalesExterna,
  });

  // Regras de solvabilidade
  const regras = avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimento, proposta, ficha });

  // Conclusão baseada nas regras
  const conclusao = gerarConclusao(regras, credito);

  // Idade do titular e idade de reforma
  const idadeTitular = idadeCliente(ficha.entidade.data_nascimento);
  const reforma = idadeReforma(ficha.entidade.sexo);

  // Ajuste de rendimento por idade da reforma
  const idadeFimCredito = idadeTitular + Number(proposta?.prazo_amortizacao || 0) / 12;
  let ajusteRendimentoTexto = '';
  if (idadeFimCredito >= reforma) {
    const anosNaReforma = idadeFimCredito - reforma;
    const proporcao = Math.min(anosNaReforma / (Number(proposta?.prazo_amortizacao || 0) / 12), 1);
    const ajuste = 20 * proporcao;
    ajusteRendimentoTexto = `O crédito ultrapassa a idade de reforma (${reforma} anos). Considera-se prudente um ajuste no rendimento líquido em cerca de ${fPercent(
      ajuste / 100
    )}, refletindo a expectativa de redução após a aposentadoria.`;
  }

  // Risco prospetivo
  const riscoProspectivo = gerarRiscoProspectivo(ficha, rendimento, proposta);

  return (
    // Introdução
    `${ficha?.titular ?? 'NOME DO CLIENTE'}${
      rendimento?.nome_conjuge ? ` e ${rendimento?.nome_conjuge}` : ''
    }, cliente nº ${ficha?.cliente ?? 'Nº DE CLIENTE'}, com início de relacionamento com o banco em ${dataAbertura}, ${historicoReestruturacao}. O cliente possui salário domiciliado na Caixa, é funcionári${ficha.entidade.sexo === 'Masculino' ? 'o' : 'a'} do(a) <strong>${rendimento?.local_trabalho ?? 'EMPRESA/INSTITUIÇÃO'}</strong>, auferindo um vencimento mensal bruto de ${fCurrency(
      calcRendimento(rendimento, true)
    )}.\n\n` +
    `O cliente, com ${idadeTitular} anos, solicita um crédito ${credito?.componente} no valor de ${fCurrency(
      proposta?.montante
    )}, correspondente a ${fShortenNumber(proposta?.montante / calcRendimento(rendimento, true))} vezes o seu salário, destinado a ${
      credito?.finalidade ?? 'FINALIDADE'
    }. O crédito proposto apresenta as seguintes condições:\n` +
    `- Prazo de amortização: ${proposta?.prazo_amortizacao} meses;\n` +
    `- Taxa de juros: ${fPercent(proposta?.taxa_juro)};\n` +
    `- Prestação mensal: ${fCurrency(ficha?.valorPrestacao)}.\n\n` +
    // Situação Financeira
    `Situação Financeira\nConforme os dados analisados, o cliente apresenta o seguinte quadro de responsabilidades:\n${resumoResponsa}\n${detalheResponsa}\n` +
    `\nAnálise das Regras de Solvabilidade\n${regras.map((r) => `- ${r.regra}: ${r.valor} - ${r.status}`).join('\n')}\n${
      ajusteRendimentoTexto ? `- ${ajusteRendimentoTexto}\n` : ''
    }\nRisco Prospetivo\n${riscoProspectivo}\n\nConclusão\n${conclusao}`
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarResponsabilidades({ dividas, fiancas, dividasExterna, avalesExterna }) {
  const blocos = [];
  const resumoParts = [];

  if (dividas?.length > 0) {
    resumoParts.push(`${dividas.length} crédito${dividas.length > 1 ? 's' : ''} próprio`);
    const detalhe = dividas
      .map((d) => `(${d.tipo}, saldo ${fNumber(Math.abs(d.saldo_divida))} ${d.moeda}, situação ${d.situacao})`)
      .join('; ');
    blocos.push(`Possui ${dividas.length} crédito${dividas.length > 1 ? 's' : ''} ativo na Caixa: ${detalhe}.`);
  }

  if (fiancas?.length > 0) {
    resumoParts.push(`${fiancas.length} fiança/aval interno`);
    const detalhe = fiancas
      .map(
        (f) =>
          `(beneficiário ${f.beneficiario}, saldo ${fNumber(Math.abs(f.saldo_divida))} ${f.moeda}, situação ${f.situacao})`
      )
      .join('; ');
    blocos.push(
      `Encontra-se como avalista/fiador em ${fiancas.length} crédito${fiancas.length > 1 ? 's' : ''} na Caixa: ${detalhe}.`
    );
  }

  if (dividasExterna?.length > 0) {
    resumoParts.push(`${dividasExterna.length} crédito${dividasExterna.length > 1 ? 's' : ''} externo`);
    const detalhe = dividasExterna
      .map((d) => `(saldo ${fCurrency(d.saldo_divida)}, prestação ${fCurrency(d.valor_prestacao)})`)
      .join('; ');
    blocos.push(
      `Mantém ${dividasExterna.length} crédito${dividasExterna.length > 1 ? 's' : ''} ativo em outras instituições: ${detalhe}.`
    );
  }

  if (avalesExterna?.length > 0) {
    resumoParts.push(`${avalesExterna.length} fiança/aval externo`);
    const detalhe = avalesExterna
      .map((a) => `(saldo ${fCurrency(a.saldo_divida)}, prestação ${fCurrency(a.valor_prestacao)})`)
      .join('; ');
    blocos.push(
      `É avalista/fiador em ${avalesExterna.length} crédito${avalesExterna.length > 1 ? 's' : ''} em outros bancos: ${detalhe}.`
    );
  }

  if (blocos.length === 0) {
    return {
      resumoResponsa: 'O cliente não apresenta responsabilidades financeiras registadas.',
      detalheResponsa: '',
    };
  }

  return {
    resumoResponsa: `Na totalidade, o cliente assume responsabilidades em ${resumoParts.join(', ')}.`,
    detalheResponsa: blocos.map((b) => `- ${b}`).join('\n'),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimento, proposta, ficha }) {
  const resultados = [];

  // Regra 1
  resultados.push({
    regra: 'DSTI <= 50%',
    valor: fPercent(dsti),
    status: dsti <= 50 ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

  // Regra 2
  resultados.push({
    regra: 'DSTI Corrigido <= 70%',
    valor: fPercent(dstiCor),
    status: dstiCor <= 70 ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

  // Regra 3: prestações avalizadas
  const somaAval = [...(fiancas || []), ...(avalesExterna || [])].reduce(
    (acc, a) => acc + Math.abs(a.valor_prestacao || 0),
    0
  );
  const limiteAval = calcRendimento(rendimento, true) * 0.5 * 2; // 2x limite DSTI
  resultados.push({
    regra: 'Prestações avalizadas/afiançadas <= 2x limite DSTI',
    valor: fCurrency(somaAval),
    status: somaAval <= limiteAval ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

  // Regra 4: ajuste por idade da reforma
  const idadeTitular = idadeCliente(ficha.entidade.data_nascimento);
  const reforma = idadeReforma(ficha.entidade.sexo);
  const idadeFimCredito = idadeTitular + Number(proposta?.prazo_amortizacao || 0) / 12;
  let ajusteStatus = 'Antes da idade de reforma';
  if (idadeFimCredito >= reforma) ajusteStatus = 'ATENÇÃO';
  resultados.push({
    regra: 'Ajuste rendimento por idade de reforma',
    valor: `${idadeFimCredito.toFixed(0)} anos ao final do crédito`,
    status: ajusteStatus,
  });

  return resultados;
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarRiscoProspectivo(ficha, rendimento, proposta) {
  const idadeTitular = idadeCliente(ficha.entidade.data_nascimento);
  const reforma = idadeReforma(ficha.entidade.sexo);
  const idadeFimCredito = idadeTitular + Number(proposta?.prazo_amortizacao || 0) / 12;
  const anosAposReforma = Math.max(0, idadeFimCredito - reforma);

  const risco = [];

  // 1. Idade vs Reforma
  if (anosAposReforma > 0) {
    risco.push(
      `O crédito projetado ultrapassa a idade de reforma (${reforma} anos) em cerca de ${anosAposReforma.toFixed(
        0
      )} anos, o que poderá impactar a capacidade de pagamento após a aposentadoria.`
    );
  }

  // 2. DSTI atual e potencial
  const dstiAtual = percentagemDsti(ficha);
  if (dstiAtual <= 50) {
    const potencialDSTI = dstiAtual * 1.1; // +10% hipotético
    if (potencialDSTI > 50) {
      risco.push(
        `Em cenário de aumento de responsabilidades futuras, o DSTI poderia subir, ultrapassando o limite recomendado de 50% e comprometendo a folga financeira.`
      );
    }
  } else {
    risco.push(
      `O DSTI do cliente encontra-se atualmente acima do limite recomendado de 50% (${fPercent(
        dstiAtual
      )}), sugerindo risco de sobre-endividamento no curto prazo.`
    );
  }

  // 3. Avalista / fiador
  const somaAval = [...(ficha.fiancas || []), ...(ficha.avales_externas || [])].reduce(
    (acc, a) => acc + Math.abs(a.valor_prestacao || 0),
    0
  );
  const limiteAval = calcRendimento(rendimento, true) * 0.5 * 2; // 2x limite DSTI
  if (somaAval > limiteAval) {
    risco.push(
      `O cliente exerce função de avalista/fiador em créditos cujo valor totaliza ${fCurrency(
        somaAval
      )}, aumentando significativamente a exposição a riscos contingentes.`
    );
  }

  if (risco.length === 0) return 'Não foram identificados riscos prospetivos relevantes.';

  return risco.map((r) => `- ${r}`).join('\n');
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarConclusao(regras, credito) {
  const total = regras.length;
  const ok = regras.filter(
    (r) => r.status === 'Dentro do limite recomendado' || r.status === 'Antes da idade de reforma'
  ).length;
  const fails = regras.filter((r) => r.status === 'Fora do limite recomendado' || r.status === 'ATENÇÃO');

  if (fails.length === 0) {
    return `O cliente cumpre todas as ${total} regras de solvabilidade estabelecidas. Considerando também a garantia apresentada (${credito?.garantia ?? 'N/A'}), a proposta revela-se enquadrada dentro do perfil de risco aceitável.`;
  }

  return `O cliente atende ${ok} das ${total} regras de solvabilidade, com atenção ou não conformidade observada em: ${fails
    .map((f) => f.regra)
    .join(
      '; '
    )}. Considerando as garantias apresentadas (${credito?.garantia ?? 'N/A'}), recomenda-se uma avaliação criteriosa e detalhada antes da decisão final sobre a aprovação do crédito.`;
}
