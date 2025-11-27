import { useState, useEffect, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { setItemValue } from '../../../utils/formatObject';
// redux
import { useDispatch } from '../../../redux/store';
import { setModal } from '../../../redux/slices/suporte-cliente';
// Components
import { DefaultAction } from '../../../components/Actions';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
//
import TableConfiguracoes from './table-configuracoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function Configuracoes() {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('suporte-config') || 'Assuntos');

  const tabsList = useMemo(
    () => [
      { value: 'Assuntos', component: <TableConfiguracoes item="assuntos" /> },
      { value: 'Utilizadores', component: <TableConfiguracoes item="utilizadores" /> },
      { value: 'Departamentos', component: <TableConfiguracoes item="departamentos" /> },
      { value: 'Respostas', component: <TableConfiguracoes item="respostas" /> },
      { value: 'SLA', component: <TableConfiguracoes item="slas" /> },
      { value: 'FAQ', component: <TableConfiguracoes item="faq" /> },
      { value: 'Prompt email', component: <TableConfiguracoes item="prompts" /> },
    ],
    []
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'suporte-config', false);
  }, [tabsList, currentTab]);

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={`Configurações - ${currentTab}`}
        action={
          <Stack direction="row" spacing={1}>
            {currentTab === 'FAQ' && (
              <DefaultAction button label="Categorias" onClick={() => dispatch(setModal({ modal: 'categories' }))} />
            )}
            <DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ modal: 'add' }))} />
          </Stack>
        }
      />
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        changeTab={(event, newValue) => setItemValue(newValue, setCurrentTab, 'suporte-config', false)}
      />
      <>{tabsList?.find(({ value }) => value === currentTab)?.component}</>
    </>
  );
}
