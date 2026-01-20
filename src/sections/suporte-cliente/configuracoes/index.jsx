import { useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { useDispatch } from '../../../redux/store';
import { setModal } from '../../../redux/slices/suporte-cliente';
import { useTabsSync } from '../../../hooks/minimal-hooks/use-tabs-sync';
// Components
import { DefaultAction } from '../../../components/Actions';
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
//
import TableConfiguracoes from './table-configuracoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function Configuracoes() {
  const dispatch = useDispatch();

  const tabsList = useMemo(
    () => [
      { value: 'Assuntos', component: <TableConfiguracoes item="assuntos" /> },
      { value: 'Utilizadores', component: <TableConfiguracoes item="utilizadores" /> },
      { value: 'Departamentos', component: <TableConfiguracoes item="departamentos" /> },
      { value: 'Respostas', component: <TableConfiguracoes item="respostas" /> },
      { value: 'FAQ', component: <TableConfiguracoes item="faq" /> },
      { value: 'Prompt email', component: <TableConfiguracoes item="prompts" /> },
      { value: 'SLA Global', component: <TableConfiguracoes item="slas" /> },
      { value: 'SLA Departamental', component: <TableConfiguracoes item="slasUo" /> },
    ],
    []
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Assuntos', 'tab-suporte-cliente-config');

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={`Configurações - ${tab}`}
        action={
          <Stack direction="row" spacing={1}>
            {tab === 'FAQ' && (
              <DefaultAction button label="Categorias" onClick={() => dispatch(setModal({ modal: 'categories' }))} />
            )}
            <DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ modal: 'add' }))} />
          </Stack>
        }
      />
      <TabsWrapperSimple tab={tab} tabsList={tabsList} setTab={setTab} />
      {tabsList?.find(({ value }) => value === tab)?.component}
    </>
  );
}
