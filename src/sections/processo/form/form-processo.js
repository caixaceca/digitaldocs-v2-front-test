import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import DialogTitle from '@mui/material/DialogTitle';
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
import { Fechar } from '../../../components/Actions';
import { FormLoading } from '../../../components/skeleton';
import { SearchNotFound } from '../../../components/table';
import { DialogConfirmar } from '../../../components/CustomDialog';
// sections
import ProcessoInterno from './interno';
import ProcessoCredito from './credito';
import ProcessoExterno from './externo';
import ProcessoCON from './comunicacao-op-num';

// ----------------------------------------------------------------------

ProcessoForm.propTypes = { processo: PropTypes.object, ambientId: PropTypes.number, onCancel: PropTypes.func };

export default function ProcessoForm({ processo, ambientId, onCancel }) {
  const isEdit = !!processo;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fluxo, setFluxo] = useState(null);

  const { activeStep } = useSelector((state) => state.stepper);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { selectedAnexoId, isSaving, done, processo: newProcesso } = useSelector((state) => state.digitaldocs);

  const estado = useMemo(
    () => meusAmbientes?.find(({ id }) => id === ambientId) || meusAmbientes.find(({ isinicial }) => isinicial) || null,
    [ambientId, meusAmbientes]
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

  const eliminarAnexo = () => {
    const params = { processo: true, processoId: processo?.id, anexo: selectedAnexoId, msg: 'Anexo eliminado' };
    dispatch(updateItem('anexo', null, params));
  };

  useNotificacao({
    done,
    afterSuccess: () => {
      if (done === 'Processo adicionado') navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${newProcesso?.id}`);
    },
  });

  const onClose = () => {
    onCancel();
    dispatch(resetDados());
  };

  const changeFluxo = (newValue) => {
    setFluxo(newValue);
    dispatch(resetDados());
  };

  return (
    <>
      <Dialog open fullWidth maxWidth={fluxo ? 'lg' : 'md'}>
        <DialogTitle sx={{ p: 0 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3} sx={{ p: 2 }}>
            <Stack>
              {isEdit ? 'Atualizar processo' : 'Adicionar processo'}
              <Typography sx={{ color: 'text.secondary', typography: 'caption', fontWeight: 'bold' }}>
                <CircleIcon sx={{ height: 10, width: 18, color: estado?.nome ? 'success.main' : 'error.main' }} />
                {estado?.nome || 'Nenhum estado selecionado...'}
              </Typography>
            </Stack>
            {fluxo && <Assunto dados={{ fluxo, changeFluxo, fluxosList, small: true }} />}
          </Stack>
          {fluxo && (
            <Steps
              sx={{ mt: 1, mb: 0 }}
              activeStep={activeStep}
              // sx={{ p: 1, mt: 1, mb: 0, bgcolor: 'background.neutral' }}
              steps={
                (fluxo?.iscredito && ['Info. crédito', 'Garantias', 'Anexos']) ||
                (fluxo?.iscon && ['Operação', 'Depositante', 'Anexos']) || ['Dados gerais', 'Anexos']
              }
            />
          )}
          <Box sx={{ top: 15, right: 15, position: 'absolute' }}>
            <Fechar handleClick={() => onClose()} />
          </Box>
        </DialogTitle>
        <DialogContent>
          {isEdit && !fluxo ? (
            <FormLoading />
          ) : (
            <>
              {estado && fluxo ? (
                <>
                  {(fluxo?.iscredito && <ProcessoCredito dados={{ isEdit, processo, fluxo, estado, onClose }} />) ||
                    (fluxo?.iscon && <ProcessoCON dados={{ isEdit, processo, fluxo, estado, onClose }} />) ||
                    (fluxo?.isinterno && <ProcessoInterno dados={{ isEdit, processo, fluxo, estado, onClose }} />) || (
                      <ProcessoExterno dados={{ isEdit, processo, fluxo, estado, onClose }} />
                    )}
                </>
              ) : (
                <>
                  {!fluxo ? (
                    <Stack justifyContent="center" alignItems="center" sx={{ py: 5, px: { xs: 0, md: 10 } }}>
                      <Assunto dados={{ fluxo, changeFluxo, fluxosList }} />
                    </Stack>
                  ) : (
                    <SearchNotFound message={isEdit ? '' : `Estado atual não permite editar o processo...`} />
                  )}
                </>
              )}
            </>
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

// --------------------------------------------------------------------------------------------------------------------------------------------

Assunto.propTypes = { dados: PropTypes.object };

export function Assunto({ dados }) {
  const { fluxo, changeFluxo, fluxosList, small } = dados;
  return (
    <Autocomplete
      value={fluxo}
      disableClearable
      options={fluxosList}
      size={small ? 'small' : 'medium'}
      getOptionLabel={(option) => option?.assunto}
      onChange={(event, newValue) => changeFluxo(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      sx={{ minWidth: { xs: 1, md: small ? 450 : 1 }, pr: { xs: 0, md: 5 } }}
      renderInput={(params) => (
        <TextField {...params} fullWidth label="Assunto" variant="standard" focused={small} color="success" />
      )}
    />
  );
}
