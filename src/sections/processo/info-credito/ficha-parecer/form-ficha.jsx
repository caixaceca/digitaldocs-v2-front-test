import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { updateFicha } from '../../../../redux/slices/intranet';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '../../../../components/Actions';

const ps = { perfil_id: null, gestor: false, padrao: false, observador: false, data_limite: null, data_inicial: null };

// ---------------------------------------------------------------------------------------------------------------------

export function SituacaoFinancaeiraForm({ conjuge = true, dados = null, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    tipo_contrato: Yup.mixed().required().label('Situação laboral'),
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
    renda_bruto_mensal_conjuge: conjuge && Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal_conjuge: conjuge && Yup.number().positive().label('Rendimento liquido'),
  });

  const defaultValues = useMemo(
    () => ({
      conjuge: !!dados?.conjuge,
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
      renda_bruto_mensal_conjuge: dados?.renda_bruto_mensal_conjuge || '',
      renda_liquido_mensal_conjuge: dados?.renda_liquido_mensal_conjuge || '',
    }),
    [dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const onSubmit = async () => {
    try {
      dispatch(updateFicha(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Situação profissional e Rendimento do agregado</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
            <GridItem>
              <RHFAutocompleteSmp name="tipo_contrato" label="Situação laboral" options={['Quadro', 'Contratado']} />
            </GridItem>
            <GridItem sm={6}>
              <RHFNumberField tipo="CVE" name="renda_bruto_mensal" label="Rendimento bruto" />
            </GridItem>
            <GridItem sm={6}>
              <RHFNumberField tipo="CVE" name="renda_liquido_mensal" label="Rendimento liquido" />
            </GridItem>
            {conjuge && (
              <>
                <GridItem children={<Typography variant="subtitle1">Cônjuge</Typography>} />
                <GridItem sm={6}>
                  <RHFNumberField tipo="CVE" name="renda_bruto_mensal_conjuge" label="Rendimento bruto" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFNumberField tipo="CVE" name="renda_liquido_mensal_conjuge" label="Rendimento liquido" />
                </GridItem>
              </>
            )}
          </Grid>
          <DialogButons edit isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function PerfisEstadoForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const { colaboradores } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(() => ({ perfis: [ps] }), []);
  const formSchema = Yup.object().shape({
    perfis: Yup.array(Yup.object({ perfil_id: Yup.mixed().required().label('Colaborador') })),
  });
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });

  const onSubmit = async () => {
    try {
      dispatch(updateFicha(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        title="Adicionar colaborador"
        action={<AddItem dados={{ small: true, label: 'Colaborador' }} onClick={() => append(ps)} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ mt: 3 }}>
            {fields.map((item, index) => (
              <Stack direction="row" key={item.id} spacing={2} alignItems="center">
                <Stack sx={{ width: 1 }} spacing={1}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                    <Stack direction="row" sx={{ width: { xs: 1, md: '50%' } }}>
                      <RHFAutocompleteObj
                        label="Colaborador"
                        name={`perfis[${index}].perfil_id`}
                        options={colaboradores?.map(({ perfil_id: pid, nome }) => ({ id: pid, label: nome }))}
                        getOptionDisabled={(option) => values.perfis.some(({ perfil }) => perfil?.id === option.id)}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <RHFDatePicker dateTime name={`perfis[${index}].data_inicial`} label="Início" />
                      <RHFDatePicker dateTime name={`perfis[${index}].data_limite`} label="Término" />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <RHFSwitch name={`perfis[${index}].observador`} label="Observador" />
                    <RHFSwitch name={`perfis[${index}].gestor`} label="Gestor" />
                    <RHFSwitch name={`perfis[${index}].padrao`} label="Padrão" />
                  </Stack>
                </Stack>
                {values.perfis.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
              </Stack>
            ))}
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
