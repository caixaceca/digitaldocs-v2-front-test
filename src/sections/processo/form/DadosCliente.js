import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Fab, Grid, Button, Tooltip, InputAdornment } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';
import { RHFTextField, RHFDatePicker } from '../../../components/hook-form';
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
            <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
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
                  startIcon={<AddCircleIcon />}
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
              startIcon={<AddCircleIcon />}
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
