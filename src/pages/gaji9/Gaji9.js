import { useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// routes
import useSettings from '../../hooks/useSettings';
// redux
import { closeModal } from '../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { Notificacao } from '../../components/NotistackProvider';
// sections
import TabGaji9 from '../../sections/gaji9/TabGaji9';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function Gaji9() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { done, error } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabGaji9') || 'Acessos');

  const tabsList = useMemo(
    () => [
      { value: 'Acessos', component: <TabGaji9 item="acessos" label="Acessos" subTabs /> },
      { value: 'Identificadores', component: <TabGaji9 item="identificadores" label="Identificadores" subTabs /> },
      { value: 'Cláusulas', component: <TabGaji9 item="clausulas" label="Cláusulas" /> },
      { value: 'Minutas', component: <TabGaji9 item="minutas" label="Minutas" /> },
    ],
    []
  );

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <Page title="GAJi9 | DigitalDocs">
      <Notificacao done={done} error={error} afterSuccess={handleCloseModal} />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          title="GAJi9"
          tab="tabGaji9"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />

        <RoleBasedGuard hasContent roles={['gaji9-111']}>
          {tabsList?.map((tab) => {
            const isMatched = tab?.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })}
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}
