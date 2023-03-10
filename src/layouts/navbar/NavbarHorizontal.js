import { memo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Avatar, AppBar } from '@mui/material';
// utils
import { BASEURL } from '../../utils/axios';
// redux
import { useSelector } from '../../redux/store';
// config
import { HEADER } from '../../config';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import { NavSectionHorizontal } from '../../components/nav-section';
//
import navConfigDigitalDocs from './NavConfigDigitalDocs';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  boxShadow: theme.customShadows.z8,
  top: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
  backgroundColor: theme.palette.background.default,
}));

const LogoApp = styled(Avatar)(() => ({
  p: 0.25,
  width: '22px',
  height: '22px',
}));

// ----------------------------------------------------------------------

function NavbarHorizontal() {
  const { myAplicacoes } = useSelector((state) => state.aplicacao);
  const appsOrder = applySort(myAplicacoes, getComparator('asc', 'nome'));
  const noApp = appsOrder.length === 0;
  const aplicacoes = [];
  appsOrder.map((app) =>
    aplicacoes.push({
      title: app.nome,
      path: app.link,
      icon: <LogoApp variant="rounded" alt={app.nome} src={`${BASEURL}/aplicacao/logo/${app.logo_disco}`} />,
    })
  );

  const Apps = [
    {
      items: [
        {
          title: 'Aplicações',
          path: '#',
          icon: <SvgIconStyle src={`/assets/icons/app.svg`} sx={{ width: 1, height: 1 }} />,
          children: aplicacoes,
        },
      ],
    },
  ];
  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal navConfig={(noApp && navConfigDigitalDocs) || [...navConfigDigitalDocs, ...Apps]} />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
