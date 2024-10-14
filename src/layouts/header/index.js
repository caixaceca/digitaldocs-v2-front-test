import { m } from 'framer-motion';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Snowfall from 'react-snowfall';
// @mui
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
// utils
import cssStyles from '../../utils/cssStyles';
import { formatDate } from '../../utils/formatTime';
import { validarAcesso } from '../../utils/validarAcesso';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
import useToggle, { useToggle1, useToggle2 } from '../../hooks/useToggle';
// config
import { HEADER, NAVBAR } from '../../config';
// components
import Logo from '../../components/Logo';
import Image from '../../components/Image';
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';
// sections
import Ajuda from '../../sections/home/Ajuda';
import { ValidarDocForm, DenunciaForm, FormSugestao } from '../../sections/home/HomeForm';
//
import Linksuteis from './Linksuteis';
import Notificacoes from './Notificacoes';
import ProcuraAvancada from './ProcuraAvancada';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse' && prop !== 'isOffset' && prop !== 'verticalLayout',
})(({ isCollapse, isOffset, verticalLayout, theme }) => ({
  ...cssStyles(theme).bgBlur(),
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
  boxShadow: theme.customShadows.z8,
  transition: theme.transitions.create(['width', 'height'], { duration: theme.transitions.duration.shorter }),
  [theme.breakpoints.up('lg')]: {
    height: HEADER.DASHBOARD_DESKTOP_HEIGHT,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH + 1}px)`,
    ...(isCollapse && { width: `calc(100% - ${NAVBAR.DASHBOARD_COLLAPSE_WIDTH}px)` }),
    ...(isOffset && { height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT }),
    ...(verticalLayout && {
      width: '100%',
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
      backgroundColor: theme.palette.background.default,
    }),
  },
  '&:before': {
    opacity: 1,
    width: '100%',
    content: "''",
    height: '100%',
    position: 'absolute',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: 'url(/assets/Shape.svg)',
  },
}));

// ----------------------------------------------------------------------

DashboardHeader.propTypes = {
  isCollapse: PropTypes.bool,
  onOpenSidebar: PropTypes.func,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const isDesktop = useResponsive('up', 'lg');
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const { myGroups } = useSelector((state) => state.intranet);
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT) && !verticalLayout;
  const acessoValidarDoc = validarAcesso('Admin', myGroups) || validarAcesso('pdex', myGroups);

  return (
    <>
      <RootStyle isCollapse={isCollapse} isOffset={isOffset} verticalLayout={verticalLayout}>
        {format(new Date(), 'MM') === '12' && (
          <Snowfall snowflakeCount={100} changeFrequency={10} radius={[0.5, 1.5]} />
        )}
        <Toolbar sx={{ minHeight: '100% !important', px: { lg: 3 } }}>
          {isDesktop && verticalLayout && <Logo sx={{ mr: 2.5 }} />}

          {!isDesktop && (
            <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
              <MenuIcon />
            </IconButtonAnimate>
          )}

          <ProcuraAvancada />
          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 1 }}>
            {acessoValidarDoc && (
              <>
                <IconButtonHead
                  open={open1}
                  onOpen={onOpen1}
                  title="Validação de documento"
                  icon={<BadgeOutlinedIcon sx={{ width: { xs: 20, sm: 26 }, height: { xs: 20, sm: 26 } }} />}
                />
                {open1 && <ValidarDocForm onCancel={onClose1} />}
              </>
            )}

            <Linksuteis />
            <Notificacoes />

            <IconButtonHead
              open={open2}
              onOpen={onOpen2}
              title="Denúncia"
              icon={<OutlinedFlagIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />}
            />
            {open2 && <DenunciaForm open onCancel={onClose2} />}

            <Ajuda />
            <Parabens />
          </Stack>
        </Toolbar>
      </RootStyle>

      <Box sx={{ top: 12, bottom: 12, right: 0, position: 'fixed', zIndex: 2001 }}>
        <Box
          sx={{
            p: 0.25,
            left: -70,
            bottom: 10,
            borderRadius: '50%',
            position: 'absolute',
            color: 'common.white',
            bgcolor: 'success.main',
            boxShadow: (theme) => theme.customShadows.z8,
          }}
        >
          <Tooltip arrow title="Sugestão">
            <Fab
              size="small"
              color="success"
              onClick={onOpen}
              sx={{ p: 0, width: 47, height: 47, color: 'common.white' }}
            >
              <SvgIconStyle src="/assets/icons/sugestao.svg" sx={{ width: 30, height: 30 }} />
            </Fab>
          </Tooltip>
        </Box>
      </Box>
      {open && <FormSugestao open onCancel={onClose} />}
    </>
  );
}

// ----------------------------------------------------------------------

function Parabens() {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc } = useSelector((state) => state.intranet);
  const aniversarianteHoje =
    cc?.data_cel_aniv && formatDate(cc?.data_cel_aniv, 'dd-MM') === formatDate(new Date(), 'dd-MM');
  const tempoServicoHoje =
    cc?.data_admissao && formatDate(cc?.data_admissao, 'dd-MM') === formatDate(new Date(), 'dd-MM');
  const anos = tempoServicoHoje ? formatDate(new Date(), 'yyyy') - formatDate(cc?.data_admissao, 'yyyy') : 0;

  return !!aniversarianteHoje || !!tempoServicoHoje ? (
    <>
      <Tooltip arrow title="Parabéns">
        <IconButtonAnimate size="small" onClick={onOpen}>
          <m.div animate={{ rotate: [0, -20, 0, 20, 0] }} transition={{ duration: 1, repeat: Infinity }}>
            <Image src="/assets/icons/gift.svg" sx={{ width: 36, height: 36 }} />
          </m.div>
        </IconButtonAnimate>
      </Tooltip>
      <Dialog
        fullWidth
        open={open}
        maxWidth="xs"
        scroll="paper"
        onClose={onClose}
        PaperProps={{ style: { overflow: 'hidden' } }}
      >
        <Logo
          sx={{
            opacity: 0.1,
            width: '155%',
            height: '155%',
            position: 'absolute',
            transform: 'rotate(37deg)',
            left: aniversarianteHoje && tempoServicoHoje ? '55%' : '60%',
            bottom: aniversarianteHoje && tempoServicoHoje ? '-80%' : '-70%',
          }}
        />
        <Box sx={{ p: { xs: 4, sm: 8 } }}>
          <Stack
            spacing={1}
            sx={{
              color: 'success.main',
              fontWeight: 'normal',
              pt: (aniversarianteHoje && tempoServicoHoje && 1) || (tempoServicoHoje && 3) || 5,
            }}
          >
            <Stack>
              <Typography variant="subtitle1">Parabéns:</Typography>
              <Typography variant="subtitle1">{cc?.perfil?.displayName}</Typography>
              {aniversarianteHoje ? (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Feliz Aniversário!
                </Typography>
              ) : (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  {anos} ano{anos > 1 ? 's' : ''} de serviço!
                </Typography>
              )}
            </Stack>
            {aniversarianteHoje ? (
              <>
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{
                    top: 33,
                    width: 25,
                    right: 65,
                    height: 25,
                    position: 'absolute',
                    color: 'success.main',
                    transform: 'rotate(-60deg)',
                  }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{ position: 'absolute', width: 37, height: 37, color: 'success.main', right: 30, top: 30 }}
                />
                <SvgIconStyle
                  src="/assets/icons/party.svg"
                  sx={{
                    top: 65,
                    width: 25,
                    right: 35,
                    height: 25,
                    position: 'absolute',
                    color: 'success.main',
                    transform: 'rotate(60deg)',
                  }}
                />
                <SvgIconStyle
                  src="/assets/icons/calendarcake.svg"
                  sx={{ position: 'absolute', width: 100, height: 100, color: 'success.main', right: 50, top: 60 }}
                />
                <Stack>
                  <Typography>É com muita alegria que a</Typography>
                  <Typography>Caixa celebra contigo este</Typography>
                  <Typography>dia especial.</Typography>
                </Stack>
              </>
            ) : (
              ''
            )}
            {tempoServicoHoje ? (
              <>
                <SvgIconStyle
                  src="/assets/icons/medal.svg"
                  sx={{
                    right: 30,
                    width: 100,
                    height: 100,
                    position: 'absolute',
                    color: 'success.main',
                    top: aniversarianteHoje ? 230 : 30,
                  }}
                />
                {aniversarianteHoje && (
                  <Typography variant="subtitle1" sx={{ pt: 3 }}>
                    {anos} ano{anos > 1 ? 's' : ''} de serviço!
                  </Typography>
                )}
                <Stack>
                  <Typography>É com grande prazer e estima</Typography>
                  <Typography>que a Caixa comemora contigo {anos > 1 ? 'mais' : ''}</Typography>
                  <Typography>um ano de parceria, aprendizado,</Typography>
                  <Typography>empenho e dedicação.</Typography>
                </Stack>
                <Stack>
                  <Typography>Agradecemos por todo</Typography>
                  <Typography>o teu esforço e companheirismo</Typography>
                  <Typography>
                    ao longo deste{anos > 1 ? 's' : ''} ano{anos > 1 ? 's' : ''}.
                  </Typography>
                </Stack>
              </>
            ) : (
              ''
            )}
            <Stack>
              <Typography>Obrigado por fazeres parte</Typography>
              <Typography>desta Família.</Typography>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

IconButtonHead.propTypes = {
  open: PropTypes.bool,
  icon: PropTypes.node,
  onOpen: PropTypes.func,
  title: PropTypes.string,
};

export function IconButtonHead({ open, title, icon, onOpen, ...sx }) {
  return (
    <Tooltip arrow title={title}>
      <IconButtonAnimate
        color={open ? 'primary' : 'default'}
        onClick={onOpen}
        sx={{
          p: 0,
          color: '#fff',
          width: { xs: 28, sm: 40 },
          height: { xs: 28, sm: 40 },
          ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
        }}
        {...sx}
      >
        {icon}
      </IconButtonAnimate>
    </Tooltip>
  );
}
