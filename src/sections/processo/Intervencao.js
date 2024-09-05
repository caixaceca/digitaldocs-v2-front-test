import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// utils
import { noEstado, podeArquivar, pertencoAoEstado, arquivoAtendimento } from '../../utils/validarAcesso';
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
import { Encaminhar, Abandonar, Domiciliar, Arquivar, Finalizar, ColocarPendente } from './form/IntervencaoForm';

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
            <DialogConfirmar
              open={open}
              onClose={onClose}
              isSaving={isSaving}
              handleOk={() => handleFinalizar()}
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

// ----------------------------------------------------------------------

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
