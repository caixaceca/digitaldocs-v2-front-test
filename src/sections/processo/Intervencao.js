import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// utils
import { noEstado, podeArquivar, pertencoAoEstado, arquivoAtendimento } from '../../utils/validarAcesso';
// redux
import { resetDados } from '../../redux/slices/stepper';
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
import { updateItem, selectAnexo, getAll, selectItem } from '../../redux/slices/digitaldocs';
// hooks
import useToggle from '../../hooks/useToggle';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { DefaultAction } from '../../components/Actions';
import { DialogConfirmar } from '../../components/CustomDialog';
//
import {
  AtribuirForm,
  ResgatarForm,
  LibertarForm,
  CancelarForm,
  FinalizarForm,
  AbandonarForm,
  DomiciliarForm,
  EncaminharStepper,
  ColocarPendenteForm,
} from './form/IntervencaoForm';
import { RestaurarForm, ArquivarForm, DesarquivarForm } from './form/Arquivo';

// ----------------------------------------------------------------------

Intervencao.propTypes = { colaboradoresList: PropTypes.array };

export default function Intervencao({ colaboradoresList }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { arquivarProcessos, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const gerencia = useMemo(
    () => noEstado(processo?.estado_processo?.estado, ['Gerência', 'Caixa Principal']),
    [processo?.estado_processo?.estado]
  );
  const fromAgencia = useMemo(
    () => uos?.find((row) => row.id === processo?.uo_origem_id)?.tipo === 'Agências',
    [processo?.uo_origem_id, uos]
  );
  const aberturaEmpSemValCompliance = useMemo(
    () =>
      gerencia &&
      processo.segmento === 'E' &&
      processo?.assunto === 'Abertura de conta' &&
      !processo?.htransicoes?.find((row) => row?.estado_atual?.includes('Compliance') && row?.modo === 'Seguimento'),
    [gerencia, processo?.assunto, processo?.htransicoes, processo.segmento]
  );
  const dados = useMemo(() => setDados(processo, aberturaEmpSemValCompliance), [aberturaEmpSemValCompliance, processo]);

  const handleFinalizar = () => {
    dispatch(
      updateItem('finalizar', JSON.stringify({ cativos: [] }), {
        mail,
        perfilId,
        id: processo?.id,
        msg: 'Processo finalizado',
      })
    );
  };

  return (
    <>
      <ColocarPendente />

      {dados?.devolucoes?.length > 0 && (
        <Encaminhar
          title="DEVOLVER"
          gerencia={gerencia}
          fluxoId={processo?.fluxo_id}
          destinos={dados?.devolucoes}
          colaboradoresList={colaboradoresList}
        />
      )}

      {dados?.seguimentos?.length > 0 && (
        <Encaminhar
          gerencia={gerencia}
          destinos={dados?.seguimentos}
          colaboradoresList={colaboradoresList}
          title={processo?.estado_atual === 'Comissão Executiva' ? 'DESPACHO' : 'ENCAMINHAR'}
        />
      )}

      {processo?.agendado &&
        processo?.status !== 'Executado' &&
        processo?.estado_atual === 'Autorização SWIFT' &&
        (processo?.assunto === 'OPE DARH' || processo?.assunto === 'Transferência Internacional') &&
        pertencoAoEstado(meusAmbientes, ['Autorização SWIFT']) && (
          <>
            <DefaultAction handleClick={onOpen} label="FINALIZAR" />
            {open && (
              <DialogConfirmar
                onClose={onClose}
                isSaving={isSaving}
                handleOk={() => handleFinalizar()}
                color="success"
                title="Finalizar"
                desc="finalizar este processo"
              />
            )}
          </>
        )}

      {processo?.status === 'Em andamento' &&
        processo?.operacao === 'Cativo/Penhora' &&
        processo?.estado_atual === 'DOP - Validação Notas Externas' &&
        pertencoAoEstado(meusAmbientes, ['DOP - Validação Notas Externas']) && (
          <Finalizar id={processo?.id} cativos={processo?.cativos} />
        )}

      <Abandonar
        id={processo?.id}
        isSaving={isSaving}
        fluxoId={processo?.fluxo_id}
        estadoId={processo?.estado_processo?.estado_id}
      />

      {processo?.status === 'Inicial' && <Domiciliar id={processo?.id} estadoId={processo?.estado_atual_id} />}

      <DefaultAction
        label="EDITAR"
        color="warning"
        handleClick={() => navigate(`${PATH_DIGITALDOCS.processos.root}/${processo.id}/editar`)}
      />

      {podeArquivar(
        fromAgencia,
        meusAmbientes,
        arquivarProcessos,
        processo?.estado_atual_id,
        arquivoAtendimento(
          processo?.assunto,
          processo?.htransicoes?.[0]?.modo === 'Seguimento' && !processo?.htransicoes?.[0]?.resgate
        )
      ) && <Arquivar naoFinal={dados?.destinosFora?.length > 0 ? dados?.destinosFora : []} />}
    </>
  );
}

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

Encaminhar.propTypes = {
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
  fluxoId: PropTypes.number,
  colaboradoresList: PropTypes.array,
};

export function Encaminhar({ title, destinos, gerencia = false, colaboradoresList = [], fluxoId = null }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  return (
    <>
      <DefaultAction
        color={title === 'DEVOLVER' ? 'warning' : 'success'}
        handleClick={() => {
          onOpen();
          dispatch(resetDados());
          if (title === 'DEVOLVER') {
            dispatch(getFromParametrizacao('motivos transicao', { mail, perfilId, fluxoId }));
          }
        }}
        label={title}
      />
      {open && (
        <EncaminharStepper
          title={title}
          onClose={onClose}
          destinos={destinos}
          gerencia={gerencia}
          colaboradoresList={colaboradoresList}
        />
      )}
    </>
  );
}

// --- ARQUIVAR PROCESSO -----------------------------------------------------------------------------------------------

Arquivar.propTypes = { naoFinal: PropTypes.array };

export function Arquivar({ naoFinal }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="error" handleClick={onOpen} label="ARQUIVAR" />
      {open && <ArquivarForm naoFinal={naoFinal} onClose={onClose} />}
    </>
  );
}

