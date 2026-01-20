import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import useSettings from '../../hooks/useSettings';
import { useNotificacao } from '../../hooks/useNotificacao';
import { useTabsSync } from '../../hooks/minimal-hooks/use-tabs-sync';
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
    () => [
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
    ],
    [isAdmin]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Acessos', 'tab-parametrizacao');

  useNotificacao({ done, onClose: () => dispatch(closeModal()) });

  return (
    <Page title="Parametrização | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper tabsList={tabsList} title="Parametrização" tab={tab} setTab={setTab} />
        <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
        {tabsList?.length === 0 && <RoleBasedGuard hasContent roles={['XXXXXX']} />}
      </Container>
    </Page>
  );
}
