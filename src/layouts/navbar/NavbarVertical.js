import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, NavLink as RouterLink } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Stack, Avatar, Drawer, Typography } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// utils
import { BASEURL } from '../../utils/axios';
import cssStyles from '../../utils/cssStyles';
// config
import { NAVBAR } from '../../config';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import { NavSectionVertical } from '../../components/nav-section';
//
import NavbarAcount from './NavbarAcount';
import Certificados from '../Certificados';
import CollapseButton from './CollapseButton';
import navConfigDigitalDocs from './NavConfigDigitalDocs';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
  },
}));

const LogoApp = styled(Avatar)(() => ({ p: 0.25, width: '25px', height: '25px' }));

// ----------------------------------------------------------------------

NavbarVertical.propTypes = { isOpenSidebar: PropTypes.bool, onCloseSidebar: PropTypes.func };

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isDesktop = useResponsive('up', 'lg');
  const { myAplicacoes } = useSelector((state) => state.intranet);
  const appsOrder = applySort(myAplicacoes, getComparator('asc', 'nome'));
  const noApp = appsOrder.length === 0;

  const Apps = [
    {
      subheader: 'aplicações',
      items: appsOrder.map((app) => ({
        title: app.nome,
        path: app.link,
        icon: <LogoApp variant="rounded" alt={app.nome} src={`${BASEURL}/aplicacao/logo/${app.logo_disco}`} />,
      })),
    },
  ];

  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
    useCollapseDrawer();

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Stack spacing={3} sx={{ p: 2.5, flexShrink: 0, ...(isCollapse && { alignItems: 'center' }) }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 55 }}>
          <Logo />

          {isDesktop && !isCollapse && (
            <>
              <Typography
                to="/"
                variant="h4"
                component={RouterLink}
                sx={{ color: (theme) => theme.palette.success.main, textDecoration: 'none', textAlign: 'center' }}
              >
                <Typography variant='h5'>IntraNet - Teste</Typography>
                <Typography variant="subtitle2" sx={{ mt: -0.5 }}>
                  DIGITALDOCS
                </Typography>
              </Typography>
              <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
            </>
          )}
        </Stack>

        <NavbarAcount isCollapse={isCollapse} />
      </Stack>

      <NavSectionVertical navConfig={navConfigDigitalDocs} isCollapse={isCollapse} />

      {!noApp && <NavSectionVertical navConfig={Apps} isCollapse={isCollapse} />}

      <Box sx={{ flexGrow: 1 }} />

      {!isCollapse && <Certificados />}
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: { lg: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH },
        ...(collapseClick && { position: 'absolute' }),
      }}
    >
      {!isDesktop && (
        <Drawer open={isOpenSidebar} onClose={onCloseSidebar} PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH } }}>
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: NAVBAR.DASHBOARD_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: 'background.default',
              transition: (theme) =>
                theme.transitions.create('width', { duration: theme.transitions.duration.standard }),
              ...(isCollapse && { width: NAVBAR.DASHBOARD_COLLAPSE_WIDTH }),
              ...(collapseHover && { ...cssStyles(theme).bgBlur(), boxShadow: (theme) => theme.customShadows.z24 }),
              '&:before': {
                width: '100%',
                content: "''",
                height: '100%',
                position: 'absolute',
                backgroundImage: 'url(/assets/Shape.svg)',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                opacity: 0.1,
              },
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
