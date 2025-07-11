// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
// utils
import { nomeacaoBySexo } from '../../utils/formatText';
import { getIntranetFile } from '../../utils/formatFile';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import SvgIconStyle from '../../components/SvgIconStyle';
import MyAvatar, { AvatarBedge } from '../../components/MyAvatar';

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
  alignItems: 'center',
  position: 'absolute',
  left: theme.spacing(1),
  [theme.breakpoints.up('md')]: { left: theme.spacing(2) },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function PerfilCover({ colaborador, isDeFeria }) {
  const { isLoading } = useSelector((state) => state.intranet);
  return (
    <RootStyle>
      <InfoStyle>
        <Stack>
          <AvatarBedge
            id={colaborador?.id}
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
              name={colaborador?.nome}
              src={getIntranetFile('colaborador', colaborador?.foto_anexo)}
            />
          </AvatarBedge>
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
