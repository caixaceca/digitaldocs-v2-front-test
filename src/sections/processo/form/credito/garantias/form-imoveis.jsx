// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { listaFreguesias } from '@/_mock';
import { imovelSchema } from './schemaFileds';
import { applySort, getComparator } from '@/hooks/useTable';
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { AddItem, DefaultAction } from '@/components/Actions';
import { RHFTextField, RHFNumberField, RHFAutocompleteObj, RHFAutocompleteSmp } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormImoveis({ tipo, name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">{tipo}(s)</Typography>
        <AddItem onClick={() => append(imovelSchema)} dados={{ label: tipo, small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={3}>
        <Imoveis fields={fields} remove={remove} tipo={tipo} prefixo={name} />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Imoveis({ fields = [], remove, prefixo, tipo }) {
  const isAp = tipo === 'Apartamento';
  const isTerreno = tipo === 'Terreno';

  return fields?.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Grid container spacing={2} justifyContent="center">
            <GridItem sm={6} md={isAp ? 3 : 4}>
              <RHFAutocompleteSmp
                label="Tipo de matriz"
                options={['Urbana', 'Rural']}
                name={`${prefixo}[${index}].tipo_matriz`}
              />
            </GridItem>
            {isAp ? (
              <GridItem sm={6} md={3}>
                <RHFTextField name={`${prefixo}[${index}].matriz_predial`} label="Matriz predial" />
              </GridItem>
            ) : (
              <GridItem sm={6} md={4}>
                <RHFTextField name={`${prefixo}[${index}].numero_matriz`} label="Nº de matriz" />
              </GridItem>
            )}
            <GridItem sm={6} md={isAp ? 3 : 4}>
              <RHFTextField name={`${prefixo}[${index}].numero_descricao_predial`} label="Nº descrição predial" />
            </GridItem>
            <GridItem sm={6} md={isAp || isTerreno ? 3 : 4}>
              <RHFTextField name={`${prefixo}[${index}].nip`} label="NIP" />
            </GridItem>
            {isAp && (
              <>
                <GridItem sm={6} md={3}>
                  <RHFTextField name={`${prefixo}[${index}].identificacao_fracao`} label="Identificação fração" />
                </GridItem>
                <GridItem sm={6} md={3}>
                  <RHFTextField name={`${prefixo}[${index}].numero_andar`} label="Nº de andar" />
                </GridItem>
              </>
            )}
            {isTerreno && (
              <GridItem sm={6} md={3} children={<RHFTextField name={`${prefixo}[${index}].area`} label="Área" />} />
            )}
            <GridItem sm={6} md={isAp || isTerreno ? 3 : 4}>
              <RHFNumberField name={`${prefixo}[${index}].valor_pvt`} label="Valor PVT" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={isAp || isTerreno ? 3 : 4}>
              <RHFNumberField name={`${prefixo}[${index}].percentagem_cobertura`} label="Cobertura" tipo="%" />
            </GridItem>
            <GridItem>
              <Typography variant="overline">Localização</Typography>
              <Divider sx={{ mb: 1 }} />
              <Grid container spacing={2} justifyContent="center">
                <GridItem sm={6}>
                  <RHFAutocompleteObj
                    label="Freguesia"
                    name={`${prefixo}[${index}].freguesia`}
                    options={applySort(
                      listaFreguesias?.map((f) => ({
                        ...f,
                        label: f?.duplicada ? `${f?.freguesia} - ${f?.ilha}` : f?.freguesia,
                      })),
                      getComparator('asc', 'label')
                    )}
                  />
                </GridItem>
                <GridItem sm={6} children={<RHFTextField name={`${prefixo}[${index}].zona`} label="Zona" />} />
                <GridItem sm={6} md={3} children={<RHFTextField name={`${prefixo}[${index}].rua`} label="Rua" />} />
                <GridItem sm={6} md={3}>
                  <RHFTextField name={`${prefixo}[${index}].numero_porta`} label="Nº da porta" />
                </GridItem>
                <GridItem sm={6}>
                  <RHFTextField name={`${prefixo}[${index}].descritivo`} label="Descritivo" />
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem children={<FormEntidades label="Dono" name={`${prefixo}[${index}].donos`} />} />
            <GridItem children={<FormSeguros prefixo={`${prefixo}[${index}].seguros`} tipo />} />
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <SemDados message={`Nenhum ${tipo.toLowerCase()} adicionado...`} sx={{ p: 1.5 }} />
  );
}
