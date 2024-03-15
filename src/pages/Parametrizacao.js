import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import selectTab from '../utils/selectTab';
import { temAcesso } from '../utils/validarAcesso';
import { setItemValue } from '../utils/normalizeText';
// routes
import useSettings from '../hooks/useSettings';
// hooks
import useModal from '../hooks/useModal';
// redux
import { useSelector } from '../redux/store';
import { closeModal } from '../redux/slices/parametrizacao';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
import { Notificacao } from '../components/NotistackProvider';
// sections
import Acessos from '../sections/parametrizacao/Acessos';
import ParametrizacaoItem from '../sections/parametrizacao/ParametrizacaoItem';
import ParametrizacaoItemTabs from '../sections/parametrizacao/ParametrizacaoItemTabs';

// ----------------------------------------------------------------------

export default function Parametrizacao() {
  const { themeStretch } = useSettings();
  const { handleCloseModal } = useModal(closeModal());
  const { done, error, meusacessos, isAdmin } = useSelector((state) => state.parametrizacao);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabParams') || 'Acessos');

  const tabsList = useMemo(
    () =>
      [
        ...(isAdmin || temAcesso(['acesso-110', 'acesso-111'], meusacessos)
          ? [{ value: 'Acessos', component: <Acessos /> }]
          : []),
        ...(isAdmin || temAcesso(['fluxo-110', 'fluxo-111'], meusacessos)
          ? [{ value: 'Fluxos', component: <ParametrizacaoItem item="fluxos" /> }]
          : []),
        ...(isAdmin || temAcesso(['estado-110', 'estado-111'], meusacessos)
          ? [{ value: 'Estados', component: <ParametrizacaoItem item="estados" /> }]
          : []),
        ...(isAdmin || temAcesso(['origem-110', 'origem-111'], meusacessos)
          ? [{ value: 'Origens', component: <ParametrizacaoItem item="origens" /> }]
          : []),
        ...(isAdmin
          ? [
              { value: 'Anexos', component: <ParametrizacaoItemTabs item="anexos" /> },
              { value: 'Crédito', component: <ParametrizacaoItemTabs item="crédito" /> },
              { value: 'Pareceres', component: <ParametrizacaoItemTabs item="pareceres" /> },
              { value: 'Motivos pendências', component: <ParametrizacaoItem item="motivos" /> },
              { value: 'Notificações', component: <ParametrizacaoItemTabs item="notificacoes" /> },
            ]
          : []),
      ] || [],
    [isAdmin, meusacessos]
  );

  useEffect(() => {
    if (!currentTab || currentTab !== selectTab(tabsList, currentTab)) {
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabParams');
    }
  }, [tabsList, currentTab]);

  return (
    <Page title="Parametrização | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={handleCloseModal} />
        <TabsWrapper
          tab="tabParams"
          tabsList={tabsList}
          title="Parametrização"
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        {tabsList.map((tab) => {
          const isMatched = tab?.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