// --- DESARQUIVAR PROCESSO --------------------------------------------------------------------------------------------

Desarquivar.propTypes = { id: PropTypes.number, colaboradoresList: PropTypes.array };

export function Desarquivar({ id, colaboradoresList }) {
  const dispatch = useDispatch();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isOpenModal1 } = useSelector((state) => state.digitaldocs);
  return (
    <>
      <DefaultAction
        color="error"
        label="DESARQUIVAR"
        handleClick={() => dispatch(getAll('destinosDesarquivamento', { mail, id, perfilId }))}
      />
      {isOpenModal1 && <DesarquivarForm id={id} colaboradoresList={colaboradoresList} />}
    </>
  );
}

// --- RESTAURAR PROCESSO DO HISTÓRICO ---------------------------------------------------------------------------------

Restaurar.propTypes = { id: PropTypes.number };

export function Restaurar({ id }) {
  const dispatch = useDispatch();
  const { selectedAnexoId } = useSelector((state) => state.digitaldocs);
  return (
    <>
      <DefaultAction color="error" label="RESTAURAR" handleClick={() => dispatch(selectAnexo(id))} />
      {!!selectedAnexoId && <RestaurarForm id={id} />}
    </>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

Finalizar.propTypes = { id: PropTypes.number, cativos: PropTypes.array };

export function Finalizar({ id, cativos = [] }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction handleClick={onOpen} label="FINALIZAR" />
      {open && <FinalizarForm onClose={onClose} id={id} cativos={cativos} />}
    </>
  );
}

// --- LIBERTAR PROCESSO -----------------------------------------------------------------------------------------------

Libertar.propTypes = { perfilID: PropTypes.number, processoID: PropTypes.number };

export function Libertar({ perfilID, processoID }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="LIBERTAR" />
      {open && <LibertarForm perfilID={perfilID} processoID={processoID} onClose={onClose} />}
    </>
  );
}

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

Resgatar.propTypes = { dados: PropTypes.object };

export function Resgatar({ dados }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction label="RESGATAR" handleClick={onOpen} color="warning" />
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
      <DefaultAction label={fechar ? 'FECHAR' : 'RESGATAR'} color="warning" handleClick={onOpen} />
      {open && <CancelarForm onClose={onClose} id={id} estadoId={estadoId} fechar={fechar} />}
    </>
  );
}

// --- ABANDONAR PROCESSO ----------------------------------------------------------------------------------------------

Abandonar.propTypes = {
  id: PropTypes.number,
  isSaving: PropTypes.bool,
  fluxoId: PropTypes.number,
  estadoId: PropTypes.number,
};

export function Abandonar({ id, fluxoId, estadoId, isSaving }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="ABANDONAR" />
      {open && <AbandonarForm dados={{ id, fluxoId, estadoId }} onClose={() => onClose} isSaving={isSaving} />}
    </>
  );
}

// --- ATRIBUIR/AFETAR PROCESSO ----------------------------------------------------------------------------------------

Atribuir.propTypes = { dados: PropTypes.object };

export function Atribuir({ dados }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const atribuirClick = () => {
    onOpen();
    if (mail && perfilId && dados?.estadoId) {
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: dados?.estadoId }));
    }
  };

  return (
    <>
      <DefaultAction color="info" label="ATRIBUIR" handleClick={() => atribuirClick()} />
      {open && <AtribuirForm dados={dados} onClose={onClose} />}
    </>
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

export function ColocarPendente() {
  const dispatch = useDispatch();
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);
  return (
    <>
      <DefaultAction color="inherit" label="PENDENTE" handleClick={() => dispatch(selectItem(processo))} />
      {isOpenModal && <ColocarPendenteForm />}
    </>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

Domiciliar.propTypes = { id: PropTypes.number, estadoId: PropTypes.number };

export function Domiciliar({ id, estadoId }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" label="DOMICILIAR" handleClick={() => onOpen()} />
      {open && <DomiciliarForm id={id} estadoId={estadoId} onClose={onClose} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function setDados(processo, aberturaEmpSemValCompliance) {
  const devolucoes = [];
  const seguimentos = [];
  const destinosFora = [];
  processo?.destinos?.forEach((row) => {
    if (processo?.uo_origem_id !== row?.uo_id) {
      destinosFora.push(row?.nome);
    }
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
      if (aberturaEmpSemValCompliance && row?.nome?.includes('Compliance')) {
        seguimentos?.push(destino);
      } else if (!aberturaEmpSemValCompliance) {
        seguimentos?.push(destino);
      }
    } else {
      devolucoes.push(destino);
    }
  });

  return { seguimentos, devolucoes, destinosFora };
}
