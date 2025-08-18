import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import CircleIcon from '@mui/icons-material/Circle';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
// redux
import { resetDados } from '../../../redux/slices/stepper';
import { setModal } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromParametrizacao, meusFluxos } from '../../../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import Steps from '../../../components/Steps';
import { Fechar } from '../../../components/Actions';
import { FormLoading } from '../../../components/skeleton';
import { SearchNotFoundSmall } from '../../../components/table';
// sections
import ProcessoInterno from './interno';
import ProcessoCredito from './credito';
import ProcessoExterno from './externo';
import ProcessoCON from './comunicacao-op-num';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoForm({ isEdit = false, processo, ambientId }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fluxo, setFluxo] = useState(null);
  const [estado, setEstado] = useState(null);
  const id = useMemo(() => processo?.id || '', [processo?.id]);

  const { activeStep } = useSelector((state) => state.stepper);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { done, processo: newProcesso } = useSelector((state) => state.digitaldocs);

  const fluxosList = useMemo(() => {
    if (!estado?.fluxos) return [];
    return meusFluxos(estado.fluxos).map((row) => ({ ...row, nome: row?.assunto }));
  }, [estado?.fluxos]);

  const estadosList = useMemo(() => meusAmbientes?.filter(({ isinicial }) => isinicial) || [], [meusAmbientes]);

  useEffect(() => {
    dispatch(resetDados());
  }, [dispatch]);

  useEffect(() => {
    setFluxo(null);
  }, [dispatch, estado]);

  useEffect(() => {
    const estado =
      meusAmbientes?.find(({ id }) => id === ambientId) || meusAmbientes.find(({ isinicial }) => isinicial) || null;
    if (estado) setEstado(estado);
  }, [ambientId, meusAmbientes]);

  useEffect(() => {
    const fluxoProcesso = fluxosList?.find(({ id }) => id === processo?.fluxo_id) || null;
    if (fluxoProcesso) setFluxo(fluxoProcesso);
  }, [dispatch, fluxosList, processo?.fluxo_id]);

  useEffect(() => {
    if (!isEdit && fluxo?.id) dispatch(getFromParametrizacao('checklist', { fluxoId: fluxo?.id, reset: { val: [] } }));
  }, [dispatch, isEdit, fluxo?.id]);

  useEffect(() => {
    if (done === 'Processo adicionado') navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${newProcesso?.id}`);
  }, [done, navigate, newProcesso?.id]);

  const onClose = () => {
    dispatch(setModal());
    dispatch(resetDados());
  };

  const changeFluxo = (newValue) => {
    setFluxo(newValue);
    dispatch(resetDados());
  };

  return (
    <Dialog open fullWidth maxWidth={fluxo || (isEdit && !fluxo) ? 'lg' : 'md'}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <CircleIcon sx={{ mr: 0.5, width: 14, color: isEdit ? 'warning.main' : 'success.main' }} />
          {isEdit ? 'Atualizar processo' : 'Adicionar processo'}
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ pb: 2 }}>
          <EstadoAssunto dados={{ value: estado, setValue: setEstado, options: estadosList, isEdit }} />
          <EstadoAssunto dados={{ value: fluxo, setValue: changeFluxo, options: fluxosList, label: 'Assunto' }} />
        </Stack>
        {!!fluxo?.iscon && (
          <Steps
            sx={{ mt: 1, mb: 0 }}
            activeStep={activeStep}
            steps={isEdit ? ['Operação', 'Depositante'] : ['Operação', 'Depositante', 'Anexos']}
          />
        )}
        {!isEdit && !!fluxo?.iscredito && (
          <Steps sx={{ mt: 1, mb: 0 }} activeStep={activeStep} steps={['Dados gerais', 'Garantias', 'Anexos']} />
        )}
        {!isEdit && fluxo && !fluxo?.iscon && !fluxo?.iscredito && (
          <Steps sx={{ mt: 1, mb: 0 }} activeStep={activeStep} steps={['Dados gerais', 'Anexos']} />
        )}
        <Box sx={{ top: 15, right: 15, position: 'absolute' }}>
          <Fechar onClick={() => onClose()} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {isEdit && !fluxo ? (
          <FormLoading />
        ) : (
          <>
            {estado && fluxo ? (
              <>
                {(fluxo?.iscredito && <ProcessoCredito dados={{ isEdit, id, processo, fluxo, estado, onClose }} />) ||
                  (fluxo?.iscon && <ProcessoCON dados={{ isEdit, id, processo, fluxo, estado, onClose }} />) ||
                  (fluxo?.isinterno && (
                    <ProcessoInterno dados={{ isEdit, id, processo, fluxo, estado, onClose }} />
                  )) || <ProcessoExterno dados={{ isEdit, id, processo, fluxo, estado, onClose }} />}
              </>
            ) : (
              <SearchNotFoundSmall
                message={
                  (!estado && 'Seleciona um assunto...') ||
                  (!fluxo && 'Seleciona um assunto...') ||
                  (isEdit && 'Estado atual não permite editar o processo...') ||
                  ''
                }
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EstadoAssunto({ dados }) {
  const { value = null, setValue, options = [], label = 'Estado', isEdit = false } = dados;
  return (
    <Autocomplete
      fullWidth
      size="small"
      value={value}
      disableClearable
      options={options}
      disabled={isEdit}
      getOptionLabel={(option) => option?.nome}
      onChange={(event, newValue) => setValue(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label={label} color="success" variant="filled" />}
    />
  );
}
