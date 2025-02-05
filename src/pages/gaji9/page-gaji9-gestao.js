import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// redux
import { getFromGaji9 } from '../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../redux/store';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { Notificacao } from '../../components/NotistackProvider';
// sections
import AcessoGaji9 from './acesso-gaji9';
import TabGaji9 from '../../sections/gaji9/TabGaji9';

// ----------------------------------------------------------------------

export default function PageGaji9Gestao() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { cc } = useSelector((state) => state.intranet);
  const { done, error, minutaId, utilizador } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabGaji9') || 'Acessos');

  useEffect(() => {
    if (cc?.perfil?.id_aad) dispatch(getFromGaji9('utilizador', { id: cc?.perfil?.id_aad }));
  }, [dispatch, cc?.perfil?.id_aad]);

  const tabsList = useMemo(
    () =>
      utilizador
        ? [
            { value: 'Acessos', component: <TabGaji9 item="acessos" label="Acessos" subTabs /> },
            {
              value: 'Identificadores',
              component: <TabGaji9 item="identificadores" label="Identificadores" subTabs />,
            },
            { value: 'Intervenientes', component: <TabGaji9 item="intervenientes" label="Intervenientes" subTabs /> },
            { value: 'Cláusulas', component: <TabGaji9 item="clausulas" label="Cláusulas" /> },
            { value: 'Minutas', component: <TabGaji9 item="minutas" label="Minutas" /> },
            { value: 'Minutas públicas', component: <TabGaji9 item="minutasPublicas" label="Minutas públicas" /> },
            { value: 'Créditos', component: <TabGaji9 item="creditos" label="Créditos" /> },
          ]
        : [],
    [utilizador]
  );

  return (
    <Page title="GAJ-i9 | DigitalDocs">
      <Notificacao
        done={done}
        error={error}
        afterSuccess={() => {
          if (done === 'Minuta adicionada' && minutaId) navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${minutaId}`);
          if (done === 'Crédito adicionado' && minutaId) navigate(`${PATH_DIGITALDOCS.gaji9.root}/credito/${minutaId}`);
        }}
      />
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper
          title="GAJ-i9"
          tab="tabGaji9"
          tabsList={tabsList}
          currentTab={currentTab}
          changeTab={setCurrentTab}
        />
        <AcessoGaji9>
          {tabsList?.map((tab) => {
            const isMatched = tab?.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })}
        </AcessoGaji9>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

Gaji9Coontent.propTypes = { currentTab: PropTypes.string, setCurrentTab: PropTypes.func };

function Gaji9Coontent({ currentTab, setCurrentTab }) {
  const tabsList = useMemo(
    () => [
      { value: 'Acessos', component: <TabGaji9 item="acessos" label="Acessos" subTabs /> },
      { value: 'Identificadores', component: <TabGaji9 item="identificadores" label="Identificadores" subTabs /> },
      { value: 'Intervenientes', component: <TabGaji9 item="intervenientes" label="Intervenientes" subTabs /> },
      { value: 'Cláusulas', component: <TabGaji9 item="clausulas" label="Cláusulas" /> },
      { value: 'Minutas', component: <TabGaji9 item="minutas" label="Minutas" /> },
      { value: 'Minutas públicas', component: <TabGaji9 item="minutasPublicas" label="Minutas públicas" /> },
      { value: 'Créditos', component: <TabGaji9 item="creditos" label="Créditos" /> },
    ],
    []
  );

  return (
    <>
      <TabsWrapper
        title="GAJ-i9"
        tab="tabGaji9"
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={setCurrentTab}
      />

      {tabsList?.map((tab) => {
        const isMatched = tab?.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}
