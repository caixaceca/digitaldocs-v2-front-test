import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import Accordion from '@mui/material/Accordion';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import DialogContentText from '@mui/material/DialogContentText';
// utils
import { fNumber, fCurrency } from '../../../utils/formatNumber';
import { paraLevantamento, noEstado, findColaboradores } from '../../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { backStep, resetStep, updateDados } from '../../../redux/slices/stepper';
import { updateItem, selectAnexo, closeModal } from '../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../hooks/useAnexos';
import { getComparator, applySort } from '../../../hooks/useTable';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFUploadMultiFile,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
import Steps from '../../../components/Steps';
import { DialogConfirmar } from '../../../components/CustomDialog';
import { DefaultAction, DialogButons, ButtonsStepper, AnexosExistente } from '../../../components/Actions';

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

EncaminharStepper.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
  colaboradoresList: PropTypes.array,
};

export function EncaminharStepper({ title, destinos, gerencia = false, colaboradoresList = [], onClose }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);
  const destinosParalelo = useMemo(() => destinos?.filter((row) => row?.paralelo), [destinos]);
  const destinosSingulares = useMemo(() => destinos?.filter((row) => !row?.paralelo), [destinos]);
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
          {title?.charAt(0).toUpperCase() + title?.slice(1)?.toLowerCase()} processo
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            {destinosParalelo?.length > 0 && destinosSingulares?.length > 0 && (
              <FormControlLabel
                label="Envio em paralelo"
                sx={{ justifyContent: 'center' }}
                control={<Switch checked={inParalelo} />}
                onChange={(event, newValue) => {
                  dispatch(resetStep());
                  setInParalelo(newValue);
                }}
              />
            )}
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {!inParalelo && <Steps activeStep={activeStep} steps={['Destino', 'Outros']} />}
        {activeStep === 0 && (
          <>
            {inParalelo ? (
              <EncaminharEmParalelo destinos={destinosParalelo} onClose={onClose} />
            ) : (
              <EncaminharEmSerie title={title} onClose={onClose} gerencia={gerencia} destinos={destinosSingulares} />
            )}
          </>
        )}
        {activeStep === 1 && <OutrosEmSerie title={title} colaboradoresList={colaboradoresList} gerencia={gerencia} />}
      </DialogContent>
    </Dialog>
  );
}

// --- ENCAMINHAR EM SÉRIE ---------------------------------------------------------------------------------------------

EncaminharEmSerie.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
};

