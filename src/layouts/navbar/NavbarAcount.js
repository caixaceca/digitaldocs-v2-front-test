import { useMsal } from '@azure/msal-react';
import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// utils
import { getFile } from '../../utils/getFile';
// redux
import { useSelector } from '../../redux/store';
// components
import MyAvatar from '../../components/MyAvatar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '-10px',
  marginRight: '-10px',
  padding: theme.spacing(2, 1.5),
  boxShadow: theme.customShadows.z8,
  backgroundColor: theme.palette.grey[500_12],
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  '&:hover': { backgroundColor: theme.palette.grey[500_32] },
  transition: theme.transitions.create('opacity', { duration: theme.transitions.duration.shorter }),
}));

// ----------------------------------------------------------------------

NavbarAcount.propTypes = { isCollapse: PropTypes.bool };

export default function NavbarAcount({ isCollapse }) {
  const { accounts } = useMsal();
  const { cc } = useSelector((state) => state.intranet);

  return (
    <Box>
      <RootStyle sx={{ ...(isCollapse && { bgcolor: 'transparent' }) }}>
        <MyAvatar name={accounts[0]?.name} src={getFile('colaborador', cc?.foto_disk)} sx={{ height: 44, width: 44 }} />
        <Box
          sx={{
            ml: 2,
            transition: (theme) => theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
            ...(isCollapse && { ml: 0, width: 0 }),
          }}
        >
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
            {accounts[0]?.name}
          </Typography>
          <Typography noWrap sx={{ color: 'text.secondary', maxWidth: 180 }}>
            <Typography variant="caption">{accounts[0]?.username}</Typography>
          </Typography>
        </Box>
      </RootStyle>
    </Box>
  );
}
