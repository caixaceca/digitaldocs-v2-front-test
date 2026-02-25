import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getFromIntranet } from '@/redux/slices/intranet';
// components
import { DefaultAction } from '@/components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export function SearchEntidade({ entidades }) {
  const dispatch = useDispatch();
  const { fichaInformativa } = useSelector((state) => state.intranet);
  const [entidade, setEntidade] = useState(fichaInformativa?.numero || entidades?.[0] || null);

  useEffect(() => {
    if (entidade && !fichaInformativa) dispatch(getFromIntranet('fichaInformativa', { entidade }));
  }, [dispatch, entidade, fichaInformativa]);

  const handleSearch = () => dispatch(getFromIntranet('fichaInformativa', { entidade }));

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <Autocomplete
        fullWidth
        size="small"
        disableClearable
        options={entidades}
        sx={{ minWidth: 130 }}
        value={entidade || null}
        onChange={(event, newValue) => setEntidade(newValue)}
        renderInput={(params) => <TextField {...params} label="Entidade" />}
      />
      {entidade && <DefaultAction small label="PROCURAR" onClick={() => handleSearch()} />}
    </Stack>
  );
}
