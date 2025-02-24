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
// redux
import { useSelector } from '../redux/store';

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

AvatarBedge.propTypes = { id: PropTypes.number, children: PropTypes.node, sx: PropTypes.object };

export function AvatarBedge({ id, children, sx = null }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const presence = colaboradores?.find((row) => Number(row?.id) === Number(id))?.presence || null;
  return presence ? (
    <Box>
      <Badge
        overlap="circular"
        badgeContent={
          (presence?.availability === 'Available' && <CheckCircleIcon color="success" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'Busy' && <CircleIcon color="error" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'DoNotDisturb' && <RemoveCircleOutlineIcon color="error" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'Away' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'BeRightBack' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'Offline' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (presence?.availability === 'OutOfOffice' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (presence?.availability && <RemoveCircleOutlineIcon color="focus" sx={{ ...iconWH }} />)
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
