import PropTypes from 'prop-types';
// @mui
import { Grid, Stack, Alert } from '@mui/material';

// ----------------------------------------------------------------------

NotaProcesso.propTypes = {
  nota: PropTypes.string,
};

export default function NotaProcesso({ nota }) {
  return (
    <>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="center" alignItems="center">
          {(nota === 'Essa Entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!' && (
            <Alert severity="error">
              Este entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!
            </Alert>
          )) ||
            (nota === 'Saldo disponivel para cativo inferior ao valor solicitado!' && (
              <Alert severity="warning">Saldo disponível para cativo inferior ao valor solicitado!</Alert>
            )) || <Alert severity="warning">{nota}</Alert>}
        </Stack>
      </Grid>
    </>
  );
}
