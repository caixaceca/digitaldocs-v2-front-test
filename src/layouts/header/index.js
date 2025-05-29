import { useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Snowfall from 'react-snowfall';
// @mui
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
// utils
import cssStyles from '../../utils/cssStyles';
// hooks
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAVBAR } from '../../config';
// components
import Logo from '../../components/Logo';
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';
// sections
import { FormSugestao } from '../../sections/home/HomeForm';
//
import Parabens from './Parabens';
import Definicoes from './Definicoes';
import Notificacoes from './Notificacoes';
import ProcuraAvancada from './ProcuraAvancada';
import { ValidarDocumento, Ajuda, Denuncia, LinksUteis } from './Items';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

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
  const [openModal, setOpenModal] = useState('');
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT) && !verticalLayout;

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

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 0.75 }}>
            <RoleBasedGuard roles={['Todo-111', 'Admin', 'pdex']}>
              <ValidarDocumento />
            </RoleBasedGuard>
            <LinksUteis />
            <Notificacoes />
            <Denuncia />
            <Definicoes />
            <Ajuda />
            <Parabens />
          </Stack>
        </Toolbar>
      </RootStyle>

      <Box sx={{ top: 12, bottom: 12, right: 0, position: 'fixed', zIndex: 2001 }}>
        <HelpButton title="Sugestão" action={() => setOpenModal('sugestao')} />
      </Box>

      {openModal === 'sugestao' && <FormSugestao onClose={() => setOpenModal('')} />}
    </>
  );
}

// ----------------------------------------------------------------------

HelpButton.propTypes = { title: PropTypes.string, action: PropTypes.func };

function HelpButton({ title, action }) {
  return (
    <Box
      sx={{
        p: 0.25,
        bottom: 10,
        borderRadius: '50%',
        position: 'absolute',
        color: 'common.white',
        bgcolor: 'success.main',
        left: title === 'Sugestão' ? -70 : -125,
        boxShadow: (theme) => theme.customShadows.z8,
      }}
    >
      <Tooltip arrow title={title}>
        <Fab size="small" onClick={action} color="success" sx={{ p: 0, width: 47, height: 47, color: 'common.white' }}>
          {title === 'Sugestão' && <SvgIconStyle src="/assets/icons/sugestao.svg" sx={{ width: 30, height: 30 }} />}
        </Fab>
      </Tooltip>
    </Box>
  );
}
