import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatObject';
// routes
import useSettings from '../../hooks/useSettings';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { closeModal } from '../../redux/slices/parametrizacao';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import Acessos from '../../sections/parametrizacao/Acessos';
import TabParametrizacao from '../../sections/parametrizacao/TabParametrizacao';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageParametrizacao() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { done, isAdmin } = useSelector((state) => state.parametrizacao);

  const tabsList = useMemo(
    () =>
      [
        ...(isAdmin
          ? [
              { value: 'Acessos', component: <Acessos /> },
              { value: 'Fluxos', component: <TabParametrizacao item="fluxos" label="Fluxos" /> },
              { value: 'Estados', component: <TabParametrizacao item="estados" label="Estados" /> },
              { value: 'Origens', component: <TabParametrizacao item="origens" label="Origens" /> },
              { value: 'Crédito', component: <TabParametrizacao item="credito" label="Crédito" subTabs /> },
              { value: 'Motivos', component: <TabParametrizacao item="motivos" label="Motivos" subTabs /> },
              { value: 'Documentos', component: <TabParametrizacao item="documentos" label="Documentos" /> },
            ]
          : []),
      ] || [],
    [isAdmin]
  );

  const [currentTab, setCurrentTab] = useState(
    tabsList?.map(({ value }) => value)?.find((item) => item === localStorage.getItem('tabParams')) || 'Acessos'
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabParams');
  }, [tabsList, currentTab]);

  useNotificacao({ done, onClose: () => dispatch(closeModal()) });

  return (
    <Page title="Parametrização | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabParams"
          tabsList={tabsList}
          title="Parametrização"
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
        {tabsList?.length === 0 && <RoleBasedGuard hasContent roles={['XXXXXX']} />}
      </Container>
    </Page>
  );
}
