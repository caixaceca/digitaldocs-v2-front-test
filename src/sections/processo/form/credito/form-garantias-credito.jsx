import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { getFromGaji9 } from '../../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../../redux/store';
import { createItem, updateItem } from '../../../../redux/slices/digitaldocs';
// components
import {
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import { DialogButons } from '../../../../components/Actions';
import { DialogTitleAlt } from '../../../../components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export function SeguroForm({ onClose, selectedItem, ids }) {
  const dispatch = useDispatch();
  const isEdit = selectedItem?.modal === 'editar';
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const segurosList = useMemo(() => tiposSeguros.map((s) => ({ id: s?.id, label: s?.designacao })), [tiposSeguros]);

  useEffect(() => {
    dispatch(getFromGaji9('tiposSeguros'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    apolice: Yup.string().required().label('Apólice'),
    seguradora: Yup.mixed().required().label('Seguradora'),
    tipo_seguro_id: Yup.mixed().required().label('Tipo de seguro'),
    valor_seguro: Yup.number().positive().required().label('Valor do seguro'),
  });

  const defaultValues = useMemo(
    () => ({
      credito_id: ids?.creditoId ?? '',
      garantia_id: ids?.garantiaId ?? '',
      apolice: selectedItem?.apolice ?? '',
      seguradora: selectedItem?.seguradora ?? null,
      valor_seguro: selectedItem?.valor_seguro ?? '',
      tipo_seguro_id: segurosList?.find(({ id }) => id === selectedItem?.tipo_seguro_id) ?? null,
    }),
    [ids, segurosList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    const msg = `Seguro ${isEdit ? 'atualizado' : 'adicionado'}`;
    const formData = { ...values, tipo_seguro_id: values?.tipo_seguro_id?.id };
    const params = { id: selectedItem?.id, ...ids, put: true, fillCredito: true };
    dispatch((isEdit ? updateItem : createItem)('seguros', JSON.stringify(formData), { ...params, msg, onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitleAlt title={isEdit ? 'Editar seguro' : 'Adicionar seguro'} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj label="Tipo de seguro" options={segurosList} name="tipo_seguro_id" />
            <RHFAutocompleteSmp
              name="seguradora"
              label="Seguradora"
              options={['Aliança Seguros', 'Garantia Seguros', 'Impar Seguros']}
            />
            <RHFTextField name="apolice" label="Apólice" />
            <RHFNumberField name="valor_seguro" label="Valor do seguro" tipo="CVE" />
          </Stack>
          <DialogButons edit={isEdit} onClose={onClose} isSaving={isSaving} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
