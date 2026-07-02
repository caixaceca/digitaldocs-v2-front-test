import { fMonthYear } from '@/utils/formatTime';
import { fCurrency, fNumber, fShortenNumber, fPercent } from '@/utils/formatNumber';
import { calcRendimento, percentagemDsti, dstiCorrigido, idadeCliente, idadeReforma } from './calculos';

// ---------------------------------------------------------------------------------------------------------------------

const REGRAS_SOLVABILIDADE = {
  AVAL_MULTIPLICADOR: 2,
  AJUSTE_REFORMA_PCT: 20,
  DSTI: { limite: 50, label: 'DSTI <= 50%' },
  DSTI_CORRIGIDO: { limite: 70, label: 'DSTI Corrigido <= 70%' },
};

// ---------------------------------------------------------------------------------------------------------------------

export function textParecer(ficha) {
  const {
    dividas = [],
    fiancas = [],
    credito = {},
    proposta = {},
    rendimento = {},
    liquidacoes = [],
    avales_externas: avalesExterna = [],
    dividas_externas: dividasExterna = [],
    clientes = [],
  } = ficha || {};

  const titularCliente = clientes.find((c) => c?.titular === ficha?.credito?.titular) || clientes[0];

  const dataAbertura = fMonthYear(titularCliente?.data_abertura) ?? 'DATA DE ABERTURA';
  const historicoReestruturacao = titularCliente?.com_historico_restruturacao
    ? 'apresenta histórico de reestruturações de crédito, fator que poderá influenciar a avaliação de risco'
    : 'não apresenta histórico de reestruturações de crédito relevantes';

  const dsti = percentagemDsti(ficha);
  const dstiCor = dstiCorrigido(ficha);

  const { resumoResponsa, detalheResponsa } = gerarResponsabilidades({
    dividas,
    fiancas,
    liquidacoes,
    dividasExterna,
    avalesExterna,
  });

  const rendimentoLiq = calcRendimento(rendimento);
  const rendimentoBruto = calcRendimento(rendimento, true);
  const impactoReforma = calcularImpactoReforma(ficha, proposta);

  let ajusteRendimentoTexto = '';
  if (impactoReforma.ultrapassaReforma) {
    ajusteRendimentoTexto = `O crédito ultrapassa a idade de reforma (${impactoReforma.reforma} anos). Considera-se prudente um ajuste no rendimento líquido em cerca de ${fPercent(
      impactoReforma.ajustePct / 100
    )}, refletindo a expectativa de redução após a aposentadoria.`;
  }

  const regras = avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimentoLiq, impactoReforma });
  const riscoProspectivo = gerarRiscoProspectivo(regras);
  const conclusao = gerarConclusao(regras);

  const multiploSalario = rendimentoBruto > 0 ? fShortenNumber(proposta?.montante / rendimentoBruto) : 'N/D';

  return `
    <p><strong>${ficha?.credito?.titular ?? 'NOME DO CLIENTE'}</strong>${
      rendimento?.nome_conjuge ? ` e <strong>${rendimento?.nome_conjuge}</strong>` : ''
    }, cliente nº <strong>${
      ficha?.cliente ?? 'Nº DE CLIENTE'
    }</strong>, com início de relacionamento com o banco em <strong>${dataAbertura}</strong>, ${historicoReestruturacao}. O cliente possui salário domiciliado na Caixa, é funcionári${
      ficha?.entidade?.sexo === 'Masculino' ? 'o' : 'a'
    } do(a) <strong>${
      rendimento?.local_trabalho ?? 'EMPRESA/INSTITUIÇÃO'
    }</strong>, auferindo um vencimento mensal bruto de <strong>${fCurrency(rendimentoBruto)}</strong>.</p>

    <br/>
    <p>O cliente, com <strong>${impactoReforma.idadeTitular} anos</strong>, solicita um crédito <strong>${
      credito?.componente
    }</strong> no valor de <strong>${fCurrency(proposta?.montante)}</strong>, correspondente a <strong>${multiploSalario}</strong> vezes o seu salário, destinado a <strong>${
      proposta?.finalidade ?? 'FINALIDADE'
    }</strong>. O crédito proposto apresenta as seguintes condições:</p>
    <ul>
      <li>Prazo de amortização: <strong>${proposta?.prazo_amortizacao} meses</strong></li>
      <li>Taxa de juros: <strong>${fPercent(proposta?.taxa_juro)}</strong></li>
      <li>Prestação mensal: <strong>${fCurrency(ficha?.valorPrestacao)}</strong></li>
    </ul>

    <br/>
    <p><strong>SITUAÇÃO FINANCEIRA:</strong></p>
    ${resumoResponsa}
    ${detalheResponsa}

    <br/>
    <p><strong>ANÁLISE DAS REGRAS DE SOLVABILIDADE:</strong></p>
    <p>A presente análise de solvabilidade é efetuada nos termos da <b>Normativa Interna IS - 007/2020</b>.</p>
    <ul>
      ${regras.map((r) => `<li><b>${r.regra}</b>: ${r.status}</li>`).join('')}
      ${ajusteRendimentoTexto ? `<li>${ajusteRendimentoTexto}</li>` : ''}
    </ul>

    <br/>
    <p><strong>RISCO PROSPETIVO:</strong></p>
    ${riscoProspectivo}

    <br/>
    <p><strong>CONCLUSÃO:</strong></p>
    ${conclusao}
  `;
}

