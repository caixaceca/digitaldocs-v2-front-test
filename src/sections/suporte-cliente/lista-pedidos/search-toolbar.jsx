// @mui
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import OutlinedInput from '@mui/material/OutlinedInput';
// utils
import { statusList } from '../utils';
import { setItemValue } from '../../../utils/formatObject';
// components
import { DefaultAction } from '../../../components/Actions';
import { SearchField, RemoverFiltros } from '../../../components/SearchToolbar';

// ---------------------------------------------------------------------------------------------------------------------

export default function SearchToolbar({ dados, lists, extra }) {
  const { admin, colaborador, setColaborador } = extra;
  const { usersList = [], subjectsList = [], departamentos = [] } = lists;
  const { filter, status, subject, department, setStatus, setFilter, setSubject, setDepartment } = dados;

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
          {admin && (
            <Autocomplete
              fullWidth
              options={departamentos}
              value={department || null}
              sx={{ minWidth: { md: 150 } }}
              getOptionLabel={(option) => option?.abreviation || option?.name}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Departamento" />}
              onChange={(event, newValue) => setItemValue(newValue, setDepartment, 'departmentTicket', true)}
            />
          )}
          <Autocomplete
            fullWidth
            value={subject || null}
            options={subjectsList?.sort()}
            sx={{ minWidth: { xl: 250, md: 200 } }}
            renderInput={(params) => <TextField {...params} label="Assunto" />}
            onChange={(event, newValue) => setItemValue(newValue, setSubject, 'subjectTicket')}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
          <Autocomplete
            fullWidth
            value={status || null}
            sx={{ minWidth: { sm: 160 } }}
            getOptionLabel={(option) => option?.label}
            options={statusList?.filter(({ id }) => id !== 'CLOSED')}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Estado" />}
            onChange={(event, newValue) => setItemValue(newValue, setStatus, 'statusTicket', true)}
          />
          <Autocomplete
            fullWidth
            value={colaborador || null}
            options={usersList?.sort()}
            sx={{ minWidth: { xl: 230, md: 180 } }}
            renderInput={(params) => <TextField {...params} label="Atribuído a" />}
            onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorTickets')}
          />
        </Stack>
      </Stack>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <SearchField item="filterC" filter={filter} setFilter={setFilter} />
        {(filter || subject || status) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filterTicket');
              setItemValue('', setStatus, 'statusTicket');
              setItemValue('', setSubject, 'subjectTicket');
              setItemValue('', setColaborador, 'colaboradorTickets');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 260,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 330, boxShadow: theme.customShadows.z8 },
  '& fieldset': { borderWidth: `1px !important`, borderColor: `${theme.palette.grey['500_32']} !important` },
}));

export function SearchTickets({ query, setQuery, searchPedidos }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <SearchStyle
        size="small"
        value={query}
        placeholder="Código ou email..."
        onChange={(event) => setItemValue(event.target.value, setQuery, 'queryTickets')}
      />
      <DefaultAction small label="Procurar" disabled={!query} onClick={searchPedidos} />
    </Stack>
  );
}
