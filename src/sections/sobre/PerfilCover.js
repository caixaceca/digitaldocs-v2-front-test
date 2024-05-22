import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Switch from '@mui/material/Switch';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { getFile } from '../../utils/getFile';
import { nomeacaoBySexo } from '../../utils/validarAcesso';
// redux
import { changeDadosView } from '../../redux/slices/banka';
import { useDispatch, useSelector } from '../../redux/store';
// components
import MyAvatar from '../../components/MyAvatar';

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
  right: 'auto',
  display: 'flex',
  position: 'absolute',
  marginTop: theme.spacing(3),
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
            <MyAvatar
              sx={{
                mx: 'auto',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'common.white',
                width: { xs: 80, md: 128 },
                height: { xs: 80, md: 128 },
              }}
              src={getFile('colaborador', perfilColaborador?.foto_disk)}
            />
          </StyledBadge>
        ) : (
          <MyAvatar
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
              <Skeleton height={40} width={250} animation="wave" sx={{ backgroundColor: 'background.neutral' }} />
            )}
          </Typography>
          <Typography>
            {perfilColaborador ? (
              <>
                {nomeacaoBySexo(perfilColaborador?.nomeacao || perfilColaborador?.funcao, perfilColaborador?.sexo)} -{' '}
                {perfilColaborador?.uo?.label}
              </>
            ) : (
              <Skeleton height={25} width={150} animation="wave" sx={{ backgroundColor: 'background.neutra' }} />
            )}
          </Typography>
        </Box>
      </InfoStyle>
    </RootStyle>
  );
}

// ----------------------------------------------------------------------

EntidadeCover.propTypes = { numero: PropTypes.number, entidade: PropTypes.object };

export function EntidadeCover({ numero, entidade }) {
  const dispatch = useDispatch();
  const { dadosComValores } = useSelector((state) => state.banka);

  const changeView = (newValue) => {
    dispatch(changeDadosView(newValue));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
      <MyAvatar
        sx={{
          borderStyle: 'solid',
          borderColor: 'common.white',
          width: { xs: 80, md: 120 },
          height: { xs: 80, md: 120 },
        }}
        src={getFile('colaborador', '')}
      />
      <Stack
        spacing={2}
        sx={{ flexGrow: 1 }}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'left', md: 'center' }}
        justifyContent={{ xs: 'left', md: 'space-between' }}
      >
        <Box sx={{ color: 'common.white' }}>
          <Typography variant="h5">{numero}</Typography>
          <Typography variant="h5">{entidade?.nomeDaEntidade}</Typography>
          <Typography>
            {entidade?.descritivoSectorial} - {entidade?.descritivoResidencia}
          </Typography>
        </Box>
        <Box>
          <FormControlLabel
            label="Somente campos com valores"
            sx={{ ml: 0, pr: 2, borderRadius: 1, color: 'text.secondary', bgcolor: 'background.paper' }}
            control={<Switch checked={dadosComValores} onChange={(event, newValue) => changeView(newValue)} />}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
