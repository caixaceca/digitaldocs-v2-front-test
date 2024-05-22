import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
// utils
import { newLineText } from '../../../utils/normalizeText';

// ----------------------------------------------------------------------

NotaProcesso.propTypes = { nota: PropTypes.string, segmento: PropTypes.string, motivo: PropTypes.string };

export default function NotaProcesso({ nota = '', segmento = '', motivo = '' }) {
  return !(segmento === 'E' && nota === 'Entidade primária com apenas o documento primário em vigor!') || motivo ? (
    <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
      {nota &&
        ((nota === 'Essa Entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!' && (
          <Alert severity="error">
            Este entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!
          </Alert>
        )) || (
          <Alert severity={nota === 'Saldo cativado é igual ao valor solicitado!' ? 'success' : 'warning'}>
            {nota}
          </Alert>
        ))}
      {motivo ? (
        <Alert severity="warning" sx={{ lineHeight: 1.5 }}>
          <AlertTitle sx={{ typography: 'subtitle2' }}>Processo devolvido</AlertTitle>
          {newLineText(motivo)}
        </Alert>
      ) : (
        ''
      )}
    </Stack>
  ) : (
    ''
  );
}
