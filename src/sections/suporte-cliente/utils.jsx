// utils
import { useSelector } from '../../redux/store';
import { colorLabel } from '../../utils/getColorPresets';
// components
import Label from '../../components/Label';

// ---------------------------------------------------------------------------------------------------------------------

export function useColaborador({ userId, nome }) {
  const { utilizadores } = useSelector((state) => state.suporte);
  const { colaboradores } = useSelector((state) => state.intranet);

  const user = utilizadores?.find(({ id }) => id === userId);
  const colaborador = colaboradores?.find(({ id }) => id === user?.employee_id);

  const retornarNome = colaborador?.nome ?? '';
  const retornarObjeto = colaborador ?? null;

  return nome ? retornarNome : retornarObjeto;
}

// ---------------------------------------------------------------------------------------------------------------------

export function LabelStatus({ label }) {
  return (
    <Label color={colorLabel(getStatusLabel(label), 'default')} variant="ghost">
      {getStatusLabel(label)}
    </Label>
  );
}

export function LabelApply({ label }) {
  return (
    <Label color={colorLabel(getApllyLabel(label), 'default')} variant="ghost">
      {getStatusLabel(label)}
    </Label>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const statusList = [
  { id: 'DRAFT', label: 'Rascunho' },
  { id: 'OPEN', label: 'Pendente' },
  { id: 'IN_PROGRESS', label: 'Em análise' },
  { id: 'CLOSED', label: 'Fechado' },
];

export const phasesList = [
  { id: 'VALIDATION', label: 'Validação' },
  { id: 'OPENING', label: 'Abertura' },
  { id: 'ANALYSIS', label: 'Análise' },
  { id: 'CLOSING', label: 'Fecho' },
];

export const applyList = [
  { id: 'CUSTOMER', label: 'Clientes' },
  { id: 'NON_CUSTOMER', label: 'Não clientes' },
  { id: 'BOTH', label: 'Ambos' },
];

export const rolesList = [
  { id: 'OPERATOR', label: 'Operador' },
  { id: 'COORDINATOR', label: 'Chefia' },
  { id: 'ADMINISTRATOR', label: 'Administrador' },
];

export const customerTypeList = [
  { id: 'PRIVATE', label: 'Particular' },
  { id: 'CORPORATE', label: 'Empresa' },
];

export const departsTypeList = [
  { id: 'AGENCY', label: 'Agência' },
  { id: 'CENTRAL_SERVICES', label: 'Serviço central' },
];

export const actionsList = [
  { id: 'ASSIGNMENT', label: 'Atribuição' },
  { id: 'FORWARDING', label: 'Encaminhamento' },
  { id: 'STATUS_CHANGE', label: 'Alteração do estado' },
];

export const ratingList = [
  { id: 'VERY_DISSATISFIED', rating: 1, label: 'Muito insatisfeito' },
  { id: 'UNSATISFIED', rating: 2, label: 'Insatisfeito' },
  { id: 'NEUTRAL', rating: 3, label: 'Neutro' },
  { id: 'SATISFIED', rating: 4, label: 'Satisfeito' },
  { id: 'VERY_SATISFIED', rating: 5, label: 'Muito satisfeito' },
];

// ---------------------------------------------------------------------------------------------------------------------

const buildLabelGetter = (list) => (id) => list.find((item) => item.id === id)?.label || id;

export const getApllyLabel = buildLabelGetter(applyList);
export const getRolesLabel = buildLabelGetter(rolesList);
export const getStatusLabel = buildLabelGetter(statusList);
export const getPhasesLabel = buildLabelGetter(phasesList);
export const getActionLabel = buildLabelGetter(actionsList);
export const getDepartTypeLabel = buildLabelGetter(departsTypeList);
export const getCustomerTypeLabel = buildLabelGetter(customerTypeList);

// ---------------------------------------------------------------------------------------------------------------------

export const getColorRating = (rating) => {
  if (rating < 1.5) return 'error.main';
  if (rating >= 1.5 && rating <= 2.5) return 'warning.main';
  if (rating >= 2.5 && rating <= 3.5) return 'focus.main';
  if (rating >= 3.5 && rating <= 4.5) return 'info.main';
  return 'success.main';
};

// ---------------------------------------------------------------------------------------------------------------------

export function injectCollaboratorName(data, users, colaboradores) {
  const usersById = new Map(users.map((u) => [u.id, u]));
  const colaboradoresById = new Map(colaboradores.map((c) => [c.id, c]));

  return data.map((item) => {
    if (!item.current_user_id) return { ...item, colaborador: null };

    const user = usersById.get(item.current_user_id);
    if (!user) return { ...item, colaborador: null };

    const colaborador = colaboradoresById.get(user.employee_id);
    const name = colaborador ? colaborador.nome : item?.current_user_name;

    return { ...item, colaborador: name };
  });
}
