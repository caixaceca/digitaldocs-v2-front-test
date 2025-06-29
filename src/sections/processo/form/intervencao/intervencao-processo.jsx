import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { vdt } from '../../../../utils/formatObject';
import { paraLevantamento } from '../../../../utils/validarAcesso';
import { shapeAnexos, appendAnexos } from '../anexos/utils-anexos';
import { fNumber, fCurrency } from '../../../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
import { getInfoProcesso, setModal, updateItem, deleteItem } from '../../../../redux/slices/digitaldocs';
// components
import { DialogConfirmar } from '../../../../components/CustomDialog';
import { DefaultAction, DialogButons } from '../../../../components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFAutocompleteObj } from '../../../../components/hook-form';
//
import Anexos from '../anexos';
import { Confidencialidade, confidenciaIds } from './encaminhar';

// --- CONFIDENCILAIDADES ----------------------------------------------------------------------------------------------

export function ConfidencialidadesForm({ processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({
      confidencial: true,
      perfis_incluidos: confidencialidadesIds(selectedItem?.criterios, 'perfil_incluido_id', '', colaboradores),
      perfis_excluidos: confidencialidadesIds(selectedItem?.criterios, 'perfil_excluido_id', '', colaboradores),
      estados_incluidos: confidencialidadesIds(selectedItem?.criterios, 'estado_incluido_id', 'estado_incluido', []),
      estados_excluidos: confidencialidadesIds(selectedItem?.criterios, 'estado_excluido_id', 'estado_excluido', []),
    }),
    [selectedItem, colaboradores]
  );

  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        perfis_incluidos: confidenciaIds(values, 'perfis_incluidos'),
        perfis_excluidos: confidenciaIds(values, 'perfis_excluidos'),
        estados_incluidos: confidenciaIds(values, 'estados_incluidos'),
        estados_excluidos: confidenciaIds(values, 'estados_excluidos'),
      };

      dispatch(
        updateItem('confidencialidade', JSON.stringify(formData), {
          processoId,
          id: selectedItem?.id,
          msg: 'Confidencialidade atualizado',
          onClose: () => dispatch(getInfoProcesso('confidencialidades', { id: processoId })),
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(setModal())} fullWidth maxWidth="md">
      <DialogTitle>Editar confidencialidade</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Confidencialidade
            perfisIncluidos="perfis_incluidos"
            perfisExcluidos="perfis_excluidos"
            estadosIncluidos="estados_incluidos"
            estadosExcluidos="estados_excluidos"
          />
          <DialogButons edit isSaving={isSaving} onClose={() => dispatch(setModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

export function ColocarPendenteForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { motivosPendencia } = useSelector((state) => state.parametrizacao);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({ motivo: Yup.mixed().required('Motivo de pendência não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ pendenteLevantamento: false, mobs: '', motivo: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = (action) => {
    try {
      const params = { id: selectedItem?.id };
      dispatch(
        updateItem(
          'pendencia',
          JSON.stringify({
            pender: action !== 'eliminar',
            estado_id: selectedItem?.estadoId,
            mobs: action === 'eliminar' ? '' : values?.mobs,
            mpendencia: action === 'eliminar' ? '' : values?.motivo?.id,
          }),
          { ...params, msg: action === 'eliminar' ? 'Pendência eliminada' : 'Processo colocado pendente' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Processo pendente</DialogTitle>
      <DialogContent>
        {selectedItem?.pendente ? (
          <Stack direction="column" spacing={1} sx={{ pt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                Motivo:
              </Typography>
              <Typography>
                {selectedItem?.motivo || motivosPendencia?.find(({ id }) => id === selectedItem?.motivo_id)?.label}
              </Typography>
            </Stack>
            {selectedItem?.obs && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Observação:
                </Typography>
                <Typography>{selectedItem?.obs}</Typography>
              </Stack>
            )}
            <Stack direction="row" sx={{ pt: 3 }} justifyContent="end">
              <DefaultAction button onClick={() => onSubmit('eliminar')} label="Eliminar" />
            </Stack>
          </Stack>
        ) : (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
              {paraLevantamento(selectedItem?.fluxo) && selectedItem?.estado?.includes('Atendimento') && (
                <RHFSwitch
                  name="pendenteLevantamento"
                  label="Pendente de levantamento"
                  onChange={(event, newVal) => {
                    setValue('pendenteLevantamento', newVal, vdt);
                    setValue('mobs', newVal ? 'Para levantamento do pedido' : '', vdt);
                    setValue('motivo', newVal ? motivosPendencia?.find(({ label }) => label === 'Cliente') : null, vdt);
                  }}
                />
              )}
              <RHFAutocompleteObj
                name="motivo"
                label="Motivo"
                options={motivosPendencia}
                disabled={values?.pendenteLevantamento}
                onChange={(event, newVal) => setValue('motivo', newVal, vdt)}
              />
              <RHFTextField name="mobs" label="Observação" disabled={values?.pendenteLevantamento} />
            </Stack>
            <DialogButons edit isSaving={isSaving} onClose={onClose} />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

export function FinalizarNeForm({ id, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(() => ({ cativos: [] }), []);
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async () => {
    try {
      if (selecionados?.length === 0) {
        enqueueSnackbar('Por favor selecionar as contas a serem cativadas', { variant: 'error' });
      } else {
        const params = { id, msg: 'Processo finalizado' };
        dispatch(updateItem('finalizar', JSON.stringify({ cativos: selecionados.map(({ id }) => id) }), params));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleToggle = (value) => () => {
    const currentIndex = selecionados.indexOf(value);
    const novaLista = [...selecionados];
    if (currentIndex === -1) novaLista.push(value);
    else novaLista.splice(currentIndex, 1);
    setSelecionados(novaLista);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Seleciona as contas a serem cativadas</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <TableContainer sx={{ minWidth: 500, mt: 2, position: 'relative', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size="small">Conta</TableCell>
                  <TableCell size="small" align="right">
                    Saldo
                  </TableCell>
                  <TableCell size="small" align="right">
                    Saldo em CVE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItem?.length === 0 ? (
                  <TableRow hover>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Não foi encontrado nenhuma conta disponível para cativo...
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedItem?.map((row) => {
                    const labelId = `checkbox-list-label-${row?.conta}`;
                    return (
                      <TableRow hover key={labelId} onClick={handleToggle(row)}>
                        <TableCell>
                          <Checkbox
                            edge="start"
                            tabIndex={-1}
                            disableRipple
                            sx={{ mt: -0.5 }}
                            checked={selecionados.indexOf(row) !== -1}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                          {row?.conta}
                        </TableCell>
                        <TableCell align="right">
                          {fNumber(row?.saldo)} {row?.moeda}
                        </TableCell>
                        <TableCell align="right">{fCurrency(row?.saldo_cve)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogButons label="Finalizar" isSaving={isSaving} onClose={onClose} hideSubmit={!selecionados?.length} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- FINALIZAR OPE ---------------------------------------------------------------------------------------------------

export function FinalizarOpeForm({ id, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      color="success"
      title="Finalizar"
      desc="finalizar este processo"
      handleOk={() =>
        dispatch(updateItem('finalizar', JSON.stringify({ cativos: [] }), { id, msg: 'Processo finalizado' }))
      }
    />
  );
}

// --- FINALIZAR PROCESSO ----------------------------------------------------------------------------------------------

export function AnexosForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { checklist } = useSelector((state) => state.parametrizacao);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { id, estadoPreso, fluxo_id: fluxoId } = processo || {};

  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const checkList = useMemo(
    () => checklist.filter(({ transicao_id: trId, designacao }) => !trId && designacao !== 'OUTROS'),
    [checklist]
  );

  useEffect(() => {
    dispatch(getFromParametrizacao('checklist', { fluxoId, reset: { val: [] } }));
  }, [dispatch, fluxoId]);

  const formSchema = shapeAnexos(outros, checkList, true);
  const defaultValues = useMemo(
    () => ({ anexos: [], checklist: checkList?.map((doc) => ({ ...doc, anexos: [] })) }),
    [checkList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      appendAnexos(formData, values.anexos, outros, values.checklist);
      if ([...formData.entries()].length > 0) {
        const params = { id, estadoId: estadoPreso, anexos: formData };
        dispatch(updateItem('adicionar-anexos', null, { ...params, msg: 'Anexos adicionados' }));
      } else enqueueSnackbar('Introduza os anexos pretendidos', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Adicionar anexos</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Anexos anexos={[]} outros={!!outros} solto />
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} hideSubmit={!outros && !checkList?.length} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- LIBERTAR PROCESSO -----------------------------------------------------------------------------------------------

export function EliminarReativar({ ids, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      title="Confirmar eliminação de processo"
      desc="marcar este processo como eliminado"
      handleOk={() => dispatch(deleteItem('processo', { ...ids, duplicado: true, msg: 'Processo eliminado' }))}
      content={
        <Stack spacing={1}>
          <Typography variant="body2">
            Ao prosseguir, o processo será marcado como <b>eliminado por duplicação</b>.
          </Typography>
          <Typography variant="body2">
            Esta ação <b>não remove o processo do sistema</b>, apenas o torna <b>inativo</b> para efeitos de
            estatística, análise e utilização.
          </Typography>
          <Typography variant="body2">
            O processo será <b>automaticamente arquivado</b> e permanecerá disponível apenas para <b>consulta</b>.
          </Typography>
          <Typography variant="body2" sx={{ pb: 3 }}>
            A reversão desta ação será possível apenas em situações devidamente justificadas e avaliadas caso a caso.
          </Typography>
        </Stack>
      }
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function confidencialidadesIds(dados, item, label, colaboradores) {
  return (
    dados
      ?.filter((row) => row[item])
      .map((val) => ({
        id: val[item],
        label: label
          ? val[label]
          : colaboradores?.find(({ perfil_id: pid }) => pid === val[item])?.perfil?.displayName ||
            `PerfilID: ${val[item]}`,
      })) || []
  );
}
