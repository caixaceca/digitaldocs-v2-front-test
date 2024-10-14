import { memo } from 'react';
// @mui
import AppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
// redux
import { useSelector } from '../../redux/store';
// config
import { HEADER } from '../../config';
// components
import { NavSectionHorizontal } from '../../components/nav-section';
//
import Aplicacoes from './Aplicacoes';
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

// ----------------------------------------------------------------------

function NavbarHorizontal() {
  const { minhasAplicacoes } = useSelector((state) => state.intranet);

  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal
          navConfig={[
            ...navConfigDigitalDocs,
            ...(minhasAplicacoes?.length === 0
              ? []
              : [
                  {
                    items: [
                      {
                        path: '#',
                        title: 'Aplicações',
                        children: Aplicacoes({ minhasAplicacoes }),
                        icon: <GridViewOutlinedIcon sx={{ width: 1, height: 1 }} />,
                      },
                    ],
                  },
                ]),
          ]}
        />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
