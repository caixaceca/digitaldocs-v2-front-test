import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
// hooks
import useSettings from '../hooks/useSettings';
import useResponsive from '../hooks/useResponsive';
import { useNotificacao } from '../hooks/useNotificacao';
import useCollapseDrawer from '../hooks/useCollapseDrawer';
// redux
import { useSelector } from '../redux/store';
// config
import { HEADER, NAVBAR } from '../config';
// components
import Disposicao from './Disposicao';
//
import DashboardHeader from './header';
import NavbarVertical from './navbar/NavbarVertical';
import NavbarHorizontal from './navbar/NavbarHorizontal';

// ---------------------------------------------------------------------------------------------------------------------

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})(({ collapseClick, theme }) => ({
  flexGrow: 1,
  paddingTop: HEADER.MOBILE_HEIGHT + 24,
  paddingBottom: HEADER.MOBILE_HEIGHT + 24,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
    transition: theme.transitions.create('margin-left', { duration: theme.transitions.duration.shorter }),
    ...(collapseClick && { marginLeft: NAVBAR.DASHBOARD_COLLAPSE_WIDTH }),
  },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function IntranetLayout() {
  const { themeLayout } = useSettings();
  const [open, setOpen] = useState(false);
  const isDesktop = useResponsive('up', 'lg');
  const verticalLayout = themeLayout === 'vertical';
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const { error } = useSelector((state) => state.digitaldocs);
  const { error: erroGaji9 } = useSelector((state) => state.gaji9);
  const { error: erroIndic } = useSelector((state) => state.indicadores);
  const { error: erroParam } = useSelector((state) => state.parametrizacao);
  const { disposicao, error: erroIntranet, done } = useSelector((state) => state.intranet);

  useNotificacao({ done, error: error || erroIntranet || erroGaji9 || erroParam || erroIndic });

  if (verticalLayout) {
    return (
      <>
        <DashboardHeader onOpenSidebar={() => setOpen(true)} verticalLayout={verticalLayout} />

        {isDesktop ? (
          <NavbarHorizontal />
        ) : (
          <NavbarVertical isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
        )}

        <Box
          component="main"
          sx={{
            px: { lg: 2 },
            pt: { xs: `${HEADER.MOBILE_HEIGHT + 24}px`, lg: `${HEADER.DASHBOARD_DESKTOP_HEIGHT + 70}px` },
            pb: { xs: `${HEADER.MOBILE_HEIGHT + 24}px`, lg: `${HEADER.DASHBOARD_DESKTOP_HEIGHT + 24}px` },
          }}
        >
          {!disposicao && <Disposicao />}
          <Outlet />
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ display: { lg: 'flex' }, minHeight: { lg: 1 } }}>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpen(true)} />
      <NavbarVertical isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle collapseClick={collapseClick}>
        {!disposicao && <Disposicao />}
        <Outlet />
      </MainStyle>
    </Box>
  );
}
