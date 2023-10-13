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

// ----------------------------------------------------------------------

export function dadosList(array, colaboradores, tab) {
  const dados = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];
  array?.forEach((row) => {
    let colaboradorNome = '';
    if (tab === 'entradas' || tab === 'porconcluir') {
      const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.dono));
      if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
        colaboradoresList.push(colaborador?.perfil?.displayName);
      }
      colaboradorNome = colaborador?.perfil?.displayName;
    } else {
      const colaborador = colaboradores?.find((colab) => Number(colab.perfil_id) === Number(row?.perfil_id));
      if (colaborador && !colaboradoresList?.some((item) => item.id === colaborador.id)) {
        colaboradoresList.push(colaborador);
      }
      colaboradorNome = colaborador?.perfil?.displayName;
    }
    if (!estadosList.includes(row?.nome)) {
      estadosList.push(row?.nome);
    }
    if (row?.nome === 'Arquivo' && !estadosList.includes('Excepto Arquivo')) {
      estadosList.push('Excepto Arquivo');
    }
    if (row?.motivo && !estadosList.includes('Pendente')) {
      estadosList.push('Pendente');
    }
    if (row?.motivo && !estadosList.includes('Excepto Pendente')) {
      estadosList.push('Excepto Pendente');
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    dados.push({ ...row, colaborador: colaboradorNome });
  });
  return { dados, estadosList, assuntosList, colaboradoresList };
}
