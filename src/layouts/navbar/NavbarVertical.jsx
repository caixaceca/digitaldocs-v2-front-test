import { format } from 'date-fns';
import Snowfall from 'react-snowfall';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
// utils
import { BASEURL } from '../../utils/apisUrl';
import cssStyles from '../../utils/cssStyles';
// config
import { NAVBAR, ambiente } from '../../config';
// hooks
import useResponsive from '../../hooks/useResponsive';
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
// redux
import { useSelector } from '../../redux/store';
// components
import Logo from '../../components/Logo';
import Image from '../../components/Image';
import Scrollbar from '../../components/Scrollbar';
import { NavSectionVertical } from '../../components/nav-section';
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
  const { minhasAplicacoes, certificacoes } = useSelector((state) => state.intranet);

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

          {isDesktop && !isCollapse && (
            <>
              <Typography
                to="/"
                component={RouterLink}
                sx={{ textAlign: 'center', textDecoration: 'none', color: theme.palette.success.main }}
              >
                {(ambiente === 'local' && <Typography variant="h6">IntraNet - Local</Typography>) ||
                  (ambiente === 'teste' && <Typography variant="h6">IntraNet - Teste</Typography>) || (
                    <Typography variant="h3">IntraNet</Typography>
                  )}
                <Typography variant="subtitle2" sx={{ mt: ambiente === 'teste' || ambiente === 'local' ? 0 : -1 }}>
                  DIGITALDOCS
                </Typography>
              </Typography>
              <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
            </>
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
        <Stack spacing={3} alignItems="center" sx={{ p: 5, width: 1, textAlign: 'center' }}>
          {certificacoes.map(({ designacao, imagem_disco: imagem }, index) => (
            <Box key={designacao || `cert_${index}`} sx={{ px: 3 }}>
              <Image alt={designacao} src={`${BASEURL}/certificacao/file/certificacao/${imagem}`} />
            </Box>
          ))}
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
