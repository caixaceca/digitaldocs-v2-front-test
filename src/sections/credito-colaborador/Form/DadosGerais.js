import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { updatePedidoForm } from '../../../redux/slices/cc';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import { FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteObj } from '../../../components/hook-form';
//
import { NextPrev } from './PedidoSteps';

// ----------------------------------------------------------------------

DadosGerais.propTypes = { dados: PropTypes.object };

export default function DadosGerais({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoForm } = useSelector((state) => state.cc);
  const { perfilId, cc } = useSelector((state) => state.intranet);
  const { linhas } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    salario: Yup.number().typeError('Introduza o salário bruto'),
    cliente: Yup.number().typeError('Introduza o nº de cliente'),
    taxa_juros: Yup.number().typeError('Introduza a taxa de juros'),
    conta_salario: Yup.number().typeError('Introduza o nº de conta'),
    finalidade: Yup.string().required('Finalidade não pode ficar vazio'),
    linha: Yup.mixed().required('Seleciona a linha do crédito pretendido'),
    montante_solicitado: Yup.number().typeError('Introduza o capital pretendido'),
    prazo_amortizacao: Yup.number().typeError('Introduza o prazo de amortização'),
    categoria_nivel: Yup.string().required('Categoria/Nível não pode ficar vazio'),
    setor_atividade: Yup.string().required('Entidade patronal não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfil_id: pedidoForm?.perfil_id || perfilId,
      fluxo_id: pedidoForm?.fluxo_id || dados?.fluxo_id,
      salario: pedidoForm?.salario || dados?.salario || '',
      cliente: pedidoForm?.cliente || dados?.cliente || '',
      uo_origem_id: pedidoForm?.uo_origem_id || cc?.uo?.id,
      observacao: pedidoForm?.observacao || dados?.observacao || '',
      conta_salario: pedidoForm?.conta_salario || dados?.conta_salario || '',
      taxa_juros: pedidoForm?.taxa_juros || dados?.credito?.taxa_juros || '',
      finalidade: pedidoForm?.finalidade || dados?.credito?.finalidade || '',
      estado_origem_id: pedidoForm?.estado_origem_id || dados?.estado_origem_id,
      categoria_nivel: pedidoForm?.categoria_nivel || dados?.categoria_nivel || '',
      salario_conjuge: pedidoForm?.salario_conjuge || dados?.salario_conjuge || '',
      setor_atividade: pedidoForm?.setor_atividade || dados?.credito?.setor_atividade || 'Caixa',
      prazo_amortizacao: pedidoForm?.prazo_amortizacao || dados?.credito?.prazo_amortizacao || '',
      montante_solicitado: pedidoForm?.montante_solicitado || dados?.credito?.montante_solicitado || '',
      entidade_patronal_conjuge: pedidoForm?.entidade_patronal_conjuge || dados?.entidade_patronal_conjuge || '',
      linha:
        pedidoForm?.linha ||
        (dados?.credito?.linha_id && { id: dados?.credito?.linha_id, label: dados?.credito?.linha }) ||
        null,
    }),
    [dados, perfilId, pedidoForm, cc]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoForm, dados]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="1. Dados gerais" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField name="cliente" label="Nº cliente" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField name="conta_salario" label="Nº conta salário" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField tipo="moeda" name="salario" label="Salário bruto" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFTextField name="categoria_nivel" label="Categoria/Nível" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFTextField name="setor_atividade" label="Entidade patronal" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFAutocompleteObj
                name="linha"
                label="Linha de crédito"
                options={linhas
                  ?.filter((row) => row?.descricao === 'Particular')
                  ?.map((item) => ({ id: item?.id, label: item?.linha }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField tipo="moeda" name="salario_conjuge" label="Salário bruto do conjuge" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFTextField name="entidade_patronal_conjuge" label="Entidade patronal do conjuge" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField tipo="moeda" name="montante_solicitado" label="Capital pretendido" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField tipo="prestacao" name="prazo_amortizacao" label="Prazo amortização" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField tipo="percentagem" name="taxa_juros" label="Taxa de juros" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RHFTextField name="finalidade" label="Finalidade" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" label="Observações" multiline minRows={3} maxRows={6} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <NextPrev />
    </FormProvider>
  );
}
