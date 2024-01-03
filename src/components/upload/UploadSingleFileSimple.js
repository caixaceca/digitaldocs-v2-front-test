import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';
//
import Iconify from '../Iconify';
//
import FileDescription from './FileDescription';

// ----------------------------------------------------------------------

const StyledDropZone = styled('div')(({ theme }) => ({
  height: 40,
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  border: `dashed 1px ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------

UploadSingleFileSimple.propTypes = {
  sx: PropTypes.object,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default function UploadSingleFileSimple({ error = false, disabled = false, file, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: false, ...other });

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <StyledDropZone
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...(error && { color: 'error.main', bgcolor: 'error.lighter', borderColor: 'error.light' }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...sx,
        }}
      >
        <input {...getInputProps()} />
        <Iconify icon="eva:cloud-upload-fill" width={24} height={24} />
        <Typography noWrap variant="body2" sx={{ ml: 1 }}>
          Selecione o ficheiro...
        </Typography>
      </StyledDropZone>

      {file && <FileDescription file={file} />}
    </Stack>
  );
}
