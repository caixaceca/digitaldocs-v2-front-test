import PropTypes from 'prop-types';
import Snowfall from 'react-snowfall';
// @mui
import {
  Box,
  Fab,
  Stack,
  AppBar,
  Dialog,
  Toolbar,
  Tooltip,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { alpha, styled } from '@mui/material/styles';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// utils
import { format } from 'date-fns';
import cssStyles from '../../utils/cssStyles';
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
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';
// sections
import Ajuda from '../../sections/home/Ajuda';
import { FormSugestao } from '../../sections/sobre/FormSugestao';
import { ValidarDocForm, DenunciaForm } from '../../sections/home/HomeForm';
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
        {format(new Date(), 'MM') > '11' && <Snowfall snowflakeCount={100} changeFrequency={10} radius={[0.5, 1.5]} />}
        <Toolbar sx={{ minHeight: '100% !important', px: { lg: 5 } }}>
          {isDesktop && verticalLayout && <Logo sx={{ mr: 2.5 }} />}

          {!isDesktop && (
            <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
              <MenuIcon />
            </IconButtonAnimate>
          )}

          <ProcuraAvancada />
          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
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

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <FormSugestao open={open} onCancel={onClose} />
      </Dialog>
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
