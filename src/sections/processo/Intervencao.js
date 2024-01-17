import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// utils
import { podeArquivar, caixaPrincipal, pertencoAoEstado, arquivoAtendimento } from '../../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { updateItem, selectItem } from '../../redux/slices/digitaldocs';
// hooks
import useToggle, { useToggle1, useToggle3, useToggle4, useToggle5 } from '../../hooks/useToggle';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { DefaultAction } from '../../components/Actions';
import DialogConfirmar from '../../components/DialogConfirmar';
//
import { IntervencaoForm, FinalizarForm, ArquivarForm, ColocarPendente, Abandonar } from './IntervencaoForm';

// ----------------------------------------------------------------------

Intervencao.propTypes = { colaboradoresList: PropTypes.array };

export default function Intervencao({ colaboradoresList }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
  const { toggle4: open4, onOpen4, onClose4 } = useToggle4();
  const { toggle5: open5, onOpen5, onClose5 } = useToggle5();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { iAmInGrpGerente, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { isSaving, arquivarProcessos, processo } = useSelector((state) => state.digitaldocs);
  const perfilId = cc?.perfil_id;
  const fromAgencia = uos?.find((row) => row.id === processo?.uo_origem_id)?.tipo === 'Agências';
  const aberturaEmpSemValCompliance =
    processo.segcliente === 'E' &&
    processo?.nome?.includes('Gerência') &&
    processo?.assunto === 'Abertura de conta' &&
    !processo?.htransicoes?.find((row) => row?.nome?.includes('Compliance') && row?.modo === 'Seguimento');

  const devolucoes = [];
  const seguimentos = [];
  const destinosFora = [];
  processo.destinos?.forEach((row) => {
    if (processo?.uo_origem_id !== row?.uo_id) {
      destinosFora.push(row?.nome);
    }
    if (row.modo === 'Seguimento') {
      const seguimento = {
        modo: row.modo,
        id: row.transicao_id,
        estado_final_id: row.id,
        paralelo: row?.is_paralelo,
        hasopnumero: row.hasopnumero,
        label: row?.is_paralelo ? row?.nome : `${row?.modo} para ${row?.nome}`,
      };
      if (aberturaEmpSemValCompliance && row?.nome?.includes('Compliance')) {
        seguimentos?.push(seguimento);
      } else if (!aberturaEmpSemValCompliance) {
        seguimentos?.push(seguimento);
      }
    } else {
      devolucoes.push({
        modo: row.modo,
        id: row.transicao_id,
        estado_final_id: row.id,
        paralelo: row?.is_paralelo,
        hasopnumero: row.hasopnumero,
        label: row?.is_paralelo ? row?.nome : `${row?.modo} para ${row?.nome}`,
      });
    }
  });

  const handleFinalizar = () => {
    const formData = {
      cativos: [],
      perfil_id: perfilId,
      fluxoID: processo?.fluxo_id,
      estado_id: processo?.estado_atual_id,
    };
    dispatch(updateItem('finalizar', JSON.stringify(formData), { id: processo?.id, mail, msg: 'finalizado' }));
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  const handleEdit = () => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${processo.id}/editar`);
  };

  return (
    <>
      {processo?.destinos?.length !== 0 && (
        <>
          {devolucoes?.length > 0 && (
            <>
              <DefaultAction color="warning" icon="devolver" handleClick={onOpen} label="DEVOLVER" />
              <IntervencaoForm
                title="Devolver"
                onCancel={onClose}
                isOpenModal={open}
                destinos={devolucoes}
                colaboradoresList={colaboradoresList}
              />
            </>
          )}

          {seguimentos?.length > 0 && (
            <>
              <DefaultAction
                icon="encaminhar"
                handleClick={onOpen3}
                label={processo?.nome === 'Comissão Executiva' ? 'DESPACHO' : 'ENCAMINHAR'}
              />
              <IntervencaoForm
                isOpenModal={open3}
                onCancel={onClose3}
                destinos={seguimentos}
                colaboradoresList={colaboradoresList}
                title={processo?.nome === 'Comissão Executiva' ? 'Despacho' : 'Encaminhar'}
              />
            </>
          )}
        </>
      )}

      {processo?.agendado &&
        processo.situacao !== 'X' &&
        processo?.nome === 'Autorização SWIFT' &&
        (processo?.assunto === 'OPE DARH' || processo?.assunto === 'Transferência Internacional') &&
        pertencoAoEstado(meusAmbientes, 'Autorização SWIFT') && (
          <>
            <DefaultAction icon="finalizar" handleClick={onOpen4} label="FINALIZAR" />
            <DialogConfirmar
              open={open4}
              onClose={onClose4}
              isSaving={isSaving}
              handleOk={handleFinalizar}
              color="success"
              title="Finalizar"
              desc="finalizar este processo"
            />
          </>
        )}

      {processo?.situacao === 'E' &&
        processo?.operacao === 'Cativo/Penhora' &&
        processo?.nome === 'DOP - Validação Notas Externas' &&
        pertencoAoEstado(meusAmbientes, 'DOP - Validação Notas Externas') && (
          <>
            <DefaultAction icon="finalizar" handleClick={onOpen5} label="FINALIZAR" />
            <FinalizarForm open={open5} onCancel={onClose5} />
          </>
        )}

      <Abandonar isSaving={isSaving} processo={processo} />

      {!processo?.ispendente && (
        <>
          <DefaultAction color="inherit" label="PENDENTE" handleClick={() => handlePendente(processo)} />
          <ColocarPendente from="processo" />
        </>
      )}

      <DefaultAction color="warning" handleClick={handleEdit} label="EDITAR" />

      {podeArquivar(
        meusAmbientes,
        fromAgencia,
        iAmInGrpGerente || caixaPrincipal(meusAmbientes),
        processo?.estado_atual_id,
        arquivoAtendimento(
          processo?.assunto,
          processo?.htransicoes?.[0]?.modo === 'Seguimento' && !processo?.htransicoes?.[0]?.is_resgate
        ),
        arquivarProcessos
      ) && (
        <>
          <DefaultAction color="error" handleClick={onOpen1} label="ARQUIVAR" />
          <ArquivarForm
            open={open1}
            processo={processo}
            onCancel={onClose1}
            arquivoAg={
              (processo?.nome?.includes('Gerência') || processo?.nome?.includes('Atendimento')) &&
              destinosFora?.length > 0
                ? destinosFora
                : []
            }
          />
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

Libertar.propTypes = { perfilID: PropTypes.number, processoID: PropTypes.number };

export function Libertar({ perfilID, processoID }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail } = useSelector((state) => state.intranet);
  const { isSaving, done } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'Processo libertado') {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const handleAbandonar = () => {
    dispatch(updateItem('atribuir', '', { mail, perfilID, processoID, perfilIDAfeto: '', msg: 'Processo libertado' }));
  };

  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="LIBERTAR" />
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isSaving={isSaving}
        handleOk={handleAbandonar}
        color="warning"
        title="Libertar"
        desc="libertar este processo"
      />
    </>
  );
}
