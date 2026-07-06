// utils
import { useSelector } from '@/redux/store';
import { colorLabel } from '@/utils/getColorPresets';
// components
import Label from '@/components/Label';

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

export function LabelAction({ label }) {
  return (
    <Label color={colorLabel(getActionLabel(label), 'default')} variant="ghost">
      {getActionLabel(label)}
    </Label>
  );
}

export function LabelApply({ label }) {
  return (
    <Label color={colorLabel(getApllyLabel(label), 'default')} variant="ghost">
      {getApllyLabel(label)}
    </Label>
  );
}

export function LabelPhase({ label }) {
  return (
    <Label color={colorLabel(getPhasesLabel(label), 'warning')} variant="ghost">
      {getPhasesLabel(label)}
    </Label>
  );
}

export function LabelRole({ label }) {
  return (
    <Label color={colorLabel(getRolesLabel(label), 'success')} variant="ghost">
      {getRolesLabel(label)}
    </Label>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const statusList = [
  { id: 'DRAFT', label: 'Rascunho' },
  { id: 'OPEN', label: 'Pendente' },
  { id: 'IN_PROGRESS', label: 'Em tratamento' },
  { id: 'CLOSED', label: 'Encerrado' },
];

export const phasesList = [
  { id: 'VALIDATION', label: 'Validação' },
  { id: 'OPENING', label: 'Abertura' },
  { id: 'ANALYSIS', label: 'Análise' },
  { id: 'CLOSING', label: 'Fecho' },
  { id: 'REMINDER', label: 'Lembrete' },
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
  { id: 'STATUS_CHANGE', label: 'Mudança de estado' },
  { id: 'SUBJECT_CHANGE', label: 'Mudança de assunto' },
  { id: 'CLOSURE', label: 'Encerramento' },
  { id: 'MESSAGE', label: 'Mensagem' },
  { id: 'OPENING', label: 'Abertura' },
];

export const ratingList = [
  { id: 'VERY_DISSATISFIED', rating: 1, label: 'Muito mau' },
  { id: 'DISSATISFIED', rating: 2, label: 'Mau' },
  { id: 'NEUTRAL', rating: 3, label: 'Razoável' },
  { id: 'SATISFIED', rating: 4, label: 'Bom' },
  { id: 'VERY_SATISFIED', rating: 5, label: 'Excelente' },
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
    if (!item.current_user_id && !item.employee_id) return { ...item, colaborador: null };

    const user = usersById.get(item.current_user_id || item?.employee_id);
    if (!user) return { ...item, colaborador: null };

    const colaborador = colaboradoresById.get(user.employee_id);
    const name = colaborador ? colaborador.nome : item?.current_user_name;

    return { ...item, colaborador: name };
  });
}

// ---------------------------------------------------------------------------------------------------------------------

export function getAccessibleUsers(users, employees, currentUser, department) {
  const filteredUsers = users.filter((user) => {
    switch (currentUser.role) {
      case 'ADMINISTRATOR':
        if (department?.id) return user.department_id === department?.id;
        return true;
      case 'COORDINATOR':
        return user.department_id === currentUser.department_id && user.department_id !== null;
      case 'OPERATOR':
        return user.id === currentUser.id;
      default:
        return false;
    }
  });

  return filteredUsers.map((user) => {
    const employee = employees.find((emp) => emp.id === user.employee_id);
    return { id: user.id, name: employee ? employee.nome : `UserId: ${user.id}` };
  });
}

// ---------------------------------------------------------------------------------------------------------------------

export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  if (value == null || value === '') localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}
