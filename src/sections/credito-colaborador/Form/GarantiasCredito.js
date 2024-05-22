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
import { FormProvider, RHFSwitch, RHFTextField, RHFAutocompleteSimple } from '../../../components/hook-form';
//
import { NextPrev } from './PedidoSteps';
import { AnexosGarantias } from './Anexos';

// ----------------------------------------------------------------------

GarantiasCredito.propTypes = { garantias: PropTypes.array };

export default function GarantiasCredito({ garantias = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoForm } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(
      Yup.object({
        tipo: Yup.mixed().required('Seleciona o tipo da garantia'),
        anexos: Yup.array(
          Yup.object({
            anexo: Yup.mixed().required('Introduza o anexo'),
            descricao: Yup.mixed().required('Seleciona o tipo de anexo'),
          })
        ),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      garantias:
        pedidoForm?.garantias ||
        garantias
          ?.filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            tipo: row?.tipo,
            conta_dp: row?.conta_dp || '',
            descritivo: row?.descritivo || '',
            is_colaborador: row?.is_colaborador,
            numero_hipoteca: row?.numero_hipoteca || '',
            anexos: [],
          })) ||
        [],
    }),
    [garantias, pedidoForm?.garantias]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoForm, garantias]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

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
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title="5. Garantias"
          sx={{ p: 2, pr: 2.5 }}
          action={<DefaultAction button label="Adicionar" handleClick={handleAdd} />}
        />
      </Card>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => {
          const tipo = values?.garantias?.find((row, _index) => _index === index)?.tipo;
          return (
            <Card key={item.id} sx={{ p: 2 }}>
              <Stack spacing={2} justifyContent="center" direction="row">
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
                <DefaultAction small label="REMOVER" handleClick={() => handleRemove(index, item?.idItem)} />
              </Stack>
              <AnexosGarantias indexGarantia={index} garantiaId={item?.idItem} />
            </Card>
          );
        })}
      </Stack>
      <NextPrev back />
    </FormProvider>
  );
}
