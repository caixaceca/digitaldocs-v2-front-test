import { m } from 'framer-motion';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Snowfall from 'react-snowfall';
// @mui
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, styled } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// utils
import cssStyles from '../../utils/cssStyles';
import { formatDate } from '../../utils/formatTime';
import { validarAcesso } from '../../utils/validarAcesso';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
import useToggle, { useToggle1, useToggle2, useToggle3 } from '../../hooks/useToggle';
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
  // boxShadow: 'none',
  boxShadow: theme.customShadows.z8,
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
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
    width: '100%',
    content: "''",
    height: '100%',
    position: 'absolute',
    backgroundImage: 'url(/assets/Shape.svg)',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    opacity: 1,
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
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
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
                <ValidarDocForm open={open1} onCancel={onClose1} />
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
            <DenunciaForm open={open2} onCancel={onClose2} />

            <IconButtonHead
              open={open3}
              title="Ajuda"
              onOpen={onOpen3}
              icon={<HelpOutlineOutlinedIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />}
            />
            <Dialog open={open3} onClose={onClose3} fullWidth maxWidth="lg">
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>Ajuda</Box>
                  <Box>
                    <IconButton onClick={onClose3}>
                      <CloseOutlinedIcon sx={{ width: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Ajuda />
              </DialogContent>
            </Dialog>
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
      <FormSugestao open={open} onCancel={onClose} />
    </>
  );
}

// ----------------------------------------------------------------------

IconButtonHead.propTypes = {
  open: PropTypes.bool,
  icon: PropTypes.node,
  onOpen: PropTypes.func,
  title: PropTypes.string,
};

function IconButtonHead({ open, title, icon, onOpen, ...sx }) {
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
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity),
          }),
        }}
        {...sx}
      >
        {icon}
      </IconButtonAnimate>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

function Parabens() {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc, aniversariantes, tempoServico } = useSelector((state) => state.intranet);
  const aniversarianteHoje = aniversariantes
    ?.filter((row) => formatDate(row.data_cel_aniv, 'dd') === formatDate(new Date(), 'dd'))
    ?.find((item) => item?.id === cc.id);
  const tempoServicoHoje = tempoServico
    ?.filter((row) => formatDate(row.data_admissao, 'dd') === formatDate(new Date(), 'dd'))
    ?.find((item) => item?.id === cc.id);

  return (
    <>
      {!!aniversarianteHoje || !!tempoServicoHoje ? (
        <>
          <Tooltip arrow title="Parabéns">
            <IconButtonAnimate size="small" onClick={onOpen}>
              <m.div animate={{ rotate: [0, -20, 0, 20, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <Image src="/assets/icons/gift.svg" sx={{ width: 36, height: 36 }} />
              </m.div>
            </IconButtonAnimate>
          </Tooltip>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <Image
              src="/assets/icons/gift.svg"
              sx={{ opacity: 0.15, height: 1, width: 1, objectFit: 'cover', position: 'absolute' }}
            />
            <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', backgroundColor: 'success.main' }}>
              <Stack direction="row" justifyContent="center" alignItems="center" sx={{ pb: { xs: 3, sm: 4 } }}>
                <Image src="/assets/icons/party.svg" sx={{ width: 40, height: 40, color: '#fff' }} />
                <Typography variant="h4" sx={{ color: 'common.white', px: 2, zIndex: 2 }}>
                  Parabéns: {cc?.perfil?.displayName}
                </Typography>
                <Image src="/assets/icons/party.svg" sx={{ width: 40, height: 40, color: '#fff' }} />
              </Stack>
              <Card sx={{ p: { xs: 3, sm: 5 } }}>
                <Typography variant="h6" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {aniversarianteHoje ? (
                    <>
                      Trouxemos este bolo para comemorar o seu aniversário.
                      <br />
                      <br />
                      <Stack direction="row" justifyContent="center">
                        <Image src="/assets/icons/cake.svg" sx={{ width: 150, height: 150 }} />
                      </Stack>
                      <br />
                      A CAIXA deseja-lhe um dia cheio de abraços, afetos e principalmente muita saúde.
                      <br />
                    </>
                  ) : (
                    ''
                  )}
                  {tempoServicoHoje ? (
                    <>
                      {aniversarianteHoje ? <br /> : ''}
                      <Typography variant="h5" sx={{ color: 'success.main' }}>
                        {formatDate(new Date(), 'yyyy') - formatDate(tempoServicoHoje?.data_admissao, 'yyyy')}
                        &nbsp;anos de serviço
                      </Typography>
                      <br />
                      É com enorme prazer e estima que a CAIXA comemora consigo, mais um ano de parceria, aprendizado,
                      empenho e dedicação.
                      <br />
                      <br />
                      Obrigado por fazer parte desta Família.
                      <br />
                    </>
                  ) : (
                    ''
                  )}
                </Typography>
              </Card>
              <Stack direction="row" justifyContent="center" sx={{ mt: { xs: 3, sm: 4 } }}>
                <Image src="/assets/Caixa_Logo_Branco_sem_fundo.png" sx={{ width: 130 }} />
              </Stack>
            </Box>
          </Dialog>
        </>
      ) : (
        ''
      )}
    </>
  );
}
