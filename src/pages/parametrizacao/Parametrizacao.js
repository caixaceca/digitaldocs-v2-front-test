import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatText';
// routes
import useSettings from '../../hooks/useSettings';
// hooks
import useModal from '../../hooks/useModal';
// redux
import { useSelector } from '../../redux/store';
import { closeModal } from '../../redux/slices/parametrizacao';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { Notificacao } from '../../components/NotistackProvider';
// sections
import Acessos from '../../sections/parametrizacao/Acessos';
import ParametrizacaoItem from '../../sections/parametrizacao/ParametrizacaoItem';
import ParametrizacaoTabs from '../../sections/parametrizacao/ParametrizacaoTabs';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Parametrizacao() {
  const { themeStretch } = useSettings();
  const { handleCloseModal } = useModal(closeModal());
  const { done, error, isAdmin } = useSelector((state) => state.parametrizacao);

  const tabsList = useMemo(
    () =>
      [
        ...(isAdmin
          ? [
              { value: 'Acessos', component: <Acessos /> },
              { value: 'Fluxos', component: <ParametrizacaoItem item="fluxos" /> },
              { value: 'Estados', component: <ParametrizacaoItem item="estados" /> },
              { value: 'Origens', component: <ParametrizacaoItem item="origens" /> },
              { value: 'Anexos', component: <ParametrizacaoTabs item="anexos" /> },
              { value: 'Crédito', component: <ParametrizacaoTabs item="crédito" /> },
              { value: 'Motivos', component: <ParametrizacaoTabs item="motivos" /> },
            ]
          : []),
      ] || [],
    [isAdmin]
  );

  const [currentTab, setCurrentTab] = useState(
    tabsList?.map((row) => row?.value)?.find((item) => item === localStorage.getItem('tabParams')) || 'Acessos'
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map((row) => row?.value)?.includes(currentTab)) {
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabParams');
    }
  }, [tabsList, currentTab]);

  return (
    <Page title="Parametrização | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={handleCloseModal} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          tab="tabParams"
          tabsList={tabsList}
          title="Parametrização"
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        {tabsList?.map((tab) => {
          const isMatched = tab?.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
        {tabsList?.length === 0 && <RoleBasedGuard hasContent roles={['XXXXXX']} />}
      </Container>
    </Page>
  );
}
