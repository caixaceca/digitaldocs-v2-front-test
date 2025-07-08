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
import { getIntranetFile } from '../../utils/formatFile';
import { useAuthContext } from '../../providers/auth-provider';
// components
import MyAvatar, { AvatarBedge } from '../../components/MyAvatar';

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
  const { cc } = useSelector((state) => state.intranet);

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
        <AvatarBedge id={cc?.id}>
          <MyAvatar
            name={account?.name}
            sx={{ height: 44, width: 44 }}
            src={getIntranetFile('colaborador', cc?.foto_anexo)}
          />
        </AvatarBedge>
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
