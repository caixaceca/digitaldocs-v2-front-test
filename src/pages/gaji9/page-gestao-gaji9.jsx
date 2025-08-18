import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { setItemValue } from '../../utils/formatObject';
//
import { useSelector } from '../../redux/store';
import useSettings from '../../hooks/useSettings';
import { usePermissao } from '../../hooks/useAcesso';
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
// sections
import AcessoGaji9 from './acesso-gaji9';
import TabGaji9 from '../../sections/gaji9/items';

// ---------------------------------------------------------------------------------------------------------------------

export default function PageGaji9Gestao() {
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { temPermissao, isAdmin } = usePermissao();

  const { done, propostaId, utilizador } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabGaji9') || 'Parametrização');

  const tabsList = useMemo(
    () =>
      utilizador
        ? [
            ...(isAdmin ? [{ value: 'Parametrização', component: <TabGaji9 item="parametrizacao" /> }] : []),
            ...(temPermissao([
              'READ_SEGMENTO',
              'READ_TIPO TITULAR',
              'READ_TIPO GARANTIA',
              'READ_REPRESENTANTE',
              'READ_PRODUTO/COMPONENTE',
            ])
              ? [{ value: 'Identificadores', component: <TabGaji9 item="identificadores" /> }]
              : []),
            ...(temPermissao(['READ_CLAUSULA'])
              ? [{ value: 'Cláusulas', component: <TabGaji9 item="clausulas" label="Cláusulas" /> }]
              : []),
            ...(temPermissao(['READ_MINUTA'])
              ? [{ value: 'Minutas', component: <TabGaji9 item="minutas" label="Minutas" /> }]
              : []),
            ...(utilizador?._role === 'GERENTE' || temPermissao(['READ_CREDITO'])
              ? [{ value: 'Créditos', component: <TabGaji9 item="creditos" label="Créditos" /> }]
              : []),
          ]
        : [],
    [utilizador, isAdmin, temPermissao]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabGaji9', false);
  }, [tabsList, currentTab]);

  useEffect(() => {
    if (done === 'Proposta carregada' && propostaId) navigate(`${PATH_DIGITALDOCS.gaji9.root}/credito/${propostaId}`);
  }, [done, navigate, propostaId]);

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
          <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
        </AcessoGaji9>
      </Container>
    </Page>
  );
}
