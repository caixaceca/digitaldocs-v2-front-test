import PropTypes from 'prop-types';
import Snowfall from 'react-snowfall';
// @mui
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Fab, Stack, AppBar, Dialog, Toolbar, Tooltip } from '@mui/material';
// utils
import { format } from 'date-fns';
import cssStyles from '../../utils/cssStyles';
// hooks
import useToggle from '../../hooks/useToggle';
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAVBAR } from '../../config';
// components
import Ajuda from './Ajuda';
import Denuncia from './Denuncia';
import Linksuteis from './Linksuteis';
import Logo from '../../components/Logo';
import Notificacoes from './Notificacoes';
import AccountPopover from './AccountPopover';
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';
import { FormSugestao } from '../../sections/sobre/FormSugestao';
//
import Procurar from './Procurar';

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
  onOpenSidebar: PropTypes.func,
  isCollapse: PropTypes.bool,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const isDesktop = useResponsive('up', 'lg');
  const { toggle: open, onOpen, onClose } = useToggle();
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT) && !verticalLayout;

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

          <Procurar />
          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
            <Linksuteis />
            <Notificacoes />
            <Denuncia />
            <Ajuda />
            <AccountPopover />
          </Stack>
        </Toolbar>
      </RootStyle>

      <Box sx={{ top: 12, bottom: 12, right: 0, position: 'fixed', zIndex: 2001 }}>
        <Box
          sx={{
            p: 0.25,
            left: -70,
            bottom: 10,
            position: 'absolute',
            color: 'common.white',
            bgcolor: 'success.main',
            borderRadius: '50%',
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
