import PropTypes from 'prop-types';
import isString from 'lodash/isString';
import { useDropzone } from 'react-dropzone';
// @mui
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// utils
import { varFade } from '../animate';
import { fData } from '../../utils/formatNumber';
import { getFileThumb, getFileFormat } from '../../utils/getFileFormat';
//
import Image from '../Image';
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  helperText: PropTypes.node,
  sx: PropTypes.object,
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
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
          ...(file &&
            getFileFormat(file.name) === 'image' && {
              padding: '12% 0',
            }),
        }}
      >
        <input {...getInputProps()} />
        <BlockContent />
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
      {file && (
        <ListItem
          {...varFade().inRight}
          sx={{
            my: 1,
            py: 0.75,
            px: 2,
            borderRadius: 1,
            border: (theme) => `solid 1px ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            color: 'text.secondary',
          }}
        >
          <ListItemIcon>{getFileThumb(false, null, file.name)}</ListItemIcon>
          <ListItemText
            primary={isString(file) ? file : file.name}
            secondary={isString(file) ? '' : fData(file.size)}
            primaryTypographyProps={{ variant: 'subtitle2' }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItem>
      )}
      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      {helperText && helperText}
    </Box>
  );
}
