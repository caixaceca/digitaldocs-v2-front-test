import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
// utils
import { getFromGaji9 } from '../../../../redux/slices/gaji9';
import { updateDados } from '../../../../redux/slices/stepper';
import { createItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { useSubtiposGarantia } from '../../../../hooks/useSubtiposGarantia';
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
  numero_entidade: '',
  tipo_garantia_id: null,
  valor_premio_seguro: '',
  subtipo_garantia_id: null,
};

// ---------------------------------------------------------------------------------------------------------------------

export default function GarantiasIniciais() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({ garantias: shapeGarantia() });
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
      <FormGarantias dados={{ fields, append, remove }} />
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasSeparados({ processoId, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    dispatch(getFromGaji9('tiposGarantias'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({ garantias: shapeGarantia() });
  const defaultValues = useMemo(() => ({ garantias: [garantiaSchema] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });

  const { control, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async (values) => {
    const params = { fillCredito: true, processoId, msg: 'Garantias adicionadas', onClose };
    dispatch(createItem('garantias', JSON.stringify(garantiasAssociadas(values.garantias)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt title="Adicionar garantias" onClose={onClose} sx={{ pb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FormGarantias dados={{ fields, append, remove }} />
          <DialogButons onClose={onClose} isSaving={isSaving} hideSubmit={fields?.length === 0} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FormGarantias({ dados }) {
  const { fields, remove, append } = dados;
  return (
    <Stack spacing={3} sx={{ pt: 1 }}>
      {fields?.length === 0 ? (
        <SemDados message="Ainda não foi adicionada nenhuma garantia..." />
      ) : (
        <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {fields.map((item, index) => (
            <Stack direction="row" alignItems="center" spacing={1} key={item.id}>
              <Stack sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Garantia index={index} />
                  <GridItem sm={6}>
                    <RHFNumberField label="Valor da garantia" name={`garantias[${index}].valor_garantia`} />
                  </GridItem>
                  <GridItem xs={6} sm={3}>
                    <RHFNumberField noFormat label="Nº de entidade" name={`garantias[${index}].numero_entidade`} />
                  </GridItem>
                  <GridItem xs={6} sm={3}>
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

function Garantia({ index }) {
  const { tiposGarantias } = useSelector((state) => state.gaji9);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);

  const { watch, setValue } = useFormContext();
  const tipo = watch(`garantias[${index}].tipo_garantia_id`);
  const subtipos = useSubtiposGarantia(tipo, setValue, index);

  return (
    <>
      <GridItem sm={subtipos.length > 0 ? 6 : 12}>
        <RHFAutocompleteObj label="Garantia" options={garantiasList} name={`garantias[${index}].tipo_garantia_id`} />
      </GridItem>

      {subtipos.length > 0 ? (
        <GridItem sm={6}>
          <RHFAutocompleteObj
            label="Subtipo da garantia"
            name={`garantias[${index}].subtipo_garantia_id`}
            options={subtipos.map((s) => ({ id: s?.id, label: s?.designacao }))}
          />
        </GridItem>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const shapeGarantia = () =>
  Yup.array(
    Yup.object({
      tipo_garantia_id: Yup.mixed().required().label('Garantia'),
      subtipo_garantia_id: Yup.mixed().when('tipo_garantia_id', {
        is: (tipo) => Boolean(tipo?.subtipos),
        then: (schema) => schema.required().label('Subtipo da garantia'),
        otherwise: (schema) => schema.nullable(),
      }),
      numero_entidade: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .when('tipo_garantia_id', {
          is: (tipo) => tipo && tipo.reais === false,
          then: (schema) => schema.positive().typeError('Introduza um número').required().label('Nº da entidade'),
          otherwise: (schema) => schema.nullable(),
        }),
    })
  );
