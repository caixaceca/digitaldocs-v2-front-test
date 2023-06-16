import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Fab, Tooltip } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { finalizarProcesso, abandonarProcesso, atribuirProcesso } from '../../redux/slices/digitaldocs';
// hooks
import useToggle, { useToggle1, useToggle2, useToggle3, useToggle4, useToggle5 } from '../../hooks/useToggle';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
//
import { IntervencaoForm, FinalizarForm, ArquivarForm } from './IntervencaoForm';

// ----------------------------------------------------------------------

Intervencao.propTypes = { processo: PropTypes.object, colaboradoresList: PropTypes.array };

export default function Intervencao({ processo, colaboradoresList }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { toggle2: open2, onOpen2, onClose2 } = useToggle2();
  const { toggle3: open3, onOpen3, onClose3 } = useToggle3();
  const { toggle4: open4, onOpen4, onClose4 } = useToggle4();
  const { toggle5: open5, onOpen5, onClose5 } = useToggle5();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { isSaving, meusAmbientes, iAmInGrpGerente } = useSelector((state) => state.digitaldocs);
  const fromAgencia = uos?.find((row) => row.id === processo?.uo_origem_id)?.tipo === 'Agências' || false;
  const perfilId = cc?.perfil_id;

  const devolucoes = [];
  const seguimentos = [];
  const destinosFora = [];
  processo.destinos?.forEach((row) => {
    if (processo?.uo_origem_id !== row?.uo_id) {
      destinosFora.push(row?.nome);
    }
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
      cativos: [],
      perfil_id: perfilId,
      fluxoID: processo?.fluxo_id,
      estado_id: processo?.estado_atual_id,
    };
    dispatch(finalizarProcesso(JSON.stringify(formData), processo?.id, mail));
  };

  const handleAbandonar = () => {
    const formData = { perfilID: perfilId, fluxoID: processo?.fluxo_id, estadoID: processo?.estado_atual_id };
    dispatch(abandonarProcesso(formData, processo?.id, mail));
  };

  const podeFinalizar = () => {
    if (processo?.agendado && processo.situacao !== 'X') {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.is_final) {
          return true;
        }
        i += 1;
      }
    }
    return false;
  };

  const podeFinalizarNE = () => {
    if (
      processo?.situacao === 'E' &&
      processo?.operacao === 'Cativo/Penhora' &&
      processo?.nome === 'DOP - Validação Notas Externas'
    ) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.is_final) {
          return true;
        }
        i += 1;
      }
    }
    return false;
  };

  const podeArquivar = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (
        ((meusAmbientes[i]?.is_inicial && fromAgencia && iAmInGrpGerente) ||
          (meusAmbientes[i]?.is_inicial && !fromAgencia) ||
          meusAmbientes[i]?.is_final) &&
        Number(meusAmbientes[i]?.id) === Number(processo?.estado_atual_id)
      ) {
        return true;
      }
      i += 1;
    }
    return false;
  };

  return (
    <>
      {processo?.destinos?.length !== 0 && !processo.ispendente && (
        <>
          {devolucoes?.length > 0 && (
            <>
              <Tooltip title="DEVOLVER" arrow>
                <Fab color="warning" size="small" variant="soft" onClick={onOpen}>
                  <SvgIconStyle src="/assets/icons/resgatar.svg" />
                </Fab>
              </Tooltip>
              <IntervencaoForm
                title="Devolver"
                onCancel={onClose}
                isOpenModal={open}
                processo={processo}
                destinos={devolucoes}
                colaboradoresList={colaboradoresList}
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
                processo={processo}
                onCancel={onClose3}
                destinos={seguimentos}
                colaboradoresList={colaboradoresList}
                title={processo?.nome === 'Comissão Executiva' ? 'Despacho' : 'Encaminhar'}
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

      {podeFinalizarNE() && (
        <>
          <Tooltip title="FINALIZAR" arrow>
            <Fab color="success" size="small" variant="soft" onClick={onOpen5}>
              <SvgIconStyle src="/assets/icons/stop.svg" />
            </Fab>
          </Tooltip>
          <FinalizarForm open={open5} onCancel={onClose5} processo={processo} />
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

      {podeArquivar() && (
        <>
          <Tooltip title="ARQUIVAR" arrow>
            <Fab color="error" size="small" variant="soft" onClick={onOpen1}>
              <SvgIconStyle src="/assets/icons/archive.svg" />
            </Fab>
          </Tooltip>
          <ArquivarForm
            open={open1}
            processo={processo}
            onCancel={onClose1}
            arquivoAg={fromAgencia && iAmInGrpGerente && destinosFora?.length > 0 ? destinosFora : []}
          />
        </>
      )}
    </>
  );
}

Libertar.propTypes = { perfilID: PropTypes.number, processoID: PropTypes.number };

export function Libertar({ perfilID, processoID }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail } = useSelector((state) => state.intranet);
  const { isSaving, done } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'processo libertado') {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const handleAbandonar = () => {
    dispatch(atribuirProcesso(mail, processoID, '', perfilID, 'processo libertado'));
  };

  return (
    <>
      <Tooltip title="LIBERTAR" arrow>
        <Fab color="warning" size="small" variant="soft" onClick={onOpen}>
          <SvgIconStyle src="/assets/icons/abandonar.svg" />
        </Fab>
      </Tooltip>
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isLoading={isSaving}
        handleOk={handleAbandonar}
        color="warning"
        title="Libertar"
        desc="libertar este processo"
      />
    </>
  );
}
