import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao, resetItem } from '../redux/slices/parametrizacao';
// routes
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
import { SearchNotFound404 } from '../components/table';
// sections
import TableEstado from '../sections/parametrizacao/TableEstado';

// ----------------------------------------------------------------------

export default function Fluxo() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { fluxo, estados } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEstado') || 'Transições');

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getFromParametrizacao('fluxo', { id, mail, perfilId }));
    }
    return () => dispatch(resetItem('fluxo'));
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (mail && perfilId && estados?.length === 0) {
      dispatch(getFromParametrizacao('estados', { mail, perfilId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, perfilId, mail]);

  const tabsList = [
    { value: 'Transições', component: <TableEstado tab="transicoes" /> },
    { value: 'Estados', component: <TableEstado tab="estados" /> },
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
