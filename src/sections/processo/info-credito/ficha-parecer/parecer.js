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

  const titularCliente = clientes.find((c) => c?.titular === ficha?.titular) || clientes[0];

  const dataAbertura = fMonthYear(titularCliente?.data_abertura) ?? 'DATA DE ABERTURA';
  const historicoReestruturacao = titularCliente?.com_historico_restruturacao
    ? 'apresenta histórico de reestruturações de crédito, fator que poderá influenciar a avaliação de risco'
    : 'não apresenta histórico de reestruturações de crédito relevantes';

  const dsti = percentagemDsti(ficha);
  const dstiCor = dstiCorrigido(ficha);

  const { resumoResponsa, detalheResponsa } = gerarResponsabilidades({
    dividas,
    fiancas,
    dividasExterna,
    avalesExterna,
  });

  const regras = avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimento, proposta, ficha });

  const conclusao = gerarConclusao(regras, credito);

  const idadeTitular = idadeCliente(ficha.entidade.data_nascimento);
  const reforma = idadeReforma(ficha.entidade.sexo);

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

  const riscoProspectivo = gerarRiscoProspectivo(ficha, rendimento, proposta);

  return `
    <p><strong>${ficha?.titular ?? 'NOME DO CLIENTE'}</strong>${rendimento?.nome_conjuge ? ` e <strong>${rendimento?.nome_conjuge}</strong>` : ''}, cliente nº <strong>${ficha?.cliente ?? 'Nº DE CLIENTE'}</strong>, com início de relacionamento com o banco em <strong>${dataAbertura}</strong>, ${historicoReestruturacao}. O cliente possui salário domiciliado na Caixa, é funcionári${ficha.entidade.sexo === 'Masculino' ? 'o' : 'a'} do(a) <strong>${rendimento?.local_trabalho ?? 'EMPRESA/INSTITUIÇÃO'}</strong>, auferindo um vencimento mensal bruto de <strong>${fCurrency(calcRendimento(rendimento, true))}</strong>.</p>

    <br>
    <p>O cliente, com <strong>${idadeTitular} anos</strong>, solicita um crédito <strong>${credito?.componente}</strong> no valor de <strong>${fCurrency(proposta?.montante)}</strong>, correspondente a <strong>${fShortenNumber(proposta?.montante / calcRendimento(rendimento, true))}</strong> vezes o seu salário, destinado a <strong>${credito?.finalidade ?? 'FINALIDADE'}</strong>. O crédito proposto apresenta as seguintes condições:</p>
    <ul>
      <li>Prazo de amortização: <strong>${proposta?.prazo_amortizacao} meses</strong></li>
      <li>Taxa de juros: <strong>${fPercent(proposta?.taxa_juro)}</strong></li>
      <li>Prestação mensal: <strong>${fCurrency(ficha?.valorPrestacao)}</strong></li>
    </ul>
    
    <br>
    <p><strong style="font-size: 18px;">Situação Financeira</strong></p>
    ${resumoResponsa}
    ${detalheResponsa}

    <br>
    <p><strong style="font-size: 18px;">Análise das Regras de Solvabilidade</strong></p>
    <ul>
      ${regras.map((r) => `<li>${r.regra}: ${r.valor} - ${r.status}</li>`).join('')}
      ${ajusteRendimentoTexto ? `<li>${ajusteRendimentoTexto}</li>` : ''}
    </ul>

    <br>
    <p><strong style="font-size: 18px;">Risco Prospetivo</strong></p>
    ${riscoProspectivo}

    <br>
    <p><strong style="font-size: 18px;">Conclusão</strong></p>
    ${conclusao}
  `;
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarResponsabilidades({ dividas, fiancas, dividasExterna, avalesExterna }) {
  const blocos = [];

  const criarListaInterna = (itens, formatItem) => `<ul>${itens.map(formatItem).join('')}</ul>`;

  if (dividas?.length > 0) {
    blocos.push(
      `<li>Possui ${dividas.length} crédito${dividas.length > 1 ? 's' : ''} ativo na Caixa:${criarListaInterna(
        dividas,
        (d) =>
          `<li class="ql-indent-1">C/CR ${d.tipo}, saldo ${fNumber(
            Math.abs(d.saldo_divida)
          )} ${d.moeda}, situação ${d.situacao};</li>`
      )}</li>`
    );
  }

  if (fiancas?.length > 0) {
    blocos.push(
      `<li>Encontra-se como avalista/fiador em ${fiancas.length} crédito${
        fiancas.length > 1 ? 's' : ''
      } na Caixa:${criarListaInterna(
        fiancas,
        (f) =>
          `<li class="ql-indent-1">Beneficiário ${f.beneficiario}, saldo ${fNumber(
            Math.abs(f.saldo_divida)
          )} ${f.moeda}, situação ${f.situacao};</li>`
      )}</li>`
    );
  }

  if (dividasExterna?.length > 0) {
    blocos.push(
      `<li>Mantém ${dividasExterna.length} crédito${
        dividasExterna.length > 1 ? 's' : ''
      } ativo em outras instituições:${criarListaInterna(
        dividasExterna,
        (d) =>
          `<li class="ql-indent-1">Saldo ${fCurrency(d.saldo_divida)}, prestação ${fCurrency(d.valor_prestacao)};</li>`
      )}</li>`
    );
  }

  if (avalesExterna?.length > 0) {
    blocos.push(
      `<li>É avalista/fiador em ${avalesExterna.length} crédito${
        avalesExterna.length > 1 ? 's' : ''
      } em outros bancos:${criarListaInterna(
        avalesExterna,
        (a) =>
          `<li class="ql-indent-1">Saldo ${fCurrency(a.saldo_divida)}, prestação ${fCurrency(a.valor_prestacao)};</li>`
      )}</li>`
    );
  }

  if (blocos.length === 0) {
    return {
      resumoResponsa: '<p>O cliente não apresenta responsabilidades financeiras registadas.</p>',
      detalheResponsa: '',
    };
  }

  return {
    resumoResponsa: '<p>Conforme os dados analisados, o cliente apresenta o seguinte quadro de responsabilidades:</p>',
    detalheResponsa: `<ol>${blocos.join('')}</ol>`,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimento, proposta, ficha }) {
  const resultados = [];

  resultados.push({
    regra: 'DSTI <= 50%',
    valor: fPercent(dsti),
    status: dsti <= 50 ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

  resultados.push({
    regra: 'DSTI Corrigido <= 70%',
    valor: fPercent(dstiCor),
    status: dstiCor <= 70 ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

  const somaAval = [...(fiancas || []), ...(avalesExterna || [])].reduce(
    (acc, a) => acc + Math.abs(a.valor_prestacao || 0),
    0
  );
  const limiteAval = calcRendimento(rendimento, true) * 0.5 * 2;
  resultados.push({
    regra: 'Prestações avalizadas/afiançadas <= 2x limite DSTI',
    valor: fCurrency(somaAval),
    status: somaAval <= limiteAval ? 'Dentro do limite recomendado' : 'Fora do limite recomendado',
  });

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

  if (anosAposReforma > 0) {
    risco.push(
      `O crédito projetado ultrapassa a idade de reforma (${reforma} anos) em cerca de ${anosAposReforma.toFixed(
        0
      )} anos, o que poderá impactar a capacidade de pagamento após a aposentadoria.`
    );
  }

  const dstiAtual = percentagemDsti(ficha);
  if (dstiAtual <= 50) {
    const potencialDSTI = dstiAtual * 1.1;
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

  const somaAval = [...(ficha.fiancas || []), ...(ficha.avales_externas || [])].reduce(
    (acc, a) => acc + Math.abs(a.valor_prestacao || 0),
    0
  );
  const limiteAval = calcRendimento(rendimento, true) * 0.5 * 2;
  if (somaAval > limiteAval) {
    risco.push(
      `O cliente exerce função de avalista/fiador em créditos cujo valor totaliza ${fCurrency(
        somaAval
      )}, aumentando significativamente a exposição a riscos contingentes.`
    );
  }

  if (risco.length === 0) return '<p>Não foram identificados riscos prospetivos relevantes.</p>';

  return `<ul>${risco.map((r) => `<li>${r}</li>`).join('')}</ul>`;
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarConclusao(regras, credito) {
  const total = regras.length;
  const ok = regras.filter(
    (r) => r.status === 'Dentro do limite recomendado' || r.status === 'Antes da idade de reforma'
  ).length;
  const fails = regras.filter((r) => r.status === 'Fora do limite recomendado' || r.status === 'ATENÇÃO');

  if (fails.length === 0) {
    return `<p>O cliente cumpre todas as ${total} regras de solvabilidade estabelecidas. Considerando também a garantia apresentada (${credito?.garantia ?? 'N/A'}), a proposta revela-se enquadrada dentro do perfil de risco aceitável.</p>`;
  }

  return `<p>O cliente atende ${ok} das ${total} regras de solvabilidade, com atenção ou não conformidade observada em: ${fails
    .map((f) => f.regra)
    .join(
      '; '
    )}. Considerando as garantias apresentadas (${credito?.garantia ?? 'N/A'}), recomenda-se uma avaliação criteriosa e detalhada antes da decisão final sobre a aprovação do crédito.</p>`;
}
