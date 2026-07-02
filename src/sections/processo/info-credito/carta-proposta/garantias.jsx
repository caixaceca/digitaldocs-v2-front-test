import { TextRun } from 'docx';
import { ptDate } from '@/utils/formatTime';

const separadorBloco = (runs) => (runs.length > 0 ? { break: 2 } : {});

// ---------------------------------------------------------------------------------------------------------------------

function formatImovel(bem, runs) {
  const isFracao = Boolean(bem.identificacao_fracao || bem.numero_andar);

  runs.push(
    new TextRun({
      text: isFracao ? '• Hipoteca sobre fração autónoma: ' : '• Hipoteca sobre imóvel: ',
      ...separadorBloco(runs),
    })
  );

  const morada = [bem.rua, bem.numero_porta, bem.freguesia, bem.concelho, bem.ilha].filter(Boolean).join(', ');

  const identificacaoPredial = bem.nip
    ? `NIP nº ${bem.nip}`
    : `Matriz nº ${bem.numero_matriz || '---'}, Descritivo predial nº ${bem.numero_descricao_predial || '---'}`;

  const partes = [
    isFracao && `Fração ${bem.identificacao_fracao || '---'}`,
    isFracao && bem.numero_andar && `${bem.numero_andar}º andar`,
    identificacaoPredial,
    bem.localizacao_conservatoria && `Conservatória de ${bem.localizacao_conservatoria}`,
    morada ? `localizado em ${morada}` : null,
  ].filter(Boolean);

  runs.push(new TextRun({ text: `${partes.join(', ')};`, bold: true }));
}

function formatVeiculo(bem, runs) {
  runs.push(new TextRun({ text: '• Hipoteca de veículo: ', ...separadorBloco(runs) }));

  const desc = `${bem.marca || ''} ${bem.modelo || ''}${bem.ano_fabrico ? ` (${bem.ano_fabrico})` : ''}`.trim();
  const registo = bem.matricula || bem.nura;
  const semRegisto = bem.bem_sem_registo || !registo;

  const identificacao = semRegisto
    ? `${[
        `fatura proforma nº ${bem.numero_fatura_proforma || '---'}`,
        bem.emissora_fatura_proforma && `emitida por ${bem.emissora_fatura_proforma}`,
        bem.data_emissao_fatura_proforma && `em ${ptDate(bem.data_emissao_fatura_proforma)}`,
      ]
        .filter(Boolean)
        .join(', ')} — viatura ainda sem matrícula/registo`
    : `matrícula ${registo}`;

  runs.push(new TextRun({ text: `${desc || 'veículo'}, ${identificacao};`, bold: true }));
}

function formatDeposito(bem, runs) {
  runs.push(new TextRun({ text: '• Penhor de Depósito a Prazo na conta: ', ...separadorBloco(runs) }));
  const balcao = bem.balcao ? `, balcão ${bem.balcao}` : '';
  runs.push(new TextRun({ text: `${bem.numero_conta || '---'}${balcao};`, bold: true }));
}

function formatTitulo(bem, runs) {
  runs.push(new TextRun({ text: '• Penhor de valores mobiliários: ', ...separadorBloco(runs) }));
  const qtd = bem.numero_titulos ? `${bem.numero_titulos} título(s) ` : '';
  runs.push(
    new TextRun({
      text: `${qtd}${bem.tipo_titulo || ''}, emitidos por ${bem.nome_entidade_emissora || '---'};`,
      bold: true,
    })
  );
}

function formatSeguro(bem, runs) {
  runs.push(new TextRun({ text: '• Penhor/cessão de apólice de seguro: ', ...separadorBloco(runs) }));
  runs.push(
    new TextRun({
      text: `apólice nº ${bem.apolice || '---'} (${bem.tipo_seguro || 'seguro'}), ${bem.seguradora || '---'};`,
      bold: true,
    })
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const formatters = {
  IMOVEL: formatImovel,
  PREDIO: formatImovel,
  APARTAMENTO: formatImovel,
  TERRENO: formatImovel,
  VEICULO: formatVeiculo,
  AUTOMOVEL: formatVeiculo,
  DEPOSITO: formatDeposito,
  DEPOSITO_PRAZO: formatDeposito,
  CONTA: formatDeposito,
  TITULO: formatTitulo,
  VALOR_MOBILIARIO: formatTitulo,
  SEGURO: formatSeguro,
  APOLICE: formatSeguro,
};

export function inferirTipoBem(bem) {
  if (bem.identificacao_fracao || bem.numero_andar) return 'APARTAMENTO';
  if (bem.numero_matriz || bem.numero_descricao_predial) return 'IMOVEL';
  if (bem.matricula || bem.marca || bem.numero_fatura_proforma) return 'VEICULO';
  if (bem.numero_conta) return 'DEPOSITO';
  if (bem.tipo_titulo || bem.numero_titulos) return 'TITULO';
  if (bem.apolice) return 'SEGURO';
  return null;
}

function formatGarantidoresList(header, garantidores, runs) {
  if (!garantidores?.length) return;
  runs.push(new TextRun({ text: header, ...separadorBloco(runs) }));
  garantidores.forEach((f) => {
    runs.push(
      new TextRun({ text: `- ${f.numero_entidade ?? '---'} - ${f.nome_entidade || '---'};`, bold: true, break: 1 })
    );
  });
}

function formatLivranca(numero, runs) {
  runs.push(new TextRun({ text: '• Livrança nº: ', ...separadorBloco(runs) }));
  runs.push(new TextRun({ text: `${numero};`, bold: true }));
}

export const extrairDescricaoGarantias = (garantias = []) => {
  if (!garantias?.length) {
    return [new TextRun({ text: 'Garantia constituída por livrança subscrita pelo proponente.' })];
  }

  const runs = [];

  garantias.forEach((g) => {
    const meta = g.metadados || {};
    const { bem, garantidores } = meta;
    const numeroLivranca = meta.numero_livranca;

    if (bem) {
      const tipo = (bem.tipo || '').toUpperCase().trim();
      const formatter = formatters[tipo] || formatters[inferirTipoBem(bem)];

      if (formatter) {
        formatter(bem, runs);
      } else {
        runs.push(
          new TextRun({
            text: `• [ATENÇÃO: tipo de bem não identificado — bem.tipo="${bem.tipo || ''}", tipo_garantia="${
              g.tipo_garantia || ''
            }"] Confirmar manualmente;`,
            italics: true,
            ...separadorBloco(runs),
          })
        );
      }
    }

    if (numeroLivranca) {
      formatLivranca(numeroLivranca, runs);
      formatGarantidoresList('• Aval à livrança prestado por:', garantidores, runs);
    } else {
      formatGarantidoresList('• Fiança solidária sem beneficio de excussão prévia, prestada por:', garantidores, runs);
    }
  });

  return runs.length > 0 ? runs : [new TextRun({ text: 'Garantia conforme condições contratuais.' })];
};
