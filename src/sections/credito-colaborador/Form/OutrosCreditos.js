// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { useDispatch } from '../../../redux/store';
import { deleteAnexo } from '../../../redux/slices/cc';
// components
import { AddItem, DeleteItem } from '../../../components/Actions';
import { RHFNumberField, RHFSwitch } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export default function OutrosCreditos() {
  const dispatch = useDispatch();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'outros_creditos' });

  const handleAdd = () => {
    append({
      idItem: '',
      montante: '',
      taxa_juro: '',
      na_caixa: true,
      prazo_restante: '',
      capital_em_divida: '',
      prazo_amortizacao: '',
    });
  };

  const handleRemove = (index, itemId) => {
    if (itemId) {
      dispatch(deleteAnexo({ itemId, tipoItem: 'responsabilidade' }));
    } else {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader
        title="4. Responsabilidades"
        sx={{ pb: fields?.length === 0 && 3 }}
        action={<AddItem button label="Crédito" handleClick={handleAdd} />}
      />
      {fields?.length > 0 && (
        <CardContent>
          <Stack spacing={2}>
            {fields.map((item, index) => (
              <Stack spacing={2} key={item.id} justifyContent="center" direction={{ xs: 'column', lg: 'row' }}>
                <Stack spacing={2} sx={{ width: 1 }} justifyContent="center" direction={{ xs: 'column', sm: 'row' }}>
                  <RHFNumberField tipo="moeda" label="Capital inicial" name={`outros_creditos[${index}].montante`} />
                  <RHFNumberField
                    tipo="moeda"
                    label="Capital em dívida"
                    name={`outros_creditos[${index}].capital_em_divida`}
                  />
                  <RHFNumberField
                    tipo="percentagem"
                    label="Taxa de juros"
                    name={`outros_creditos[${index}].taxa_juro`}
                  />
                </Stack>
                <Stack
                  spacing={2}
                  sx={{ width: 1 }}
                  alignItems="center"
                  justifyContent="center"
                  direction={{ xs: 'column', sm: 'row' }}
                >
                  <RHFNumberField
                    tipo="prestacao"
                    label="Prazo de amortização"
                    name={`outros_creditos[${index}].prazo_amortizacao`}
                  />
                  <RHFNumberField
                    tipo="prestacao"
                    label="Prazo restante"
                    name={`outros_creditos[${index}].prazo_restante`}
                  />
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <RHFSwitch name={`outros_creditos[${index}].na_caixa`} label="Caixa" />
                    <DeleteItem small handleClick={() => handleRemove(index, item?.idItem)} />
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
