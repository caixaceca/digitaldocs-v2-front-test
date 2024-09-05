import PropTypes from 'prop-types';
import { useMsal } from '@azure/msal-react';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/Circle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
// utils
import { getFile } from '../../utils/getFile';
// redux
import { useSelector } from '../../redux/store';
// components
import MyAvatar from '../../components/MyAvatar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  marginLeft: '-10px',
  marginRight: '-10px',
  alignItems: 'center',
  padding: theme.spacing(2, 1.5),
  backgroundColor: theme.palette.grey[500_16],
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  '&:hover': { backgroundColor: theme.palette.grey[500_32] },
}));

// ----------------------------------------------------------------------

NavbarAcount.propTypes = { isCollapse: PropTypes.bool };

export default function NavbarAcount({ isCollapse }) {
  const { instance, accounts } = useMsal();
  const { cc, myStatus } = useSelector((state) => state.intranet);

  return (
    <Link color="inherit" underline="none">
      {!isCollapse && (
        <Box sx={{ position: 'absolute', right: 12, marginTop: 0.1 }}>
          <Tooltip title="Sair" arrow>
            <IconButton onClick={() => instance.logout()} sx={{ width: 25, height: 25 }}>
              <LogoutIcon sx={{ width: 16, opacity: 0.75 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <RootStyle sx={{ ...(isCollapse && { p: 1 }) }}>
        <Badge
          overlap="circular"
          badgeContent={
            (myStatus === 'Available' && <CheckCircleIcon color="success" sx={{ width: 15, height: 15 }} />) ||
            (myStatus === 'Busy' && <CircleIcon color="error" sx={{ width: 15, height: 15 }} />) ||
            (myStatus === 'DoNotDisturb' && <DoNotDisturbOnIcon color="error" sx={{ width: 15, height: 15 }} />) ||
            (myStatus === 'Away' && <AccessTimeFilledIcon color="warning" sx={{ width: 15, height: 15 }} />) ||
            (myStatus === 'BeRightBack' && <AccessTimeFilledIcon color="warning" sx={{ width: 15, height: 15 }} />) ||
            (myStatus === 'Offline' && <CancelIcon sx={{ width: 15, height: 15, color: 'focus.main' }} />) ||
            (myStatus === 'OutOfOffice' && <CancelIcon sx={{ width: 15, height: 15, color: 'focus.main' }} />) || (
              <DoNotDisturbOnIcon sx={{ width: 15, height: 15, color: 'focus.main' }} />
            )
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ '& .MuiBadge-badge': { p: 0, minWidth: 10, width: 10, height: 10, bgcolor: 'common.white' } }}
        >
          <MyAvatar
            name={accounts[0]?.name}
            sx={{ height: 44, width: 44 }}
            src={getFile('colaborador', cc?.foto_disk)}
          />
        </Badge>
        <Box
          sx={{
            ml: 2,
            transition: (theme) => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
            ...(isCollapse && { ml: 0, width: 0 }),
          }}
        >
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 170 }}>
            {accounts[0]?.name}
          </Typography>
          <Typography noWrap sx={{ color: 'text.secondary', maxWidth: 180, lineHeight: 1 }}>
            <Typography variant="caption">{accounts[0]?.username}</Typography>
          </Typography>
        </Box>
      </RootStyle>
    </Link>
  );
}
