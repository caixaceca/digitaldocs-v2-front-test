import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller, useFieldArray } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Box,
  Fab,
  Grid,
  Stack,
  Dialog,
  Button,
  Tooltip,
  TextField,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';
// redux
import { createItem } from '../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../redux/store';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import { FormProvider } from '../../components/hook-form';

// ----------------------------------------------------------------------

PerfisEstadoForm.propTypes = { onCancel: PropTypes.func, estado: PropTypes.object, isOpenModal: PropTypes.bool };

export default function PerfisEstadoForm({ isOpenModal, estado, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.colaborador);
  const colaboradoresNA = applyFilter1(colaboradores, estado?.perfis);

  useEffect(() => {
    if (done === 'Perfis adicionados') {
      enqueueSnackbar('Perfis adicionados com sucesso', { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const defaultValues = useMemo(
    () => ({
      perfis: [{ perfil: null, data_limite: null, data_inicial: null }],
    }),
    []
  );

  const methods = useForm({ defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const perfisByCategoria = applyFilter(colaboradoresNA, values?.perfis);

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal]);

  const onSubmit = async () => {
    try {
      const formData = {
        estado_id: estado?.id,
        perfil_id_cc: currentColaborador?.perfil?.id,
        perfis: [],
      };
      values?.perfis?.forEach((row) => {
        formData?.perfis?.push({
          perfil_id: row?.perfil?.id,
          data_inicial: row?.data_inicial,
          data_limite: row?.data_limite,
        });
      });
      dispatch(createItem('perfisEstado', JSON.stringify(formData), { mail, mensagem: 'Perfis adicionados' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });

  const handleAdd = () => {
    append({ perfil: null, data_limite: null, data_inicial: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{`Adicionar colaborador ao estado » ${estado?.nome}`}</DialogTitle>
      <DialogContent sx={{ minWidth: { md: 820, sm: 520 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {fields.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`perfis[${index}].perfil`}
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          fullWidth
                          onChange={(event, newValue) => field.onChange(newValue)}
                          options={perfisByCategoria.map((option) => option)}
                          getOptionLabel={(option) => option?.label}
                          renderInput={(params) => <TextField required fullWidth {...params} label="Colaborador" />}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack alignItems="flex-end">
                      <Stack direction="row" spacing={1}>
                        <Controller
                          control={control}
                          name={`perfis[${index}].data_inicial`}
                          render={({ field }) => (
                            <DateTimePicker
                              fullWidth
                              disablePast
                              label="Data de início"
                              value={field.value}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                              }}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`perfis[${index}].data_limite`}
                          render={({ field }) => (
                            <DateTimePicker
                              fullWidth
                              disablePast
                              label="Data de término"
                              value={field.value}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                              }}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          )}
                        />
                        {values.perfis.length > 1 && (
                          <Stack direction="row" alignItems="center">
                            <Tooltip title="Remover" arrow>
                              <Fab color="error" size="small" variant="soft" onClick={() => handleRemove(index)}>
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20 }} />
                              </Fab>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {perfisByCategoria.length > 0 && (
              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="soft"
                  startIcon={<SvgIconStyle src="/assets/icons/add.svg" />}
                  onClick={handleAdd}
                >
                  Colaborador
                </Button>
              </Grid>
            )}
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important' }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Adicionar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil?.id);
  });

  const perfisFiltered = colaboradores?.map((row) => ({
    id: row?.perfil_id,
    label: row?.perfil?.displayName,
  }));

  return perfisFiltered;
}

function applyFilter1(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil_id);
  });

  return colaboradores;
}
