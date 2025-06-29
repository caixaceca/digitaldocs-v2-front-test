import { format } from 'date-fns';
// utils
import { dataValido } from '../../utils/formatTime';
import { normalizeText } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function dadosList(cartoes, uos) {
  return cartoes?.map((row) => ({
    ...row,
    entrega: uos?.find(({ balcao }) => balcao === Number(row?.balcao_entrega))?.label || row?.balcao_entrega,
  }));
}

export function tiposCartoes(dados, filter, uo) {
  const tiposCartao = [];
  applySortFilter({ dados, filter, tipoCartao: '', balcao: uo?.id, comparator: getComparator('asc', 'id') })?.forEach(
    ({ tipo }) => tiposCartao.push(tipo)
  );
  return [...new Set(tiposCartao)];
}

export function datas(datai, dataf) {
  return {
    dataFim: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
    dataInicio: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
  };
}

export function applySortFilter({ dados, comparator, filter, tipoCartao, balcao }) {
  dados = applySort(dados, comparator);

  if (balcao) dados = dados.filter(({ balcao_entrega: be }) => be === balcao);
  if (tipoCartao) dados = dados.filter(({ tipo }) => tipo === tipoCartao);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ nome, numero, cliente, data_emissao: dataEmissao }) =>
        (nome && normalizeText(nome).indexOf(normalizedFilter) !== -1) ||
        (numero && normalizeText(numero).indexOf(normalizedFilter) !== -1) ||
        (cliente && normalizeText(cliente).indexOf(normalizedFilter) !== -1) ||
        (dataEmissao && normalizeText(dataEmissao).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
}
