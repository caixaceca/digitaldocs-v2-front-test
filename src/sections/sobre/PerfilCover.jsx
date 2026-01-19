// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
// utils
import { useSelector } from '../../redux/store';
import { nomeacaoBySexo } from '../../utils/formatText';
// components
import Label from '../../components/Label';
import SvgIconStyle from '../../components/SvgIconStyle';
import { AvatarBadge } from '../../components/custom-avatar';

// ---------------------------------------------------------------------------------------------------------------------

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
  position: 'absolute',
  left: theme.spacing(2),
  marginTop: theme.spacing(3),
  [theme.breakpoints.up('md')]: { alignItems: 'center', bottom: theme.spacing(4) },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function PerfilCover({ colaborador, isDeFeria }) {
  const { isLoading, colaboradores } = useSelector((state) => state.intranet);
  return (
    <RootStyle>
      <InfoStyle>
        <Stack>
          <AvatarBadge
            name={colaborador?.nome}
            foto={colaborador?.foto_anexo}
            presence={colaboradores?.find?.(({ id }) => id === colaborador?.id)?.presence}
            avatarSx={{
              borderWidth: 2,
              borderStyle: 'solid',
              width: { xs: 80, md: 128 },
              height: { xs: 80, md: 128 },
              borderColor: 'common.white',
            }}
            sx={{ width: 15, height: 15 }}
          />
        </Stack>
        <Stack sx={{ ml: 3, mt: { md: -2 }, color: 'common.white', textAlign: { md: 'left' } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ pr: 1 }}>
            {!colaborador && isLoading ? (
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
                {colaborador ? (
                  <Typography variant="h5" noWrap>
                    {colaborador?.nome || colaborador?.email}
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

          {!!colaborador && (
            <>
              <Typography noWrap variant="subtitle2">
                {nomeacaoBySexo(colaborador?.nomeacao_funcao, colaborador?.sexo)}
              </Typography>
              <Typography noWrap variant="body2">
                {colaborador?.uo}
              </Typography>
            </>
          )}
        </Stack>
      </InfoStyle>
    </RootStyle>
  );
}
