import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { getSuccess as gSDD, updateItem } from '../../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// hooks
import { useNotificacao } from '../../../hooks/useNotificacao';
// components
import { SearchNotFound } from '../../../components/table';
import { DialogConfirmar } from '../../../components/CustomDialog';
// sections
import ProcessoCredito from './processo-credito';
import ProcessoExterno from './processo-externo';
import ProcessoInterno from './processo-interno';

// ----------------------------------------------------------------------

ProcessoForm.propTypes = { processo: PropTypes.object, ambientId: PropTypes.number, onCancel: PropTypes.func };

export default function ProcessoForm({ processo, ambientId, onCancel }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fluxo, setFluxo] = useState(null);
  const [estado, setEstaddo] = useState(null);

  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { selectedAnexoId, isSaving, done } = useSelector((state) => state.digitaldocs);

  const isEdit = !!processo;
  const estadoProcesso = useMemo(
    () => meusAmbientes?.find(({ id }) => id === processo?.estado_processo?.estado_id) || null,
    [meusAmbientes, processo?.estado_processo?.estado_id]
  );
  const estadosList = useMemo(
    () =>
      (!isEdit && meusAmbientes?.filter(({ isinicial, observador }) => isinicial && !observador)) ||
      (estadoProcesso && [estadoProcesso]) ||
      [],
    [isEdit, meusAmbientes, estadoProcesso]
  );
  const fluxosList = useMemo(
    () =>
      estado?.fluxos
        ?.filter(({ ativo, credito_funcionario: cf }) => ativo && !cf)
        ?.map((row) => ({ ...row, id: row?.fluxo_id })) || [],
    [estado?.fluxos]
  );

  useEffect(() => {
    if (fluxo?.iscredito) dispatch(getFromParametrizacao('linhas'));
  }, [dispatch, fluxo]);

  useEffect(() => {
    const fluxoProcesso = fluxosList?.find(({ id }) => id === processo?.fluxo_id) || null;
    if (fluxoProcesso) setFluxo(fluxoProcesso);
  }, [dispatch, fluxosList, processo?.fluxo_id]);

  useEffect(() => {
    const estadoDefault = estadoProcesso || estadosList?.find(({ id }) => id === ambientId);
    if (estadoDefault) setEstaddo(estadoDefault);
  }, [ambientId, estadoProcesso, estadosList]);

  const navigateToProcess = () => {
    if (done === 'Processo adicionado') navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/${processo?.id}`);
  };

  const eliminarAnexo = () => {
    const params = { processo: true, processoId: id, anexo: selectedAnexoId, msg: 'Anexo eliminado' };
    dispatch(updateItem('anexo', null, params));
  };

  useNotificacao({ done, afterSuccess: () => navigateToProcess() });

  return (
    <>
      <Dialog open onClose={onCancel} fullWidth maxWidth="lg">
        <DialogTitle>{isEdit ? 'Atualizar processo' : 'Adicionar processo'}</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 1, mt: 3, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Autocomplete
                fullWidth
                value={estado}
                disableClearable
                getOptionLabel={(option) => option?.nome}
                options={(!isEdit && estadosList) || (estado && [estado]) || []}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => <TextField {...params} label="Estado" />}
                onChange={(event, newValue) => {
                  setFluxo(null);
                  setEstaddo(newValue);
                }}
              />
              <Autocomplete
                fullWidth
                value={fluxo}
                disableClearable
                options={fluxosList}
                getOptionLabel={(option) => option?.assunto}
                onChange={(event, newValue) => setFluxo(newValue)}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => <TextField {...params} fullWidth label="Assunto" />}
              />
            </Stack>
          </Card>
          {estado ? (
            <>
              {!fluxo ? (
                <SearchNotFound message="Seleciona o assunto do processo que pretendes adicionar..." />
              ) : (
                <>
                  {fluxo?.iscredito ? (
                    <ProcessoCredito isEdit={isEdit} processo={processo} fluxo={fluxo} estado={estado} />
                  ) : (
                    <>
                      {fluxo?.isinterno ? (
                        <ProcessoInterno isEdit={isEdit} processo={processo} fluxo={fluxo} estado={estado} />
                      ) : (
                        <ProcessoExterno isEdit={isEdit} processo={processo} fluxo={fluxo} estado={estado} />
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <SearchNotFound
              message={`Seleciona o estado ${isEdit ? 'atual do' : 'onde pretendes adicionar o'} processo...`}
            />
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
