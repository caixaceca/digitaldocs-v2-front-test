import { useDropzone } from 'react-dropzone';
// @mui
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
//
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';
import MultiFilePreview from './MultiFilePreview';

// ---------------------------------------------------------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(2, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey['500_32']}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function UploadMultiFile({ error, showPreview = false, files, onRemove, helperText, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({ ...other });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && { color: 'error.main', borderColor: 'error.light', bgcolor: 'error.lighter' }),
        }}
      >
        <input {...getInputProps()} />

        <BlockContent multiple small={other?.small} permitidos={other?.permitidos} />
      </DropZoneStyle>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} {...other} />}

      <MultiFilePreview files={files} showPreview={showPreview} onRemove={onRemove} />

      {helperText && helperText}
    </Box>
  );
}
