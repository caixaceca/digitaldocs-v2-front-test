import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
// utils
import { fillData } from '../../../../utils/formatTime';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDataEntrada,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import { Entidades } from '../dados-cliente';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
//
import { entidadesList, submitDados } from '../utils-form-processo';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormInfoExterno({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, processo, fluxo, estado, onClose } = dados;

  const { cc, uos } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { origens } = useSelector((state) => state.parametrizacao);

  const origensList = useMemo(
    () => origens.map(({ id, designacao, seguimento }) => ({ id, label: `${designacao} - ${seguimento}` })) || [],
    [origens]
  );

  const formSchema = Yup.object().shape({
    origem_id: Yup.mixed().required().label('Origem'),
    canal: Yup.mixed().required().label('Canal entrada'),
    referencia: Yup.string().required().label('Referência'),
    data_entrada: Yup.date().typeError().required().label('Data entrada'),
    operacao: estado?.nome?.includes('DOP') && Yup.string().required().label('Operação'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().required().label('Nº de entidade') })),
    valor: Yup.string().when('operacao', { is: 'Cativo/Penhora', then: (schema) => schema.required().label('Valor') }),
  });

  const defaultValues = useMemo(
    () => ({
      fluxo_id: fluxo?.id,
      valor: dadosStepper?.valor || processo?.valor || '',
      obs: dadosStepper?.obs || processo?.observacao || '',
      canal: dadosStepper?.canal || processo?.canal || null,
      conta: dadosStepper?.conta || processo?.conta || null,
      docidp: dadosStepper?.docidp || processo?.doc_idp || '',
      docids: dadosStepper?.docids || processo?.doc_ids || '',
      titular: dadosStepper?.titular || processo?.titular || '',
      cliente: dadosStepper?.cliente || processo?.cliente || '',
      operacao: dadosStepper?.operacao || processo?.operacao || null,
      referencia: dadosStepper?.referencia || processo?.referencia || '',
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      entidades: dadosStepper?.entidades || entidadesList(isEdit, processo?.entidade, fluxo?.assunto),
      balcao: processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo_balcao,
      origem_id: dadosStepper?.origem_id || origensList?.find(({ id }) => id === processo?.origem_id) || null,
    }),
    [isEdit, processo, origensList, dadosStepper, fluxo, estado?.uo_id, uos, cc?.uo_balcao]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });
  const cativo = values.operacao === 'Cativo/Penhora';

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, processo, origensList, dadosStepper, fluxo, estado?.uo_id, uos, cc?.uo_balcao]);

  const onSubmit = async () => {
    submitDados(values, isEdit, processo?.id, dispatch, enqueueSnackbar, onClose);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ width: 1 }}>
        <Card sx={{ mt: 4, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem sm={4} lg={2}>
              <RHFDataEntrada name="data_entrada" label="Data entrada" disableFuture />
            </GridItem>
            <GridItem sm={4} lg={2}>
              <RHFAutocompleteSmp dc name="canal" label="Canal entrada" options={['Email', 'Correspondência']} />
            </GridItem>
            <GridItem sm={4} lg={2} children={<RHFTextField name="referencia" label="Referência" />} />
            <GridItem lg={6} children={<RHFTextField name="titular" label="Titular" />} />
            <GridItem md={6} children={<RHFAutocompleteObj label="Origem" name="origem_id" options={origensList} />} />
            <GridItem sm={cativo ? 6 : 12} md={cativo ? 3 : 6}>
              <RHFAutocompleteSmp
                name="operacao"
                label="Operação"
                options={[
                  'Cativo/Penhora',
                  'Pedido de Informação',
                  'Cancelamento/Levantamento de Cativo/Penhora',
                  'Pedido de Extrato Bancário',
                  'Outras',
                ]}
              />
            </GridItem>
            {cativo && <GridItem sm={6} md={3} children={<RHFNumberField name="valor" tipo="CVE" label="Valor" />} />}
          </Grid>
        </Card>

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem sm={6} lg={3} children={<RHFTextField name="docidp" label="Nº de identificação 1" />} />
            <GridItem sm={6} lg={3} children={<RHFTextField name="docids" label="Nº de identificação 2" />} />
            <GridItem sm={6} lg={3}>
              <RHFNumberField noFormat name="cliente" label="Nº de cliente" />
            </GridItem>
            <GridItem sm={6} lg={3} children={<RHFNumberField noFormat name="conta" label="Nº de conta" />} />
            <Entidades fields={fields} append={append} remove={remove} />
          </Grid>
        </Card>

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Card>
      </Box>

      <ButtonsStepper isSaving={isSaving} onClose={onClose} labelCancel="Cancelar" label={isEdit ? 'Guardar' : ''} />
    </FormProvider>
  );
}
