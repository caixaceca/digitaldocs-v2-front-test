import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useCallback } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updatePedidoForm, deleteAnexo } from '../../../redux/slices/cc';
// components
import { DefaultAction, AnexosExistente } from '../../../components/Actions';
import { FormProvider, RHFDatePicker, RHFUploadFileSimple, RHFAutocompleteObj } from '../../../components/hook-form';
//
import { applyFilter } from './Anexos';
import { NextPrev } from './PedidoSteps';

// ----------------------------------------------------------------------

AnexosProcesso.propTypes = { anexos: PropTypes.array };

export default function AnexosProcesso({ anexos = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoForm, anexosProcesso } = useSelector((state) => state.cc);
  const anexosAtivos = anexos?.filter((item) => item.ativo) || [];

  const formSchema = Yup.object().shape({
    anexos: Yup.array(
      Yup.object({
        anexo: Yup.mixed().required('Introduza o anexo'),
        descricao: Yup.mixed().required('Seleciona o tipo de anexo'),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ anexos: pedidoForm?.anexos || [] }), [pedidoForm?.anexos]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'anexos' });
  const anexosFiltered = applyFilter(
    anexosProcesso?.filter((row) => !row?.reutilizavel),
    [...anexosAtivos?.map((row) => row?.designacao_id), ...values?.anexos?.map((row) => row?.descricao?.id)]
  );

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anexos]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  const handleAdd = () => {
    append({ descricao: null, data_validade: null, anexo: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleDeleteAnexo = async (itemId) => {
    dispatch(deleteAnexo({ itemId, tipoItem: 'anexo processo' }));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title="2. Anexos do processo"
          sx={{ p: 2, pr: 2.5 }}
          action={anexosFiltered?.length > 0 && <DefaultAction button label="Adicionar" handleClick={handleAdd} />}
        />
      </Card>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => {
          const anexoSel = values?.anexos?.[index]?.descricao;
          return (
            <Card key={item.id} sx={{ p: 2 }}>
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                <Box sx={{ width: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={anexoSel?.prazo ? 8 : 12} md={3}>
                      <RHFAutocompleteObj
                        options={anexosFiltered}
                        label={`Anexo ${index + 1}`}
                        name={`anexos[${index}].descricao`}
                      />
                    </Grid>
                    {anexoSel?.prazo && (
                      <Grid item xs={12} sm={4} md={2}>
                        <RHFDatePicker disablePast required name={`anexos[${index}].data_validade`} label="Validade" />
                      </Grid>
                    )}
                    <Grid item xs={12} md={anexoSel?.prazo ? 7 : 9}>
                      <RHFUploadFileSimple
                        sx={{ height: 56 }}
                        name={`anexos[${index}].anexo`}
                        onDrop={(file) => handleDrop(`anexos[${index}].anexo`, file)}
                      />
                    </Grid>
                  </Grid>
                </Box>
                <DefaultAction small label="ELIMINAR" color="error" handleClick={() => handleRemove(index)} />
              </Stack>
            </Card>
          );
        })}
        {anexosAtivos?.length > 0 && (
          <Stack>
            <AnexosExistente
              mt={1}
              onOpen={handleDeleteAnexo}
              anexos={anexosAtivos?.map((row) => ({ ...row, path: row?.anexo, name: row?.designacao }))}
            />
          </Stack>
        )}
      </Stack>
      <NextPrev back />
    </FormProvider>
  );
}
