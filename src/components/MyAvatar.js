import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const iconWH = { width: 14, height: 14 };

// ----------------------------------------------------------------------

const CustomAvatar = forwardRef(({ name, ...other }, ref) => {
  const renderContent = (
    <Avatar ref={ref} {...other}>
      {name?.charAt(0)?.toUpperCase()}
    </Avatar>
  );

  return renderContent;
});

export default CustomAvatar;

CustomAvatar.propTypes = { sx: PropTypes.object, name: PropTypes.string };

// ----------------------------------------------------------------------

AvatarBedge.propTypes = { status: PropTypes.string, children: PropTypes.node, sx: PropTypes.object };

export function AvatarBedge({ status, children, sx = null }) {
  return status ? (
    <Box>
      <Badge
        overlap="circular"
        badgeContent={
          (status === 'Available' && <CheckCircleIcon color="success" sx={{ ...iconWH }} />) ||
          (status === 'Busy' && <CircleIcon color="error" sx={{ ...iconWH }} />) ||
          (status === 'DoNotDisturb' && <RemoveCircleOutlineIcon color="error" sx={{ ...iconWH }} />) ||
          (status === 'Away' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (status === 'BeRightBack' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (status === 'Offline' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (status === 'OutOfOffice' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (status && <RemoveCircleOutlineIcon color="focus" sx={{ ...iconWH }} />)
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            p: 0,
            width: 10,
            height: 10,
            minWidth: 5,
            borderRadius: '50%',
            alignItems: 'center',
            bgcolor: 'common.white',
            ...sx,
          },
        }}
        // sx={{ '& .MuiBadge-badge': { p: 0, minWidth: 10, width: 10, height: 10, bgcolor: 'common.white', ...sx } }}
      >
        {children}
      </Badge>
    </Box>
  ) : (
    children
  );
}
