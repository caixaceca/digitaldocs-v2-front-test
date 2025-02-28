import * as Yup from 'yup';
import { useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper, DefaultAction } from '../../../../components/Actions';
//
import { listaGarantias } from '../../../gaji9/applySortFilter';

// ----------------------------------------------------------------------

export default function FormGarantiasCredito() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { tiposGarantia } = useSelector((state) => state.parametrizacao);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantia), [tiposGarantia]);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ tipo_garantia_id: Yup.mixed().required().label('Garantia') })),
  });

  const defaultValues = useMemo(() => ({ garantias: dadosStepper?.garantias || [] }), [dadosStepper]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3}>
        {fields?.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', fontStyle: 'italic', p: 3, bgcolor: 'background.neutral', borderRadius: 1 }}
          >
            Ainda não foi adicionada nenhuma garantia...
          </Typography>
        ) : (
          <Stack spacing={3} sx={{ pt: 1 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <Stack sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                    <GridItem sm={6} md={3}>
                      <RHFAutocompleteObj
                        label="Garantia"
                        options={garantiasList}
                        name={`garantias[${index}].tipo_garantia_id`}
                      />
                    </GridItem>
                    <GridItem sm={6} md={3}>
                      <RHFNumberField label="Valor da garantia" name={`garantias[${index}].valor_garantia`} />
                    </GridItem>
                    <GridItem sm={6} md={3}>
                      <RHFTextField label="Moeda" name={`garantias[${index}].moeda`} />
                    </GridItem>
                    <GridItem sm={6} md={3}>
                      <RHFNumberField label="Conta DP" name={`garantias[${index}].conta_dp`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFTextField label="Hipoteca câmara" name={`garantias[${index}].codigo_hipoteca_camara`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFTextField label="Hipoteca cartório" name={`garantias[${index}].codigo_hipoteca_cartorio`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFNumberField label="Nº de entidade" name={`garantias[${index}].numero_entidade`} />
                    </GridItem>
                    <GridItem xs={4} children={<RHFSwitch name="fiador" label="Fiador" otherSx={{ mt: 0 }} />} />
                    <GridItem xs={4} children={<RHFSwitch name="avalista" label="Avalista" otherSx={{ mt: 0 }} />} />
                    <GridItem xs={4} children={<RHFSwitch name="pessoal" label="Pessoal" otherSx={{ mt: 0 }} />} />
                  </Grid>
                </Stack>
                <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
              </Stack>
            ))}
          </Stack>
        )}

        <Stack direction="row" justifyContent="center">
          <DefaultAction
            small
            button
            label="Garantia"
            icon="adicionar"
            handleClick={() =>
              append({
                moeda: '',
                conta_dp: '',
                fiador: false,
                avalista: true,
                pessoal: false,
                valor_garantia: '',
                numero_entidade: '',
                tipo_garantia_id: null,
                codigo_hipoteca_camara: '',
                codigo_hipoteca_cartorio: '',
              })
            }
          />
        </Stack>
      </Stack>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}
