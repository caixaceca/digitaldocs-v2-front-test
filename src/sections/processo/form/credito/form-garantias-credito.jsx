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
import { useSelector, useDispatch } from '../../../../redux/store';
import { createItem, updateItem } from '../../../../redux/slices/digitaldocs';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { SemDados } from '../../../../components/Panel';
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { DefaultAction, DialogButons } from '../../../../components/Actions';
//
import { garantiasAssociadas } from '../anexos/utils-anexos';
import { listaGarantias } from '../../../gaji9/applySortFilter';

const garantiaSquema = {
  moeda: '',
  conta_dp: '',
  fiador: false,
  avalista: false,
  pessoal: false,
  valor_garantia: '',
  numero_entidade: null,
  tipo_garantia_id: null,
  codigo_hipoteca_camara: '',
  codigo_hipoteca_cartorio: '',
};

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiasSeparados({ dados }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { tiposGarantia } = useSelector((state) => state.parametrizacao);

  const { isEdit, garantia, creditoId, processoId, onClose } = dados;
  const garantiasList = useMemo(() => listaGarantias(tiposGarantia), [tiposGarantia]);

  useEffect(() => {
    dispatch(getFromParametrizacao('tiposGarantia'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ tipo_garantia_id: Yup.mixed().required().label('Garantia') })),
  });

  const defaultValues = useMemo(
    () => ({
      garantias: garantia
        ? [{ ...garantia, tipo_garantia_id: garantiasList?.find(({ id }) => id === garantia?.tipo_garantia_id) }]
        : [garantiaSquema],
    }),
    [garantia, garantiasList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    const params = {
      onClose,
      creditoId,
      processoId,
      fillCredito: true,
      id: garantia?.id || '',
      msg: isEdit ? 'Garantia atualizada' : 'Garantias adicionadas',
    };
    const formData = garantiasAssociadas(values.garantias);
    dispatch(
      (isEdit ? updateItem : createItem)('garantias', JSON.stringify(isEdit ? formData[0] : formData), { ...params })
    );
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt title={isEdit ? 'Atualizar garantia' : 'Adicionar garantias'} onClose={onClose} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <FormGarantias dados={{ fields, append, remove, garantiasList, isEdit }} />
          <DialogButons
            isSaving={isSaving}
            onClose={onClose}
            label={isEdit ? 'Guardar' : ''}
            hideSubmit={fields?.length === 0}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function FormGarantias({ dados }) {
  const { fields, remove, append, garantiasList, isEdit } = dados;
  return (
    <Stack spacing={3} sx={{ pt: 3 }}>
      {fields?.length === 0 ? (
        <SemDados message="Ainda não foi adicionada nenhuma garantia..." />
      ) : (
        <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {fields.map((item, index) => (
            <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
              <Stack sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <GridItem md={6}>
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
                    <RHFNumberField noFormat label="Nº de entidade" name={`garantias[${index}].numero_entidade`} />
                  </GridItem>
                  <GridItem sm={6} md={3}>
                    <RHFNumberField noFormat label="Conta DP" name={`garantias[${index}].conta_dp`} />
                  </GridItem>
                  <GridItem sm={6} md={3}>
                    <RHFTextField label="Hipoteca câmara" name={`garantias[${index}].codigo_hipoteca_camara`} />
                  </GridItem>
                  <GridItem sm={6} md={3}>
                    <RHFTextField label="Hipoteca cartório" name={`garantias[${index}].codigo_hipoteca_cartorio`} />
                  </GridItem>
                  <GridItem xs={4}>
                    <RHFSwitch name={`garantias[${index}].fiador`} label="Fiador" otherSx={{ mt: 0 }} />
                  </GridItem>
                  <GridItem xs={4}>
                    <RHFSwitch name={`garantias[${index}].avalista`} label="Avalista" otherSx={{ mt: 0 }} />
                  </GridItem>
                  <GridItem xs={4}>
                    <RHFSwitch name={`garantias[${index}].pessoal`} label="Pessoal" otherSx={{ mt: 0 }} />
                  </GridItem>
                </Grid>
              </Stack>
              {!isEdit && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
            </Stack>
          ))}
        </Stack>
      )}

      {!isEdit && (
        <Stack direction="row" justifyContent="center">
          <DefaultAction small button label="Garantia" icon="adicionar" onClick={() => append(garantiaSquema)} />
        </Stack>
      )}
    </Stack>
  );
}
