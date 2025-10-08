import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { getFromGaji9 } from '../../../../redux/slices/gaji9';
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { fillData, formatDate } from '../../../../utils/formatTime';
import { validacao } from '../../../../components/hook-form/yup-shape';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { AddItem, DefaultAction, ButtonsStepper } from '../../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosForm({ onClose, dados, ids }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { tiposTitulos, tiposImoveis } = useSelector((state) => state.gaji9);

  const getTipoInicial = () => {
    if (dados?.tipo_imovel_id) return 'Imóvel';
    if (dados?.tipo_titulo_id) return 'Título';
    if (dados?.conta_dp) return 'DP';
    if (dados?.marca_viatura) return 'Viatura';
    return null;
  };

  const [tipo, setTipo] = useState(getTipoInicial());

  const titulosList = useMemo(() => tiposTitulos.map((t) => ({ id: t?.id, label: t?.tipo })), [tiposTitulos]);
  const imoveisList = useMemo(() => tiposImoveis.map((i) => ({ id: i?.id, label: i?.tipo })), [tiposImoveis]);

  useEffect(() => {
    dispatch(getFromGaji9('tiposTitulos'));
    dispatch(getFromGaji9('tiposImoveis'));
  }, [dispatch]);

  const formSchema = useMemo(
    () =>
      Yup.object().shape({
        // DP
        conta_dp: validacao(tipo === 'DP', Yup.number().positive().required().label('Conta DP')),
        // Titulo
        tipo_titulo_id: validacao(tipo === 'Título', Yup.mixed().required().label('Tipo de título')),
        data_emissao_titulo: validacao(tipo === 'Título', Yup.date().required().label('Data de emissão')),
        data_vencimento_titulo: validacao(tipo === 'Título', Yup.date().required().label('Data de vencimento')),
        total_titulo: validacao(tipo === 'Título', Yup.number().positive().required().label('Total de títulos')),
        instituicao_registo_titulo: validacao(
          tipo === 'Título',
          Yup.string().required().label('Instituição de registo')
        ),
        instituicao_emissora_titulo: validacao(
          tipo === 'Título',
          Yup.string().required().label('Instituição de emissão')
        ),
        cliente_registo_titulo: validacao(
          tipo === 'Título',
          Yup.number().positive().required().label('Cliente de registo')
        ),
        // Imóvel
        zona: validacao(tipo === 'Imóvel', Yup.string().required().label('Zona')),
        ilha: validacao(tipo === 'Imóvel', Yup.string().required().label('Ilha')),
        cidade: validacao(tipo === 'Imóvel', Yup.string().required().label('Cidade')),
        concelho: validacao(tipo === 'Imóvel', Yup.string().required().label('Concelho')),
        freguesia: validacao(tipo === 'Imóvel', Yup.string().required().label('Freguesia')),
        conservatoria: validacao(tipo === 'Imóvel', Yup.string().required().label('Conservatória')),
        tipo_imovel_id: validacao(tipo === 'Imóvel', Yup.mixed().required().label('Tipo de imóvel')),
        // Viatura
        nura_viatura: validacao(tipo === 'Viatura', Yup.string().required().label('Nura')),
        marca_viatura: validacao(tipo === 'Viatura', Yup.string().required().label('Marca')),
        modelo_viatura: validacao(tipo === 'Viatura', Yup.string().required().label('Modelo')),
        ano_fabrico: validacao(tipo === 'Viatura', Yup.date().required().label('Ano de fabricação')),
        matricula_viatura: validacao(tipo === 'Viatura', Yup.string().required().label('Matrícula')),

        donos: Yup.array(
          Yup.object({ numero_entidade: Yup.number().positive().integer().required().label('Nº entidade') })
        ),
      }),
    [tipo]
  );

  const defaultValues = useMemo(
    () => ({
      // DP
      conta_dp: dados?.conta_dp ?? '',
      // TÍTULO
      total_titulo: dados?.total_titulo ?? '',
      cliente_registo_titulo: dados?.cliente_registo_titulo ?? '',
      data_emissao_titulo: fillData(dados?.data_emissao_titulo, null),
      instituicao_registo_titulo: dados?.instituicao_registo_titulo ?? '',
      instituicao_emissora_titulo: dados?.instituicao_emissora_titulo ?? '',
      data_vencimento_titulo: fillData(dados?.data_vencimento_titulo, null),
      tipo_titulo_id: titulosList?.find(({ id }) => id === dados?.tipo_titulo_id) || null,
      // IMÓVEL
      zona: dados?.zona ?? '',
      piso: dados?.piso ?? '',
      ilha: dados?.ilha ?? '',
      cidade: dados?.cidade ?? '',
      concelho: dados?.concelho ?? '',
      freguesia: dados?.freguesia ?? '',
      tipo_matriz: dados?.tipo_matriz ?? '',
      area_terreno: dados?.area_terreno ?? '',
      conservatoria: dados?.conservatoria ?? '',
      num_matriz_predial: dados?.num_matriz_predial ?? '',
      num_registo_predial: dados?.num_registo_predial ?? '',
      identificacao_fracao: dados?.identificacao_fracao ?? '',
      num_descricao_predial: dados?.num_descricao_predial ?? '',
      tipo_imovel_id: imoveisList?.find(({ id }) => id === dados?.tipo_imovel_id) || null,
      // VIATURA
      nura_viatura: dados?.nura_viatura ?? '',
      marca_viatura: dados?.marca_viatura ?? '',
      modelo_viatura: dados?.modelo_viatura ?? '',
      matricula_viatura: dados?.matricula_viatura ?? '',
      ano_fabrico: dados?.ano_fabrico ? new Date(`${dados?.ano_fabrico}-01-01`) : null,
      //
      donos: dados?.donos || (tipo === 'DP' && []) || [{ numero_entidade: '' }],
    }),
    [dados, tipo, imoveisList, titulosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, control, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'donos' });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, tipo, imoveisList, titulosList]);

  const onSubmit = async (values) => {
    try {
      const formData =
        (tipo === 'DP' && { conta_dp: values?.conta_dp }) ||
        (tipo === 'Título' && {
          donos: values?.donos,
          total_titulo: values?.total_titulo,
          tipo_titulo_id: values?.tipo_titulo_id?.id,
          cliente_registo_titulo: values?.cliente_registo_titulo,
          instituicao_registo_titulo: values?.instituicao_registo_titulo,
          instituicao_emissora_titulo: values?.instituicao_emissora_titulo,
          data_emissao_titulo: formatDate(values?.data_emissao_titulo, 'yyyy-MM-dd'),
          data_vencimento_titulo: formatDate(values?.data_vencimento_titulo, 'yyyy-MM-dd'),
        }) ||
        (tipo === 'Imóvel' && {
          zona: values?.zona,
          ilha: values?.ilha,
          piso: values?.piso,
          donos: values?.donos,
          cidade: values?.cidade,
          concelho: values?.concelho,
          freguesia: values?.freguesia,
          tipo_matriz: values?.tipo_matriz,
          area_terreno: values?.area_terreno,
          conservatoria: values?.conservatoria,
          tipo_imovel_id: values?.tipo_imovel_id?.id,
          num_matriz_predial: values?.num_matriz_predial,
          num_registo_predial: values?.num_registo_predial,
          identificacao_fracao: values?.identificacao_fracao,
          num_descricao_predial: values?.num_descricao_predial,
        }) ||
        (tipo === 'Viatura' && {
          donos: values?.donos,
          nura_viatura: values?.nura_viatura,
          marca_viatura: values?.marca_viatura,
          modelo_viatura: values?.modelo_viatura,
          matricula_viatura: values?.matricula_viatura,
          ano_fabrico: values?.ano_fabrico?.getFullYear(),
        });
      const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
      dispatch(updateItem('metadados-garantia', JSON.stringify(formData), { ...params, onClose }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={(tipo === 'Imóvel' && 'md') || 'sm'}>
      <DialogTitleAlt title="Informações da garantia" onClose={onClose} sx={{ mb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }} justifyContent="center">
            <GridItem sm={6}>
              <Autocomplete
                fullWidth
                disableClearable
                value={tipo || null}
                options={['DP', 'Título', 'Imóvel', 'Viatura']}
                onChange={(event, newValue) => setTipo(newValue)}
                renderInput={(params) => <TextField {...params} label="Garantia" />}
              />
            </GridItem>
            {tipo === 'DP' && <GridItem sm={6} children={<RHFNumberField name="conta_dp" label="Conta DP" />} />}
            {tipo === 'Título' && (
              <>
                <GridItem sm={6}>
                  <RHFAutocompleteObj name="tipo_titulo_id" label="Tipo de título" options={titulosList} />
                </GridItem>
                <GridItem sm={6}>
                  <RHFNumberField name="total_titulo" label="Total de títulos" noFormat />
                </GridItem>
                <GridItem sm={6}>
                  <RHFNumberField name="cliente_registo_titulo" label="Cliente de registo" noFormat />
                </GridItem>
                <GridItem sm={6}>
                  <RHFDatePicker name="data_emissao_titulo" label="Data de emissão" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFDatePicker name="data_vencimento_titulo" label="Data de vencimento" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFTextField name="instituicao_registo_titulo" label="Instituição de registo" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFTextField name="instituicao_emissora_titulo" label="Instituição emissora" />
                </GridItem>
              </>
            )}
            {tipo === 'Imóvel' && (
              <>
                <GridItem sm={6}>
                  <RHFAutocompleteObj name="tipo_imovel_id" label="Tipo de imóvel" options={imoveisList} />
                </GridItem>
                <GridItem sm={6} children={<RHFTextField name="conservatoria" label="Conservatória" />} />
                <GridItem sm={6}>
                  <RHFTextField name="num_descricao_predial" label="Nº descrição predial" />
                </GridItem>
                <GridItem sm={6} children={<RHFTextField name="num_matriz_predial" label="Nº matriz predial" />} />
                <GridItem sm={6} children={<RHFTextField name="num_registo_predial" label="Nº registo predial" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="ilha" label="Ilha" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="cidade" label="Cidade" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="concelho" label="Concelho" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="freguesia" label="Freguesia" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="zona" label="Zona" />} />
                <GridItem sm={6} md={4} children={<RHFTextField name="piso" label="Piso" />} />
                <GridItem sm={6} md={4}>
                  <RHFTextField name="identificacao_fracao" label="Identificação fração" />
                </GridItem>
                <GridItem sm={6} md={4} children={<RHFTextField name="tipo_matriz" label="Tipo de matriz" />} />
                <GridItem sm={6} md={4}>
                  <RHFNumberField name="area_terreno" label="Área do terreno" tipo="m²" />
                </GridItem>
              </>
            )}
            {tipo === 'Viatura' && (
              <>
                <GridItem sm={6}>
                  <RHFDatePicker name="ano_fabrico" label="Ano de fabricação" maxDate={new Date()} views={['year']} />
                </GridItem>
                <GridItem sm={6} children={<RHFTextField name="matricula_viatura" label="Matrícula" />} />
                <GridItem sm={6} children={<RHFTextField name="nura_viatura" label="Nura" />} />
                <GridItem sm={6} children={<RHFTextField name="marca_viatura" label="Marca" />} />
                <GridItem sm={6} children={<RHFTextField name="modelo_viatura" label="Modelo" />} />
              </>
            )}
            {tipo && tipo !== 'DP' && (
              <GridItem>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                  <Typography variant="overline">Dono(s) da garantia</Typography>
                  <AddItem onClick={() => append({ numero_entidade: '' })} dados={{ label: 'Entidade', small: true }} />
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={3} sx={{ pt: 1 }} justifyContent="center">
                  {fields.map((item, index) => (
                    <GridItem sm={4} key={`entidade_${index}`}>
                      <RHFTextField
                        name={`donos[${index}].numero_entidade`}
                        label={`Entidade ${fields?.length > 1 ? index + 1 : ''}`}
                        InputProps={{
                          type: 'number',
                          endAdornment: (
                            <InputAdornment position="end">
                              <DefaultAction
                                small
                                icon="Remover"
                                label="Eliminar"
                                onClick={() => remove(index)}
                                disabled={fields?.length === 1}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </GridItem>
                  ))}
                </Grid>
              </GridItem>
            )}
          </Grid>
          <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
