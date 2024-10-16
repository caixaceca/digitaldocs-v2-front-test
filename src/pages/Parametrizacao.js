import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { temAcesso } from '../utils/validarAcesso';
import { setItemValue } from '../utils/formatText';
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
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Parametrizacao() {
  const { themeStretch } = useSettings();
  const { handleCloseModal } = useModal(closeModal());
  const { done, error, meusacessos, isAdmin } = useSelector((state) => state.parametrizacao);

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
              { value: 'Motivos', component: <ParametrizacaoItemTabs item="motivos" /> },
              { value: 'Notificações', component: <ParametrizacaoItemTabs item="notificacoes" /> },
            ]
          : []),
      ] || [],
    [isAdmin, meusacessos]
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
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={handleCloseModal} />
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
        {tabsList?.length === 0 && <RoleBasedGuard hasContent roles={[]} />}
      </Container>
    </Page>
  );
}