// ---------------------------------------------------------------------------------------------------------------------

function calcularImpactoReforma(ficha, proposta) {
  const reforma = idadeReforma(ficha?.entidade?.sexo);
  const prazoAnos = Number(proposta?.prazo_amortizacao || 0) / 12;
  const idadeTitular = idadeCliente(ficha?.entidade?.data_nascimento);
  const idadeFimCredito = idadeTitular + prazoAnos;
  const ultrapassaReforma = idadeFimCredito >= reforma;

  let ajustePct = 0;
  if (ultrapassaReforma && prazoAnos > 0) {
    const anosNaReforma = idadeFimCredito - reforma;
    const proporcao = Math.min(anosNaReforma / prazoAnos, 1);
    ajustePct = REGRAS_SOLVABILIDADE.AJUSTE_REFORMA_PCT * proporcao;
  }

  return { idadeTitular, reforma, idadeFimCredito, ultrapassaReforma, ajustePct };
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarResponsabilidades({ dividas, liquidacoes, fiancas, dividasExterna, avalesExterna }) {
  const blocos = [];

  const criarListaInterna = (itens, formatItem) => `<ul>${itens.map(formatItem).join('')}</ul>`;

  const contasParaLiquidar = new Set(liquidacoes ?? []);

  if (dividas?.length > 0) {
    blocos.push(
      `<li>Possui ${dividas.length} crédito${dividas.length > 1 ? 's' : ''} ativo na Caixa:${criarListaInterna(
        dividas,
        (d) => {
          const notaLiquidacao = contasParaLiquidar.has(d.conta) ? ' <strong>(liquidação anticipada)</strong>' : '';
          return `<li class="ql-indent-1">${d.tipo}, saldo ${fNumber(Math.abs(d.saldo_divida))} ${d.moeda}, situação ${d.situacao}${notaLiquidacao};</li>`;
        }
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
          `<li class="ql-indent-1">Beneficiário ${f.beneficiario}, saldo ${fNumber(Math.abs(f.saldo_divida))} ${
            f.moeda
          }, situação ${f.situacao};</li>`
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

function avaliarRegras({ dsti, dstiCor, fiancas, avalesExterna, rendimentoLiq, impactoReforma }) {
  const resultados = [];

  resultados.push({
    id: 'DSTI',
    cumpre: dsti <= REGRAS_SOLVABILIDADE.DSTI.limite,
    regra: REGRAS_SOLVABILIDADE.DSTI.label,
    status:
      dsti <= REGRAS_SOLVABILIDADE.DSTI.limite
        ? `O rácio de esforço do cliente é de <b>${fPercent(dsti)}</b>, encontrando-se <b>dentro do limite definido</b>, evidenciando capacidade adequada para assumir a prestação proposta;`
        : `O rácio de esforço do cliente é de <b>${fPercent(dsti)}</b>, encontrando-se <b>fora do limite definido</b>, indicando pressão excessiva sobre o rendimento disponível;`,
  });

  resultados.push({
    id: 'DSTI_CORRIGIDO',
    cumpre: dstiCor <= REGRAS_SOLVABILIDADE.DSTI_CORRIGIDO.limite,
    regra: REGRAS_SOLVABILIDADE.DSTI_CORRIGIDO.label,
    status:
      dstiCor <= REGRAS_SOLVABILIDADE.DSTI_CORRIGIDO.limite
        ? `Após ajustamentos prudenciais, o DSTI situa-se em <b>${fPercent(dstiCor)}</b>, permanecendo <b>dentro do limite definido</b>;`
        : `Após ajustamentos prudenciais, o DSTI situa-se em <b>${fPercent(dstiCor)}</b>, encontrando-se <b>fora do limite definido</b>, agravando o risco de sobre-endividamento`,
  });

  const somaAval = [...fiancas, ...avalesExterna].reduce((acc, a) => acc + Math.abs(a.valor_prestacao || 0), 0);
  const limiteAval = rendimentoLiq > 0 ? rendimentoLiq * 0.5 * REGRAS_SOLVABILIDADE.AVAL_MULTIPLICADOR : 0;

  resultados.push({
    id: 'AVAL',
    cumpre: somaAval <= limiteAval,
    regra: 'Prestações avalizadas/afiançadas <= 2x limite DSTI',
    status:
      somaAval <= limiteAval
        ? `A exposição por avales/fianças totaliza <b>${fCurrency(somaAval)}</b>, encontrando-se <b>dentro do limite definido</b>;`
        : `A exposição por avales/fianças totaliza <b>${fCurrency(somaAval)}</b>, encontrando-se <b>fora do limite definido</b>, representando risco contingente adicional associado a eventual incumprimento de terceiros;`,
  });

  resultados.push({
    id: 'REFORMA',
    cumpre: !impactoReforma.ultrapassaReforma,
    regra: 'Ajuste rendimento por idade de reforma',
    status: !impactoReforma.ultrapassaReforma
      ? `O prazo do crédito termina <b>antes</b> da idade legal de reforma do proponente, ${impactoReforma.idadeFimCredito.toFixed(0)} anos no final do crédito.`
      : `O prazo do crédito <b>ultrapassa</b> a idade legal de reforma do proponente, ${impactoReforma.idadeFimCredito.toFixed(0)} anos, sendo aplicado <b>ajustamento prudencial de ${REGRAS_SOLVABILIDADE.AJUSTE_REFORMA_PCT}% ao rendimento</b>, visando reforçar a prudência na avaliação da capacidade futura de pagamento`,
  });

  return resultados;
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarRiscoProspectivo(regras) {
  const riscos = [];

  regras.forEach(({ cumpre, id }) => {
    if (cumpre) return;

    switch (id) {
      case 'DSTI':
        riscos.push(
          'O nível de esforço financeiro atual poderá limitar a capacidade do cliente de acomodar aumentos futuros de despesas ou responsabilidades.'
        );
        break;

      case 'DSTI_CORRIGIDO':
        riscos.push(
          'Após ajustamentos prudenciais, o rácio de esforço mantém-se elevado, aumentando o risco de sobre-endividamento em cenários adversos.'
        );
        break;

      case 'AVAL':
        riscos.push(
          'A exposição associada a avales e fianças representa risco contingente relevante, dependente de eventual incumprimento de terceiros.'
        );
        break;

      case 'REFORMA':
        riscos.push(
          'A extensão do prazo do crédito para além da idade de reforma poderá impactar negativamente a capacidade futura de pagamento.'
        );
        break;

      default:
        break;
    }
  });

  if (riscos.length === 0) {
    return '<p>À data da análise, não se identificam riscos prospetivos relevantes suscetíveis de comprometer a capacidade futura de pagamento.</p>';
  }

  return `
    <p>A análise prospetiva identifica fatores que poderão impactar a capacidade futura de cumprimento das obrigações financeiras, designadamente:</p>
    <ul>
      ${riscos.map((r) => `<li>${r}</li>`).join('')}
    </ul>
  `;
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarConclusao(regras) {
  const falhas = regras.filter((r) => !r.cumpre);

  if (falhas.length === 0) {
    return `<p>O cliente cumpre integralmente os critérios de solvabilidade analisados. Considerando as condições da operação e as garantias apresentadas, a proposta enquadra-se no perfil de risco aceitável, não se identificando impedimentos à sua aprovação.</p>`;
  }

  if (falhas.length === 1) {
    return `<p>A análise evidencia <b>uma alerta</b> face aos critérios de solvabilidade, designadamente: <b>${falhas[0].regra}</b>.</p>
      <p>A proposta poderá ser considerada, desde que devidamente ponderado o risco identificado, podendo ser equacionadas medidas mitigadoras.</p>`;
  }

  return `<p>A análise evidencia <b>não conformidades relevantes</b> face aos critérios de solvabilidade definidos, nomeadamente: <b>${falhas.map((f) => f.regra).join('; ')}</b>.</p>
    <p>Nestes termos, recomenda-se especial cautela na decisão, podendo ser necessário o ajustamento das condições da operação ou o reforço das garantias antes de eventual aprovação.</p>`;
}
