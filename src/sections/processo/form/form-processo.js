import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
// @mui
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
// redux
import { resetDados } from '../../../redux/slices/stepper';
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { getSuccess as gSDD, updateItem } from '../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// hooks
import { useNotificacao } from '../../../hooks/useNotificacao';
// components
import Steps from '../../../components/Steps';
import { SearchNotFound } from '../../../components/table';
import { DialogConfirmar, DialogTitleAlt } from '../../../components/CustomDialog';
// sections
import ProcessoCredito from './credito';
import ProcessoExterno from './processo-externo';
import ProcessoInterno from './processo-interno';

// ----------------------------------------------------------------------

ProcessoForm.propTypes = { processo: PropTypes.object, ambientId: PropTypes.number, onCancel: PropTypes.func };

export default function ProcessoForm({ processo, ambientId, onCancel }) {
  const isEdit = !!processo;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fluxo, setFluxo] = useState(null);

  const { activeStep } = useSelector((state) => state.stepper);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { selectedAnexoId, isSaving, done } = useSelector((state) => state.digitaldocs);

  const estado = useMemo(
    () =>
      meusAmbientes?.find(({ id }) => id === processo?.estado_processo?.estado_id) ||
      meusAmbientes?.find(({ id }) => id === ambientId) ||
      meusAmbientes.find(({ isinicial }) => isinicial) ||
      null,
    [ambientId, meusAmbientes, processo?.estado_processo?.estado_id]
  );

  const fluxosList = useMemo(
    () => estado?.fluxos?.filter(({ ativo }) => ativo)?.map((row) => ({ ...row, id: row?.fluxo_id })) || [],
    [estado?.fluxos]
  );

  useEffect(() => {
    const fluxoProcesso = fluxosList?.find(({ id }) => id === processo?.fluxo_id) || null;
    if (fluxoProcesso) setFluxo(fluxoProcesso);
  }, [dispatch, fluxosList, processo?.fluxo_id]);

  useEffect(() => {
    if (fluxo?.id) dispatch(getFromParametrizacao('checklist', { fluxoId: fluxo?.id }));
  }, [dispatch, fluxo?.id]);

  const navigateToProcess = () => {
    if (done === 'Processo adicionado') navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${processo?.id}`);
  };

  const eliminarAnexo = () => {
    const params = { processo: true, processoId: processo?.id, anexo: selectedAnexoId, msg: 'Anexo eliminado' };
    dispatch(updateItem('anexo', null, params));
  };

  useNotificacao({ done, afterSuccess: () => navigateToProcess() });

  const onClose = () => {
    onCancel();
    dispatch(resetDados());
  };

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitleAlt
          title={isEdit ? 'Atualizar processo' : 'Adicionar processo'}
          subtitle={
            <Typography sx={{ color: 'text.secondary', typography: 'caption', fontWeight: 'bold' }}>
              <CircleIcon sx={{ height: 10, width: 18, color: estado?.nome ? 'success.main' : 'error.main' }} />
              {estado?.nome || 'Nenhum estado selecionado...'}
            </Typography>
          }
          stepper={
            fluxo ? (
              <Steps
                sx={{ my: 3 }}
                activeStep={activeStep}
                steps={fluxo?.iscredito ? ['Info. crédito', 'Garantias', 'Anexos'] : ['Dados gerais', 'Anexos']}
              />
            ) : null
          }
          action={
            estado && (
              <Autocomplete
                fullWidth
                size="small"
                value={fluxo}
                disableClearable
                options={fluxosList}
                sx={{ minWidth: { xs: 150, sm: 300, md: 500 } }}
                getOptionLabel={(option) => option?.assunto}
                onChange={(event, newValue) => setFluxo(newValue)}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => <TextField {...params} fullWidth label="Assunto" />}
              />
            )
          }
        />
        <DialogContent>
          {estado ? (
            <>
              {fluxo ? (
                <>
                  {(fluxo?.iscredito && (
                    <ProcessoCredito dados={{ isEdit, processo, fluxo, estado }} onCancel={() => onClose()} />
                  )) ||
                    (fluxo?.isinterno && (
                      <ProcessoInterno dados={{ isEdit, processo, fluxo, estado }} onCancel={() => onClose()} />
                    )) || <ProcessoExterno dados={{ isEdit, processo, fluxo, estado }} onCancel={() => onClose()} />}
                </>
              ) : (
                <SearchNotFound message="Seleciona o assunto do processo que pretendes adicionar..." />
              )}
            </>
          ) : (
            <SearchNotFound message={`Estado atual não permite ${isEdit ? 'editar o' : 'adicionar'} processo...`} />
          )}
        </DialogContent>
      </Dialog>

      {!!selectedAnexoId && (
        <DialogConfirmar
          isSaving={isSaving}
          handleOk={eliminarAnexo}
          desc="eliminar este anexo"
          onClose={() => dispatch(gSDD({ item: 'selectedAnexoId', dados: null }))}
        />
      )}
    </>
  );
}
