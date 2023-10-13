import { useEffect, useMemo, useState } from 'react';
// @mui
import { Box, Container } from '@mui/material';
import SchemaOutlinedIcon from '@mui/icons-material/SchemaOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import ModeStandbyOutlinedIcon from '@mui/icons-material/ModeStandbyOutlined';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
// utils
import selectTab from '../utils/selectTab';
// routes
import useSettings from '../hooks/useSettings';
// redux
import { useSelector } from '../redux/store';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
import SvgIconStyle from '../components/SvgIconStyle';
// sections
import Acessos from '../sections/parametrizacao/Acessos';
import ParametrizacaoItem from '../sections/parametrizacao/ParametrizacaoItem';

// ----------------------------------------------------------------------

export default function Parametrizacao() {
  const { themeStretch } = useSettings();
  const { meusacessos, isAdmin } = useSelector((state) => state.digitaldocs);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabParams') || 'Acessos');
  const acessoMotivosPendencias = isAdmin;
  const acessoFluxos = isAdmin || meusacessos?.includes('fluxo-110') || meusacessos?.includes('fluxo-110');
  const acessoOrigens = isAdmin || meusacessos?.includes('origem-110') || meusacessos?.includes('origem-110');
  const acessoEstados = isAdmin || meusacessos?.includes('estado-110') || meusacessos?.includes('estado-110');
  const acessoAcessos = isAdmin || meusacessos?.includes('acesso-110') || meusacessos?.includes('acesso-110');

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    localStorage.setItem('tabParams', newValue);
  };

  const acessos = useMemo(
    () => (acessoAcessos ? [{ value: 'Acessos', icon: <GroupAddOutlinedIcon />, component: <Acessos /> }] : []),
    [acessoAcessos]
  );

  const fluxos = useMemo(
    () =>
      acessoFluxos
        ? [{ value: 'Fluxos', icon: <SchemaOutlinedIcon />, component: <ParametrizacaoItem item="fluxos" /> }]
        : [],
    [acessoFluxos]
  );

  const origens = useMemo(
    () =>
      acessoOrigens
        ? [{ value: 'Origens', icon: <CorporateFareOutlinedIcon />, component: <ParametrizacaoItem item="origens" /> }]
        : [],
    [acessoOrigens]
  );

  const estados = useMemo(
    () =>
      acessoEstados
        ? [
            {
              value: 'Estados',
              component: <ParametrizacaoItem item="estados" />,
              icon: <SvgIconStyle src={`/assets/icons/navbar/state.svg`} />,
            },
          ]
        : [],
    [acessoEstados]
  );

  const motivosPendencias = useMemo(
    () =>
      acessoMotivosPendencias
        ? [
            {
              value: 'Motivos pendências',
              icon: <ModeStandbyOutlinedIcon />,
              component: <ParametrizacaoItem item="motivos" />,
            },
            {
              value: 'Linhas crédito',
              icon: <CreditScoreOutlinedIcon />,
              component: <ParametrizacaoItem item="linhas" />,
            },
          ]
        : [],
    [acessoMotivosPendencias]
  );

  const tabsList = useMemo(
    () => [...acessos, ...fluxos, ...estados, ...origens, ...motivosPendencias] || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fluxos]
  );

  useEffect(() => {
    if (currentTab !== selectTab(tabsList, currentTab)) {
      setCurrentTab(tabsList?.[0]?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsList, currentTab]);

  return (
    <Page title="Parametrização | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper tabsList={tabsList} title="Parametrização" currentTab={currentTab} changeTab={handleChangeTab} />
        {tabsList.map((tab) => {
          const isMatched = tab?.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
