import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
//
import { useSelector } from '../../redux/store';
import { useAuthContext } from '../../providers/auth-provider';
// components
import { AvatarBadge } from '../../components/custom-avatar';

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  marginLeft: '-10px',
  marginRight: '-10px',
  alignItems: 'center',
  padding: theme.spacing(2, 1.5),
  backgroundColor: theme.palette.grey['500_16'],
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  '&:hover': { backgroundColor: theme.palette.grey['500_32'] },
}));

export default function NavbarAccount({ isCollapse }) {
  const { account, logout } = useAuthContext();
  const { cc, colaboradores } = useSelector((state) => state.intranet);
  const colaborador = useMemo(() => colaboradores?.find(({ id }) => id === cc?.id), [cc?.id, colaboradores]);

  return (
    <Link color="inherit" underline="none">
      {!isCollapse && (
        <Box sx={{ position: 'absolute', right: 12, marginTop: 0.1 }}>
          <Tooltip title="Sair" arrow>
            <IconButton onClick={logout} sx={{ width: 25, height: 25 }}>
              <LogoutIcon sx={{ width: 16, opacity: 0.75 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <RootStyle sx={{ ...(isCollapse && { p: 1 }) }}>
        <AvatarBadge
          nome={account?.name}
          foto={cc?.foto_anexo}
          presence={colaborador?.presence}
          avatarSx={{ height: 44, width: 44 }}
        />
        <Box sx={{ ml: 2, ...(isCollapse && { ml: 0, width: 0 }) }}>
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 170 }}>
            {account?.name}
          </Typography>
          <Typography noWrap sx={{ color: 'text.secondary', maxWidth: 180, lineHeight: 1 }}>
            <Typography variant="caption">{account?.username}</Typography>
          </Typography>
        </Box>
      </RootStyle>
    </Link>
  );
}
