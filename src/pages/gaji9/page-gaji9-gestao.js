import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// redux
import { resetDados } from '../../redux/slices/stepper';
import { useDispatch, useSelector } from '../../redux/store';
import { getFromGaji9, closeModal } from '../../redux/slices/gaji9';
// components
import Page from '../../components/Page';
import TabsWrapper from '../../components/TabsWrapper';
import { Notificacao } from '../../components/NotistackProvider';
// sections
import TabGaji9 from '../../sections/gaji9/TabGaji9';
// guards
// import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function PageGaji9Gestao() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { done, error, minutaId } = useSelector((state) => state.gaji9);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabGaji9') || 'Acessos');

  useEffect(() => {
    dispatch(getFromGaji9('funcoes'));
    dispatch(getFromGaji9('componentes'));
    dispatch(getFromGaji9('tiposTitulares'));
    dispatch(getFromGaji9('tiposGarantias'));
  }, [dispatch]);

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
    <Page title="GAJ-i9 | DigitalDocs">
      <Notificacao
        done={done}
        error={error}
        afterSuccess={() => {
          dispatch(closeModal());
          dispatch(resetDados());
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

        {tabsList?.map((tab) => {
          const isMatched = tab?.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
