import { useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// utils
import { useSelector } from '../redux/store';
import useSettings from '../hooks/useSettings';
import { temAcesso, estadoInicial } from '../utils/validarAcesso';
import { useTabsSync } from '../hooks/minimal-hooks/use-tabs-sync';
// components
import Page from '../components/Page';
import TabsWrapper from '../components/TabsWrapper';
// sections
import TableCON from '../sections/tabela/table-con';
import TableControle from '../sections/tabela/table-controle';
import TableCartoes from '../sections/cartoes/table-cartoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function Controle() {
  const { themeStretch } = useSettings();
  const { cc } = useSelector((state) => state.intranet);
  const { isAdmin, isAuditoria, meusAmbientes, meusacessos } = useSelector((state) => state.parametrizacao);

  const tabsList = useMemo(
    () => [
      { value: 'Trabalhados', component: <TableControle from="Trabalhados" /> },
      ...(isAdmin || isAuditoria || estadoInicial(meusAmbientes)
        ? [
            { value: 'Entradas', component: <TableControle from="Entradas" /> },
            { value: 'Por concluir', component: <TableControle from="Por concluir" /> },
            { value: 'Devoluções', component: <TableControle from="Devoluções" /> },
          ]
        : []),
      ...(isAdmin || isAuditoria || cc?.uo_label === 'DOP-CE' || cc?.uo_tipo === 'Agências'
        ? [{ value: 'Receção de cartões', component: <TableCartoes /> }]
        : []),
      ...(isAdmin || isAuditoria || temAcesso(['con-100'], meusacessos)
        ? [{ value: 'CON', component: <TableCON /> }]
        : []),
      ...(isAdmin || isAuditoria || temAcesso(['pjf-100'], meusacessos)
        ? [{ value: 'Judiciais & Fiscais', component: <TableCON item="pjf" /> }]
        : []),
    ],
    [isAdmin, isAuditoria, meusAmbientes, cc?.uo_label, cc?.uo_tipo, meusacessos]
  );

  const [tab, setTab] = useTabsSync(tabsList, 'Trabalhados', 'tab-controle');

  return (
    <Page title="Controle | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TabsWrapper title="Controle" tabsList={tabsList} tab={tab} setTab={setTab} />
        <Box>{tabsList?.find(({ value }) => value === tab)?.component}</Box>
      </Container>
    </Page>
  );
}
