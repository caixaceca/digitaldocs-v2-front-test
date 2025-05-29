import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
import { FormProvider, RHFTextField, RHFDataEntrada, RHFNumberField } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

FormOperacao.propTypes = { dados: PropTypes.object };

export default function FormOperacao({ dados }) {
  const dispatch = useDispatch();
  const { processo, fluxo, estado, onClose } = dados;
  const { cc, uos } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    valor: Yup.number().positive().required().label('Valor'),
    conta: Yup.number().positive().integer().label('Nº de conta'),
    origem_fundo: Yup.string().required().label('Origem do fundo'),
    finalidade_fundo: Yup.string().required().label('Finalidade do fundo'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
  });

  const defaultValues = useMemo(
    () => ({
      fluxo_id: fluxo?.id,
      valor: dadosStepper?.valor || processo?.valor || '',
      conta: dadosStepper?.conta || processo?.conta || '',
      email: dadosStepper?.email || processo?.email || '',
      obs: dadosStepper?.obs || processo?.observacao || '',
      noperacao: dadosStepper?.noperacao || processo?.numero_operacao || '',
      origem_fundo: dadosStepper?.origem_fundo || processo?.con?.origem_fundo || '',
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      finalidade_fundo: dadosStepper?.finalidade_fundo || processo?.con?.finalidade || '',
      balcao: processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo?.balcao,
    }),
    [dadosStepper, processo, uos, estado?.uo_id, cc?.uo?.balcao, fluxo?.id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dadosStepper, processo, uos, estado?.uo_id, cc?.uo?.balcao, fluxo?.id]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Box sx={{ width: 1 }}>
        <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem sm={6} lg={3}>
              <RHFDataEntrada name="data_entrada" label="Data de entrada" disableFuture />
            </GridItem>
            <GridItem sm={6} lg={3} children={<RHFNumberField noFormat name="conta" label="Nº de conta" />} />
            <GridItem sm={6} lg={3} children={<RHFNumberField tipo="CVE" name="valor" label="Valor" />} />
            <GridItem sm={6} lg={3} children={<RHFNumberField noFormat name="noperacao" label="Nº de operação" />} />
            <GridItem>
              <RHFTextField name="origem_fundo" label="Origem do fundo" multiline minRows={2} maxRows={4} />
            </GridItem>
            <GridItem>
              <RHFTextField name="finalidade_fundo" label="Finalidade do fundo" multiline minRows={2} maxRows={4} />
            </GridItem>
          </Grid>
        </Card>
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Card>
      </Box>
      <ButtonsStepper onClose={() => onClose()} labelCancel="Cancelar" />
    </FormProvider>
  );
}
