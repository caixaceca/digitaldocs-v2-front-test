import PropTypes from 'prop-types';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Badge, Typography, Skeleton, Avatar } from '@mui/material';
// utils
import { BASEURL } from '../../utils/axios';
import { nomeacaoBySexo } from '../../utils/validarAcesso';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  '&:before': {
    top: 0,
    zIndex: 9,
    width: '100%',
    content: "''",
    height: '100%',
    position: 'absolute',
    backgroundColor: alpha(theme.palette.primary.main, 1),
  },
}));

const InfoStyle = styled('div')(({ theme }) => ({
  left: 20,
  zIndex: 99,
  position: 'absolute',
  marginTop: theme.spacing(3),
  right: 'auto',
  display: 'flex',
  [theme.breakpoints.up('md')]: { alignItems: 'center', left: theme.spacing(2), bottom: theme.spacing(4) },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': { border: `2px solid ${theme.palette.common.white}` },
}));

// ----------------------------------------------------------------------

PerfilCover.propTypes = { perfilColaborador: PropTypes.object };

export default function PerfilCover({ perfilColaborador }) {
  return (
    <RootStyle>
      <InfoStyle>
        {perfilColaborador ? (
          <StyledBadge
            overlap="circular"
            color={perfilColaborador.is_active ? 'success' : 'focus'}
            badgeContent=" "
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              sx={{
                mx: 'auto',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'common.white',
                width: { xs: 80, md: 128 },
                height: { xs: 80, md: 128 },
              }}
              src={
                perfilColaborador?.foto_disk &&
                `${BASEURL}/colaborador/file/colaborador/${perfilColaborador?.foto_disk}`
              }
            />
          </StyledBadge>
        ) : (
          <Avatar
            sx={{
              mx: 'auto',
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: 'common.white',
              width: { xs: 80, md: 128 },
              height: { xs: 80, md: 128 },
            }}
            src="assets/Shape.svg"
          />
        )}
        <Box sx={{ ml: 3, mt: { xs: 2, md: 0 }, color: 'common.white', textAlign: { md: 'left' } }}>
          <Typography variant="h4">
            {perfilColaborador ? (
              perfilColaborador?.perfil?.displayName || perfilColaborador?.perfil?.mail
            ) : (
              <Skeleton
                animation="wave"
                height={40}
                width={250}
                sx={{ backgroundColor: (theme) => theme.palette.background.neutral, opacity: 0.72 }}
              />
            )}
          </Typography>
          <Typography>
            {perfilColaborador ? (
              <>
                {nomeacaoBySexo(perfilColaborador?.nomeacao || perfilColaborador?.funcao, perfilColaborador?.sexo)} -{' '}
                {perfilColaborador?.uo?.label}
              </>
            ) : (
              <Skeleton
                animation="wave"
                height={25}
                width={150}
                sx={{ backgroundColor: (theme) => theme.palette.background.neutral }}
              />
            )}
          </Typography>
        </Box>
      </InfoStyle>
    </RootStyle>
  );
}
