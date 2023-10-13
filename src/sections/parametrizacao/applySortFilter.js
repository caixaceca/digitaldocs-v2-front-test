// utils
import { normalizeText } from '../../utils/normalizeText';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  const stabilizedThis = dados.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  dados = stabilizedThis.map((el) => el[0]);

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.modelo && normalizeText(row?.modelo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.linha && normalizeText(row?.linha).indexOf(normalizeText(filter)) !== -1) ||
        (row?.descricao && normalizeText(row?.descricao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.acesso && normalizeText(row?.acesso).indexOf(normalizeText(filter)) !== -1) ||
        (row?.objeto && normalizeText(row?.objeto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.obs && normalizeText(row?.obs).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.seguimento && normalizeText(row?.seguimento).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo && normalizeText(row?.tipo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.ilha && normalizeText(row?.ilha).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cidade && normalizeText(row?.cidade).indexOf(normalizeText(filter)) !== -1) ||
        (row?.email && normalizeText(row?.email).indexOf(normalizeText(filter)) !== -1) ||
        (row?.telefone && normalizeText(row?.telefone).indexOf(normalizeText(filter)) !== -1) ||
        (row.estado_inicial && normalizeText(row?.estado_inicial).indexOf(normalizeText(filter)) !== -1) ||
        (row.estado_final && normalizeText(row?.estado_final).indexOf(normalizeText(filter)) !== -1) ||
        (row?.referencia && normalizeText(row?.referencia).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1) ||
        (row?.processo && normalizeText(row?.processo).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
