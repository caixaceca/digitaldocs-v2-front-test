import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatObject';
import { acessoGaji9 } from '../../utils/validarAcesso';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useSelector } from '../../redux/store';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import AcessoGaji9 from './acesso-gaji9';
import TabGaji9 from '../../sections/gaji9/items';

// ----------------------------------------------------------------------

export default function PageGaji9Gestao() {
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { done, minutaId, adminGaji9, utilizador } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabGaji9') || 'Parametrização');

  const tabsList = useMemo(
    () =>
      utilizador
        ? [
            ...(adminGaji9 ? [{ value: 'Parametrização', component: <TabGaji9 item="parametrizacao" /> }] : []),
            ...(adminGaji9 ||
            acessoGaji9(utilizador?.acessos, [
              'READ_TIPO TITULAR',
              'READ_TIPO GARANTIA',
              'READ_REPRESENTANTE',
              'READ_PRODUTO/COMPONENTE',
            ])
              ? [{ value: 'Identificadores', component: <TabGaji9 item="identificadores" /> }]
              : []),
            ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_CLAUSULA'])
              ? [{ value: 'Cláusulas', component: <TabGaji9 item="clausulas" label="Cláusulas" /> }]
              : []),
            ...(adminGaji9 || acessoGaji9(utilizador?.acessos, ['READ_MINUTA'])
              ? [{ value: 'Minutas', component: <TabGaji9 item="minutas" label="Minutas" /> }]
              : []),
            ...(adminGaji9 || utilizador?._role === 'GERENTE' || acessoGaji9(utilizador?.acessos, ['READ_CREDITO'])
              ? [{ value: 'Créditos', component: <TabGaji9 item="creditos" label="Créditos" /> }]
              : []),
          ]
        : [],
    [adminGaji9, utilizador]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'gaji9Identificadores', false);
  }, [tabsList, currentTab]);

  const navigateTo = () => {
    if (done === 'Minuta adicionada' && minutaId) navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${minutaId}`);
    if (done === 'Proposta carregada' && minutaId) navigate(`${PATH_DIGITALDOCS.gaji9.root}/credito/${minutaId}`);
  };

  useNotificacao({ done, onClose: () => navigateTo() });

  return (
    <Page title="GAJ-i9 | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          title="GAJ-i9"
          tab="tabGaji9"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <AcessoGaji9 item="gestao">
          <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
