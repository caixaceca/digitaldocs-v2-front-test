import { useMemo } from 'react';
// utils
import {
  noEstado,
  gestorEstado,
  podeArquivar,
  processoEstadoFinal,
  processoEstadoInicial,
} from '@/utils/validarAcesso';
import useToggle from '@/hooks/useToggle';
import { applySort, getComparator } from '@/hooks/useTable';
// redux
import { resetDados } from '@/redux/slices/stepper';
import { setModal } from '@/redux/slices/digitaldocs';
import { useDispatch, useSelector } from '@/redux/store';
//
import { ArquivarForm } from './form/form-arquivo';
import { DefaultAction } from '@/components/Actions';
import { EncaminharStepper } from './form/intervencao';
import EnviarContratacao from './info-credito/enviar-contratacao';

// ---------------------------------------------------------------------------------------------------------------------

export default function Intervencao() {
  const dispatch = useDispatch();
  const { uos } = useSelector((state) => state.intranet);
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);
  const { arquivarProcessos, meusAmbientes } = useSelector((state) => state.parametrizacao);

  const { agendado = false, cativos = [], fluxo_id: fluxoId } = processo;
  const { id, estado, uo_origem_id: uoId = '', operacao = '', fluxo = '', status = '' } = processo;

  const gerencia = useMemo(() => noEstado(estado?.estado, ['Gerência', 'Caixa Principal']), [estado?.estado]);
  const fromAgencia = useMemo(() => uos?.find(({ id }) => id === uoId)?.tipo === 'Agências', [uoId, uos]);
  const { seguimentos, devolucoes, destinosFora } = useMemo(
    () => destinosProcesso(processo, gerencia),
    [gerencia, processo]
  );

  const openModal = (modal, dados) => {
    dispatch(setModal({ modal: modal || '', dados: dados || null }));
  };

  return (
    <>
      {processo?.origem_dform && processoEstadoFinal(meusAmbientes, estado?.estado_id) && (
        <DefaultAction label="APLICAR NA BANCA" onClick={() => openModal('aplicar-banca', null)} />
      )}
      {processo?.credito?.situacao_final_mes === 'Aprovado' && !processo?.credito?.enviado_para_contratacao && (
        <EnviarContratacao fab dados={{ ...processo?.credito, processoId: processo?.id }} />
      )}
      {devolucoes?.length > 0 && <Encaminhar dados={{ gerencia, destinos: devolucoes, acao: 'DEVOLVER', fluxoId }} />}

      {seguimentos?.length > 0 && (
        <Encaminhar
          dados={{
            gerencia,
            destinos: seguimentos,
            acao: estado?.estado === 'Comissão Executiva' ? 'DESPACHO' : 'ENCAMINHAR',
          }}
        />
      )}

      {processoEstadoInicial(meusAmbientes, estado?.estado_id) && (
        <DefaultAction label="DOMICILIAR" onClick={() => openModal('domiciliar', null)} />
      )}
      <DefaultAction label="ADICIONAR ANEXO" onClick={() => openModal('adicionar-anexo', null)} />

      {agendado &&
        status !== 'X' &&
        estado?.estado === 'Autorização SWIFT' &&
        (fluxo === 'OPE DARH' || fluxo === 'Transferência Internacional') && (
          <DefaultAction label="FINALIZAR" onClick={() => openModal('finalizar-ope', null)} />
        )}

      {status === 'E' && operacao === 'Cativo/Penhora' && estado?.estado === 'DOP - Validação Notas Externas' && (
        <DefaultAction label="FINALIZAR" onClick={() => openModal('finalizar-ne', cativos)} />
      )}
      <DefaultAction label="EDITAR" onClick={() => openModal('editar-processo', null)} />

      <DefaultAction
        label="PENDENTE"
        onClick={() =>
          dispatch(
            setModal({
              modal: 'pendencia',
              dados: {
                id,
                pendente: !!estado?.pendente,
                estado: estado?.estado ?? '',
                obs: estado?.observacao ?? '',
                estadoId: estado?.estado_id ?? '',
                motivo: estado?.motivo_pendencia ?? '',
                motivo_id: estado?.motivo_pendencia_id ?? '',
              },
            })
          )
        }
      />

      <DefaultAction
        label="LIBERTAR"
        onClick={() => openModal('libertar', { id, estadoId: estado?.estado_id, perfilId: estado?.perfil_id })}
      />
      {podeArquivar(processo, meusAmbientes, arquivarProcessos, fromAgencia, gerencia) && (
        <DefaultAction label="ARQUIVAR" onClick={() => openModal('arquivar', null)} />
      )}
      {processoEstadoInicial(meusAmbientes, estado?.estado_id) && gestorEstado(meusAmbientes, estado?.estado_id) && (
        <DefaultAction label="ELIMINAR" onClick={() => openModal('eliminar-processo', null)} />
      )}
      {isOpenModal === 'arquivar' && <ArquivarForm onClose={() => openModal()} naoFinal={destinosFora} />}
    </>
  );
}

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

export function Encaminhar({ dados }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { acao, destinos, gerencia = false } = dados;
  return (
    <>
      <DefaultAction
        label={acao}
        color={acao === 'DEVOLVER' ? 'warning' : 'success'}
        onClick={() => {
          onOpen();
          dispatch(resetDados());
        }}
      />
      {open && <EncaminharStepper dados={{ acao, destinos, gerencia, onClose }} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function destinosProcesso(processo, gerencia) {
  const { segmento = '', fluxo = '', htransicoes = [], destinos = [], uo_origem_id: uoId = '' } = processo;

  const aberturaEmpresaSemValGFC =
    gerencia &&
    segmento === 'E' &&
    fluxo === 'Abertura de Conta' &&
    !htransicoes?.some(({ modo, estado_inicial }) => estado_inicial?.includes('Compliance') && modo === 'Seguimento');

  const listaOrdenada = applySort(destinos, getComparator('asc', 'nome')) || [];

  return listaOrdenada.reduce(
    (acc, { modo, nome, transicao_id: id, is_inicial: inicial, ...res }) => {
      if (uoId !== res?.uo_id) acc.destinosFora.push(nome);

      const destino = {
        id,
        modo,
        inicial,
        label: nome,
        uo_id: res?.uo_id,
        paralelo: res.paralelo,
        hasopnumero: res.hasopnumero,
        estado_final_id: res.estado_id,
        requer_parecer: res?.requer_parecer,
      };

      if (modo === 'Seguimento') {
        const isCompliance = nome?.includes('Compliance');
        if (!aberturaEmpresaSemValGFC || isCompliance) acc.seguimentos.push(destino);
      } else {
        acc.devolucoes.push(destino);
      }

      return acc;
    },
    { seguimentos: [], devolucoes: [], destinosFora: [] }
  );
}
