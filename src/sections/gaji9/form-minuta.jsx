import { useMemo, useEffect } from 'react';

// form
import { useForm } from 'react-hook-form';
// @mui
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
import { DialogButons } from '../../components/Actions';
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
  const { isSaving } = useSelector((state) => state.gaji9);
  const { tiposTitulares, tiposGarantias, segmentos, tipoGarantia } = useSelector((state) => state.gaji9);

  const titularCl = localStorage.getItem('titularCl');
  const garantiaCl = localStorage.getItem('garantiaCl');
  const segmentoCl = localStorage.getItem('segmentoCl');
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const subTiposGarant = useMemo(() => subTiposGarantia(tipoGarantia?.subtipos || []), [tipoGarantia?.subtipos]);
  const segmentosList = useMemo(() => segmentos?.map(({ id, designacao }) => ({ id, label: designacao })), [segmentos]);

  const defaultValues = useMemo(
    () => ({
      sub_garantia: null,
      titular: getItem(titularesList, titularCl),
      segmento: getItem(segmentosList, segmentoCl),
      garantia: getItem(garantiasList, garantiaCl),
    }),
    [garantiaCl, garantiasList, segmentoCl, segmentosList, titularCl, titularesList]
  );
  const methods = useForm({ defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(
      getDocumento('minutav2', {
        segmento_id: values?.segmento?.id,
        tipo_titular_id: values?.titular?.id,
        tipo_garantia_id: values?.garantia?.id,
        sub_tipo_garantia_id: values?.sub_garantia?.id,
      })
    );
  };

  useEffect(() => {
    getSuccess({ item: 'tipoGarantia', dados: null });
    if (values?.garantia?.id) dispatch(getFromGaji9('tipoGarantia', { id: values?.garantia?.id, notLoading: true }));
  }, [dispatch, values?.garantia?.id]);

  const changeGarantia = (val) => {
    setValue('garantia', val, vdt);
    setValue('subtipoGarantia', null, vdt);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ mb: 2 }}>Pré-visualizar minuta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }} spacing={3}>
            <RHFAutocompleteObj name="titular" label="Tipo de titular" options={titularesList} />
            <RHFAutocompleteObj name="segmento" label="Segmento" options={segmentosList} />
            <Stack direction="row" spacing={3}>
              <RHFAutocompleteObj
                name="garantia"
                label="Tipo de garantia"
                options={garantiasList}
                onChange={(_, val) => changeGarantia(val)}
              />
              {values?.garantia?.id && subTiposGarant?.length > 0 && (
                <RHFAutocompleteObj name="subtipoGarantia" label="Subtipo da garantia" options={subTiposGarant} />
              )}
            </Stack>
          </Stack>
          <DialogButons label="Pré-visualizar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
