import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { garantiaSchema } from './schemaFileds';
import { shapeGarantia } from './validationFields';
import composeGarantiaPayload from './composePayload';
import { vdt } from '../../../../../utils/formatObject';
import { getFromGaji9 } from '../../../../../redux/slices/gaji9';
import { createItem } from '../../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../../redux/store';
// components
import { FormProvider, RHFNumberField, RHFAutocompleteObj } from '../../../../../components/hook-form';
import GridItem from '../../../../../components/GridItem';
import { DialogButons } from '../../../../../components/Actions';
import { DialogTitleAlt } from '../../../../../components/CustomDialog';
//
import FormDps from './form-dps';
import FormImoveis from './form-imoveis';
import FormTitulos from './form-titulos';
import FormSeguros from './form-seguros';
import FormVeiculos from './form-veiculos';
import FormEntidades from './form-entidades';
import FormLivrancas from './form-livrancas';
import { listaGarantias } from '../../../../gaji9/applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormGarantias({ processoId, onClose }) {
  const dispatch = useDispatch();
  const { tiposGarantias } = useSelector((state) => state.gaji9);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);

  useEffect(() => {
    dispatch(getFromGaji9('tiposSeguros'));
    dispatch(getFromGaji9('tiposGarantias'));
  }, [dispatch]);

  const formSchema = shapeGarantia();
  const defaultValues = useMemo(() => garantiaSchema, []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });

  const { handleSubmit, watch, setValue } = methods;

  const tipo = watch('tipo_garantia');
  const subtipo = watch('subtipo_garantia');
  const subtipos = useMemo(() => tipo?.subtipos ?? [], [tipo?.subtipos]);
  const chaveMeta = useMemo(() => extrairChaveMeta(tipo, subtipo) ?? null, [tipo, subtipo]);

  const onSubmit = async (values) => {
    const params = { fillCredito: true, processoId, msg: 'Garantia adicionada', onClose };
    dispatch(createItem('garantias', JSON.stringify([composeGarantiaPayload(values)]), params));
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt title="Adicionar garantia" onClose={onClose} sx={{ pb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ flexGrow: 1, pt: 1 }}>
            <GridItem sm={subtipos.length > 0 ? 6 : 12} md={subtipos.length > 0 ? 4 : 7}>
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
              <GridItem sm={6} md={3}>
                <RHFAutocompleteObj
                  dc
                  label="Subtipo"
                  name="subtipo_garantia"
                  options={subtipos.map((row) => ({ ...row, label: row?.subtipo }))}
                  onChange={(_, newValue) => setValue('subtipo_garantia', newValue, vdt)}
                />
              </GridItem>
            ) : null}
            <GridItem sm={6} md={3} children={<RHFNumberField label="Valor" name="valor" tipo="CVE" />} />
            <GridItem sm={6} md={2} children={<RHFNumberField label="Cobertura" name="cobertura" tipo="%" />} />
            {chaveMeta === 'fiadores' && <GridItem children={<FormEntidades label="Fiador" name="fiadores" />} />}
            {chaveMeta === 'livrancas' && <GridItem children={<FormLivrancas />} />}
            {chaveMeta === 'contas' && <GridItem children={<FormDps />} />}
            {chaveMeta === 'seguros' && <GridItem children={<FormSeguros prefixo="seguros" />} />}
            {chaveMeta === 'titulos' && <GridItem children={<FormTitulos />} />}
            {chaveMeta === 'terrenos' && <GridItem children={<FormImoveis tipo="Terreno" name="terrenos" />} />}
            {chaveMeta === 'predios' && <GridItem children={<FormImoveis tipo="Prédio" name="predios" />} />}
            {chaveMeta === 'apartamentos' && (
              <GridItem children={<FormImoveis tipo="Apartamento" name="apartamentos" />} />
            )}
            {chaveMeta === 'veiculos' && <GridItem children={<FormVeiculos />} />}
          </Grid>
          <DialogButons onClose={onClose} isSaving={isSaving} />
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
  return subtipoSelecionado?.chave_meta ?? null;
}
