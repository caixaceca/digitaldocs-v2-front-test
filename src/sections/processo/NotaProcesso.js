import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

NotaProcesso.propTypes = { nota: PropTypes.string, segmento: PropTypes.string };

export default function NotaProcesso({ nota, segmento }) {
  return (
    <>
      {segmento === 'E' && nota === 'Entidade primária com apenas o documento primário em vigor!' ? (
        ''
      ) : (
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
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
      )}
    </>
  );
}
