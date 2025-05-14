// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export default function applySortFilter({ from, dados, comparator, filter, colaborador, assunto, estado }) {
  dados = applySort(dados, comparator);

  if (assunto) dados = dados.filter(({ assunto: ass }) => ass === assunto);
  if (colaborador && from === 'Devoluções') dados = dados.filter(({ dono }) => dono === colaborador);
  if (colaborador && (from === 'Entradas' || from === 'Trabalhados'))
    dados = dados.filter(({ colaborador: colab }) => colab === colaborador);

  if (estado === 'Excepto Arquivo') dados = dados.filter(({ nome }) => nome !== 'Arquivo');
  else if (estado === 'Pendente') dados = dados.filter(({ motivo }) => motivo);
  else if (estado === 'Excepto Pendente') dados = dados.filter(({ motivo }) => !motivo);
  else if (estado) dados = dados.filter(({ nome }) => nome === estado);

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1) ||
        (row?.observacao && normalizeText(row?.observacao).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}

// ----------------------------------------------------------------------

export function dadosList(array, colaboradores, uos, from) {
  const dados = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];

  array?.forEach((row) => {
    const uo = uos?.find(({ id }) => id === Number(row?.uo_origem_id));
    const criado = colaboradores?.find(({ id }) => id === Number(row?.perfil_dono_id));
    const colaborador = colaboradores?.find(({ id }) => id === row?.dono || id === row?.perfil_id);
    if (colaborador && !colaboradoresList.includes(colaborador?.label)) colaboradoresList.push(colaborador?.label);

    if (row?.nome && !estadosList.includes(row?.nome)) estadosList.push(row?.nome);
    if (row?.nome === 'Arquivo' && !estadosList.includes('Excepto Arquivo')) estadosList.push('Excepto Arquivo');
    if (from === 'Por concluir' && row?.motivo && !estadosList.includes('Pendente')) estadosList.push('Pendente');
    if (from === 'Por concluir' && row?.motivo && !estadosList.includes('Excepto Pendente'))
      estadosList.push('Excepto Pendente');
    if (row?.assunto && !assuntosList.includes(row?.assunto)) assuntosList.push(row?.assunto);

    dados.push({
      ...row,
      balcao: uo?.balcao || '',
      dono: criado?.label || row?.perfil_dono_id || '',
      colaborador: colaborador?.label || row?.dono || row?.perfil_id || '',
      uoLabel: (uo && uo?.tipo === 'Agências' && `Agência ${uo?.label}`) || uo?.label || '',
    });
  });
  return { dados, estadosList, assuntosList, colaboradoresList };
}
