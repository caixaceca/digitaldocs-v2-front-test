import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { statusList } from '../../utils';
import { RHFDateIF } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function SearchToolbar({ values, setValues, lists }) {
  const { colaborador, status, subject, department } = values;
  const { usersList = [], subjectsList = [], departmentList = [] } = lists;
  const { setStatus, setColaborador, setSubject, setDepartment } = setValues;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1, maxWidth: { md: '40%' } }}>
        <SearchFilter
          value={department}
          label="Departamento"
          dados={departmentList}
          setValue={setDepartment}
          disabled={departmentList.length < 2}
        />
        <SearchFilter value={status} dados={statusList} setValue={setStatus} label="Estado" />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
        <SearchFilter value={subject} dados={subjectsList} setValue={setSubject} label="Assunto" />
        <SearchFilter value={colaborador} dados={usersList} setValue={setColaborador} label="Atribuído a" />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchTrabalhados({ values, setValues, lists }) {
  const { colaborador, datai, dataf, subject, department } = values;
  const { usersList = [], subjectsList = [], departmentList = [] } = lists;
  const { setDatai, setDataf, setColaborador, setSubject, setDepartment } = setValues;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { md: '50%' } }}>
        <RHFDateIF options={{ datai, dataf, setDatai, setDataf, small: false }} />
        <SearchFilter
          disableClearable
          value={department}
          label="Departamento"
          dados={departmentList}
          setValue={setDepartment}
          disabled={departmentList.length < 2}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { md: '50%' } }}>
        <SearchFilter value={colaborador} dados={usersList} setValue={setColaborador} label="Trabalhado por" />
        <SearchFilter value={subject} dados={subjectsList} setValue={setSubject} label="Assunto" />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchAvaliacoes({ values, setValues, lists }) {
  const { rating, subject } = values;
  const { setSubject, setRating } = setValues;
  const { ratingList = [], subjectsList = [] } = lists;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <SearchFilter
        value={rating}
        label="Avaliação"
        setValue={setRating}
        sx={{ maxWidth: { xs: 1, sm: 230 } }}
        dados={ratingList?.map(({ rating, label }) => ({ id: rating, label }))}
      />
      <SearchFilter value={subject} dados={subjectsList} setValue={setSubject} label="Assunto" />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SearchFilter({ value, dados, setValue, label, ...others }) {
  const getLabel = (option) => option?.abreviation || option?.name || option?.label || '';

  const sortedDados = useMemo(() => {
    if (!dados) return [];
    return [...dados].sort((a, b) => {
      const labelA = getLabel(a);
      const labelB = getLabel(b);
      return labelA.localeCompare(labelB, 'pt', { sensitivity: 'base' });
    });
  }, [dados]);

  return (
    <Autocomplete
      fullWidth
      value={value}
      options={label === 'Estado' ? dados : sortedDados}
      onChange={(event, newValue) => setValue(newValue)}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      getOptionLabel={getLabel}
      {...others}
    />
  );
}
