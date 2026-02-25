import { useState } from 'react';
import { format } from 'date-fns';
import { m } from 'framer-motion';
import Snowfall from 'react-snowfall';
// @mui
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, alpha } from '@mui/material/styles';
// utils
import cssStyles from '@/utils/cssStyles';
import { formatDate } from '@/utils/formatTime';
// redux
import { useSelector } from '@/redux/store';
// hooks
import useToggle from '@/hooks/useToggle';
import useOffSetTop from '@/hooks/useOffSetTop';
import useResponsive from '@/hooks/useResponsive';
// config
import { HEADER, NAVBAR } from '@/config';
// components
import Logo from '@/components/Logo';
import Image from '@/components/Image';
import SvgIconStyle from '@/components/SvgIconStyle';
import { IconButtonAnimate } from '@/components/animate';
import { Id, AjudaIcon, DenunciaIcon, LinksIcon, DefinicoesIcon, NotificacoesIcon } from '@/assets';
//
import Definicoes from './Definicoes';
import LinksUteis from './LinksUteis';
import Notificacoes from './Notificacoes';
import ProcuraAvancada from './ProcuraAvancada';
import AjudaDialog from '@/sections/home/Ajuda';
import ConsultarDocumento from './ConsultarDocumento';
import Felicitacoes from '@/sections/home/Felicitacoes';
import { FormSugestao, DenunciaForm } from '@/sections/home/HomeForm';
// guards
import RoleBasedGuard from '@/guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const [modal, setModal] = useState('');
  const isDesktop = useResponsive('up', 'lg');
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
            <RoleBasedGuard roles={['Admin', 'pdex']}>
              <IconButtonHeader
                title="Consultar documento"
                open={modal === 'documento'}
                setOpen={() => setModal('documento')}
              />
            </RoleBasedGuard>
            <LinksUteis />
            <Notificacoes />
            <IconButtonHeader title="Denúncia" open={modal === 'denuncia'} setOpen={() => setModal('denuncia')} />
            <Definicoes />
            <IconButtonHeader title="Ajuda" open={modal === 'ajuda'} setOpen={() => setModal('ajuda')} />
            <Parabens />
          </Stack>
        </Toolbar>
      </RootStyle>

      <Box sx={{ top: 12, bottom: 12, right: 0, position: 'fixed', zIndex: 2001 }}>
        <HelpButton title="Sugestão" action={() => setModal('sugestao')} />
      </Box>

      {modal === 'ajuda' && <AjudaDialog onClose={() => setModal('')} />}
      {modal === 'sugestao' && <FormSugestao onClose={() => setModal('')} />}
      {modal === 'denuncia' && <DenunciaForm onClose={() => setModal('')} />}
      {modal === 'documento' && <ConsultarDocumento onClose={() => setModal('')} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

function Parabens() {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc } = useSelector((state) => state.intranet);
  const aniversarianteHoje =
    cc?.data_aniversario && formatDate(cc?.data_aniversario, 'dd-MM') === formatDate(new Date(), 'dd-MM');
  const tempoServicoHoje =
    cc?.data_admissao &&
    formatDate(cc?.data_admissao, 'yyyy') !== formatDate(new Date(), 'yyyy') &&
    formatDate(cc?.data_admissao, 'dd-MM') === formatDate(new Date(), 'dd-MM');

  return aniversarianteHoje || tempoServicoHoje ? (
    <>
      <Tooltip arrow title="Parabéns">
        <IconButtonAnimate size="small" onClick={onOpen}>
          <m.div animate={{ rotate: [0, -20, 0, 20, 0] }} transition={{ duration: 1, repeat: Infinity }}>
            <Image src="/assets/icons/gift.svg" sx={{ width: 36, height: 36 }} />
          </m.div>
        </IconButtonAnimate>
      </Tooltip>
      {open && (
        <Felicitacoes onClose={() => onClose()} colaborador={cc} niver={aniversarianteHoje} tempo={tempoServicoHoje} />
      )}
    </>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function IconButtonHeader({ title, open, setOpen, total }) {
  return (
    <Tooltip arrow title={title}>
      <IconButtonAnimate
        color={open ? 'primary' : 'default'}
        onClick={(event) => setOpen(event.currentTarget)}
        sx={{
          padding: 0,
          color: '#fff',
          width: { xs: 28, sm: 40 },
          height: { xs: 28, sm: 40 },
          ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
        }}
      >
        {title === 'Notificações' ? (
          <Badge badgeContent={total} color="error">
            <NotificacoesIcon sx={{ width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } }} />
          </Badge>
        ) : (
          <Box sx={{ width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } }}>
            {title === 'Ajuda' && <AjudaIcon />}
            {title === 'Links úteis' && <LinksIcon />}
            {title === 'Denúncia' && <DenunciaIcon />}
            {title === 'Consultar documento' && <Id />}
            {title === 'Definições' && <DefinicoesIcon />}
          </Box>
        )}
      </IconButtonAnimate>
    </Tooltip>
  );
}
