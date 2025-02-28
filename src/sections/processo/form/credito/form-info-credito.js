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
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
import { shapeText, shapeDate, shapeNumber } from '../../../../components/hook-form/yup-shape';
// sections
import { listaTitrulares, listaProdutos } from '../../../gaji9/applySortFilter';
// _mock
import { escaloes, situacoes } from '../../../../_mock';

// ----------------------------------------------------------------------

FormInfoCredito.propTypes = { dados: PropTypes.object, onCancel: PropTypes.func };

export default function FormInfoCredito({ dados, onCancel }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { linhas, tiposTitular, componentes } = useSelector((state) => state.parametrizacao);
  const { isEdit, fluxo, processo } = dados;
  const credito = processo?.credito || null;
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const tiposTitularList = useMemo(() => listaTitrulares(tiposTitular), [tiposTitular]);

  const formSchema = Yup.object().shape({
    linha: Yup.mixed().required().label('Linha'),
    finalidade: Yup.string().required().label('Finalidade'),
    tipo_titular: Yup.mixed().required().label('Tipo de titular'),
    componente: Yup.mixed().required().label('Produto/Componente'),
    titular: shapeText('Nome do proponente', '', false, 'cliente'),
    taxa_juro: Yup.number().positive().required().label('Taxa de juros'),
    situacao_final_mes: isEdit && Yup.mixed().required().label('Situação'),
    data_entrada: Yup.date().typeError().required().label('Data de entrada'),
    cliente: shapeNumber('Nº de cliente', 'Contratado', '', 'situacao_final_mes'),
    setor_atividade: Yup.string().required().label('Ent. patronal/Set. atividade'),
    prazo_amortizacao: Yup.number().positive().required().label('Prazo amortização'),
    montante_solicitado: Yup.number().positive().required().label('Montante solicitado'),
    escalao_decisao: shapeText('Decisor', 'Aprovado', 'Contratado', 'situacao_final_mes'),
    data_desistido: shapeDate('Data de desistência', 'Desistido', '', 'situacao_final_mes'),
    data_contratacao: shapeDate('Data de contratação', 'Contratado', '', 'situacao_final_mes'),
    data_indeferido: shapeDate('Data de indeferimento', 'Indeferido', '', 'situacao_final_mes'),
    data_aprovacao: shapeDate('Data de aprovação', 'Aprovado', 'Contratado', 'situacao_final_mes'),
    montante_contratado: shapeNumber('Montante contratado', 'Contratado', '', 'situacao_final_mes'),
    montante_aprovado: shapeNumber('Montante aprovado', 'Aprovado', 'Contratado', 'situacao_final_mes'),
  });

  const defaultValues = useMemo(
    () => ({
      obs: dadosStepper?.obs || processo?.observacao || '',
      titular: dadosStepper?.titular || processo?.titular || '',
      cliente: dadosStepper?.cliente || processo?.cliente || '',
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      // info credito
      taxa_juro: dadosStepper?.taxa_juro || credito?.taxa_juro || '',
      finalidade: dadosStepper?.finalidade || credito?.finalidade || '',
      numero_proposta: dadosStepper?.numero_proposta || credito?.nproposta || '',
      setor_atividade: dadosStepper?.setor_atividade || credito?.setor_atividade || '',
      escalao_decisao: dadosStepper?.escalao_decisao || credito?.escalao_decisao || null,
      montante_aprovado: dadosStepper?.montante_aprovado || credito?.montante_aprovado || '',
      prazo_amortizacao: dadosStepper?.prazo_amortizacao || credito?.prazo_amortizacao || '',
      montante_solicitado: dadosStepper?.montante_solicitado || credito?.montante_solicitado || '',
      montante_contratado: dadosStepper?.montante_contratado || credito?.montante_contratado || '',
      data_desistido: dadosStepper?.data_desistido || fillData(credito?.data_desistido, null),
      data_aprovacao: dadosStepper?.data_aprovacao || fillData(credito?.data_aprovacao, null),
      data_indeferido: dadosStepper?.data_indeferido || fillData(credito?.data_indeferido, null),
      data_contratacao: dadosStepper?.data_contratacao || fillData(credito?.data_contratacao, null),
      situacao_final_mes: dadosStepper?.situacao_final_mes || credito?.situacao_final_mes || 'Em análise',
      linha: dadosStepper?.linha || (credito?.linha_id && { id: credito?.linha_id, label: credito?.linha }) || null,
      componente: dadosStepper?.componente || componentesList?.find(({ id }) => id === credito?.componente_id) || null,
      tipo_titular:
        dadosStepper?.tipo_titular || tiposTitularList?.find(({ id }) => id === credito?.tipo_titular_id) || null,
    }),
    [processo, credito, dadosStepper, componentesList, tiposTitularList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;
  const values = watch();

  console.log(errors);

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fluxo?.id, linhas, componentesList, tiposTitularList]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center">
        <Box sx={{ width: 1 }}>
          <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFNumberField tipo="moeda" name="montante_solicitado" label="Montante solicitado" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFAutocompleteObj
                  name="tipo_titular"
                  label="Tipo de titular"
                  options={tiposTitularList}
                  onChange={(event, newValue) => {
                    setValue('linha', null, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    setValue('tipo_titular', newValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteObj name="componente" label="Produto/Componente" options={componentesList} />
              </Grid>
              <GridItem xs={12} sm={6} md={3}>
                <RHFTextField name="numero_proposta" label="Nº de proposta" />
              </GridItem>
              <GridItem xs={12} sm={6} md={3} children={<RHFNumberField name="cliente" label="Nº de cliente" />} />
              <GridItem xs={12} md={4} children={<RHFTextField name="titular" label="Nome do proponente" />} />
              <GridItem xs={12} sm={4}>
                <RHFTextField name="setor_atividade" label="Ent. patronal/Set. atividade" />
              </GridItem>
              <GridItem xs={12} sm={4} children={<RHFTextField name="finalidade" label="Finalidade" />} />
              {values?.situacao_final_mes !== 'Contratado' && (
                <>
                  <GridItem xs={12} sm={6} md={3}>
                    <RHFNumberField name="prazo_amortizacao" tipo="prestacao" label="Prazo amorização" />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={3}>
                    <RHFNumberField name="taxa_juro" tipo="percentagem" label="Taxa de juro" />
                  </GridItem>
                </>
              )}
            </Grid>
          </Card>
          {isEdit && (
            <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={3}>
                  <RHFAutocompleteSmp label="Situação" disableClearable options={situacoes} name="situacao_final_mes" />
                </Grid>
                {(values?.situacao_final_mes === 'Aprovado' ||
                  values?.situacao_final_mes === 'Contratado' ||
                  values?.situacao_final_mes === 'Desistido') && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <RHFDatePicker name="data_aprovacao" label="Data de aprovação" disableFuture />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <RHFNumberField tipo="moeda" name="montante_aprovado" label="Montante aprovado" />
                    </Grid>
                    <GridItem xs={12} sm={6} md={3}>
                      <RHFAutocompleteSmp name="escalao_decisao" label="Decisor" options={escaloes} />
                    </GridItem>
                  </>
                )}
                {values?.situacao_final_mes === 'Contratado' && (
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <GridItem xs={12} sm={6} md={3}>
                        <RHFDatePicker name="data_contratacao" label="Data de contratação" disableFuture />
                      </GridItem>
                      <GridItem xs={12} sm={6} md={3}>
                        <RHFNumberField tipo="moeda" name="montante_contratado" label="Montante contratado" />
                      </GridItem>
                      <GridItem xs={12} sm={6} md={3}>
                        <RHFTextField name="prazo_amortizacao" label="Prazo" />
                      </GridItem>
                      <GridItem xs={12} sm={6} md={3}>
                        <RHFNumberField name="taxa_juro" tipo="percentagem" label="Taxa de juro" />
                      </GridItem>
                    </Grid>
                  </Grid>
                )}
                {values?.situacao_final_mes === 'Indeferido' && (
                  <Grid item xs={12} sm={3}>
                    <RHFDatePicker name="data_indeferido" label="Data de indeferimento" disableFuture />
                  </Grid>
                )}
                {values?.situacao_final_mes === 'Desistido' && (
                  <Grid item xs={12} sm={3}>
                    <RHFDatePicker name="data_desistido" label="Data de desistência" disableFuture />
                  </Grid>
                )}
              </Grid>
            </Card>
          )}
          <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <RHFTextField name="obs" multiline minRows={2} maxRows={4} label="Observação" />
          </Card>
        </Box>
      </Stack>
      <ButtonsStepper onCancel={onCancel} labelCancel="Cancelar" />
    </FormProvider>
  );
}
