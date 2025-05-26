import { useMemo } from 'react';
import PropTypes from 'prop-types';
// utils
import { noEstado, podeArquivar, processoEstadoInicial, gestorEstado } from '../../utils/validarAcesso';
// redux
import { resetDados } from '../../redux/slices/stepper';
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
import { setModal } from '../../redux/slices/digitaldocs';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import { DefaultAction } from '../../components/Actions';
//
import { ArquivarForm } from './form/arquivo';
import { EncaminharStepper } from './form/intervencao';

// ----------------------------------------------------------------------

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
        <>
          <DefaultAction label="DOMICILIAR" onClick={() => openModal('domiciliar', null)} />
          <DefaultAction label="ADICIONAR ANEXO" onClick={() => openModal('adicionar-anexo', null)} />
        </>
      )}

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

Encaminhar.propTypes = { dados: PropTypes.object };

export function Encaminhar({ dados }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { acao, destinos, gerencia = false, fluxoId = null } = dados;
  return (
    <>
      <DefaultAction
        label={acao}
        color={acao === 'DEVOLVER' ? 'warning' : 'success'}
        onClick={() => {
          onOpen();
          dispatch(resetDados());
          if (acao === 'DEVOLVER') dispatch(getFromParametrizacao('motivosTransicao', { fluxoId }));
        }}
      />
      {open && <EncaminharStepper dados={{ acao, destinos, gerencia, onClose }} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function destinosProcesso(processo, gerencia) {
  const devolucoes = [];
  const seguimentos = [];
  const destinosFora = [];
  const { segmento = '', fluxo = '', htransicoes = [], destinos = [], uo_origem_id: uoId = '' } = processo;

  const aberturaEmpresaSemValGFC =
    gerencia &&
    segmento === 'E' &&
    fluxo === 'Abertura de Conta' &&
    !htransicoes?.find(({ modo, estado_inicial: estado }) => estado?.includes('Compliance') && modo === 'Seguimento');

  destinos?.forEach(({ modo, nome, hasopnumero, paralelo, transicao_id: id, is_inicial: inicial, ...res }) => {
    if (uoId !== res?.uo_id) destinosFora.push(nome);
    const destino = {
      id,
      modo,
      inicial,
      paralelo,
      hasopnumero,
      label: nome,
      uo_id: res?.uo_id,
      estado_final_id: res.estado_id,
      requer_parecer: res?.requer_parecer,
    };
    if (modo === 'Seguimento') {
      if (aberturaEmpresaSemValGFC && nome?.includes('Compliance')) seguimentos?.push(destino);
      else if (!aberturaEmpresaSemValGFC) seguimentos?.push(destino);
    } else devolucoes.push(destino);
  });

  return { seguimentos, devolucoes, destinosFora };
}
