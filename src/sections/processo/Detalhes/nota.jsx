// @mui
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

// ---------------------------------------------------------------------------------------------------------------------

export default function NotaProcesso({ nota = '', segmento = '' }) {
  return !(segmento === 'E' && nota === 'Entidade primária com apenas o documento primário em vigor!') ? (
    <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
      {nota &&
        ((nota === 'Essa Entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!' && (
          <Alert sx={{ lineHeight: 1.2, py: 0, px: 1.5 }} severity="error">
            Este entidade não possui nenhuma conta CVE elegivel para cativo/penhora no valor indicado!
          </Alert>
        )) || (
          <Alert
            sx={{ lineHeight: 1.2, py: 0, px: 1.5 }}
            severity={nota === 'Saldo cativado é igual ao valor solicitado!' ? 'success' : 'warning'}
          >
            {nota}
          </Alert>
        ))}
    </Stack>
  ) : null;
}
