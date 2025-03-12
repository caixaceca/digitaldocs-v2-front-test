import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// utils
import { fillData } from '../../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
// sections
import { listaTitrulares, listaProdutos } from '../../../gaji9/applySortFilter';

// ----------------------------------------------------------------------

FormInfoCredito.propTypes = { dados: PropTypes.object };

export default function FormInfoCredito({ dados }) {
  const dispatch = useDispatch();
  const { fluxo, processo, onClose } = dados;
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { linhas, tiposTitular, componentes } = useSelector((state) => state.parametrizacao);
  const credito = processo?.credito || null;
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const tiposTitularList = useMemo(() => listaTitrulares(tiposTitular), [tiposTitular]);

  const formSchema = Yup.object().shape({
    linha: Yup.mixed().required().label('Linha'),
    finalidade: Yup.string().required().label('Finalidade'),
    tipo_titular: Yup.mixed().required().label('Tipo de titular'),
    componente: Yup.mixed().required().label('Produto/Componente'),
    cliente: Yup.number().positive().required().label('Nº cliente'),
    prazo_amortizacao: Yup.number().positive().required().label('Prazo'),
    taxa_juro: Yup.number().positive().required().label('Taxa de juros'),
    data_entrada: Yup.date().typeError().required().label('Data entrada'),
    montante_solicitado: Yup.number().positive().required().label('Montante'),
    setor_atividade: Yup.string().required().label('Ent. patronal/Set. atividade'),
  });

  const defaultValues = useMemo(
    () => ({
      obs: dadosStepper?.obs || processo?.observacao || '',
      cliente: dadosStepper?.cliente || processo?.cliente || null,
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      // info credito
      taxa_juro: dadosStepper?.taxa_juro || credito?.taxa_juro || null,
      finalidade: dadosStepper?.finalidade || credito?.finalidade || '',
      numero_proposta: dadosStepper?.numero_proposta || credito?.nproposta || '',
      setor_atividade: dadosStepper?.setor_atividade || credito?.setor_atividade || '',
      prazo_amortizacao: dadosStepper?.prazo_amortizacao || credito?.prazo_amortizacao || null,
      montante_solicitado: dadosStepper?.montante_solicitado || credito?.montante_solicitado || '',
      linha: dadosStepper?.linha || (credito?.linha_id && { id: credito?.linha_id, label: credito?.linha }) || null,
      componente: dadosStepper?.componente || componentesList?.find(({ id }) => id === credito?.componente_id) || null,
      tipo_titular:
        dadosStepper?.tipo_titular || tiposTitularList?.find(({ id }) => id === credito?.tipo_titular_id) || null,
    }),
    [processo, credito, dadosStepper, componentesList, tiposTitularList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxo?.id, linhas, componentesList, tiposTitularList]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
        <Box sx={{ width: 1 }}>
          <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Grid container spacing={3}>
              <GridItem xs={12} sm={6} md={3}>
                <RHFDatePicker name="data_entrada" label="Data entrada" disableFuture />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFNumberField tipo="CVE" name="montante_solicitado" label="Montante" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFNumberField name="prazo_amortizacao" tipo="meses" label="Prazo" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFNumberField name="taxa_juro" tipo="%" label="Taxa de juro" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFTextField name="numero_proposta" label="Nº de proposta" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFNumberField name="cliente" label="Nº de cliente" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFAutocompleteObj
                  name="tipo_titular"
                  label="Tipo de titular"
                  options={tiposTitularList}
                  onChange={(event, newValue) => {
                    setValue('linha', null, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    setValue('tipo_titular', newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={6} md={3}>
                <RHFAutocompleteObj
                  disabled={!values?.tipo_titular}
                  name="linha"
                  label="Linha de crédito"
                  options={applySort(
                    linhas
                      ?.filter((item) => item?.descricao === values?.tipo_titular?.label)
                      ?.map((row) => ({ id: row?.id, label: row?.linha })),
                    getComparator('asc', 'label')
                  )}
                  onChange={(event, newValue) =>
                    setValue('linha', newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                  }
                />
              </GridItem>
              <GridItem xs={12} md={4}>
                <RHFAutocompleteObj name="componente" label="Produto/Componente" options={componentesList} />
              </GridItem>
              <GridItem xs={12} sm={4}>
                <RHFTextField name="setor_atividade" label="Ent. patronal/Set. atividade" />
              </GridItem>
              <GridItem xs={12} sm={4} children={<RHFTextField name="finalidade" label="Finalidade" />} />
            </Grid>
          </Card>
          <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <RHFTextField name="obs" multiline minRows={2} maxRows={4} label="Observação" />
          </Card>
        </Box>
      </Stack>
      <ButtonsStepper onCancel={() => onClose()} labelCancel="Cancelar" />
    </FormProvider>
  );
}
