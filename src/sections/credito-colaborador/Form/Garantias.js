// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { useDispatch } from '../../../redux/store';
import { deleteAnexo } from '../../../redux/slices/cc';
// components
import { AddItem, DeleteItem } from '../../../components/Actions';
import { RHFTextField, RHFSwitch, RHFAutocompleteSimple } from '../../../components/hook-form';
//
import { AnexosGarantias } from './Anexos';

// ----------------------------------------------------------------------

export default function Garantias() {
  const dispatch = useDispatch();
  const { control, watch } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const handleAdd = () => {
    append({
      anexos: [],
      idItem: '',
      tipo: null,
      conta_dp: '',
      descritivo: '',
      numero_hipoteca: '',
      is_colaborador: false,
    });
  };

  const handleRemove = (index, itemId) => {
    if (itemId) {
      dispatch(deleteAnexo({ itemId, tipoItem: 'garantia' }));
    } else {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader
        title="5. Garantias"
        sx={{ pb: fields?.length === 0 && 3 }}
        action={<AddItem button label="Garantia" handleClick={handleAdd} />}
      />
      {fields?.length > 0 && (
        <CardContent>
          <Stack spacing={3}>
            {fields.map((item, index) => {
              const tipo = values?.garantias?.find((row, _index) => _index === index)?.tipo;
              return (
                <Paper key={item.id} elevation={3} sx={{ p: 2 }}>
                  <Stack spacing={2} alignItems="center" justifyContent="center" direction="row">
                    <Stack spacing={2} sx={{ width: 1 }} direction={{ xs: 'column', sm: 'row' }}>
                      <RHFAutocompleteSimple
                        label="Tipo"
                        name={`garantias[${index}].tipo`}
                        options={['Fiança', 'Aval', 'Hipoteca', 'Penhor DP']}
                      />
                      {tipo === 'Penhor DP' && <RHFTextField label="Conta DP" name={`garantias[${index}].conta_dp`} />}
                      {tipo === 'Hipoteca' && (
                        <RHFTextField label="Nº da hipoteca" name={`garantias[${index}].numero_hipoteca`} />
                      )}
                      <RHFTextField label="Descritivo" name={`garantias[${index}].descritivo`} />
                      {tipo === 'Fiança' && (
                        <Stack sx={{ px: 1 }}>
                          <RHFSwitch name={`garantias[${index}].is_colaborador`} label="Caloborador da caixa" />
                        </Stack>
                      )}
                    </Stack>
                    <DeleteItem small handleClick={() => handleRemove(index, item?.idItem)} />
                  </Stack>
                  <AnexosGarantias indexGarantia={index} garantiaId={item?.idItem} />
                </Paper>
              );
            })}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
