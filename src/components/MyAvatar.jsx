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

// ---------------------------------------------------------------------------------------------------------------------

const CustomAvatar = forwardRef(({ name, ...other }, ref) => {
  const renderContent = (
    <Avatar ref={ref} {...other}>
      {typeof name === 'string' ? name?.charAt(0)?.toUpperCase() : ''}
    </Avatar>
  );

  return renderContent;
});

export default CustomAvatar;

// ---------------------------------------------------------------------------------------------------------------------

export function AvatarBedge({ id, children, sx = null }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const presence = colaboradores?.find(({ id: cid }) => Number(cid) === Number(id))?.presence?.availability || '';
  return presence ? (
    <Box>
      <Badge
        overlap="circular"
        badgeContent={
          (presence === 'Available' && <CheckCircleIcon color="success" sx={{ ...iconWH }} />) ||
          (presence === 'Busy' && <CircleIcon color="error" sx={{ ...iconWH }} />) ||
          (presence === 'DoNotDisturb' && <RemoveCircleOutlineIcon color="error" sx={{ ...iconWH }} />) ||
          (presence === 'Away' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (presence === 'BeRightBack' && <AccessTimeFilledIcon color="warning" sx={{ ...iconWH }} />) ||
          (presence === 'Offline' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (presence === 'OutOfOffice' && <HighlightOffIcon color="focus" sx={{ ...iconWH }} />) ||
          (presence && <RemoveCircleOutlineIcon color="focus" sx={{ ...iconWH }} />)
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
      >
        {children}
      </Badge>
    </Box>
  ) : (
    children
  );
}
