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
import { FormProvider, RHFNumberField, RHFSwitch } from '../../../components/hook-form';
//
import { NextPrev } from './PedidoSteps';

// ----------------------------------------------------------------------

Responsabilidades.propTypes = { responsabilidades: PropTypes.array };

export default function Responsabilidades({ responsabilidades = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoForm } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({
    responsabilidades: Yup.array(
      Yup.object({
        taxa_juro: Yup.number().typeError('Introduza a taxa de juros'),
        montante: Yup.number().typeError('Introduza o capital inicial'),
        prazo_restante: Yup.number().typeError('Introduza o prazo restante'),
        capital_em_divida: Yup.number().typeError('Introduza o capital em dívida'),
        prazo_amortizacao: Yup.number().typeError('Introduza o prazo de amortização'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      responsabilidades:
        pedidoForm?.responsabilidades ||
        responsabilidades
          .filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            na_caixa: row?.na_caixa,
            montante: row?.montante,
            taxa_juro: row?.taxa_juro,
            prazo_restante: row?.prazo_restante,
            capital_em_divida: row?.capital_em_divida,
            prazo_amortizacao: row?.prazo_amortizacao,
          })) ||
        [],
    }),
    [responsabilidades, pedidoForm?.responsabilidades]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'responsabilidades' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoForm, responsabilidades]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

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
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          sx={{ p: 2, pr: 2.5 }}
          title="4. Responsabilidades"
          action={<DefaultAction button label="Adicionar" handleClick={handleAdd} />}
        />
      </Card>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => (
          <Card key={item.id} sx={{ p: 2 }}>
            <Stack spacing={2} justifyContent="center" direction="row" alignItems="center">
              <Stack spacing={2} sx={{ width: 1 }}>
                <Stack spacing={2} justifyContent="center" direction={{ xs: 'column', sm: 'row' }}>
                  <RHFSwitch name={`responsabilidades[${index}].na_caixa`} label="Dívida na Caixa" />
                  <RHFNumberField tipo="moeda" label="Capital inicial" name={`responsabilidades[${index}].montante`} />
                  <RHFNumberField
                    tipo="moeda"
                    label="Capital em dívida"
                    name={`responsabilidades[${index}].capital_em_divida`}
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
                    tipo="percentagem"
                    label="Taxa de juros"
                    name={`responsabilidades[${index}].taxa_juro`}
                  />
                  <RHFNumberField
                    tipo="prestacao"
                    label="Prazo de amortização"
                    name={`responsabilidades[${index}].prazo_amortizacao`}
                  />
                  <RHFNumberField
                    tipo="prestacao"
                    label="Prazo restante"
                    name={`responsabilidades[${index}].prazo_restante`}
                  />
                </Stack>
              </Stack>
              <DefaultAction
                small
                label="ELIMINAR"
                color="error"
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
