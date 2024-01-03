// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { deleteAnexo } from '../../../redux/slices/cc';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import { AddItem, DeleteItem } from '../../../components/Actions';
import { RHFNumberField, RHFAutocompleteObject } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export default function Despesas() {
  const dispatch = useDispatch();
  const { control, watch } = useFormContext();
  const values = watch();
  const { despesas } = useSelector((state) => state.cc);
  const { fields, append, remove } = useFieldArray({ control, name: 'despesas' });
  const despesasFiltered = applyFilter(despesas, values?.despesas?.map((row) => row?.despesa?.id) || []);

  const handleAdd = () => {
    append({ idItem: '', despesa: null, valor: '' });
  };

  const handleRemove = (index, itemId) => {
    if (itemId) {
      dispatch(deleteAnexo({ itemId, tipoItem: 'despesa' }));
    } else {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader
        title="3. Despesas"
        sx={{ pb: fields?.length === 0 ? 3 : 0 }}
        action={despesasFiltered.length > 0 && <AddItem label="Despesa" handleClick={handleAdd} />}
      />
      {fields?.length > 0 && (
        <CardContent>
          <Stack spacing={2}>
            {fields.map((item, index) => (
              <Stack spacing={2} key={item.id} alignItems="center" justifyContent="center" direction="row">
                <RHFAutocompleteObject
                  options={despesasFiltered}
                  label={`Despesa ${index + 1}`}
                  name={`despesas[${index}].despesa`}
                />
                <RHFNumberField tipo="moeda" label="Valor" sx={{ width: '60%' }} name={`despesas[${index}].valor`} />
                <DeleteItem small handleClick={() => handleRemove(index, item?.idItem)} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function applyFilter(despesas, despesasSelect) {
  return despesas
    ?.filter((item) => !despesasSelect.includes(item?.id))
    ?.map((row) => ({ id: row?.id, label: row?.designacao }));
}
