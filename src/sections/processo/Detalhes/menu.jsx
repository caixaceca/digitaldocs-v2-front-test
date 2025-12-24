import { useMemo } from 'react';
// redux
import { useSelector } from '../../../redux/store';
//
import InfoCon from './info-con';
import Estados from './estados-processo';
import DadosGerais from './dados-gerais';
import Versoes from './historico-versoes';
import TableDetalhes from './table-processo';
import Views from './historico-visualiacoes';
import InfoCredito from '../info-credito/info';
import Transicoes from './historico-transicoes';
import TodosAnexos from './anexos/todos-anexos';
import Pareceres, { PareceresEstado } from './historico-pareceres';

// ---------------------------------------------------------------------------------------------------------------------

export default function useMenuProcesso({ id, processo, handleAceitar }) {
  const { isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);

  const { estado = null, credito = null, con = null } = processo || {};
  const { valor = '', fluxo = '', titular = '', numero_operacao: numero } = processo || {};
  const { estados = [], htransicoes = [], pareceres_estado: pareceres = [], criado_em: data } = processo || {};

  const assunto = useMemo(() => `${fluxo ?? ''} - ${titular ?? ''}`, [fluxo, titular]);

  const tabsList = useMemo(() => {
    const tabs = [];
    tabs.push({ value: 'Dados gerais', component: <DadosGerais processo={processo} /> });

    if (credito)
      tabs.push({
        value: 'Info. crédito',
        component: <InfoCredito dados={{ ...credito, processoId: id, criado_em: data, estado }} />,
      });

    if (con) tabs.push({ value: 'Info. CON', component: <InfoCon dados={{ ...con, valor, numero }} /> });

    if (estados?.length > 0) tabs.push({ value: 'Pareceres', component: <Estados handleAceitar={handleAceitar} /> });

    if (estado?.pareceres && estado.pareceres?.length > 0) {
      tabs.push({
        value: 'Pareceres',
        component: (
          <Pareceres
            id={id}
            assunto={assunto}
            estado={estado?.estado}
            pareceres={estado.pareceres}
            estadoId={estado?.estado_id}
          />
        ),
      });
    }

    if (pareceres?.length > 0) {
      tabs.push({ value: 'Pareceres', component: <PareceresEstado pareceres={pareceres} assunto={assunto} /> });
    }

    if (htransicoes?.length > 0) {
      tabs.push({ value: 'Encaminhamentos', component: <Transicoes transicoes={htransicoes} assunto={assunto} /> });
    }

    if (titular) {
      tabs.push(
        { value: 'Anexos', component: <TodosAnexos /> },
        { value: 'Retenções', component: <TableDetalhes id={id} item="hretencoes" /> },
        { value: 'Pendências', component: <TableDetalhes id={id} item="hpendencias" /> },
        { value: 'Atribuições', component: <TableDetalhes id={id} item="hatribuicoes" /> }
      );
    }

    if (titular && (isAdmin || isAuditoria)) {
      tabs.push({ value: 'Versões', component: <Versoes id={id} /> }, { value: 'Visualizações', component: <Views /> });
    }

    return tabs;
  }, [
    id,
    con,
    data,
    valor,
    estado,
    numero,
    assunto,
    titular,
    credito,
    isAdmin,
    processo,
    pareceres,
    htransicoes,
    isAuditoria,
    handleAceitar,
    estados?.length,
  ]);

  return tabsList;
}
