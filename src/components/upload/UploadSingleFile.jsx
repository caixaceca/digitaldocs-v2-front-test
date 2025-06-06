import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
// utils
import { getFileFormat } from '../../utils/formatFile';
//
import Image from '../Image';
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';
import FileDescription from './FileDescription';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey['500_32']}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  sx: PropTypes.object,
  error: PropTypes.bool,
  helperText: PropTypes.node,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default function UploadSingleFile({ error = false, file, helperText, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    ...other,
  });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && { color: 'error.main', borderColor: 'error.light', bgcolor: 'error.lighter' }),
          ...(file && getFileFormat(file.name) === 'image' && { padding: '12% 0' }),
        }}
      >
        <input {...getInputProps()} />
        <BlockContent small={other?.small} />
        {file && getFileFormat(file.name) === 'image' && (
          <Image
            alt="file preview"
            src={typeof file === 'string' ? file : file.preview}
            sx={{
              top: 8,
              left: 8,
              borderRadius: 1,
              position: 'absolute',
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 16px)',
            }}
          />
        )}
      </DropZoneStyle>
      {file && <FileDescription size file={file} sx={{ my: 1 }} />}
      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
      {helperText && helperText}
    </Box>
  );
}
