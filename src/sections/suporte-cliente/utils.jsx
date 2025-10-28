// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { useSelector } from '../../redux/store';
import { setItemValue } from '../../utils/formatObject';
import { colorLabel } from '../../utils/getColorPresets';
// components
import Label from '../../components/Label';
import { SearchField, RemoverFiltros } from '../../components/SearchToolbar';

// ---------------------------------------------------------------------------------------------------------------------

export function useColaborador({ userId, nome }) {
  const { utilizadores } = useSelector((state) => state.suporte);
  const { colaboradores } = useSelector((state) => state.intranet);

  const user = utilizadores?.find(({ id }) => id === userId);
  const colaborador = colaboradores?.find(({ id }) => id === user?.employee_id);

  return nome ? (colaborador?.nome ?? '') : (colaborador ?? null);
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbar({ dados, subjectsList = [], departmentsList = [] }) {
  const { filter, status, subject, department, setStatus, setFilter, setSubject, setDepartment } = dados;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Autocomplete
          fullWidth
          disableClearable
          options={departmentsList}
          value={department || null}
          sx={{ minWidth: { xl: 200, md: 150 } }}
          getOptionLabel={(option) => option?.abreviation || option?.name}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label="Departamento" />}
          onChange={(event, newValue) => setItemValue(newValue, setDepartment, 'departmentTicket', true)}
        />
        <Autocomplete
          fullWidth
          options={statusList}
          value={status || null}
          sx={{ minWidth: { sm: 160 } }}
          getOptionLabel={(option) => option?.label}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label="Estado" />}
          onChange={(event, newValue) => setItemValue(newValue, setStatus, 'statusTicket', true)}
        />
        <Autocomplete
          fullWidth
          value={subject || null}
          options={subjectsList?.sort()}
          sx={{ minWidth: { xl: 300, md: 250 } }}
          renderInput={(params) => <TextField {...params} label="Assunto" />}
          onChange={(event, newValue) => setItemValue(newValue, setSubject, 'subjectTicket')}
        />
      </Stack>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <SearchField item="filterC" filter={filter} setFilter={setFilter} />
        {(filter || subject || status) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filterTicket');
              setItemValue('', setStatus, 'statusTicket');
              setItemValue('', setSubject, 'subjectTicket');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
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
  { id: 'CLOSING', label: 'Fechamento' },
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