export function EncaminharEmSerie({ title, destinos, gerencia = false, onClose }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { motivosTransicao } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Escolhe o estado'),
    motivo_devolucao: title === 'DEVOLVER' && Yup.mixed().required('Indica o motivo da devolução'),
  });

  const defaultValues = useMemo(
    () => ({
      mobs: dadosStepper?.mobs || '',
      anexos: dadosStepper?.anexos || [],
      noperacao: dadosStepper?.noperacao || '',
      observacao: dadosStepper?.observacao || '',
      motivo_devolucao: dadosStepper?.motivo_devolucao || null,
      parecer_favoravel: dadosStepper?.parecer_favoravel || null,
      estado: dadosStepper?.estado || (destinos?.length === 1 && destinos?.[0]) || null,
    }),
    [dadosStepper, destinos]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const temNumOperacao = useMemo(() => values?.estado?.hasopnumero, [values?.estado?.hasopnumero]);
  const aberturaSemEntGer = useMemo(
    () =>
      gerencia &&
      values?.estado &&
      !processo?.entidade &&
      title === 'ENCAMINHAR' &&
      processo?.assunto === 'Abertura de conta' &&
      !values?.estado?.label?.includes('Atendimento'),
    [gerencia, processo?.assunto, processo?.entidade, title, values?.estado]
  );

  const onSubmit = async () => {
    dispatch(updateDados({ forward: true, dados: values }));
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  useEffect(() => {
    if (mail && perfilId && values?.estado?.estado_final_id) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: values?.estado?.estado_final_id }));
    }
  }, [dispatch, mail, perfilId, setValue, values?.estado?.estado_final_id]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={temNumOperacao ? 6 : 8}>
          <RHFAutocompleteObject name="estado" label="Estado" disableClearable options={destinos} />
        </Grid>
        {aberturaSemEntGer ? (
          <Grid item xs={12}>
            <Typography>
              Processo de <b>Abertura de Conta</b> não pode ser encaminhado sem <b>entidade(s)</b>!
            </Typography>
            <Typography>
              Por favor edita o processo, adicionando a(s) entidade(s) e depois prossiga com o devido encaminhamento.
            </Typography>
          </Grid>
        ) : (
          <>
            {temNumOperacao && (
              <Grid item xs={12} sm={6} md={3}>
                <RHFNumberField name="noperacao" required label="Nº de operação" />
              </Grid>
            )}
            <Grid item xs={12} sm={temNumOperacao ? 6 : 12} md={temNumOperacao ? 3 : 4}>
              <RHFAutocompleteSimple
                label="Parecer"
                name="parecer_favoravel"
                options={['Favorável', 'Não favorável']}
              />
            </Grid>
            {title === 'DEVOLVER' && (
              <Grid item xs={12}>
                <RHFAutocompleteObject name="motivo_devolucao" label="Motivo da devolução" options={motivosTransicao} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField multiline rows={4} name="observacao" label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
            </Grid>
          </>
        )}
      </Grid>
      <ButtonsStepper onCancel={onClose} isSaving={isSaving} labelCancel="Cancelar" hideSubmit={aberturaSemEntGer} />
    </FormProvider>
  );
}

// --- CONFIDENCILAIDADE E OUTROS --------------------------------------------------------------------------------------

OutrosEmSerie.propTypes = {
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  colaboradoresList: PropTypes.array,
};

