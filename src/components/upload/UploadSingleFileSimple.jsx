import { useDropzone } from 'react-dropzone';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// utils
import { fData } from '@/utils/formatNumber';
import { getFileThumb } from '@/utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

const StyledDropZone = styled('div')(({ theme }) => ({
  display: 'flex',
  cursor: 'pointer',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  border: `dashed 1px ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  '&:hover': { opacity: 0.72 },
}));

const PlaceholderStyle = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function UploadSingleFileSimple({ error = false, disabled = false, helperText, file, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: false, ...other });

  return (
    <Stack spacing={0.5}>
      <StyledDropZone
        {...getRootProps()}
        sx={{
          p: 1,
          width: 1,
          minHeight: 56,
          ...(isDragActive && { opacity: 0.72 }),
          ...(file && { color: 'success.main' }),
          ...(error && { color: 'error.main', bgcolor: 'error.lighter', borderColor: 'error.light' }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...sx,
        }}
      >
        <input {...getInputProps()} />
        {!file && <CloudUploadIcon sx={{ width: 20 }} />}
        {file ? (
          <Stack spacing={1} direction="row" alignItems="center" sx={{ px: 0.5, width: 1 }}>
            <Stack>{getFileThumb(false, null, file?.name || file)}</Stack>
            <Typography variant="body2" sx={{ lineHeight: 1.25 }}>
              {file?.name || file}
              {file?.size && (
                <Typography variant="caption" sx={{ color: 'text.secondary', pl: 0.5 }}>
                  ({fData(file.size)})
                </Typography>
              )}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ pl: 1 }}>
            Selecionar ficheiro...
          </Typography>
        )}

        {file && (
          <PlaceholderStyle
            sx={{ opacity: 0, color: 'common.white', bgcolor: 'grey.900', '&:hover': { opacity: 0.72 } }}
          >
            <CloudUploadIcon sx={{ width: 20, mr: 1 }} />
            <Typography variant="body2">Alterar ficheiro...</Typography>
          </PlaceholderStyle>
        )}
      </StyledDropZone>
      {helperText && helperText}
    </Stack>
  );
}
