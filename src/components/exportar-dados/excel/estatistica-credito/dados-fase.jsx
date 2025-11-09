import { sumBy } from 'lodash';
// utils
import { ptDate } from '../../../../utils/formatTime';
import { fPercent } from '../../../../utils/formatNumber';
import { categorias } from '../../../../sections/indicadores/estatistica-credito/table-situacao';
//
import { valorMoeda } from './formatacoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function dadosFase(dados, fase, item1, item2, emptyRows, moeda) {
  const empConst = dadosItem(dados, 'Empresa', 'Construção', fase, true, moeda);
  const empTes = dadosItem(dados, 'Empresa', 'Tesouraria', fase, false, moeda);
  const empInvest = dadosItem(dados, 'Empresa', 'Investimento', fase, false, moeda);
  const partHab = dadosItem(dados, 'Particular', 'Habitação', fase, true, moeda);
  const partCredi = dadosItem(dados, 'Particular', 'CrediCaixa', fase, false, moeda);
  const partOut = dadosItem(dados, 'Particular', 'Outros', fase, false, moeda);
  const piTes = dadosItem(dados, 'Produtor Individual', 'Tesouraria', fase, true, moeda);
  const piInvest = dadosItem(dados, 'Produtor Individual', 'Investimento', fase, false, moeda);
  const piMicro = dadosItem(dados, 'Produtor Individual', 'Micro-Crédito', fase, false, moeda);
  const entPub = dadosItem(dados, 'Entidade Pública', '', fase, true, moeda);
  const barantBanc = dadosItem(dados, '', 'Garantia Bancária', fase, true, moeda);

  const rows = [
    ...empConst.rows,
    ...empTes.rows,
    ...empInvest.rows,
    totalSegmento(dados, 'Empresa', emptyRows, item1, item2, moeda),
    ...partHab.rows,
    ...partCredi.rows,
    ...partOut.rows,
    totalSegmento(dados, 'Particular', emptyRows, item1, item2, moeda),
    ...piTes.rows,
    ...piInvest.rows,
    ...piMicro.rows,
    totalSegmento(dados, 'Produtor Individual', emptyRows, item1, item2, moeda),
    ...entPub.rows,
    ...barantBanc.rows,
  ];

  const lengths = {
    ec: empConst.rows.length,
    et: empTes.rows.length,
    ei: empInvest.rows.length,
    ph: partHab.rows.length,
    pc: partCredi.rows.length,
    po: partOut.rows.length,
    pit: piTes.rows.length,
    pii: piInvest.rows.length,
    pim: piMicro.rows.length,
    ep: entPub.rows.length,
    gb: barantBanc.rows.length,
  };

  const naoClassificados = dados.filter(
    (item) =>
      !Object.values(categorias).some(
        (cond) => (!cond.segmento || cond.segmento === item.segmento) && (!cond.linha || cond.linha === item.linha)
      )
  );

  return { rows, lengths, naoClassificados };
}

function dadosItem(dados, segmento, linha, tab, first, moeda) {
  segmento = linha === 'Garantia Bancária' ? '' : segmento;
  linha = segmento === 'Entidade Pública' ? '' : linha;

  const dadosFilter = dadosPorItem(dados, segmento, linha);
  const segmentoLabel =
    (linha === 'Garantia Bancária' && 'Garantias Bancárias') ||
    (segmento === 'Entidade Pública' && 'Entidades Públicas') ||
    segmento;
  const linhaLabel = linha === 'Garantia Bancária' ? null : linha;

  const totalLine = (colsEmpty, sumFields = []) => [
    ...[...Array(colsEmpty)].map(() => null),
    ...sumFields.map((field) => valorMoeda(sumBy(dadosFilter, field), moeda)),
  ];

  if (tab === 'Entrada' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_entrada),
      row?.setor_atividade || '',
      row?.finalidade || '',
      row?.situacao_final_mes || '',
      row?.nproposta || '',
      valorMoeda(row?.montantes || 0, moeda),
    ]);

    return { rows: [...dadosList, totalLine(9, ['montantes'])] };
  }

  if (tab === 'Aprovado' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_aprovacao),
      row?.setor_atividade || '',
      row?.situacao_final_mes || '',
      valorMoeda(row?.montantes || 0, moeda),
      valorMoeda(row?.montante_aprovado || 0, moeda),
      row?.montantes !== row?.montante_aprovado ? '*' : null,
    ]);

    return { rows: [...dadosList, totalLine(7, ['montantes', 'montante_aprovado'])] };
  }

  if (tab === 'Contratado' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_contratacao),
      row?.setor_atividade || '',
      row?.finalidade || '',
      `${row?.prazo_amortizacao ?? '--'}${row?.prazo_amortizacao?.includes('meses') ? '' : ' meses'}`,
      fPercent(row?.taxa_juro),
      row?.garantia || '',
      row?.escalao_decisao || '',
      row?.cliente || '',
      valorMoeda(row?.montante_aprovado || 0, moeda),
      valorMoeda(row?.montante_contratado || 0, moeda),
      row?.montante_aprovado !== row?.montante_contratado ? '*' : null,
    ]);

    return { rows: [...dadosList, totalLine(12, ['montante_aprovado', 'montante_contratado'])] };
  }

  if ((tab === 'Indeferido' || tab === 'Desistido') && dadosFilter?.length > 0) {
    const dadosList = dadosFilter.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_entrada),
      row?.setor_atividade || '',
      row?.finalidade || '',
      (tab === 'Indeferido' && row?.data_indeferido && ptDate(row?.data_indeferido)) ||
        (tab === 'Desistido' && row?.data_desistido && ptDate(row?.data_desistido)) ||
        '',
      valorMoeda(row?.montantes || 0, moeda),
    ]);

    return { rows: [...dadosList, totalLine(8, ['montantes'])] };
  }

  const defaultRow = [
    first ? segmentoLabel : null,
    linhaLabel,
    ...((tab === 'Aprovado' && [...Array(5).map(() => null), 0, 0]) ||
      (tab === 'Contratado' && [...Array(10).map(() => null), 0, 0]) || [
        ...Array(tab === 'Entrada' ? 7 : 6).map(() => null),
        0,
      ]),
  ];

  return { rows: [defaultRow] };
}

// ---------------------------------------------------------------------------------------------------------------------

function totalSegmento(dados, segmento, cellsEmpty, item1, item2, moeda) {
  return [
    null,
    null,
    dadosPorItem(dados, segmento, '')?.length,
    ...[...Array(cellsEmpty)].map(() => null),
    ...(item2
      ? [
          valorMoeda(sumBy(dadosPorItem(dados, segmento, ''), item2), moeda),
          valorMoeda(sumBy(dadosPorItem(dados, segmento, ''), item1), moeda),
        ]
      : [valorMoeda(sumBy(dadosPorItem(dados, segmento, ''), item1), moeda)]),
  ];
}

export function dadosPorItem(dados, segmento, linha) {
  return (
    (segmento && linha && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin === linha)) ||
    (segmento && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin !== 'Garantia Bancária')) ||
    (linha && dados?.filter(({ segmento: seg, linha: lin }) => lin === linha && seg !== 'Entidade Pública')) ||
    dados
  );
}
