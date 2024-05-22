import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// components
import { DefaultAction } from '../../../components/Actions';
import { RHFTextField, RHFNumberField, RHFDatePicker } from '../../../components/hook-form';

// ----------------------------------------------------------------------

DadosCliente.propTypes = { isInterno: PropTypes.bool, noperacao: PropTypes.string, fluxo: PropTypes.object };

export default function DadosCliente({ isInterno, noperacao = '', fluxo = null }) {
  const { watch, control } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });
  const isPS = fluxo?.assunto === 'Produtos e Serviços' || fluxo?.assunto === 'Preçário';

  const handleAdd = () => {
    append({ numero: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      {isInterno ? (
        <>
          {!isPS && (
            <Grid item xs={12} sm={6} xl={3}>
              <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
            </Grid>
          )}
          {fluxo?.assunto === 'Abertura de conta' ? (
            <>
              <Grid item xs={12} sm={6} xl={3}>
                <Button
                  fullWidth
                  size="large"
                  variant="soft"
                  sx={{ py: 3.5 }}
                  onClick={handleAdd}
                  startIcon={<AddCircleIcon />}
                >
                  Entidade
                </Button>
              </Grid>

              {fields.map((item, index) => (
                <Grid item xs={12} sm={6} xl={3} key={index}>
                  <RHFTextField
                    name={`entidades[${index}].numero`}
                    label={fields?.length < 2 ? 'Nº de entidade' : `Nº de entidade ${index + 1}`}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <DefaultAction small label="Remover" color="error" handleClick={() => handleRemove(index)} />
                        </InputAdornment>
                      ),
                      type: 'number',
                    }}
                  />
                </Grid>
              ))}
              {fields?.length === 0 && (
                <Grid item xs={12} xl={6}>
                  <RHFTextField name="titular" label="Titular" required />
                </Grid>
              )}
            </>
          ) : (
            <>
              {!isPS && fluxo?.assunto !== 'Diário' && (
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFNumberField name="conta" label="Nº de conta" />
                </Grid>
              )}
            </>
          )}
          {fluxo?.limpo && fluxo?.assunto !== 'Diário' && !isPS && (
            <Grid item xs={12} xl={6}>
              <RHFTextField name="titular" label="Titular" required={!values?.conta} />
            </Grid>
          )}
          {isPS && (
            <Grid item xs={12}>
              <RHFTextField name="titular" label="Descrição" />
            </Grid>
          )}
          {(fluxo?.assunto === 'Banca Virtual - Adesão' || fluxo?.assunto === 'Banca Virtual - Novos Códigos') && (
            <Grid item xs={12} xl={6}>
              <RHFTextField name="email" label="Email" />
            </Grid>
          )}
          {(noperacao || fluxo?.is_con) && (
            <>
              <Grid item xs={12} sm={6} xl={3}>
                <RHFNumberField tipo="moeda" name="valor" label="Valor" />
              </Grid>
              <Grid item xs={12} sm={6} xl={3}>
                <RHFNumberField name="noperacao" label="Nº de operação" />
              </Grid>
            </>
          )}
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6} xl={3}>
            <RHFTextField name="docidp" label="Nº de identificação primário" />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <RHFTextField name="docids" label="Nº de identificação secundário" />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <RHFNumberField name="cliente" label="Nº de cliente" />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <RHFNumberField name="conta" label="Nº de conta" />
          </Grid>
          <Grid item xs={12} sm={6} md={4} xl={3}>
            <Button
              fullWidth
              size="large"
              variant="soft"
              sx={{ py: 3.5 }}
              onClick={handleAdd}
              startIcon={<AddCircleIcon />}
            >
              Entidade
            </Button>
          </Grid>

          {fields.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
              <RHFTextField
                label="Nº de entidade"
                name={`entidades[${index}].numero`}
                InputProps={{
                  type: 'number',
                  endAdornment: (
                    <InputAdornment position="end">
                      <DefaultAction small label="Remover" color="error" handleClick={() => handleRemove(index)} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );
}
