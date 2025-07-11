import * as Yup from 'yup';
import { useMemo, useEffect, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { vdt } from '../../utils/formatObject';
import { getItem } from './clausulas/form-clausula';
import { listaTitrulares, listaGarantias, subTiposGarantia } from './applySortFilter';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getDocumento, getSuccess, getFromGaji9 } from '../../redux/slices/gaji9';
// components
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { FilterSwitch } from '../../components/hook-form/RHFSwitch';
import { RHFSwitch, FormProvider, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export function PreviewForm({ id = 0, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);
  const defaultValues = useMemo(() => ({ taxa: '', prazo: '', montante: '', isento: false, representante: false }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(getDocumento('minuta', { id, ...values }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ mb: 2 }}>Pré-visualizar minuta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }} spacing={3}>
            <RHFNumberField name="montante" label="Montante" tipo="CVE" />
            <Stack direction="row" spacing={3}>
              <RHFNumberField name="prazo" label="Prazo" />
              <RHFNumberField name="taxa" label="Taxa negociada" tipo="%" />
            </Stack>
            <Stack direction="row" spacing={1}>
              <RHFSwitch name="isento" label="Isento comissão" />
              <RHFSwitch name="representante" label="Com representante" />
            </Stack>
          </Stack>
          <DialogButons label="Pré-visualizar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function PreviewMinutaForm({ onClose }) {
  const dispatch = useDispatch();
  const [restrito, setRestrito] = useState(false);
  const { isSaving } = useSelector((state) => state.gaji9);
  const { tiposTitulares, tiposGarantias, segmentos, tipoGarantia } = useSelector((state) => state.gaji9);

  const titularCl = localStorage.getItem('titularCl');
  const garantiaCl = localStorage.getItem('garantiaCl');
  const segmentoCl = localStorage.getItem('segmentoCl');
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const subTiposGarant = useMemo(() => subTiposGarantia(tipoGarantia?.subtipos || []), [tipoGarantia?.subtipos]);
  const segmentosList = useMemo(() => segmentos?.map(({ id, designacao }) => ({ id, label: designacao })), [segmentos]);

  const formSchema = Yup.object().shape({
    segmento_id: Yup.mixed().required().label('Segmento'),
    tipo_garantia_id: Yup.mixed().required().label('Garantia'),
    tipo_titular_id: Yup.mixed().required().label('Tipo de titular'),
  });

  const defaultValues = useMemo(
    () => ({
      prazo: '',
      montante: '',
      com_nip: false,
      com_seguro: false,
      isencao_comissao: false,
      isento_imposto_selo: false,
      habitacao_propria_1: false,
      sub_tipo_garantia_id: null,
      taxa_juros_negociado: false,
      com_prazo_utilizacao: false,
      segmento_id: getItem(segmentosList, segmentoCl),
      tipo_titular_id: getItem(titularesList, titularCl),
      tipo_garantia_id: getItem(garantiasList, garantiaCl),
    }),
    [garantiaCl, garantiasList, segmentoCl, segmentosList, titularCl, titularesList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    const params = Object.fromEntries(
      Object.entries({
        ...values,
        segmento_id: values?.segmento_id?.id,
        tipo_titular_id: values?.tipo_titular_id?.id,
        tipo_garantia_id: values?.tipo_garantia_id?.id,
        sub_tipo_garantia_id: values?.sub_tipo_garantia_id?.id,
      }).filter(([, v]) => !!v)
    );
    dispatch(getDocumento('minutav2', { restrito, ...params }));
  };

  useEffect(() => {
    getSuccess({ item: 'tipoGarantia', dados: null });
    if (values?.tipo_garantia_id?.id)
      dispatch(getFromGaji9('tipoGarantia', { id: values?.tipo_garantia_id?.id, notLoading: true }));
  }, [dispatch, values?.tipo_garantia_id?.id]);

  const changeGarantia = (val) => {
    setValue('tipo_garantia_id', val, vdt);
    setValue('sub_tipo_garantia_id', null, vdt);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Pré-visualizar minuta"
        action={<FilterSwitch value={restrito} label="Restrito" setValue={setRestrito} />}
      />
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <GridItem>
              <RHFAutocompleteObj name="tipo_titular_id" label="Tipo de titular" options={titularesList} />
            </GridItem>
            <GridItem children={<RHFAutocompleteObj name="segmento_id" label="Segmento" options={segmentosList} />} />
            <GridItem>
              <Stack direction="row" spacing={3}>
                <RHFAutocompleteObj
                  name="tipo_garantia_id"
                  label="Tipo de garantia"
                  options={garantiasList}
                  onChange={(_, val) => changeGarantia(val)}
                />
                {values?.garantia?.id && subTiposGarant?.length > 0 && (
                  <RHFAutocompleteObj
                    options={subTiposGarant}
                    name="sub_tipo_garantia_id"
                    label="Subtipo da garantia"
                  />
                )}
              </Stack>
            </GridItem>
            <GridItem xs={6} children={<RHFNumberField label="Montante" name="montante" />} />
            <GridItem xs={6} children={<RHFNumberField label="Prazo" name="prazo" />} />
            <GridItem xs={6} children={<RHFSwitch name="isencao_comissao" label="Isenção de comissão" mt />} />
            <GridItem xs={6} children={<RHFSwitch name="isento_imposto_selo" label="Isento de imposto selo" mt />} />
            <GridItem xs={6} children={<RHFSwitch name="taxa_juros_negociado" label="Taxa juros negociada" mt />} />
            <GridItem xs={6} children={<RHFSwitch name="habitacao_propria_1" label="1º habitação própria" mt />} />
            <GridItem xs={6} children={<RHFSwitch name="com_prazo_utilizacao" label="Com prazo de utilização" mt />} />
            <GridItem xs={6} children={<RHFSwitch name="com_seguro" label="Com seguro" mt />} />
            <GridItem children={<RHFSwitch name="com_nip" label="Com NIP" mt />} />
          </Grid>
          <DialogButons label="Pré-visualizar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
