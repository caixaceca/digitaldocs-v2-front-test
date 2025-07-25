import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { createItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import GridItem from '../../../../components/GridItem';
import { SemDados } from '../../../../components/Panel';
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { DefaultAction, DialogButons, ButtonsStepper } from '../../../../components/Actions';
import { FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteObj } from '../../../../components/hook-form';
//
import { garantiasAssociadas } from '../anexos/utils-anexos';
import { listaGarantias } from '../../../gaji9/applySortFilter';

const garantiaSchema = {
  valor_garantia: '',
  numero_livranca: '',
  numero_entidade: null,
  tipo_garantia_id: null,
  valor_premio_seguro: '',
};

// ---------------------------------------------------------------------------------------------------------------------

export default function GarantiasIniciais() {
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
      <FormGarantias dados={{ fields, append, remove, garantiasList }} />
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasSeparados({ processoId, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { tiposGarantia } = useSelector((state) => state.parametrizacao);

  const garantiasList = useMemo(() => listaGarantias(tiposGarantia), [tiposGarantia]);

  useEffect(() => {
    dispatch(getFromParametrizacao('tiposGarantia'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ tipo_garantia_id: Yup.mixed().required().label('Garantia') })),
  });

  const defaultValues = useMemo(() => ({ garantias: [garantiaSchema] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    const params = { fillCredito: true, processoId, msg: 'Garantias adicionadas', onClose };
    dispatch(createItem('garantias', JSON.stringify(garantiasAssociadas(values.garantias)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt title="Adicionar garantias" onClose={onClose} sx={{ pb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }}>
            <FormGarantias dados={{ fields, append, remove, garantiasList }} />
          </Stack>
          <DialogButons onClose={onClose} isSaving={isSaving} hideSubmit={fields?.length === 0} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FormGarantias({ dados }) {
  const { fields, remove, append, garantiasList } = dados;
  return (
    <Stack spacing={3}>
      {fields?.length === 0 ? (
        <SemDados message="Ainda não foi adicionada nenhuma garantia..." />
      ) : (
        <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {fields.map((item, index) => (
            <Stack direction="row" alignItems="center" spacing={1} key={item.id}>
              <Stack sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <GridItem sm={6} md={5}>
                    <RHFAutocompleteObj
                      label="Garantia"
                      options={garantiasList}
                      name={`garantias[${index}].tipo_garantia_id`}
                    />
                  </GridItem>
                  <GridItem sm={6} md={3}>
                    <RHFNumberField label="Valor da garantia" name={`garantias[${index}].valor_garantia`} />
                  </GridItem>
                  <GridItem xs={6} md={2}>
                    <RHFNumberField noFormat label="Nº de entidade" name={`garantias[${index}].numero_entidade`} />
                  </GridItem>
                  <GridItem xs={6} md={2}>
                    <RHFTextField label="Nº de livrança" name={`garantias[${index}].numero_livranca`} />
                  </GridItem>
                </Grid>
              </Stack>
              <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
            </Stack>
          ))}
        </Stack>
      )}
      <Stack direction="row" justifyContent="center">
        <DefaultAction small button label="Garantia" icon="adicionar" onClick={() => append(garantiaSchema)} />
      </Stack>
    </Stack>
  );
}
