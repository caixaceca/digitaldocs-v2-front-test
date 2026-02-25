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
import { PATH_DIGITALDOCS } from '@/routes/paths';
import { resetDados } from '@/redux/slices/stepper';
import { setModal } from '@/redux/slices/digitaldocs';
import { useDispatch, useSelector } from '@/redux/store';
import { getFromParametrizacao, meusFluxos } from '@/redux/slices/parametrizacao';
// routes
// components
import Steps from '@/components/Steps';
import { Fechar } from '@/components/Actions';
import { FormLoading } from '@/components/skeleton';
import { SearchNotFoundSmall } from '@/components/table';
// sections
import ProcessoInterno from './interno';
import ProcessoCredito from './credito';
import ProcessoExterno from './externo';
import ProcessoCON from './comunicacao-op-num';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoForm({ isEdit = false, processo, ambientId }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeStep } = useSelector((state) => state.stepper);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { done, processo: newProcesso } = useSelector((state) => state.digitaldocs);

  const inicialEstado = useMemo(() => {
    if (!meusAmbientes?.length) return null;
    if (isEdit) {
      return meusAmbientes.find((item) => item.id === ambientId) || null;
    }
    return (
      meusAmbientes.find((item) => item.id === ambientId && item.isinicial) ||
      meusAmbientes.find((item) => item.isinicial) ||
      null
    );
  }, [meusAmbientes, ambientId, isEdit]);

  const inicialFluxo = useMemo(() => {
    if (!meusAmbientes || !processo?.fluxo_id) return null;
    const f = meusAmbientes.flatMap((item) => item.fluxos || []).find((f) => f.fluxo_id === processo?.fluxo_id);

    return f ? { ...f, id: processo?.fluxo_id, nome: f?.assunto } : null;
  }, [meusAmbientes, processo?.fluxo_id]);

  const [selectedEstado, setSelectedEstado] = useState(null);
  const [selectedFluxo, setSelectedFluxo] = useState(null);

  const estado = selectedEstado || inicialEstado;
  const fluxo = selectedFluxo || inicialFluxo;

  const id = useMemo(() => processo?.id || '', [processo?.id]);

  const fluxosList = useMemo(() => {
    if (!estado?.fluxos) return [];
    return meusFluxos(estado.fluxos).map((row) => ({ ...row, nome: row?.assunto }));
  }, [estado]);

  const estadosList = useMemo(() => meusAmbientes?.filter(({ isinicial }) => isinicial) || [], [meusAmbientes]);

  useEffect(() => {
    dispatch(resetDados());
  }, [dispatch]);

  useEffect(() => {
    if (!isEdit && fluxo?.id) {
      dispatch(getFromParametrizacao('checklist', { fluxoId: fluxo.id, reset: { val: [] } }));
    }
  }, [dispatch, isEdit, fluxo?.id]);

  useEffect(() => {
    if (done === 'Processo adicionado' && newProcesso?.id) {
      navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${newProcesso.id}`);
    }
  }, [done, navigate, newProcesso?.id]);

  const onClose = () => {
    dispatch(setModal());
    dispatch(resetDados());
  };

  const changeFluxo = (newValue) => {
    setSelectedFluxo(newValue);
    dispatch(resetDados());
  };

  const changeEstado = (newValue) => {
    setSelectedEstado(newValue);
    setSelectedFluxo(null);
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
          <EstadoAssunto dados={{ value: estado, setValue: changeEstado, options: estadosList, isEdit }} />
          <EstadoAssunto dados={{ value: fluxo, setValue: changeFluxo, options: fluxosList, label: 'Assunto' }} />
        </Stack>

        {!!fluxo?.iscon && (
          <Steps
            sx={{ mt: 1, mb: 0 }}
            activeStep={activeStep}
            steps={isEdit ? ['Operação', 'Depositante'] : ['Operação', 'Depositante', 'Anexos']}
          />
        )}

        {!isEdit && fluxo && !fluxo?.iscon && (
          <Steps sx={{ mt: 1, mb: 0 }} activeStep={activeStep} steps={['Dados gerais', 'Anexos']} />
        )}

        <Box sx={{ top: 15, right: 15, position: 'absolute' }}>
          <Fechar onClick={onClose} />
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
                  (!estado && 'Selecione um ambiente...') ||
                  (!fluxo && 'Selecione um assunto...') ||
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
      getOptionLabel={(option) => option?.nome || ''}
      onChange={(event, newValue) => setValue(newValue)}
      isOptionEqualToValue={(option, val) => option?.id === val?.id || option?.fluxo_id === val?.id}
      renderInput={(params) => <TextField {...params} label={label} color="success" variant="filled" />}
    />
  );
}
