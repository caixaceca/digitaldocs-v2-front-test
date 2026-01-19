// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { fData } from '../../utils/formatNumber';
import { getFileData } from '../../utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

export default function RejectionFiles({ fileRejections, maxSize, maxFiles }) {
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'file-too-large':
        return `O ficheiro é maior que ${fData(maxSize)}`;
      case 'file-too-small':
        return `O ficheiro é menor que ${fData(1024)}`; // Exemplo para 1KB ou use outra prop
      case 'too-many-files':
        return `Pode enviar no máximo ${maxFiles} ${maxFiles > 1 ? 'ficheiros' : 'ficheiro'}`;
      case 'file-invalid-type':
        return 'O tipo de ficheiro não é permitido';
      default:
        return error.message;
    }
  };

  if (fileRejections.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ px: 2, mt: 3, borderColor: 'error.light', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08) }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size } = getFileData(file);

        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {size ? fData(size) : ''}
            </Typography>

            {errors.map((error) => (
              <Box key={error.code} component="li" sx={{ typography: 'caption', listStyle: 'none', pl: 1 }}>
                • {getErrorMessage(error)}
              </Box>
            ))}
          </Box>
        );
      })}
    </Paper>
  );
}
