import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// utils
import {
  noEstado,
  podeArquivar,
  caixaPrincipal,
  pertencoAoEstado,
  arquivoAtendimento,
} from '../../utils/validarAcesso';
// redux
import { updateItem } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// hooks
import useToggle from '../../hooks/useToggle';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { DefaultAction } from '../../components/Actions';
import DialogConfirmar from '../../components/DialogConfirmar';
//
import { IntervencaoForm, FinalizarForm, ArquivarForm, ColocarPendente, Abandonar } from './form/IntervencaoForm';

// ----------------------------------------------------------------------

Intervencao.propTypes = { colaboradoresList: PropTypes.array };

export default function Intervencao({ colaboradoresList }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { isGerente, arquivarProcessos, meusAmbientes } = useSelector((state) => state.parametrizacao);
  const perfilId = cc?.perfil_id;
  const gerencia = noEstado(processo?.estado_processo?.estado, ['Gerência', 'Caixa Principal']);
  const fromAgencia = uos?.find((row) => row.id === processo?.uo_origem_id)?.tipo === 'Agências';
  const aberturaEmpSemValCompliance =
    gerencia &&
    processo.segmento === 'E' &&
    processo?.assunto === 'Abertura de conta' &&
    !processo?.htransicoes?.find((row) => row?.estado_atual?.includes('Compliance') && row?.modo === 'Seguimento');

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

  const handleEdit = () => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${processo.id}/editar`);
  };

  return (
    <>
      {devolucoes?.length > 0 && (
        <IntervencaoForm title="DEVOLVER" destinos={devolucoes} colaboradoresList={colaboradoresList} />
      )}

      {seguimentos?.length > 0 && (
        <IntervencaoForm
          destinos={seguimentos}
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
            <DefaultAction icon="finalizar" handleClick={onOpen} label="FINALIZAR" />
            <DialogConfirmar
              open={open}
              onClose={onClose}
              isSaving={isSaving}
              handleOk={handleFinalizar}
              color="success"
              title="Finalizar"
              desc="finalizar este processo"
            />
          </>
        )}

      {processo?.status === 'Em andamento' &&
        processo?.operacao === 'Cativo/Penhora' &&
        processo?.estado_atual === 'DOP - Validação Notas Externas' &&
        pertencoAoEstado(meusAmbientes, ['DOP - Validação Notas Externas']) && (
          <FinalizarForm id={processo?.id} cativos={processo?.cativos} />
        )}

      <Abandonar
        id={processo?.id}
        isSaving={isSaving}
        fluxoId={processo?.fluxo_id}
        estadoId={processo?.estado_processo?.estado_id}
      />

      <ColocarPendente />

      <DefaultAction color="warning" handleClick={handleEdit} label="EDITAR" />

      {podeArquivar(
        meusAmbientes,
        fromAgencia,
        isGerente || caixaPrincipal(meusAmbientes),
        processo?.estado_atual_id,
        arquivoAtendimento(
          processo?.assunto,
          processo?.htransicoes?.[0]?.modo === 'Seguimento' && !processo?.htransicoes?.[0]?.resgate
        ),
        arquivarProcessos
      ) && (
        <ArquivarForm
          arquivoAg={
            (gerencia || processo?.estado_atual?.includes('Atendimento')) && destinosFora?.length > 0
              ? destinosFora
              : []
          }
        />
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
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const hanndleLibertar = () => {
    dispatch(updateItem('atribuir', '', { mail, perfilID, processoID, perfilIDAfeto: '', msg: 'Processo libertado' }));
  };

  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="LIBERTAR" />
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isSaving={isSaving}
        handleOk={hanndleLibertar}
        color="warning"
        title="Libertar"
        desc="libertar este processo"
      />
    </>
  );
}
