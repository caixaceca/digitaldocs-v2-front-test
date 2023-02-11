import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Fab, Grid, Button, Tooltip, TextField, InputAdornment } from '@mui/material';
// hooks
import useResponsive from '../../../../hooks/useResponsive';
// components
import SvgIconStyle from '../../../../components/SvgIconStyle';
import { RHFTextField } from '../../../../components/hook-form';
// utils

// ----------------------------------------------------------------------

DadosCliente.propTypes = { isInterno: PropTypes.bool, assunto: PropTypes.string };

export default function DadosCliente({ isInterno, assunto = '' }) {
  const { control } = useFormContext();
  const isXl = useResponsive('up', 'xl');
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  const handleAdd = () => {
    append({ numero: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Grid container spacing={3}>
      {isInterno ? (
        <>
          {isXl && assunto !== 'Abertura de conta' && assunto !== 'OPE DARH' && (
            <Grid item xs={12} xl={3}>
              {' '}
            </Grid>
          )}
          <Grid item xs={12} sm={6} xl={3}>
            <Controller
              name="data_entrada"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  value={field.value}
                  label="Data de entrada"
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                  )}
                />
              )}
            />
          </Grid>
          {assunto === 'Abertura de conta' || assunto === 'OPE DARH' ? (
            <>
              <Grid item xs={12} sm={6} xl={3}>
                <Button
                  fullWidth
                  size="large"
                  variant="soft"
                  sx={{ py: 3.5 }}
                  onClick={handleAdd}
                  startIcon={<SvgIconStyle src="/assets/icons/add.svg" />}
                >
                  Entidade
                </Button>
              </Grid>

              {fields.map((item, index) => (
                <Grid item xs={12} sm={6} xl={3} key={index}>
                  <RHFTextField
                    required
                    name={`entidades[${index}].numero`}
                    label="Nº de entidade"
                    InputProps={{
                      endAdornment: fields?.length > 1 && (
                        <InputAdornment position="end">
                          <Tooltip title="Remover" arrow>
                            <Fab
                              size="small"
                              variant="soft"
                              color="inherit"
                              sx={{ width: 30, height: 30 }}
                              onClick={() => handleRemove(index)}
                            >
                              <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 18 }} />
                            </Fab>
                          </Tooltip>
                        </InputAdornment>
                      ),
                      type: 'number',
                    }}
                  />
                </Grid>
              ))}
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6} xl={3}>
                <RHFTextField name="conta" label="Nº de conta" InputProps={{ type: 'number' }} />
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
            <RHFTextField
              name="cliente"
              label="Nº de cliente"
              InputProps={{ type: 'number', inputProps: { max: 999999999 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <RHFTextField
              name="conta"
              label="Nº de conta"
              InputProps={{ type: 'number', inputProps: { max: 99999999999999 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} xl={3}>
            <Button
              fullWidth
              size="large"
              variant="soft"
              sx={{ py: 3.5 }}
              onClick={handleAdd}
              startIcon={<SvgIconStyle src="/assets/icons/add.svg" />}
            >
              Entidade
            </Button>
          </Grid>

          {fields.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
              <RHFTextField
                required
                name={`entidades[${index}].numero`}
                label="Nº de entidade"
                max={600}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Remover" arrow>
                        <Fab
                          size="small"
                          variant="soft"
                          color="inherit"
                          sx={{ width: 30, height: 30 }}
                          onClick={() => handleRemove(index)}
                        >
                          <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 18 }} />
                        </Fab>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  type: 'number',
                  inputProps: { max: 9999999 },
                }}
              />
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );
}
