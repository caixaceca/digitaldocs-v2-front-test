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
// utils
import { getIntranetFile } from '../utils/formatFile';

const STATUS_MAP = {
  Available: { icon: CheckCircleIcon, color: 'success' },
  Busy: { icon: CircleIcon, color: 'error' },
  DoNotDisturb: { icon: RemoveCircleOutlineIcon, color: 'error' },
  Away: { icon: AccessTimeFilledIcon, color: 'warning' },
  BeRightBack: { icon: AccessTimeFilledIcon, color: 'warning' },
  Offline: { icon: HighlightOffIcon, color: 'focus' },
  OutOfOffice: { icon: HighlightOffIcon, color: 'focus' },
};

// ---------------------------------------------------------------------------------------------------------------------

const CustomAvatar = forwardRef(({ name, children, ...other }, ref) => (
  <Avatar ref={ref} {...other}>
    {name ? name.charAt(0).toUpperCase() : children}
  </Avatar>
));

export default CustomAvatar;

// ---------------------------------------------------------------------------------------------------------------------

export function AvatarBadge({ presence, nome, foto, avatarSx = null, sx = null, onClick }) {
  const renderContent = (
    <CustomAvatar
      name={nome}
      onClick={onClick}
      sx={{ ...avatarSx, boxShadow: 3 }}
      src={getIntranetFile('colaborador', foto)}
    />
  );

  if (!presence) return renderContent;

  const status = STATUS_MAP[presence?.availability] || { icon: RemoveCircleOutlineIcon, color: 'focus' };
  const StatusIcon = status.icon;

  return (
    <Box component="span" sx={{ display: 'inline-flex', position: 'relative' }}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={<StatusIcon color={status.color} sx={{ width: 12, height: 12, ...sx }} />}
        sx={{ '& .MuiBadge-badge': { width: 12, height: 12, minWidth: 0, bgcolor: 'common.white', ...sx } }}
      >
        {renderContent}
      </Badge>
    </Box>
  );
}
