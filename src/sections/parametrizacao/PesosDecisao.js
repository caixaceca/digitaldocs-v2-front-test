import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
// components
import { AddItem, DefaultAction } from '../../components/Actions';
import { RHFSwitch, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';

// ----------------------------------------------------------------------

PesosDecisao.propTypes = { perfisList: PropTypes.array, isEdit: PropTypes.bool };

export default function PesosDecisao({ perfisList, isEdit }) {
  const { control, watch } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'pesos' });
  const perfisFiltered = applyFilter(perfisList, values?.pesos?.map((row) => row?.perfil?.id) || []);

  return (
    <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ pt: 3 }}>
      {fields.map((item, index) => (
        <Stack direction="row" spacing={2} key={item.id} alignItems="center">
          <Stack spacing={2} sx={{ width: 1 }}>
            <RHFAutocompleteObj
              options={perfisFiltered}
              name={`pesos[${index}].perfil_id`}
              label={`Colaborador ${index + 1}`}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} key={item.id} alignItems="center">
              <RHFNumberField tipo="%" label="Percentagem" name={`pesos[${index}].percentagem`} />
              <Stack direction="row" spacing={2}>
                <RHFSwitch name={`pesos[${index}].para_aprovacao`} label="Aprovação" />
                <RHFSwitch name={`pesos[${index}].facultativo`} label="Facultativo" />
              </Stack>
            </Stack>
          </Stack>
          {fields?.length > 1 && (
            <DefaultAction color="error" label="ELIMINAR" small handleClick={() => remove(index)} />
          )}
        </Stack>
      ))}
      {!isEdit && fields?.length < perfisList?.length && (
        <Stack direction="column" alignItems="center">
          <AddItem
            dados={{ small: true, label: 'Colaborador' }}
            handleClick={() => append({ perfil: null, percentagem: null, facultativo: false, para_aprovacao: false })}
          />
        </Stack>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function applyFilter(perfisList, perfisSelect) {
  return perfisList?.filter((item) => !perfisSelect.includes(item?.id));
}
