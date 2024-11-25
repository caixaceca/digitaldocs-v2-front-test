import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { getFile } from '../../utils/getFile';
import { nomeacaoBySexo } from '../../utils/validarAcesso';
// redux
import { getSuccess } from '../../redux/slices/banka';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import SvgIconStyle from '../../components/SvgIconStyle';
import MyAvatar, { AvatarBedge } from '../../components/MyAvatar';

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
  zIndex: 99,
  right: 'auto',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  left: theme.spacing(1),
  [theme.breakpoints.up('md')]: { left: theme.spacing(2) },
}));

// ----------------------------------------------------------------------

PerfilCover.propTypes = { perfilColaborador: PropTypes.object, isDeFeria: PropTypes.object };

export default function PerfilCover({ perfilColaborador, isDeFeria }) {
  const { isLoading } = useSelector((state) => state.intranet);
  console.log(perfilColaborador);
  return (
    <RootStyle>
      <InfoStyle>
        <Stack>
          <AvatarBedge
            id={perfilColaborador?.id}
            sx={{ border: (theme) => `2px solid ${theme.palette.common.white}`, width: 15, height: 15 }}
          >
            <MyAvatar
              sx={{
                borderWidth: 2,
                mt: { xs: 3, md: 1.5 },
                borderStyle: 'solid',
                width: { xs: 80, md: 128 },
                height: { xs: 80, md: 128 },
                borderColor: 'common.white',
              }}
              name={perfilColaborador?.perfil?.displayName}
              src={getFile('colaborador', perfilColaborador?.foto_disk)}
            />
          </AvatarBedge>
        </Stack>
        <Stack sx={{ ml: 3, mt: { md: -2 }, color: 'common.white', textAlign: { md: 'left' } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ pr: 1 }}>
            {!perfilColaborador && isLoading ? (
              <Stack>
                <Skeleton sx={{ height: 26, width: 300, bgcolor: '#fff', opacity: 0.48, transform: 'scale(1)' }} />
                <Skeleton
                  sx={{ height: 15, width: 100, bgcolor: '#fff', mt: 1, opacity: 0.48, transform: 'scale(1)' }}
                />
                <Skeleton
                  sx={{ height: 18, width: 200, bgcolor: '#fff', mt: 1, opacity: 0.48, transform: 'scale(1)' }}
                />
              </Stack>
            ) : (
              <>
                {perfilColaborador ? (
                  <Typography variant="h4" noWrap>
                    {perfilColaborador?.perfil?.displayName || perfilColaborador?.perfil?.mail}
                  </Typography>
                ) : (
                  <Typography variant="h6" noWrap sx={{ fontStyle: 'italic', fontWeight: 'normal', pr: 1 }}>
                    Dados do colaborador não encontrado
                  </Typography>
                )}
              </>
            )}
            {isDeFeria && (
              <Label
                variant="contained"
                sx={{ fontSize: 16, height: 26 }}
                startIcon={<SvgIconStyle src="/assets/icons/navbar/ferias.svg" sx={{ width: 20, height: 20 }} />}
              >
                Férias
              </Label>
            )}
          </Stack>

          {!!perfilColaborador && (
            <>
              <Typography noWrap variant="subtitle2">
                {nomeacaoBySexo(perfilColaborador?.nomeacao || perfilColaborador?.funcao, perfilColaborador?.sexo)}
              </Typography>
              <Typography noWrap variant="body2">
                {perfilColaborador?.uo?.desegnicao}
              </Typography>
            </>
          )}
        </Stack>
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
    dispatch(getSuccess({ item: 'dadosComValores', dados: newValue }));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
      <MyAvatar
        sx={{
          borderStyle: 'solid',
          width: { xs: 80, md: 120 },
          height: { xs: 80, md: 120 },
          borderColor: 'common.white',
        }}
        src={getFile('colaborador', '')}
      />
      <Stack
        useFlexGap
        spacing={1}
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        sx={{ flexGrow: 1 }}
        justifyContent="space-between"
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
