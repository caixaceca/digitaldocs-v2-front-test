import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, getAll, resetItem } from '../redux/slices/digitaldocs';
// routes
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
import SvgIconStyle from '../components/SvgIconStyle';
import { SearchNotFound404 } from '../components/table';
// sections
import TableEstado from '../sections/parametrizacao/TableEstado';

// ----------------------------------------------------------------------

export default function Fluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fluxo, estados } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEstado') || 'Transições');

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getItem('fluxo', { id, mail, perfilId: cc?.perfil_id }));
    }
    return () => dispatch(resetItem('fluxo'));
  }, [dispatch, cc?.perfil_id, mail, id]);

  useEffect(() => {
    if (mail && cc?.perfil_id && estados?.length === 0) {
      dispatch(getAll('estados', { mail, perfilId: cc?.perfil_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cc?.perfil_id, mail]);

  const tabsList = [
    {
      value: 'Transições',
      component: <TableEstado tab="transicoes" />,
      icon: <SvgIconStyle src="/assets/icons/navbar/transition.svg" sx={{ width: 17 }} />,
    },
    {
      value: 'Estados',
      component: <TableEstado tab="estados" />,
      icon: <SvgIconStyle src="/assets/icons/navbar/state.svg" sx={{ width: 18 }} />,
    },
  ];

  return (
    <Page title="Fluxo | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabEstado"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
          title={fluxo?.assunto || 'Detalhes do fluxo'}
        />
        {!fluxo ? (
          <Grid item xs={12}>
            <SearchNotFound404 message="Fluxo não encontrado..." />
          </Grid>
        ) : (
          tabsList.map((tab) => {
            const isMatched = tab.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })
        )}
      </Container>
    </Page>
  );
}
