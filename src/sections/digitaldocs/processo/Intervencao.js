import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Fab, Tooltip } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { finalizarProcesso, abandonarProcesso, deleteItem } from '../../../redux/slices/digitaldocs';
// hooks
import useToggle, { useToggle1, useToggle2, useToggle3, useToggle4, useToggle5 } from '../../../hooks/useToggle';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';
import DialogConfirmar from '../../../components/DialogConfirmar';
//
import ArquivarForm from '../ArquivarForm';
import IntervencaoForm from '../IntervencaoForm';

// ----------------------------------------------------------------------

Intervencao.propTypes = {
  processo: PropTypes.object,
};

export default function Intervencao({ processo }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
  const { toggle4: open4, onOpen4, onClose4 } = useToggle4();
  const { toggle5: open5, onOpen5, onClose5 } = useToggle5();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { isSaving, meuAmbiente, meusAmbientes } = useSelector((state) => state.digitaldocs);
  const perfilId = currentColaborador?.perfil_id;

  const devolucoes = [];
  const seguimentos = [];
  processo.destinos?.forEach((row) => {
    if (row.modo === 'Seguimento') {
      seguimentos.push({
        id: row.transicao_id,
        modo: row.modo,
        estado_final_id: row.id,
        estado_final_label: row.nome,
        hasopnumero: row.hasopnumero,
      });
    } else {
      devolucoes.push({
        id: row.transicao_id,
        modo: row.modo,
        estado_final_id: row.id,
        estado_final_label: row.nome,
        hasopnumero: row.hasopnumero,
      });
    }
  });

  const handleFinalizar = () => {
    const formData = {
      perfil_id: perfilId,
      fluxoID: processo?.fluxo_id,
      estado_id: processo?.estado_atual_id,
    };
    dispatch(finalizarProcesso(JSON.stringify(formData), processo?.id, mail));
  };

  const handleAbandonar = () => {
    const formData = {
      perfilID: perfilId,
      fluxoID: processo?.fluxo_id,
      estadoID: processo?.estado_atual_id,
    };
    dispatch(abandonarProcesso(formData, processo?.id, mail));
  };

  const handleEliminar = () => {
    dispatch(deleteItem('processo', { processoId: processo?.id, perfilId, mail, mensagem: 'Processo eliminado' }));
  };

  const podeFinalizar = () => {
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.is_final && (processo?.agendado || !processo?.is_interno) && processo.situacao !== 'X') {
          return true;
        }
        i += 1;
      }
    } else if (meuAmbiente?.is_final && (processo?.agendado || !processo?.is_interno) && processo.situacao !== 'X') {
      return true;
    }
    return false;
  };

  const podeEditar = () => {
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.uo_id === processo?.uo_origem_id && meusAmbientes[i]?.id === processo?.estado_atual_id) {
          return true;
        }
        i += 1;
      }
    } else if (processo?.uo_origem_id === meuAmbiente?.uo_id && processo?.estado_atual_id === meuAmbiente?.id) {
      return true;
    }
    return false;
  };

  const podeEditarNE = () => {
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (!processo?.is_interno && meusAmbientes[i]?.nome === 'Execução Notas externas') {
          return true;
        }
        i += 1;
      }
    } else if (!processo?.is_interno && meuAmbiente?.nome === 'Execução Notas externas') {
      return true;
    }
    return false;
  };

  const podeArquivar = () => {
    if (meuAmbiente?.id === -1) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (
          (meusAmbientes[i]?.is_inicial || meusAmbientes[i]?.is_final) &&
          meusAmbientes[i]?.id === processo?.estado_atual_id
        ) {
          return true;
        }
        i += 1;
      }
    } else if ((meuAmbiente?.is_inicial || meuAmbiente?.is_final) && processo?.estado_atual_id === meuAmbiente?.id) {
      return true;
    }
    return false;
  };

  return (
    <>
      {processo?.destinos?.length !== 0 && (
        <>
          {devolucoes?.length > 0 && (
            <>
              <Tooltip title="DEVOLVER" arrow>
                <Fab color="warning" size="small" variant="soft" onClick={onOpen}>
                  <SvgIconStyle src="/assets/icons/resgatar.svg" />
                </Fab>
              </Tooltip>
              <IntervencaoForm
                isOpenModal={open}
                title="Devolver"
                processo={processo}
                destinos={devolucoes}
                onCancel={onClose}
              />
            </>
          )}

          {seguimentos?.length > 0 && (
            <>
              <Tooltip title={processo?.nome === 'Comissão Executiva' ? 'DESPACHO' : 'ENCAMINHAR'} arrow>
                <Fab color="success" size="small" variant="soft" onClick={onOpen3}>
                  <SvgIconStyle src="/assets/icons/seguimento.svg" />
                </Fab>
              </Tooltip>
              <IntervencaoForm
                isOpenModal={open3}
                title={processo?.nome === 'Comissão Executiva' ? 'Despacho' : 'Encaminhar'}
                processo={processo}
                destinos={seguimentos}
                onCancel={onClose3}
              />
            </>
          )}
        </>
      )}

      {podeFinalizar() && (
        <>
          <Tooltip title="FINALIZAR" arrow>
            <Fab color="success" size="small" variant="soft" onClick={onOpen4}>
              <SvgIconStyle src="/assets/icons/stop.svg" />
            </Fab>
          </Tooltip>
          <DialogConfirmar
            open={open4}
            onClose={onClose4}
            isLoading={isSaving}
            handleOk={handleFinalizar}
            color="success"
            title="Finalizar"
            desc="finalizar este processo"
          />
        </>
      )}

      <Tooltip title="ABANDONAR" arrow>
        <Fab color="warning" size="small" variant="soft" onClick={onOpen2}>
          <SvgIconStyle src="/assets/icons/abandonar.svg" />
        </Fab>
      </Tooltip>

      <DialogConfirmar
        open={open2}
        onClose={onClose2}
        isLoading={isSaving}
        handleOk={handleAbandonar}
        color="warning"
        title="Abandonar"
        desc="abandonar este processo"
      />

      {(podeEditar() || podeEditarNE()) && (
        <Tooltip title="EDITAR" arrow>
          <Fab
            size="small"
            variant="soft"
            color="warning"
            component={RouterLink}
            to={`${PATH_DIGITALDOCS.processos.root}/${processo.id}/editar`}
          >
            <SvgIconStyle src="/assets/icons/editar.svg" />
          </Fab>
        </Tooltip>
      )}

      {processo?.htransicoes?.length === 0 ? (
        <>
          <Tooltip title="ELIMINAR" arrow>
            <Fab color="error" size="small" variant="soft" onClick={onOpen5}>
              <SvgIconStyle src="/assets/icons/trash.svg" />
            </Fab>
          </Tooltip>
          <DialogConfirmar
            open={open5}
            onClose={onClose5}
            isLoading={isSaving}
            handleOk={handleEliminar}
            title="Eliminar"
            desc="eliminar este processo"
          />
        </>
      ) : (
        <>
          {podeArquivar() && (
            <>
              <Tooltip title="ARQUIVAR" arrow>
                <Fab color="error" size="small" variant="soft" onClick={onOpen1}>
                  <SvgIconStyle src="/assets/icons/archive.svg" />
                </Fab>
              </Tooltip>

              <ArquivarForm open={open1} processo={processo} onCancel={onClose1} />
            </>
          )}
        </>
      )}
    </>
  );
}
