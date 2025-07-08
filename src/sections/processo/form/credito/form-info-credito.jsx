import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
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
import { vdt } from '../../../../utils/formatObject';
import { fillData } from '../../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDataEntrada,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
// sections
import { listaTitrulares, listaProdutos } from '../../../gaji9/applySortFilter';
//
import { submitDados } from '../utils-form-processo';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormInfoCredito({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { cc, uos } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { linhas, tiposTitular, componentes } = useSelector((state) => state.parametrizacao);

  const { isEdit, processo, fluxo, estado, onClose } = dados;
  const credito = useMemo(() => processo?.credito || null, [processo?.credito]);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const tiposTitularList = useMemo(() => listaTitrulares(tiposTitular), [tiposTitular]);

  const formSchema = Yup.object().shape({
    linha_id: Yup.mixed().required().label('Linha'),
    garantia: Yup.string().required().label('Garantia'),
    finalidade: Yup.string().required().label('Finalidade'),
    cliente: Yup.number().positive().required().label('Nº cliente'),
    tipo_titular_id: Yup.mixed().required().label('Tipo de titular'),
    componente_id: Yup.mixed().required().label('Produto/Componente'),
    prazo_amortizacao: Yup.number().positive().required().label('Prazo'),
    taxa_juro: Yup.number().positive().required().label('Taxa de juros'),
    data_entrada: Yup.date().typeError().required().label('Data entrada'),
    montante_solicitado: Yup.number().positive().required().label('Montante'),
    setor_atividade: Yup.string().required().label('Ent. patronal/Set. atividade'),
  });

  const defaultValues = useMemo(
    () => ({
      fluxo_id: fluxo?.id,
      obs: dadosStepper?.obs || processo?.observacao || '',
      cliente: dadosStepper?.cliente || processo?.cliente || null,
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      balcao: processo?.balcao || uos?.find(({ id }) => id === estado?.uo_id)?.balcao || cc?.uo_balcao,
      // info credito
      garantia: dadosStepper?.garantia || credito?.garantia || '',
      taxa_juro: dadosStepper?.taxa_juro || credito?.taxa_juro || '',
      finalidade: dadosStepper?.finalidade || credito?.finalidade || '',
      numero_proposta: dadosStepper?.numero_proposta || credito?.numero_proposta || '',
      setor_atividade: dadosStepper?.setor_atividade || credito?.setor_atividade || '',
      prazo_amortizacao: dadosStepper?.prazo_amortizacao || credito?.prazo_amortizacao || '',
      montante_solicitado: dadosStepper?.montante_solicitado || credito?.montante_solicitado || '',
      linha_id:
        dadosStepper?.linha_id || (credito?.linha_id && { id: credito?.linha_id, label: credito?.linha }) || null,
      componente_id:
        dadosStepper?.componente_id || componentesList?.find(({ id }) => id === credito?.componente_id) || null,
      tipo_titular_id:
        dadosStepper?.tipo_titular_id || tiposTitularList?.find(({ id }) => id === credito?.tipo_titular_id) || null,
    }),
    [processo, credito, dadosStepper, componentesList, tiposTitularList, uos, estado?.uo_id, cc?.uo_balcao, fluxo?.id]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, dadosStepper, componentesList, tiposTitularList, uos, estado?.uo_id, cc?.uo_balcao, fluxo?.id]);

  const onSubmit = async () => {
    submitDados(values, isEdit, processo?.id, dispatch, enqueueSnackbar, onClose);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
        <Box sx={{ width: 1 }}>
          <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Grid container spacing={3}>
              <GridItem sm={6} md={3}>
                <RHFDataEntrada name="data_entrada" label="Data entrada" disableFuture />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFNumberField tipo="CVE" name="montante_solicitado" label="Montante" />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFNumberField name="prazo_amortizacao" tipo="meses" label="Prazo" />
              </GridItem>
              <GridItem sm={6} md={3} children={<RHFNumberField name="taxa_juro" tipo="%" label="Taxa de juro" />} />
              <GridItem sm={6} md={3} children={<RHFTextField name="numero_proposta" label="Nº de proposta" />} />
              <GridItem sm={6} md={3} children={<RHFNumberField noFormat name="cliente" label="Nº de cliente" />} />
              <GridItem sm={6} md={3}>
                <RHFAutocompleteObj
                  dc
                  name="tipo_titular_id"
                  label="Tipo de titular"
                  options={tiposTitularList}
                  onChange={(event, newValue) => {
                    setValue('linha_id', null, vdt);
                    setValue('tipo_titular_id', newValue, vdt);
                  }}
                />
              </GridItem>
              <GridItem sm={6} md={3}>
                <RHFAutocompleteObj
                  dc
                  name="linha_id"
                  label="Linha de crédito"
                  disabled={!values?.tipo_titular_id}
                  options={applySort(
                    linhas
                      ?.filter(({ descricao }) => descricao === values?.tipo_titular_id?.label)
                      ?.map(({ id, linha }) => ({ id, label: linha })),
                    getComparator('asc', 'label')
                  )}
                />
              </GridItem>
              <GridItem md={6}>
                <RHFAutocompleteObj dc name="componente_id" label="Produto/Componente" options={componentesList} />
              </GridItem>
              <GridItem sm={6}>
                <RHFTextField name="setor_atividade" label="Ent. patronal/Set. atividade" />
              </GridItem>
              <GridItem sm={6} children={<RHFTextField name="finalidade" label="Finalidade" />} />
              <GridItem sm={6} children={<RHFTextField name="garantia" label="Garantia" />} />
            </Grid>
          </Card>
          <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <RHFTextField name="obs" multiline minRows={2} maxRows={4} label="Observação" />
          </Card>
        </Box>
      </Stack>
      <ButtonsStepper isSaving={isSaving} labelCancel="Cancelar" onClose={onClose} label={isEdit ? 'Guardar' : ''} />
    </FormProvider>
  );
}
