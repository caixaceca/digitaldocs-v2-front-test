import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { listaProdutos } from '@/sections/gaji9/applySortFilter';
import { getFromParametrizacao, createItem, updateItem, deleteItem } from '@/redux/slices/parametrizacao';
// components
import GridItem from '@/components/GridItem';
import { ItemComponent } from '../ParametrizacaoForm';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '@/components/Actions';
import { FormProvider, RHFSwitch, RHFCheckbox, RHFNumberField, RHFAutocompleteObj } from '@/components/hook-form';
// utils
import {
  toRequestBody,
  buildLinhasList,
  fromSelectedItem,
  PARAMS_BOOLEANOS,
  PARAMS_NUMERICOS,
  PARAM_NUMERICO_DEFAULT,
} from './precario-utils';

const formSchema = Yup.object().shape({
  linha: Yup.mixed().nullable(),
  componente: Yup.mixed().nullable(),
  params: Yup.array(Yup.object({ item: Yup.mixed().required().label('Parâmetro'), obrigatorio: Yup.boolean() })),
});

// ---------------------------------------------------------------------------------------------------------------------

export default function PrecarioForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem, linhas, componentes, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const linhasList = useMemo(() => buildLinhasList(linhas), [linhas]);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);

  useEffect(() => {
    dispatch(getFromParametrizacao('linhas'));
    dispatch(getFromParametrizacao('componentes'));
  }, [dispatch]);

  const defaultValues = useMemo(
    () => fromSelectedItem({ selectedItem, linhasList, componentesList }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues, shouldUnregister: false });
  const { reset, watch, control, setError, handleSubmit } = methods;
  const values = watch();
  const { fields, append } = useFieldArray({ control, name: 'params', shouldUnregister: false });

  useEffect(() => {
    reset(fromSelectedItem({ selectedItem, linhasList, componentesList }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (formValues) => {
    try {
      if (formValues.linha && formValues.componente) {
        setError('componente', { type: 'manual', message: 'Selecione apenas um Componente ou uma Linha de crédito' });
        setError('linha', { type: 'manual', message: ' ' });
        return;
      }
      if (!formValues.linha && !formValues.componente) {
        setError('componente', { type: 'manual', message: 'Selecione um Componente ou uma Linha de crédito' });
        setError('linha', { type: 'manual', message: ' ' });
        return;
      }

      const body = toRequestBody(formValues);
      const params = { id: selectedItem?.id, msg: `Preçário ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('precarios', JSON.stringify(body), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleRemove = (index) => {
    const newParams = values.params.filter((_, i) => i !== index);
    reset({ ...values, params: newParams });
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt title={isEdit ? 'Editar preçário' : 'Adicionar preçário'} onClose={onClose} sx={{ mb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <GridItem sm={6}>
                <RHFAutocompleteObj
                  name="componente"
                  label="Componente"
                  options={componentesList}
                  disabled={!!values.linha}
                />
              </GridItem>
              <GridItem sm={6}>
                <RHFAutocompleteObj
                  name="linha"
                  label="Linha de crédito"
                  options={linhasList}
                  disabled={!!values.componente}
                />
              </GridItem>

              {PARAMS_BOOLEANOS.map(({ id, label }) => (
                <GridItem key={id} xs={6} md={4}>
                  <RHFSwitch name={id} label={label} />
                </GridItem>
              ))}

              <GridItem xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ bgcolor: 'background.neutral', p: 1, mb: 2, borderRadius: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SectionLabel label="Parâmetros" />
                    {fields.length > 0 && (
                      <Chip size="small" variant="outlined" label={`${fields.length} / ${PARAMS_NUMERICOS.length}`} />
                    )}
                  </Stack>
                  {fields?.length < 11 && (
                    <AddItem onClick={() => append(PARAM_NUMERICO_DEFAULT)} dados={{ small: true }} />
                  )}
                </Stack>
                <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                  {fields.length === 0 ? (
                    <Alert severity="info" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                      Nenhum parâmetro configurado. Clique em <strong>+&nbsp;Adicionar</strong> para definir taxas e
                      prazos.
                    </Alert>
                  ) : (
                    fields.map((field, index) => {
                      const tipo = values.params[index]?.item?.tipo;

                      return (
                        <Stack key={field.id} direction="row" alignItems="center" spacing={2}>
                          <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                            <RHFAutocompleteObj
                              size="small"
                              label="Parâmetro"
                              options={PARAMS_NUMERICOS}
                              name={`params[${index}].item`}
                              getOptionDisabled={(option) => values.params.some(({ item }) => item?.id === option.id)}
                            />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}>
                                <RHFCheckbox label="Obrigatório" name={`params[${index}].obrigatorio`} size="small" />
                                <RHFNumberField
                                  size="small"
                                  tipo={tipo}
                                  label="Padrão"
                                  name={`params[${index}].default`}
                                />
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}>
                                <RHFNumberField size="small" label="Mínimo" tipo={tipo} name={`params[${index}].min`} />
                                <RHFNumberField size="small" label="Máximo" tipo={tipo} name={`params[${index}].max`} />
                              </Stack>
                            </Stack>
                          </Stack>
                          <DefaultAction small label="ELIMINAR" onClick={() => handleRemove(index)} />
                        </Stack>
                      );
                    })
                  )}
                </Stack>
              </GridItem>
            </Grid>

            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onClose={onClose}
              desc={isEdit ? 'eliminar este preçário' : ''}
              handleDelete={() =>
                dispatch(deleteItem('precarios', { id: selectedItem?.id, msg: 'Preçário eliminado' }))
              }
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
      {label}
    </Typography>
  );
}
