import { useEffect, useState, useMemo } from 'react';

// utils
import { UosAcesso } from '../../../utils/validarAcesso';
import { setItemValue } from '../../../utils/formatObject';
// redux
import { useSelector } from '../../../redux/store';
// components
import { TabsWrapperSimple } from '../../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
//
import ResumoEstatisticaCredito from './resumo';
import FiltrosEstatisticaCredito from './filtros';
import TableSituacaoCredito from './table-situacao';

// ---------------------------------------------------------------------------------------------------------------------

export default function EstatisticaCredito() {
  const { cc, uos } = useSelector((state) => state.intranet);
  const { meusAmbientes, isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);

  const [periodo, setPeriodo] = useState(localStorage.getItem('periodoEst') || 'Mensal');
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('tabEst') || 'Resumo');

  const agencias = useMemo(() => uos?.filter(({ tipo }) => tipo === 'Agências'), [uos]);
  const uosList = useMemo(
    () => UosAcesso(agencias, cc, isAdmin || isAuditoria || cc?.uo_label === 'GPCG', meusAmbientes, 'id'),
    [cc, isAdmin, isAuditoria, meusAmbientes, agencias]
  );

  const [uo, setUo] = useState(
    uosList?.find(({ id }) => Number(id) === Number(localStorage.getItem('uoEst'))) ||
      uosList?.find(({ id }) => Number(id) === Number(cc?.uo_id)) || { id: -1, label: 'Caixa' }
  );

  const tabsList = useMemo(
    () => [
      { value: 'Resumo', component: <ResumoEstatisticaCredito /> },
      ...(periodo === 'Mensal' && uo?.id > 0
        ? [
            { value: 'Entradas', component: <TableSituacaoCredito from="entrada" /> },
            { value: 'Aprovados', component: <TableSituacaoCredito from="aprovado" /> },
            { value: 'Contratados', component: <TableSituacaoCredito from="contratado" /> },
            { value: 'Indeferidos', component: <TableSituacaoCredito from="indeferido" /> },
            { value: 'Desistidos', component: <TableSituacaoCredito from="desistido" /> },
          ]
        : []),
    ],
    [uo?.id, periodo]
  );

  useEffect(() => {
    if (!currentTab || !tabsList?.map(({ value }) => value)?.includes(currentTab))
      setItemValue(tabsList?.[0]?.value, setCurrentTab, 'tabEst', false);
  }, [tabsList, currentTab]);

  const handleChangeTab = async (event, newValue) => setItemValue(newValue, setCurrentTab, 'tabEst');

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading="Estatística de crédito"
        action={<FiltrosEstatisticaCredito dados={{ uo, periodo, setUo, setPeriodo, currentTab, uosList }} />}
      />
      {tabsList?.length > 1 && (
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} />
      )}
      {tabsList?.find(({ value }) => value === currentTab)?.component}
    </>
  );
}
