import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import { AddItem, DeleteItem } from '../../components/Actions';
import { RHFNumberField, RHFAutocompleteObject } from '../../components/hook-form';

// ----------------------------------------------------------------------

PesosDecisao.propTypes = { perfisList: PropTypes.array };

export default function PesosDecisao({ perfisList }) {
  const { control, watch } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'pesos' });
  const perfisFiltered = applyFilter(perfisList, values?.pesos?.map((row) => row?.perfil?.id) || []);

  const handleAdd = () => {
    append({ perfil: null, percentagem: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <Divider />
      <Stack spacing={3} alignItems="center" justifyContent="space-between" direction="row" sx={{ py: 3 }}>
        <Typography variant="subtitle1">Colaboradores</Typography>
        {fields?.length < perfisList?.length && <AddItem small button label="Colaborador" handleClick={handleAdd} />}
      </Stack>
      <Stack spacing={2}>
        {fields.map((item, index) => (
          <Stack spacing={2} key={item.id} alignItems="center" justifyContent="center" direction="row">
            <RHFAutocompleteObject
              size="small"
              options={perfisFiltered}
              name={`pesos[${index}].perfil`}
              label={`Colaborador ${index + 1}`}
            />
            <RHFNumberField
              size="small"
              tipo="percentagem"
              label="Percentagem"
              sx={{ width: '44%' }}
              name={`pesos[${index}].percentagem`}
            />
            <DeleteItem small handleClick={() => handleRemove(index)} />
          </Stack>
        ))}
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter(perfisList, perfisSelect) {
  return perfisList?.filter((item) => !perfisSelect.includes(item?.id));
}
