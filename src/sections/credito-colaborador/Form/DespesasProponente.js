import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updatePedidoForm, deleteAnexo } from '../../../redux/slices/cc';
// components
import { DefaultAction } from '../../../components/Actions';
import { FormProvider, RHFNumberField, RHFAutocompleteObject } from '../../../components/hook-form';
//
import { NextPrev } from './PedidoSteps';

// ----------------------------------------------------------------------

DespesasProponente.propTypes = { despesasReg: PropTypes.array };

export default function DespesasProponente({ despesasReg = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { despesas, pedidoForm } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({
    despesas: Yup.array(
      Yup.object({
        despesa: Yup.mixed().required('Seleciona a despesa'),
        valor: Yup.number()
          .typeError('Introduza o valor')
          .positive('O valor deve ser um nº positivo')
          .required('Introduza o valor'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      despesas:
        pedidoForm?.despesas ||
        despesasReg
          ?.filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            valor: row?.valor || '',
            despesa: { id: row?.designacao_id, label: row?.designacao },
          })) ||
        [],
    }),
    [despesasReg, pedidoForm?.despesas]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'despesas' });
  const despesasFiltered = applyFilter(despesas, values?.despesas?.map((row) => row?.despesa?.id) || []);

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoForm, despesasReg]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

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
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title="3. Despesas"
          sx={{ p: 2, pr: 2.5 }}
          action={despesasFiltered.length > 0 && <DefaultAction button label="Adicionar" handleClick={handleAdd} />}
        />
      </Card>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => (
          <Card key={item.id} sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center" justifyContent="center" direction="row">
              <Stack spacing={2} justifyContent="center" direction="row" sx={{ width: 1 }}>
                <RHFAutocompleteObject
                  options={despesasFiltered}
                  label={`Despesa ${index + 1}`}
                  name={`despesas[${index}].despesa`}
                />
                <RHFNumberField tipo="moeda" label="Valor" sx={{ width: '50%' }} name={`despesas[${index}].valor`} />
              </Stack>
              <DefaultAction
                small
                color="error"
                label="ELIMINAR"
                handleClick={() => handleRemove(index, item?.idItem)}
              />
            </Stack>
          </Card>
        ))}
      </Stack>
      <NextPrev back />
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

function applyFilter(despesas, despesasSelect) {
  return despesas
    ?.filter((item) => !despesasSelect.includes(item?.id))
    ?.map((row) => ({ id: row?.id, label: row?.designacao }));
}
