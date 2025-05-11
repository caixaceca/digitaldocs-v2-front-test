import { useMemo } from 'react';
import PropTypes from 'prop-types';
// utils
import { noEstado, podeArquivar, processoEstadoInicial, findColaboradores } from '../../utils/validarAcesso';
// redux
import { resetDados } from '../../redux/slices/stepper';
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
import { getInfoProcesso, setModal } from '../../redux/slices/digitaldocs';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import { DefaultAction } from '../../components/Actions';
//
import {
  AtribuirForm,
  ResgatarForm,
  CancelarForm,
  LibertarForm,
  FinalizarForm,
  DomiciliarForm,
  FinalizarOPForm,
  EncaminharStepper,
} from './form/intervencao';
import { ArquivarForm, DesarquivarForm } from './form/arquivo';

// ----------------------------------------------------------------------

export default function Intervencao() {
  const dispatch = useDispatch();
  const { uos } = useSelector((state) => state.intranet);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { arquivarProcessos, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const gerencia = useMemo(
    () => noEstado(processo?.estado?.estado, ['Gerência', 'Caixa Principal']),
    [processo?.estado?.estado]
  );
  const fromAgencia = useMemo(
    () => uos?.find(({ id }) => id === processo?.uo_origem_id)?.tipo === 'Agências',
    [processo?.uo_origem_id, uos]
  );
  const destinos = useMemo(() => destinosProcesso(processo, gerencia), [gerencia, processo]);

  return (
    <>
      {destinos?.devolucoes?.length > 0 && (
        <Encaminhar
          dados={{ gerencia, destinos: destinos.devolucoes, acao: 'DEVOLVER', fluxoId: processo?.fluxo_id }}
        />
      )}

      {destinos?.seguimentos?.length > 0 && (
        <Encaminhar
          dados={{
            gerencia,
            destinos: destinos.seguimentos,
            acao: processo?.estado_atual === 'Comissão Executiva' ? 'DESPACHO' : 'ENCAMINHAR',
          }}
        />
      )}

      <DefaultAction
        label="PENDENTE"
        onClick={() =>
          dispatch(
            setModal({
              modal: 'pendencia',
              dados: {
                id: processo?.id,
                pendente: !!processo?.estado?.pendente,
                estado: processo?.estado?.estado ?? '',
                obs: processo?.estado?.observacao ?? '',
                estadoId: processo?.estado?.estado_id ?? '',
                motivo: processo?.estado?.motivo_pendencia ?? '',
                motivo_id: processo?.estado?.motivo_pendencia_id ?? '',
              },
            })
          )
        }
      />

      {processoEstadoInicial(meusAmbientes, processo?.estado_atual_id) && (
        <Domiciliar id={processo?.id} estadoId={processo?.estado_atual_id} />
      )}

      {processo?.agendado &&
        processo?.status !== 'Executado' &&
        processo?.estado_atual === 'Autorização SWIFT' &&
        (processo?.fluxo === 'OPE DARH' || processo?.fluxo === 'Transferência Internacional') && (
          <FinalizarOP id={processo?.id} isSaving={isSaving} />
        )}

      {processo?.status === 'Em andamento' &&
        processo?.operacao === 'Cativo/Penhora' &&
        processo?.estado_atual === 'DOP - Validação Notas Externas' && (
          <Finalizar id={processo?.id} cativos={processo?.cativos} />
        )}

      <Libertar dados={{ id: processo?.id, estadoId: processo?.estado?.estado_id }} />

      <DefaultAction label="EDITAR" onClick={() => dispatch(setModal({ modal: 'editar-processo', dados: null }))} />

      {podeArquivar(processo, meusAmbientes, arquivarProcessos, fromAgencia, gerencia) && (
        <Arquivar naoFinal={destinos?.destinosFora?.length > 0 ? destinos?.destinosFora : []} />
      )}
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

// --- ARQUIVAR PROCESSO -----------------------------------------------------------------------------------------------

Arquivar.propTypes = { naoFinal: PropTypes.array };

export function Arquivar({ naoFinal }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction onClick={() => onOpen()} label="ARQUIVAR" />
      {open && <ArquivarForm naoFinal={naoFinal} onClose={() => onClose()} />}
    </>
  );
}

// --- DESARQUIVAR PROCESSO --------------------------------------------------------------------------------------------

Desarquivar.propTypes = { id: PropTypes.number };

export function Desarquivar({ id }) {
  const dispatch = useDispatch();
  const { isOpenModal } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  return (
    <>
      <DefaultAction
        color="error"
        label="DESARQUIVAR"
        onClick={() => {
          dispatch(setModal({ modal: 'desarquivar', dados: null }));
          dispatch(getInfoProcesso('destinosDesarquivamento', { id }));
        }}
      />
      {isOpenModal === 'desarquivar' && <DesarquivarForm id={id} colaboradoresList={colaboradoresList} />}
    </>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

Finalizar.propTypes = { id: PropTypes.number, cativos: PropTypes.array };

export function Finalizar({ id, cativos = [] }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction onClick={() => onOpen()} label="FINALIZAR" />
      {open && <FinalizarForm onClose={() => onClose()} id={id} cativos={cativos} />}
    </>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

FinalizarOP.propTypes = { id: PropTypes.number, isSaving: PropTypes.bool };

export function FinalizarOP({ id, isSaving }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction onClick={() => onOpen()} label="FINALIZAR" />
      {open && <FinalizarOPForm onClose={() => onClose()} id={id} isSaving={isSaving} />}
    </>
  );
}

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

Resgatar.propTypes = { dados: PropTypes.object };

export function Resgatar({ dados }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction label="RESGATAR" onClick={() => onOpen()} color="warning" />
      {open && <ResgatarForm dados={dados} onClose={() => onClose()} />}
    </>
  );
}

// --- CANCELAR/FECHAR PROCESSO EM PARALELO ----------------------------------------------------------------------------

Cancelar.propTypes = { id: PropTypes.number, estadoId: PropTypes.number, fechar: PropTypes.bool };

export function Cancelar({ id, estadoId, fechar = false }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction label={fechar ? 'FECHAR' : 'RESGATAR'} color="warning" onClick={() => onOpen()} />
      {open && <CancelarForm onClose={() => onClose()} id={id} estadoId={estadoId} fechar={fechar} />}
    </>
  );
}

// --- LIBERTAR PROCESSO -------------------------------------------------------------------------------------

Libertar.propTypes = { dados: PropTypes.object };

export function Libertar({ dados }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" label="LIBERTAR" onClick={() => onOpen()} />
      {open && <LibertarForm dados={dados} onClose={() => onClose()} />}
    </>
  );
}

// --- ATRIBUIR/AFETAR PROCESSO ----------------------------------------------------------------------------------------

Atribuir.propTypes = { dados: PropTypes.object };

export function Atribuir({ dados }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();

  const onClick = () => {
    onOpen();
    if (dados?.estadoId) dispatch(getFromParametrizacao('colaboradoresEstado', { id: dados?.estadoId }));
  };

  return (
    <>
      <DefaultAction color="info" label="ATRIBUIR" onClick={() => onClick()} />
      {open && <AtribuirForm dados={dados} onClose={() => onClose()} />}
    </>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

Domiciliar.propTypes = { id: PropTypes.number, estadoId: PropTypes.number };

export function Domiciliar({ id, estadoId }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" label="DOMICILIAR" onClick={() => onOpen()} />
      {open && <DomiciliarForm id={id} estadoId={estadoId} onClose={() => onClose()} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function destinosProcesso(processo, gerencia) {
  const devolucoes = [];
  const seguimentos = [];
  const destinosFora = [];

  const aberturaESemValGFC =
    gerencia &&
    processo.segmento === 'E' &&
    processo?.fluxo === 'Abertura de Conta' &&
    !processo?.htransicoes?.find((row) => row?.estado_atual?.includes('Compliance') && row?.modo === 'Seguimento');

  processo?.destinos?.forEach((row) => {
    if (processo?.uo_origem_id !== row?.uo_id) destinosFora.push(row?.nome);
    const destino = {
      modo: row.modo,
      label: row?.nome,
      id: row.transicao_id,
      paralelo: row?.paralelo,
      hasopnumero: row.hasopnumero,
      estado_final_id: row.estado_id,
      requer_parecer: row?.requer_parecer,
    };
    if (row.modo === 'Seguimento') {
      if (aberturaESemValGFC && row?.nome?.includes('Compliance')) seguimentos?.push(destino);
      else if (!aberturaESemValGFC) seguimentos?.push(destino);
    } else devolucoes.push(destino);
  });

  return { seguimentos, devolucoes, destinosFora };
}
