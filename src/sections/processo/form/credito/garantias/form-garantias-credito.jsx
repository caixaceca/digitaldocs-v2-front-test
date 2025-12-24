import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { shapeGarantia } from './validationFields';
import composeGarantiaPayload from './composePayload';
import { vdt } from '../../../../../utils/formatObject';
import { construirSchemaImoveis } from './schemaFileds';
import { getFromGaji9 } from '../../../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../../../redux/store';
import { createItem, updateItem } from '../../../../../redux/slices/digitaldocs';
// components
import GridItem from '../../../../../components/GridItem';
import { DialogButons } from '../../../../../components/Actions';
import { DialogTitleAlt } from '../../../../../components/CustomDialog';
import { FormProvider, RHFNumberField, RHFAutocompleteObj } from '../../../../../components/hook-form';
//
import FormContas from './form-contas';
import FormImoveis from './form-imoveis';
import FormTitulos from './form-titulos';
import FormSeguros from './form-seguros';
import FormVeiculos from './form-veiculos';
import FormEntidades from './form-entidades';
import FormLivrancas from './form-livrancas';
import { listaGarantias } from '../../../../gaji9/applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormGarantias({ dados, processoId, onClose }) {
  const dispatch = useDispatch();
  const { tiposGarantias } = useSelector((state) => state.gaji9);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const isEdit = dados?.modal === 'update';
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const tipoGarantia = useMemo(
    () => garantiasList?.find(({ id }) => id === dados?.tipo_garantia_id) || null,
    [dados?.tipo_garantia_id, garantiasList]
  );

  useEffect(() => {
    dispatch(getFromGaji9('tiposSeguros'));
    dispatch(getFromGaji9('garantias-selecionaveis', { item: 'tiposGarantias' }));
  }, [dispatch]);

  const formSchema = shapeGarantia();
  const defaultValues = useMemo(
    () => ({
      contas: dados?.metadados?.contas || [],
      titulos: dados?.metadados?.titulos || [],
      seguros: dados?.metadados?.seguros || [],
      fiadores: dados?.metadados?.fiadores || [],
      livrancas: dados?.metadados?.livrancas || [],
      percentagem_cobertura: dados?.percentagem_cobertura || '',
      predios: construirSchemaImoveis(dados?.metadados?.imoveis?.[0]?.predios || []),
      terrenos: construirSchemaImoveis(dados?.metadados?.imoveis?.[0]?.terrenos || []),
      veiculos: construirSchemaImoveis(dados?.metadados?.imoveis?.[0]?.veiculos || []),
      apartamentos: construirSchemaImoveis(dados?.metadados?.imoveis?.[0]?.apartamentos || []),
      subtipo_garantia: tipoGarantia?.subtipos?.find(({ id }) => id === dados?.subtipo_garantia_id) || null,
      tipo_garantia: tipoGarantia,
    }),
    [dados, tipoGarantia]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit, watch, reset, setValue } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const tipo = watch('tipo_garantia');
  const subtipo = watch('subtipo_garantia');
  const subtipos = useMemo(() => tipo?.subtipos ?? [], [tipo?.subtipos]);
  const chaveMeta = useMemo(() => extrairChaveMeta(tipo, subtipo) ?? null, [tipo, subtipo]);

  const onSubmit = async (values) => {
    const formData = composeGarantiaPayload(values, chaveMeta);
    const msg = isEdit ? 'Garantia atualizada' : 'Garantia adicionada';
    const params = { fillCredito: true, processoId, msg, creditoId: dados?.id ?? '', put: true };
    dispatch((isEdit ? updateItem : createItem)('garantias', JSON.stringify([formData]), { ...params, onClose }));
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt title={isEdit ? 'Editar garantia' : 'Adicionar garantia'} onClose={onClose} sx={{ pb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ flexGrow: 1, pt: 1 }}>
            <GridItem md={subtipos.length > 0 ? 5 : 9}>
              <RHFAutocompleteObj
                dc
                label="Garantia"
                options={garantiasList}
                name="tipo_garantia"
                onChange={(_, newValue) => {
                  setValue('tipo_garantia', newValue, vdt);
                  setValue('subtipo_garantia', null, vdt);
                }}
              />
            </GridItem>

            {subtipos.length > 0 ? (
              <GridItem sm={8} md={4}>
                <RHFAutocompleteObj
                  dc
                  label="Subtipo"
                  options={subtipos}
                  name="subtipo_garantia"
                  onChange={(_, newValue) => setValue('subtipo_garantia', newValue, vdt)}
                />
              </GridItem>
            ) : null}
            <GridItem sm={4} md={3}>
              <RHFNumberField label="Cobertura" name="percentagem_cobertura" tipo="%" />
            </GridItem>
            {chaveMeta === 'fiadores' && <GridItem children={<FormEntidades label="Fiador" name="fiadores" />} />}
            {chaveMeta === 'livrancas' && <GridItem children={<FormLivrancas />} />}
            {chaveMeta === 'contas' && <GridItem children={<FormContas />} />}
            {chaveMeta === 'seguros' && <GridItem children={<FormSeguros prefixo="seguros" />} />}
            {chaveMeta === 'titulos' && <GridItem children={<FormTitulos />} />}
            {chaveMeta === 'terrenos' && <GridItem children={<FormImoveis tipo="Terreno" name="terrenos" />} />}
            {chaveMeta === 'predios' && <GridItem children={<FormImoveis tipo="Prédio" name="predios" />} />}
            {chaveMeta === 'apartamentos' && (
              <GridItem children={<FormImoveis tipo="Apartamento" name="apartamentos" />} />
            )}
            {chaveMeta === 'veiculos' && <GridItem children={<FormVeiculos />} />}
          </Grid>
          <DialogButons onClose={onClose} isSaving={isSaving} edit={isEdit} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function extrairChaveMeta(tipoSelecionado, subtipoSelecionado) {
  if (!tipoSelecionado) return null;
  if (!Array.isArray(tipoSelecionado?.subtipos) || tipoSelecionado?.subtipos?.length === 0) {
    return tipoSelecionado?.chave_meta ?? null;
  }
  if (!subtipoSelecionado) return null;
  return subtipoSelecionado?.chave_meta ?? tipoSelecionado?.chave_meta ?? null;
}
