import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { fluxosGmkt, bancaDigital } from '../../../utils/validarAcesso';
// components
import GridItem from '../../../components/GridItem';
import { DefaultAction } from '../../../components/Actions';
import { RHFTextField, RHFNumberField, RHFDatePicker } from '../../../components/hook-form';

// ----------------------------------------------------------------------

DadosCliente.propTypes = { isInterno: PropTypes.bool, noperacao: PropTypes.string, fluxo: PropTypes.object };

export default function DadosCliente({ isInterno, noperacao = '', fluxo = null }) {
  const { watch, control } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  return (
    <Grid container spacing={3} justifyContent="center">
      {isInterno ? (
        <>
          {!fluxosGmkt(fluxo?.assunto) && (
            <GridItem xs={12} sm={6} lg={3}>
              <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
            </GridItem>
          )}
          {fluxo?.assunto === 'Abertura de conta' ? (
            <>
              <Entidades fields={fields} append={append} remove={remove} />
              {fields?.length === 0 && (
                <GridItem xs={12} lg={6} children={<RHFTextField name="titular" label="Titular" required />} />
              )}
            </>
          ) : (
            <>
              {!fluxosGmkt(fluxo?.assunto) && fluxo?.assunto !== 'Diário' && (
                <GridItem xs={12} sm={6} xl={3} children={<RHFNumberField name="conta" label="Nº de conta" />} />
              )}
            </>
          )}
          {fluxo?.limpo && fluxo?.assunto !== 'Diário' && !fluxosGmkt(fluxo?.assunto) && (
            <Grid item xs={12} xl={6}>
              <RHFTextField name="titular" label="Titular" required={!values?.conta} />
            </Grid>
          )}
          {fluxosGmkt(fluxo?.assunto) && (
            <>
              <Grid item xs={12} sm={fluxo?.assunto === 'Formulário' ? 6 : 12}>
                <RHFTextField name="titular" label="Descrição" />
              </Grid>
              {fluxo?.assunto === 'Formulário' && (
                <GridItem xs={12} sm={6} children={<RHFTextField name="email" label="Codificação/Nome" />} />
              )}
            </>
          )}
          {bancaDigital(fluxo?.assunto) && (
            <GridItem xs={12} xl={6} children={<RHFTextField name="email" label="Email" />} />
          )}
          {(noperacao || fluxo?.iscon) && (
            <>
              <GridItem xs={12} sm={6} xl={3} children={<RHFNumberField tipo="moeda" name="valor" label="Valor" />} />
              <GridItem xs={12} sm={6} xl={3} children={<RHFNumberField name="noperacao" label="Nº de operação" />} />
            </>
          )}
        </>
      ) : (
        <>
          <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docidp" label="Nº de identificação 1" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docids" label="Nº de identificação 2" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFNumberField name="cliente" label="Nº de cliente" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFNumberField name="conta" label="Nº de conta" />} />
          <Entidades fields={fields} append={append} remove={remove} />
        </>
      )}
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Entidades.propTypes = { append: PropTypes.func, remove: PropTypes.func, fields: PropTypes.array };

export function Entidades({ fields = [], append, remove }) {
  return (
    <>
      {fields.map((item, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <RHFTextField
            label={`Nº de entidade ${index + 1}`}
            name={`entidades[${index}].numero`}
            InputProps={{
              type: 'number',
              endAdornment: (
                <InputAdornment position="end">
                  <DefaultAction small label="Remover" color="error" handleClick={() => remove(index)} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      ))}
      <Grid item xs={12} sm={6} lg={3}>
        <Button
          fullWidth
          variant="soft"
          sx={{ py: 2 }}
          startIcon={<AddCircleIcon />}
          onClick={() => append({ numero: '' })}
        >
          Entidade
        </Button>
      </Grid>
    </>
  );
}
