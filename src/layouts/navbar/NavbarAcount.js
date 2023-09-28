import { useMsal } from '@azure/msal-react';
import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
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
  padding: theme.spacing(2, 1.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
  transition: theme.transitions.create('opacity', { duration: theme.transitions.duration.shorter }),
  border: `1px solid ${theme.palette.grey[500_8]}`,
  '&:hover': { backgroundColor: theme.palette.grey[500_32], border: '1px solid rgba(90,170,40,.5)' },
  marginLeft: '-10px',
  marginRight: '-10px',
  boxShadow: theme.customShadows.z4,
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