export function OutrosEmSerie({ title, gerencia = false, colaboradoresList = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { motivosPendencia } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const cliente = useMemo(() => motivosPendencia?.find((row) => row?.label === 'Cliente'), [motivosPendencia]);
  const criador = useMemo(
    () => colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase()),
    [colaboradores, processo?.criador]
  );

  const formSchema = Yup.object().shape({
    atribuir: Yup.boolean(),
    pendente: Yup.boolean(),
    pendenteLevantamento: Yup.boolean(),
    colaborador: Yup.mixed().when(['atribuir'], {
      is: (atribuir) => atribuir,
      then: () => Yup.mixed().required().label('Colaborador'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    motivo_pendencia: Yup.mixed().when(['pendente', 'pendenteLevantamento'], {
      is: (pendente, pendenteLevantamento) => pendente && !pendenteLevantamento,
      then: () => Yup.mixed().required().label('Motivo de pendência'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      mobs: dadosStepper?.mobs || '',
      pendente: dadosStepper?.pendente || false,
      atribuir: dadosStepper?.atribuir || false,
      colaborador: dadosStepper?.colaborador || null,
      confidencial: dadosStepper?.confidencial || false,
      perfis_incluidos: dadosStepper?.perfis_incluidos || [],
      perfis_excluidos: dadosStepper?.perfis_excluidos || [],
      estados_incluidos: dadosStepper?.estados_incluidos || [],
      estados_excluidos: dadosStepper?.estados_excluidos || [],
      motivo_pendencia: dadosStepper?.motivo_pendencia || null,
      pendenteLevantamento: dadosStepper?.pendenteLevantamento || false,
    }),
    [dadosStepper]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('noperacao', dadosStepper?.noperacao);
      formData.append('observacao', dadosStepper?.observacao);
      formData.append('transicao_id ', dadosStepper?.estado?.id);
      if (dadosStepper?.motivo_devolucao?.id) {
        formData.append('motivo_id ', dadosStepper?.motivo_devolucao?.id);
      }
      if (dadosStepper?.parecer_favoravel === 'Favorável') {
        formData.append('parecer_favoravel', true);
      } else if (dadosStepper?.parecer_favoravel === 'Não favorável') {
        formData.append('parecer_favoravel', false);
      }
      if (values.atribuir && values?.colaborador) {
        formData.append('perfil_afeto_id', values?.colaborador?.id);
      } else if (
        !!criador &&
        !paraLevantamento(processo?.assunto) &&
        dadosStepper?.estado?.label?.includes('Atendimento')
      ) {
        formData.append('perfil_afeto_id', criador?.perfil_id);
      }
      if (values?.pendente && values?.pendenteLevantamento && cliente?.id) {
        formData.append('pender', true);
        formData.append('mpendencia', cliente?.id);
        formData.append('mobs', 'Para levantamento do pedido');
      } else if (values?.pendente && values?.motivo_pendencia?.id) {
        formData.append('pender', true);
        formData.append('mpendencia', values?.motivo_pendencia?.id);
        formData.append('mobs', values?.mobs);
      }
      if (values?.confidencial) {
        values?.perfis_incluidos?.forEach((item) => {
          formData.append('confidencia.perfis_incluidos', item?.id);
        });
        values?.perfis_excluidos?.forEach((item) => {
          formData.append('confidencia.perfis_excluidos', item?.id);
        });
        values?.estados_incluidos?.forEach((item) => {
          formData.append('confidencia.estados_incluidos', item?.id);
        });
        values?.estados_excluidos?.forEach((item) => {
          formData.append('confidencia.estados_excluidos', item?.id);
        });
      }
      await dadosStepper?.anexos?.forEach((row) => {
        formData.append('anexos', row);
      });

      dispatch(
        updateItem('encaminhar serie', formData, {
          mail,
          perfilId,
          id: processo.id,
          msg: title === 'DEVOLVER' ? 'Processo devolvido' : 'Processo encaminhado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const podeAtribuir = useMemo(
    () =>
      colaboradoresList?.length > 0 &&
      ((gerencia && dadosStepper?.estado?.label?.includes('Atendimento')) ||
        processo?.estado_atual === 'Devolução AN' ||
        processo?.estado_atual === 'Diário'),
    [colaboradoresList?.length, gerencia, dadosStepper?.estado?.label, processo?.estado_atual]
  );
  const podeColocarPendente = useMemo(
    () => gerencia && dadosStepper?.estado?.label?.includes('Atendimento'),
    [dadosStepper?.estado?.label, gerencia]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {processo?.versao !== 'v1' || podeAtribuir || podeColocarPendente ? (
        <Stack spacing={3}>
          {/* CONFIDENCILAIDADE */}
          {processo?.versao !== 'v1' && (
            <Stack>
              <Accordion
                expanded={values?.confidencial}
                onChange={() => setValue('confidencial', !values?.confidencial)}
              >
                <AccordionSummary sx={{ py: 0.75 }}>Confidencialidade</AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Confidencialidade
                    perfisIncluidos="perfis_incluidos"
                    perfisExcluidos="perfis_excluidos"
                    estadosIncluidos="estados_incluidos"
                    estadosExcluidos="estados_excluidos"
                  />
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}

          {/* ATRIBUIÇÃO */}
          {podeAtribuir && (
            <Stack>
              <Accordion expanded={values?.atribuir} onChange={() => setValue('atribuir', !values?.atribuir)}>
                <AccordionSummary sx={{ py: 0.75 }}>Atribuir processo</AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <RHFAutocompleteObject name="colaborador" label="Colaborador" options={colaboradoresList} />
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}

          {/* PENDÊNCIA */}
          {podeColocarPendente && (
            <Stack>
              <Accordion expanded={values?.pendente} onChange={() => setValue('pendente', !values?.pendente)}>
                <AccordionSummary sx={{ py: 0.75 }}>Enviar como pendente</AccordionSummary>
                <AccordionDetails sx={{ pt: paraLevantamento(processo?.assunto) ? 2 : 0 }}>
                  {paraLevantamento(processo?.assunto) && (
                    <RHFSwitch otherSx={{ mt: 0 }} name="pendenteLevantamento" label="Pendente de levantamento" />
                  )}
                  {!values?.pendenteLevantamento && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 2 }}>
                      <RHFAutocompleteObject
                        label="Motivo"
                        name="motivo_pendencia"
                        options={motivosPendencia}
                        sx={{ width: { sm: '50%' } }}
                      />
                      <RHFTextField name="mobs" label="Observação pendência" />
                    </Stack>
                  )}
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack sx={{ textAlign: 'center', color: 'text.secondary', typography: 'body2', py: 2 }}>
          O encaminhamento deste processo, neste estado, não permite a adição de mais informações,
          <br />
          Podes ignorar este passo e continuar com o encaminhamento.
        </Stack>
      )}
      <ButtonsStepper
        label="Enviar"
        labelCancel="Voltar"
        onCancel={() => {
          dispatch(backStep());
          dispatch(updateDados({ dados: values }));
        }}
        isSaving={isSaving}
      />
    </FormProvider>
  );
}

// --- ENCAMINHAR EM PARALELO ------------------------------------------------------------------------------------------

EncaminharEmParalelo.propTypes = { onClose: PropTypes.func, destinos: PropTypes.array };

export function EncaminharEmParalelo({ destinos, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    destinos_par: Yup.array(Yup.object({ estado: Yup.mixed().required('Escolhe o estado') })),
  });

  const defaultValues = useMemo(
    () => ({
      destinos_par: [
        {
          estado: null,
          observacao: '',
          confidencial: false,
          perfis_incluidos: [],
          perfis_excluidos: [],
          estados_incluidos: [],
          estados_excluidos: [],
        },
        {
          estado: null,
          observacao: '',
          confidencial: false,
          perfis_incluidos: [],
          perfis_excluidos: [],
          estados_incluidos: [],
          estados_excluidos: [],
        },
      ],
    }),
    []
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'destinos_par' });

  const onSubmit = async () => {
    try {
      const formData = [];
      values?.destinos_par?.forEach((row) => {
        if (processo?.versao === 'v1') {
          formData?.push({ observacao: row?.observacao, transicao_id: row?.estado?.id });
        } else {
          formData?.push({
            observacao: row?.observacao,
            transicao_id: row?.estado?.id,
            confidencia: {
              perfis_incluidos: confidenciaIds(row, 'perfis_incluidos'),
              perfis_excluidos: confidenciaIds(row, 'perfis_excluidos'),
              estados_incluidos: confidenciaIds(row, 'estados_incluidos'),
              estados_excluidos: confidenciaIds(row, 'estados_excluidos'),
            },
          });
        }
      });
      dispatch(
        updateItem('encaminhar paralelo', JSON.stringify(formData), {
          mail,
          perfilId,
          id: processo.id,
          msg: 'Processo encaminhado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {fields.map((item, index) => (
          <Paper key={`destino_${index}`} variant="elevation" elevation={5} sx={{ flexGrow: 1, p: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box variant="elevation" elevation={3} sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <RHFAutocompleteObject
                      label="Estado"
                      disableClearable
                      name={`destinos_par[${index}].estado`}
                      options={applyFilter(
                        destinos,
                        values?.destinos_par?.map((row) => row?.estado?.id)
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                      <RHFTextField
                        multiline
                        minRows={1}
                        maxRows={2}
                        label="Observação"
                        name={`destinos_par[${index}].observacao`}
                      />
                    </Stack>
                  </Grid>
                  {processo?.versao !== 'v1' && (
                    <Grid item xs={12}>
                      <RHFSwitch
                        otherSx={{ mt: 0 }}
                        label="Confidencialidade"
                        name={`destinos_par[${index}].confidencial`}
                      />
                      {values?.destinos_par?.[index]?.confidencial && (
                        <Confidencialidade
                          perfisIncluidos={`destinos_par[${index}].perfis_incluidos`}
                          perfisExcluidos={`destinos_par[${index}].perfis_excluidos`}
                          estadosIncluidos={`destinos_par[${index}].estados_incluidos`}
                          estadosExcluidos={`destinos_par[${index}].estados_excluidos`}
                        />
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
              {fields?.length > 2 && (
                <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Stack direction="row" alignItems="right" justifyContent="right" sx={{ mt: 2 }}>
        <DefaultAction
          small
          button
          label="Adicionar"
          handleClick={() =>
            append({
              estado: null,
              observacao: '',
              confidencial: false,
              perfis_incluidos: [],
              perfis_excluidos: [],
              estados_incluidos: [],
              estados_excluidos: [],
            })
          }
        />
      </Stack>
      <ButtonsStepper onCancel={onClose} isSaving={isSaving} labelCancel="Cancelar" />
    </FormProvider>
  );
}

Confidencialidade.propTypes = {
  perfisIncluidos: PropTypes.string,
  perfisExcluidos: PropTypes.string,
  estadosIncluidos: PropTypes.string,
  estadosExcluidos: PropTypes.string,
};

export function Confidencialidade({ estadosIncluidos, estadosExcluidos, perfisIncluidos, perfisExcluidos }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { estados } = useSelector((state) => state.parametrizacao);

  return (
    <>
      <Divider sx={{ mb: 1.5 }}>
        <Chip label="ATRIBUIR ACESSO" size="small" />
      </Divider>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <RHFAutocompleteObject
          multiple
          limitTags={1}
          label="Estados"
          disableCloseOnSelect
          name={estadosIncluidos}
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
        />
        <RHFAutocompleteObject
          multiple
          limitTags={1}
          disableCloseOnSelect
          label="Colaboradores"
          name={perfisIncluidos}
          options={colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }))}
        />
      </Stack>
      <Divider sx={{ mt: 3, mb: 1.5 }}>
        <Chip label="REMOVER ACESSO" size="small" />
      </Divider>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <RHFAutocompleteObject
          multiple
          limitTags={1}
          label="Estados"
          disableCloseOnSelect
          name={estadosExcluidos}
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
        />
        <RHFAutocompleteObject
          multiple
          limitTags={1}
          disableCloseOnSelect
          label="Colaboradores"
          name={perfisExcluidos}
          options={colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }))}
        />
      </Stack>
    </>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

FinalizarForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func, cativos: PropTypes.array };

export function FinalizarForm({ id, cativos, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(() => ({ cativos: [] }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      if (selecionados?.length === 0) {
        enqueueSnackbar('Por favor selecionar as contas a serem cativadas', { variant: 'error' });
      } else {
        values.cativos = selecionados.map((row) => row?.id);
        dispatch(
          updateItem('finalizar', JSON.stringify({ cativos: [selecionados.map((row) => row?.id)] }), {
            id,
            mail,
            perfilId,
            msg: 'Processo finalizado',
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleToggle = (value) => () => {
    const currentIndex = selecionados.indexOf(value);
    const novaLista = [...selecionados];
    if (currentIndex === -1) {
      novaLista.push(value);
    } else {
      novaLista.splice(currentIndex, 1);
    }
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
                  <TableCell>Conta</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="right">Saldo em CVE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cativos?.length === 0 ? (
                  <TableRow hover>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Não foi encontrado nenhuma conta disponível para cativo...
                    </TableCell>
                  </TableRow>
                ) : (
                  cativos?.map((row) => {
                    const labelId = `checkbox-list-label-${row}`;
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
          <DialogButons label="Finalizar" isSaving={isSaving} onCancel={onClose} hideSubmit={!selecionados?.length} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- LIBERTAR PROCESSO -----------------------------------------------------------------------------------------------

LibertarForm.propTypes = { perfilID: PropTypes.number, processoID: PropTypes.number, onClose: PropTypes.func };

export function LibertarForm({ perfilID, processoID, onClose }) {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const hanndleLibertar = () => {
    dispatch(updateItem('atribuir', '', { mail, perfilID, processoID, perfilIDAfeto: '', msg: 'Processo libertado' }));
  };

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      handleOk={hanndleLibertar}
      color="warning"
      title="Libertar"
      desc="libertar este processo"
    />
  );
}

// --- PARECER INDIVIDUAL/ESTADO ---------------------------------------------------------------------------------------

ParecerForm.propTypes = { estado: PropTypes.bool, onCancel: PropTypes.func, processoId: PropTypes.number };

export function ParecerForm({ onCancel, processoId, estado = false }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, selectedAnexoId, isSaving } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = useMemo(() => selectedItem?.anexos?.filter((row) => row?.ativo), [selectedItem?.anexos]);
  const isEdit =
    selectedItem?.parecer_em && (selectedItem?.parecer_favoravel === true || selectedItem?.parecer_favoravel === false);

  const formSchema = Yup.object().shape({
    parecer: Yup.string().required('Parecer não pode ficar vazio'),
    observacao: Yup.string().required('Descrição não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      validado: selectedItem?.validado || false,
      observacao: selectedItem?.observacao || '',
      parecer:
        (isEdit && selectedItem?.parecer_favoravel === true && 'Favorável') ||
        (isEdit && selectedItem?.parecer_favoravel === false && 'Não favorável') ||
        null,
    }),
    [selectedItem, isEdit]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const enviarParecer = async (formData) => {
    dispatch(
      updateItem(estado ? 'parecer estado' : 'parecer individual', formData, {
        mail,
        perfilId,
        processoId,
        id: selectedItem.id,
        msg: 'Parecer enviado',
      })
    );
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      await values?.anexos?.forEach((row) => formData.append('anexos', row));
      await formData.append('parecer_favoravel', values.parecer === 'Favorável');
      await formData.append(estado ? 'observacao' : 'descritivo', values.observacao);
      await formData.append(estado ? 'estado_id' : 'validado', estado ? selectedItem.estado_id : values.validado);
      enviarParecer(formData);
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const eliminarParecer = async () => {
    const formData = new FormData();
    await formData.append('estado_id ', selectedItem.estado_id);
    enviarParecer(formData);
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  const eliminarAnexo = () => {
    dispatch(
      updateItem('anexo', null, {
        mail,
        perfilId,
        processoId,
        msg: 'Anexo eliminado',
        anexo: selectedAnexoId,
        individual: estado ? 'false' : 'true',
        parecerId: estado ? '' : selectedItem?.id,
        estadoId: estado ? selectedItem?.id : selectedItem?.processo_estado_id,
      })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>Parecer</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={estado ? 12 : 6}>
              <RHFAutocompleteSimple name="parecer" label="Parecer" options={['Favorável', 'Não favorável']} />
            </Grid>
            {!estado && (
              <Grid item xs={12} sm={6}>
                <RHFSwitch name="validado" label="Parecer final" />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={10} label="Descrição" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              {anexosAtivos?.length > 0 && (
                <AnexosExistente anexos={anexosAtivos?.map((row) => ({ ...row, name: row?.nome }))} anexo />
              )}
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            label="Enviar"
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={() => eliminarParecer()}
            desc={isEdit ? 'eliminar o parecer' : ''}
          />
        </FormProvider>

        {!!selectedAnexoId && (
          <DialogConfirmar
            isSaving={isSaving}
            handleOk={eliminarAnexo}
            desc="eliminar este anexo"
            onClose={() => dispatch(selectAnexo(null))}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

ResgatarForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function ResgatarForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const resgatarClick = () => {
    dispatch(updateItem('resgatar', null, { mail, ...dados, perfilId, msg: 'Processo resgatado' }));
    onClose();
  };

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      handleOk={() => resgatarClick()}
      color="warning"
      title="Resgatar"
      desc="resgatar este processo"
    />
  );
}

// --- CANCELAR/FECHAR PROCESSO EM PARALELO ----------------------------------------------------------------------------

CancelarForm.propTypes = {
  id: PropTypes.number,
  fechar: PropTypes.bool,
  onClose: PropTypes.func,
  estadoId: PropTypes.number,
};

export function CancelarForm({ id, estadoId, fechar = false, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const formSchema = Yup.object().shape({ observacao: Yup.string().required('Observação não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ observacao: fechar ? '' : 'Resgatar envio em paralelo.', estado_id: estadoId }),
    [estadoId, fechar]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('cancelar', JSON.stringify(values), {
          id,
          mail,
          fechar,
          perfilId,
          msg: fechar ? 'Pareceres fechado' : 'Processo resgatado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={fechar ? 'sm' : 'xs'}>
      <DialogTitle>{fechar ? 'Fechar' : 'Resgatar'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              {fechar ? (
                <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
              ) : (
                <DialogContentText>Tens a certeza de que pretendes resgatar este processo?</DialogContentText>
              )}
            </Grid>
          </Grid>
          <DialogButons color="warning" onCancel={onClose} isSaving={isSaving} label={fechar ? 'Fechar' : 'Ok'} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- ATRIBUIR/AFETAR PROCESSO ----------------------------------------------------------------------------------------

AtribuirForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function AtribuirForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const defaultValues = useMemo(
    () => ({ perfil: colaboradoresList?.find((row) => row?.id === dados?.perfilIdA) || null }),
    [colaboradoresList, dados?.perfilIdA]
  );
  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('atribuir', '', {
          mail,
          perfilId,
          ...dados,
          id: values?.perfil?.id || '',
          msg: values?.perfil?.id ? 'Processo atribuído' : 'Atribuição eliminada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Atribuir processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFAutocompleteObject
            name="perfil"
            sx={{ pt: 3 }}
            label="Colaborador"
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
          />
          <DialogButons label="Atribuir" isSaving={isSaving} onCancel={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

export function ColocarPendenteForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { motivosPendencia } = useSelector((state) => state.parametrizacao);
  const cliente = useMemo(() => motivosPendencia?.find((row) => row?.label === 'Cliente'), [motivosPendencia]);

  const formSchema = Yup.object().shape({ motivo: Yup.mixed().required('Motivo de pendência não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ pendenteLevantamento: false, mobs: '', motivo: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'pendencia',
          JSON.stringify({
            pender: !!values?.motivo?.id,
            fluxo_id: processo?.fluxo_id,
            mpendencia: values?.motivo?.id || '',
            mobs: values?.motivo?.id && values?.mobs ? values?.mobs : '',
          }),
          {
            mail,
            perfilId,
            id: processo?.id,
            fluxoId: processo?.fluxo_id,
            msg: 'Processo colocado pendente',
            estadoId: processo?.estado_atual_id || processo?.estado_id,
            atribuir:
              (noEstado(processo?.estado_processo?.estado, ['Atendimento']) && !paraLevantamento(processo?.assunto)) ||
              !noEstado(processo?.estado_processo?.estado, ['Atendimento', 'Gerência', 'Caixa Principal']),
          }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const eliminarPendencia = () => {
    dispatch(
      updateItem(
        'pendencia',
        JSON.stringify({ pender: false, fluxo_id: processo?.fluxo_id, mpendencia: '', mobs: '' }),
        { mail, perfilId, id: processo?.id, fluxoId: processo?.fluxo_id, msg: 'Pendência eliminada' }
      )
    );
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} fullWidth maxWidth="sm">
      <DialogTitle>Processo pendente</DialogTitle>
      <DialogContent>
        {processo?.motivo_pendencia_id && processo?.motivo ? (
          <Stack direction="column" spacing={1} sx={{ pt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ color: 'text.secondary' }}>Motivo:</Typography>
              <Typography>{processo?.motivo}</Typography>
            </Stack>
            {processo?.observacao_motivo_pendencia && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Observação:</Typography>
                <Typography>{processo?.observacao_motivo_pendencia}</Typography>
              </Stack>
            )}
            <Stack direction="row" sx={{ pt: 2 }} justifyContent="end">
              <DefaultAction color="error" button handleClick={() => eliminarPendencia()} label="Eliminar" />
            </Stack>
          </Stack>
        ) : (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
              {paraLevantamento(processo?.assunto) && processo?.estado_atual?.includes('Atendimento') && (
                <RHFSwitch
                  name="pendenteLevantamento"
                  label="Pendente de levantamento"
                  onChange={(event, newValue) => {
                    setValue('pendenteLevantamento', newValue);
                    setValue('mobs', newValue ? 'Para levantamento do pedido' : '');
                    setValue('motivo', newValue ? { id: cliente?.id, label: cliente?.motivo } : null);
                  }}
                />
              )}
              <RHFAutocompleteObject
                name="motivo"
                label="Motivo"
                options={motivosPendencia}
                readOnly={values?.pendenteLevantamento}
              />
              <RHFTextField name="mobs" label="Observação" inputProps={{ readOnly: values?.pendenteLevantamento }} />
            </Stack>
            <DialogButons edit isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

DomiciliarForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func, estadoId: PropTypes.number };

export function DomiciliarForm({ id, estadoId, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { estados } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    uo: Yup.mixed().required('Unidade orgânica não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ uo: null, estado: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'domiciliar',
          JSON.stringify({
            estado_id: estadoId,
            uo_destino_id: values?.uo?.id,
            observacao: values?.observacao,
            estado_destino_id: values?.estado?.id,
          }),
          { mail, perfilId, id, msg: 'Processo domiciliado' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Domiciliar processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObject
              name="uo"
              label="Unidade orgânica"
              onChange={(event, newValue) => {
                setValue('estado', null);
                setValue('uo', newValue);
              }}
              options={uos?.map((row) => ({ id: row?.id, label: row?.label }))}
            />
            {values?.uo?.id && (
              <RHFAutocompleteObject
                name="estado"
                label="Estado"
                options={estados
                  ?.filter((item) => item?.uo_id === values?.uo?.id)
                  ?.map((row) => ({ id: row?.id, label: row?.nome }))}
              />
            )}
            <RHFTextField name="observacao" multiline rows={3} label="Observação" />
          </Stack>
          <DialogButons color="warning" label="Enviar" isSaving={isSaving} onCancel={() => onClose()} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- ABANDONAR PROCESSO ----------------------------------------------------------------------------------------------

AbandonarForm.propTypes = { dados: PropTypes.func, isSaving: PropTypes.bool, onClose: PropTypes.func };

export function AbandonarForm({ dados, isSaving, onClose }) {
  const dispatch = useDispatch();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const abandonarClick = () => {
    dispatch(updateItem('abandonar', null, { mail, perfilId, msg: 'Processo abandonado', ...dados }));
  };

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      handleOk={() => abandonarClick()}
      color="warning"
      title="Abandonar"
      desc="abandonar este processo"
    />
  );
}

// --- CONFIDENCILAIDADES ----------------------------------------------------------------------------------------------

ConfidencialidadesForm.propTypes = { processoId: PropTypes.number };

export function ConfidencialidadesForm({ processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);

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
          mail,
          perfilId,
          processoId,
          id: selectedItem?.id,
          msg: 'Confidencialidade atualizado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} fullWidth maxWidth="md">
      <DialogTitle>Editar confidencialidade</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Confidencialidade
            perfisIncluidos="perfis_incluidos"
            perfisExcluidos="perfis_excluidos"
            estadosIncluidos="estados_incluidos"
            estadosExcluidos="estados_excluidos"
          />
          <DialogButons edit isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function applyFilter(destinos, detinosSelct) {
  return destinos?.filter((item) => !detinosSelct.includes(Number(item?.id)));
}

function confidenciaIds(dados, item) {
  return dados?.confidencial && dados?.[item]?.length > 0 ? dados?.[item]?.map((row) => row?.id) : null;
}

function confidencialidadesIds(dados, item, label, colaboradores) {
  return (
    dados
      ?.filter((row) => row[item])
      .map((val) => ({
        id: val[item],
        label: label
          ? val[label]
          : colaboradores?.find((colab) => colab?.perfil_id === val[item])?.perfil?.displayName ||
            `PerfilID: ${val[item]}`,
      })) || []
  );
}
