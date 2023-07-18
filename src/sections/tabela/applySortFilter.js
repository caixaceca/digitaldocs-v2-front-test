import { normalizeText } from '../../utils/normalizeText';

// ----------------------------------------------------------------------

export default function applySortFilter({ dados, comparator, filter, colaborador, assunto, estado }) {
  const stabilizedThis = dados.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  dados = stabilizedThis.map((el) => el[0]);

  if (colaborador) {
    dados = dados.filter((row) => row?.colaborador === colaborador);
  }
  if (estado === 'Excepto Arquivo') {
    dados = dados.filter((row) => row?.nome !== 'Arquivo');
  } else if (estado === 'Pendente') {
    dados = dados.filter((row) => row?.motivo);
  } else if (estado === 'Excepto Pendente') {
    dados = dados.filter((row) => !row?.motivo);
  } else if (estado) {
    dados = dados.filter((row) => row?.nome === estado);
  }
  if (assunto) {
    dados = dados.filter((row) => row?.assunto === assunto);
  }
  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(filter)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
