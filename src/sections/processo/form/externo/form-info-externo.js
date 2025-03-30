import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
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
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import { Entidades } from '../dados-cliente';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';

// ----------------------------------------------------------------------

FormInfoExterno.propTypes = { dados: PropTypes.object };

export default function FormInfoExterno({ dados }) {
  const dispatch = useDispatch();
  const { processo, estado, onClose } = dados;
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { origens } = useSelector((state) => state.parametrizacao);
  const origensList = useMemo(
    () => origens.map(({ id, designacao, seguimento }) => ({ id, label: `${designacao} - ${seguimento}` })) || [],
    [origens]
  );
  const entidadesList = useMemo(
    () => processo?.entidade?.split(';')?.map((row) => ({ numero: row })) || [],
    [processo?.entidade]
  );

  const formSchema = Yup.object().shape({
    origem_id: Yup.mixed().required().label('Origem'),
    canal: Yup.string().required().label('Canal entrada'),
    referencia: Yup.string().required().label('Referência'),
    data_entrada: Yup.date().typeError().required().label('Data entrada'),
    operacao: estado?.nome?.includes('DOP') && Yup.string().required().label('Operação'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().label('Nº de entidade') })),
    valor: Yup.string().when('operacao', { is: 'Cativo/Penhora', then: (schema) => schema.required().label('Valor') }),
  });

  const defaultValues = useMemo(
    () => ({
      entidades: dadosStepper?.entidades || entidadesList,
      conta: dadosStepper?.conta || processo?.conta || '',
      valor: dadosStepper?.valor || processo?.valor || '',
      canal: dadosStepper?.canal || processo?.canal || null,
      docidp: dadosStepper?.docidp || processo?.doc_idp || '',
      docids: dadosStepper?.docids || processo?.doc_ids || '',
      obs: dadosStepper?.obs || processo?.observacao || '',
      titular: dadosStepper?.titular || processo?.titular || '',
      cliente: dadosStepper?.cliente || processo?.cliente || '',
      operacao: dadosStepper?.operacao || processo?.operacao || null,
      referencia: dadosStepper?.referencia || processo?.referencia || '',
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      origem_id: dadosStepper?.origem_id || origensList?.find((row) => row.id === processo?.origem_id) || null,
    }),
    [processo, origensList, dadosStepper, entidadesList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Box sx={{ width: 1 }}>
        <Card sx={{ mt: 4, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem xs={12} sm={4} lg={2}>
              <RHFDatePicker name="data_entrada" label="Data entrada" disableFuture />
            </GridItem>
            <GridItem xs={12} sm={4} lg={2}>
              <RHFAutocompleteSmp name="canal" label="Canal entrada" options={['Email', 'Correspondência']} />
            </GridItem>
            <GridItem xs={12} sm={4} lg={2} children={<RHFTextField name="referencia" label="Referência" />} />
            <GridItem xs={12} lg={6} children={<RHFTextField name="titular" label="Titular" />} />
            <GridItem xs={12} md={6}>
              <RHFAutocompleteObj label="Origem" name="origem_id" options={origensList} />
            </GridItem>
            <GridItem
              xs={12}
              sm={values.operacao === 'Cativo/Penhora' ? 6 : 12}
              md={values.operacao === 'Cativo/Penhora' ? 3 : 6}
            >
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
            {values.operacao === 'Cativo/Penhora' && (
              <GridItem xs={12} sm={6} md={3} children={<RHFNumberField name="valor" tipo="CVE" label="Valor" />} />
            )}
          </Grid>
        </Card>

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docidp" label="Nº de identificação 1" />} />
            <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docids" label="Nº de identificação 2" />} />
            <GridItem xs={12} sm={6} lg={3}>
              <RHFNumberField noFormat name="cliente" label="Nº de cliente" />
            </GridItem>
            <GridItem xs={12} sm={6} lg={3} children={<RHFNumberField noFormat name="conta" label="Nº de conta" />} />
            <Entidades fields={fields} append={append} remove={remove} />
          </Grid>
        </Card>

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Card>
      </Box>
      <ButtonsStepper onCancel={() => onClose()} labelCancel="Cancelar" />
    </FormProvider>
  );
}
