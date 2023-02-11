import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { List, IconButton, ListItemText, ListItemIcon, ListItem } from '@mui/material';
// utils
import { fData } from '../../utils/formatNumber';
import getFileData from '../../utils/getFileData';
import { getFileThumb } from '../../utils/getFileFormat';
//
import Image from '../Image';
// import { varFade } from '../animate';
import SvgIconStyle from '../SvgIconStyle';

// ----------------------------------------------------------------------

MultiFilePreview.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
};

export default function MultiFilePreview({ showPreview = false, files, onRemove }) {
  const hasFile = files.length > 0;

  return (
    <List disablePadding sx={{ ...(hasFile && { my: 3 }) }}>
      <AnimatePresence>
        {files.map((file, index) => {
          const { key, name, size, preview } = getFileData(file, index);

          if (showPreview) {
            return (
              <ListItem
                key={key}
                // component={m.div}
                // {...varFade().inRight}
                sx={{
                  p: 0,
                  m: 0.5,
                  width: 80,
                  height: 80,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'inline-flex',
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
              >
                <Image alt="preview" src={preview} ratio="1/1" />

                {onRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(file)}
                    sx={{
                      top: 6,
                      p: '2px',
                      right: 6,
                      position: 'absolute',
                      color: 'common.white',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      },
                    }}
                  >
                    <SvgIconStyle src="/assets/icons/close.svg" sx={{ width: 15 }} />
                  </IconButton>
                )}
              </ListItem>
            );
          }

          return (
            <ListItem
              key={key}
              // component={m.div}
              // {...varFade().inRight}
              sx={{
                my: 1,
                px: 1.5,
                borderRadius: 1,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <ListItemIcon>{getFileThumb(file.name)}</ListItemIcon>

              <ListItemText
                primary={typeof file === 'string' ? file : name}
                secondary={typeof file === 'string' ? '' : fData(size || 0)}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />

              {onRemove && (
                <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                  <SvgIconStyle src="/assets/icons/close.svg" sx={{ width: 20 }} />
                </IconButton>
              )}
            </ListItem>
          );
        })}
      </AnimatePresence>
    </List>
  );
}
