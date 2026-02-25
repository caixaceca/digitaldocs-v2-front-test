import { format } from 'date-fns';
import Snowfall from 'react-snowfall';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
// utils
import cssStyles from '@/utils/cssStyles';
import { NAVBAR, ambiente } from '@/config';
import { useSelector } from '@/redux/store';
// hooks
import useResponsive from '@/hooks/useResponsive';
import useCollapseDrawer from '@/hooks/useCollapseDrawer';
// components
import Logo from '@/components/Logo';
import Scrollbar from '@/components/Scrollbar';
import { NavSectionVertical } from '@/components/nav-section';
import { Iso9001Icon, Iso27001Icon } from '@/theme/overrides/CustomIcons';
//
import NavConfig from './NavConfig';
import Aplicacoes from './Aplicacoes';
import NavbarAcount from './NavbarAcount';
import CollapseButton from './CollapseButton';

// ---------------------------------------------------------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
  },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }) {
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');
  const { minhasAplicacoes } = useSelector((state) => state.intranet);

  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
    useCollapseDrawer();

  const renderContent = (
    <Scrollbar sx={{ height: 1, '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' } }}>
      <Stack spacing={3} sx={{ p: 2.5, flexShrink: 0, ...(isCollapse && { alignItems: 'center' }) }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 50 }}>
          {format(new Date(), 'MM') === '12' && (
            <Snowfall style={{ height: 90 }} snowflakeCount={30} changeFrequency={10} radius={[0.5, 1.5]} />
          )}
          <Logo />

          {!isCollapse && (
            <Typography
              to="/"
              component={RouterLink}
              sx={{ textAlign: 'center', textDecoration: 'none', width: 1, color: theme.palette.success.main }}
            >
              {(ambiente === 'local' && <Typography variant="h6">IntraNet - Dev</Typography>) ||
                (ambiente === 'teste' && <Typography variant="h6">IntraNet - Teste</Typography>) || (
                  <Typography variant="h3">IntraNet</Typography>
                )}
              <Typography variant="subtitle2" sx={{ mt: ambiente === 'teste' || ambiente === 'local' ? 0 : -1 }}>
                DIGITALDOCS
              </Typography>
            </Typography>
          )}
          {isDesktop && !isCollapse && (
            <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
          )}
        </Stack>
        <NavbarAcount isCollapse={isCollapse} />
      </Stack>

      <NavSectionVertical
        isCollapse={isCollapse}
        navConfig={[
          ...NavConfig,
          ...(minhasAplicacoes?.length === 0
            ? []
            : [{ subheader: 'Aplicações', items: Aplicacoes({ minhasAplicacoes }) }]),
        ]}
      />

      {!isCollapse && (
        <Stack spacing={3} alignItems="center" sx={{ mt: 'auto', px: 3, py: 6, width: 1, textAlign: 'center' }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Iso27001Icon sx={{ color: 'text.primary', height: { xs: 33, sm: 40 }, width: { xs: 90, sm: 110 } }} />
            <Iso9001Icon sx={{ color: 'text.primary', height: { xs: 33, sm: 40 }, width: { xs: 90, sm: 110 } }} />
          </Stack>
        </Stack>
      )}
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
                opacity: 0.1,
                width: '100%',
                content: "''",
                height: '100%',
                position: 'absolute',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: 'url(/assets/Shape.svg)',
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
