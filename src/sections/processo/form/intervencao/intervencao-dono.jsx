import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { vdt } from '../../../../utils/formatObject';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
import { getInfoProcesso, updateItem } from '../../../../redux/slices/digitaldocs';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';
// components
import { DialogButons } from '../../../../components/Actions';
import { DialogConfirmar } from '../../../../components/CustomDialog';
import { FormProvider, RHFTextField, RHFAutocompleteObj } from '../../../../components/hook-form';

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

ResgatarForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function ResgatarForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      color="warning"
      title="Resgatar"
      desc="resgatar este processo"
      handleOk={() => dispatch(getInfoProcesso('resgatar', { ...dados, msg: 'Processo resgatado' }))}
    />
  );
}

// --- ATRIBUIR/AFETAR PROCESSO ----------------------------------------------------------------------------------------

AtribuirForm.propTypes = { colaboradores: PropTypes.array, onClose: PropTypes.func };

export function AtribuirForm({ colaboradores, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem, isSaving } = useSelector((state) => state.digitaldocs);
  const { pid, estadoId } = selectedItem;

  useEffect(() => {
    if (estadoId) dispatch(getFromParametrizacao('colaboradoresEstado', { id: estadoId }));
  }, [estadoId, dispatch]);

  const defaultValues = useMemo(
    () => ({ perfil: colaboradores?.find(({ id }) => id === pid) || null }),
    [colaboradores, pid]
  );
  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradores]);

  const onSubmit = async () => {
    try {
      const msg = values?.perfil?.id ? 'Processo atribuído' : 'Atribuição eliminada';
      dispatch(updateItem('atribuir', '', { ...selectedItem, id: values?.perfil?.id || '', msg }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Atribuir processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFAutocompleteObj
            name="perfil"
            sx={{ pt: 3 }}
            label="Colaborador"
            options={applySort(colaboradores, getComparator('asc', 'label'))}
          />
          <DialogButons label="Atribuir" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- LIBERTAR PROCESSO -----------------------------------------------------------------------------------------------

LibertarForm.propTypes = { onClose: PropTypes.func };

export function LibertarForm({ onClose }) {
  const dispatch = useDispatch();
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      color="warning"
      title="Libertar"
      onClose={onClose}
      isSaving={isSaving}
      desc="libertar este processo"
      handleOk={() => dispatch(updateItem('libertar', null, { msg: 'Processo libertado', ...selectedItem }))}
    />
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

FocalPointForm.propTypes = { ids: PropTypes.object, onClose: PropTypes.func };

export function FocalPointForm({ ids, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { fluxo } = useSelector((state) => state.parametrizacao);

  const estadosL = useMemo(
    () =>
      Array.from(
        new Map(
          (fluxo?.transicoes || []).flatMap((t) => [
            [t.estado_inicial_id, { id: t.estado_inicial_id, label: t.estado_inicial }],
            [t.estado_final_id, { id: t.estado_final_id, label: t.estado_final }],
          ])
        ).values()
      ),
    [fluxo?.transicoes]
  );

  useEffect(() => {
    dispatch(getFromParametrizacao('fluxo', { id: ids?.fluxoId, reset: { val: null } }));
  }, [dispatch, ids?.fluxoId]);

  const formSchema = Yup.object().shape({ estado: Yup.mixed().required('Focal Point não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ estado: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = () => {
    try {
      const params = { id: ids?.id, estado: values?.estado };
      dispatch(getInfoProcesso('focal-point', { ...params, msg: 'Focal Point alterado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Altera Focal Point</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="estado" label="Focal Point" options={estadosL} />
          </Stack>
          <DialogButons edit isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

DomiciliarForm.propTypes = { ids: PropTypes.object, onClose: PropTypes.func };

export function DomiciliarForm({ ids, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { uos } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { estados } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    uo: Yup.mixed().required('Unidade orgânica não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ uo: null, estado: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        estado_id: ids?.estadoId,
        uo_destino_id: values?.uo?.id,
        observacao: values?.observacao,
        estado_destino_id: values?.estado?.id,
      };
      dispatch(updateItem('domiciliar', JSON.stringify(formData), { id: ids?.id, msg: 'Processo domiciliado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Domiciliar processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj
              name="uo"
              label="Unidade orgânica"
              options={uos?.map(({ id, label }) => ({ id, label }))}
              onChange={(event, newValue) => {
                setValue('estado', null, vdt);
                setValue('uo', newValue, vdt);
              }}
            />
            {values?.uo?.id && (
              <RHFAutocompleteObj
                name="estado"
                label="Estado"
                options={estados
                  ?.filter(({ uo_id: uoId }) => uoId === values?.uo?.id)
                  ?.map(({ id, nome }) => ({ id, label: nome }))}
                onChange={(event, newValue) => setValue('estado', newValue, vdt)}
              />
            )}
            <RHFTextField name="observacao" multiline rows={3} label="Observação" />
          </Stack>
          <DialogButons color="warning" label="Enviar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
