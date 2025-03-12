import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate } from '../../../../utils/formatTime';
// redux
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import { DialogButons } from '../../../../components/Actions';
import { DialogConfirmar } from '../../../../components/CustomDialog';
import { shapeMixed, shapeNumber } from '../../../../components/hook-form/yup-shape';
import { FormProvider, RHFDatePicker, RHFNumberField, RHFAutocompleteSmp } from '../../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

FormSituacao.propTypes = { onCancel: PropTypes.func };

export function FormSituacao({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const situacoes = (processo?.credito?.situacao_final_mes === 'Aprovado' && ['Contratado', 'Desistido']) || [
    'Aprovado',
    'Indeferido',
    'Desistido',
  ];

  const formSchema = Yup.object().shape({
    situacao: Yup.mixed().required().label('Situação'),
    data_referencia: Yup.date().typeError().required().label('Data'),
    nivel_decisao: shapeMixed('Decisor', 'Aprovado', '', 'situacao'),
    montante: shapeNumber('Data', 'Aprovado', 'Contratado', 'situacao'),
  });

  const defaultValues = useMemo(
    () => ({ situacao: null, montante: null, data_referencia: null, escalao_decisao: null }),
    []
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        montante: values?.montante ?? null,
        aprovar: values.situacao === 'Aprovado',
        desistir: values.situacao === 'Desistido',
        contratar: values.situacao === 'Contratado',
        indeferir: values.situacao === 'Indeferido',
        escalao_decisao: values?.escalao_decisao ?? null,
        data_referencia: formatDate(values?.data_referencia, 'yyyy-MM-dd'),
      };
      const params = { id: processo?.id, creditoId: processo?.credito?.id, msg: 'Stiuação atualizada' };
      dispatch(
        updateItem('situacaoCredito', JSON.stringify(formData), {
          ...params,
          fillCredito: true,
          afterSuccess: () => onCancel(),
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Atualizar situação do crédito</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteSmp name="situacao" label="Situação" options={situacoes} />
            {values?.situacao === 'Aprovado' && (
              <RHFAutocompleteSmp
                label="Decisor"
                name="nivel_decisao"
                options={['1º Comitê', '2º Comitê', '3º Comitê']}
              />
            )}
            <RHFDatePicker name="data_referencia" label="Data" />
            {(values?.situacao === 'Aprovado' || values?.situacao === 'Contratado') && (
              <RHFNumberField name="montante" label="Montante" tipo="CVE" />
            )}
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} label="Guardar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

EliminarDadosSituacao.propTypes = { onCancel: PropTypes.func };

export function EliminarDadosSituacao({ onCancel }) {
  const dispatch = useDispatch();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const situacao = processo?.credito?.situacao_final_mes;
  const params = { id: processo?.id, creditoId: processo?.credito?.id, msg: 'Stiuação eliminada' };

  return (
    <DialogConfirmar
      onClose={onCancel}
      isSaving={isSaving}
      desc={`eliminar os dados ${situacao} deste processo`}
      handleOk={() =>
        dispatch(
          updateItem(
            'situacaoCredito',
            JSON.stringify({
              montante: null,
              data_referencia: null,
              escalao_decisao: null,
              aprovar: situacao === 'Aprovado',
              desistir: situacao === 'Desistido',
              contratar: situacao === 'Contratado',
              indeferir: situacao === 'Indeferido',
            }),
            { ...params, fillCredito: true, afterSuccess: () => onCancel() }
          )
        )
      }
    />
  );
}
