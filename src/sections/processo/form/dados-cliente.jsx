// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { fluxosGmkt, bancaDigital } from '../../../utils/validarAcesso';
// components
import GridItem from '../../../components/GridItem';
import { DefaultAction } from '../../../components/Actions';
import { RHFTextField, RHFNumberField, RHFDataEntrada } from '../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function DadosCliente({ noperacao = '', fluxo = null }) {
  const { watch, control } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  return (
    <Grid container spacing={3} justifyContent="center">
      {!fluxosGmkt(fluxo?.assunto) && (
        <GridItem sm={6} lg={3}>
          <RHFDataEntrada disableFuture name="data_entrada" label="Data de entrada" />
        </GridItem>
      )}
      {fluxo?.assunto === 'Abertura de Conta' ? (
        <>
          {fields?.length === 0 && (
            <GridItem lg={6} children={<RHFTextField name="titular" label="Titular" required />} />
          )}
          <Entidades fields={fields} append={append} remove={remove} />
        </>
      ) : (
        <>
          {!fluxosGmkt(fluxo?.assunto) && fluxo?.assunto !== 'Diário' && (
            <GridItem sm={6} lg={3} children={<RHFNumberField noFormat name="conta" label="Nº de conta" />} />
          )}
        </>
      )}
      {fluxo?.limpo && fluxo?.assunto !== 'Diário' && !fluxosGmkt(fluxo?.assunto) && (
        <GridItem xl={6}>
          <RHFTextField name="titular" label="Titular" required={!values?.conta} />
        </GridItem>
      )}

      {fluxo?.assunto === 'Diário' && (
        <GridItem xl={6}>
          <RHFTextField name="titular" label="Descrição" />
        </GridItem>
      )}
      {fluxosGmkt(fluxo?.assunto) && (
        <>
          <GridItem sm={fluxo?.assunto === 'Formulário' ? 6 : 12}>
            <RHFTextField name="titular" label="Descrição" />
          </GridItem>
          {fluxo?.assunto === 'Formulário' && (
            <GridItem sm={6} children={<RHFTextField name="email" label="Codificação/Nome" />} />
          )}
        </>
      )}
      {bancaDigital(fluxo?.assunto) && <GridItem xl={6} children={<RHFTextField name="email" label="Email" />} />}
      {(noperacao || fluxo?.iscon) && (
        <>
          <GridItem sm={6} xl={3} children={<RHFNumberField tipo="CVE" name="valor" label="Valor" />} />
          <GridItem sm={6} xl={3} children={<RHFNumberField noFormat name="noperacao" label="Nº de operação" />} />
        </>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Entidades({ fields = [], append, remove }) {
  return (
    <>
      {fields.map((item, index) => (
        <GridItem sm={6} lg={3} key={index}>
          <RHFTextField
            name={`entidades[${index}].numero`}
            label={`Nº de entidade ${fields?.length > 1 ? index + 1 : ''}`}
            InputProps={{
              type: 'number',
              endAdornment: (
                <InputAdornment position="end">
                  <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
                </InputAdornment>
              ),
            }}
          />
        </GridItem>
      ))}
      <GridItem sm={6} lg={3}>
        <Stack justifyContent="center" alignItems="flex-start" sx={{ height: 1 }}>
          <Button variant="soft" startIcon={<AddCircleIcon />} onClick={() => append({ numero: '' })}>
            Entidade
          </Button>
        </Stack>
      </GridItem>
    </>
  );
}
