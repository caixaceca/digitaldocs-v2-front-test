import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { findColaboradores } from '../../../../utils/validarAcesso';
import { shapeAnexos, defaultAnexos, appendAnexos } from '../anexos/utils-anexos';
// redux
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
import { backStep, resetStep, updateDados } from '../../../../redux/slices/stepper';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import Steps from '../../../../components/Steps';
import GridItem from '../../../../components/GridItem';
import { DefaultAction, ButtonsStepper, Fechar } from '../../../../components/Actions';
//
import Anexos from '../anexos';

const destinoItem = {
  data: null,
  estado: null,
  observacao: '',
  // confidencial: false,
  // perfis_incluidos: [],
  // perfis_excluidos: [],
  // estados_incluidos: [],
  // estados_excluidos: [],
};

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

export default function EncaminharStepper({ dados }) {
  const dispatch = useDispatch();
  const { acao, destinos, gerencia = false, onClose } = dados;
  const { activeStep } = useSelector((state) => state.stepper);
  const destinosParalelo = useMemo(() => destinos?.filter(({ paralelo }) => paralelo), [destinos]);
  const destinosSingulares = useMemo(() => destinos?.filter(({ paralelo }) => !paralelo), [destinos]);
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle sx={{ mb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
          {acao?.charAt(0)?.toUpperCase() + acao?.slice(1)?.toLowerCase()} processo
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
            <Fechar onClick={onClose} />
          </Stack>
        </Stack>
        {!inParalelo && <Steps activeStep={activeStep} steps={['Destino', 'Atribuir/Anexos']} sx={{ mt: 2, mb: 0 }} />}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {activeStep === 0 && (
            <>
              {(inParalelo && <EncaminharEmParalelo destinos={destinosParalelo} onClose={onClose} />) || (
                <EncaminharEmSerie dados={{ acao, onClose, gerencia, destinos: destinosSingulares }} />
              )}
            </>
          )}
          {activeStep === 1 && <OutrosEmSerie acao={acao} />}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// --- ENCAMINHAR EM SÉRIE ---------------------------------------------------------------------------------------------

export function EncaminharEmSerie({ dados }) {
  const dispatch = useDispatch();
  const { acao, destinos, gerencia = false, onClose } = dados;
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { motivosTransicao, decisor } = useSelector((state) => state.parametrizacao);
  const { fluxo = '', entidade = '', fluxo_id: fluxoId = '', numero_operacao: numOp = '', estado = null } = processo;
  const indicarMotivo = useMemo(() => acao === 'DEVOLVER' || estado?.estado?.includes('GAJ'), [acao, estado?.estado]);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Escolhe o estado'),
    motivo: indicarMotivo && Yup.mixed().required('Indica o motivo'),
    parecer: Yup.mixed().when(['estado'], {
      is: (estado) => estado?.requer_parecer,
      then: () => Yup.mixed().required().label('Parecer'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    noperacao: Yup.mixed().when(['estado'], {
      is: (estado) => estado?.hasopnumero,
      then: () => Yup.number().positive().typeError('Introduza um Nº de operação válido').label('Nº de operação'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      mobs: dadosStepper?.mobs || '',
      motivo: dadosStepper?.motivo || null,
      parecer: dadosStepper?.parecer || null,
      observacao: dadosStepper?.observacao || '',
      noperacao: dadosStepper?.noperacao || numOp || '',
      estado: dadosStepper?.estado || (destinos?.length === 1 && destinos?.[0]) || null,
    }),
    [dadosStepper, destinos, numOp]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const aberturaSemEntGer = useMemo(
    () =>
      gerencia &&
      !entidade &&
      values?.estado &&
      acao === 'ENCAMINHAR' &&
      fluxo === 'Abertura de Conta' &&
      !values?.estado?.label?.includes('Atendimento'),
    [gerencia, fluxo, entidade, acao, values?.estado]
  );

  const creditoSemMetadados = useMemo(
    () => decisor && processo?.is_credito && !processo?.credito?.gaji9_metadados,
    [decisor, processo?.credito?.gaji9_metadados, processo?.is_credito]
  );

  const numOperacao = useMemo(() => !!values?.estado?.hasopnumero, [values?.estado?.hasopnumero]);
  const parecer = useMemo(() => !!values?.estado?.requer_parecer, [values?.estado?.requer_parecer]);

  const onSubmit = async () => dispatch(updateDados({ forward: true, dados: values }));

  useEffect(() => {
    if (indicarMotivo) dispatch(getFromParametrizacao('motivosTransicao', { fluxoId, modo: 'Seguimento' }));
  }, [acao, dispatch, indicarMotivo, fluxoId]);

  useEffect(() => {
    if (values?.estado?.estado_final_id)
      dispatch(getFromParametrizacao('colaboradoresEstado', { id: values?.estado?.estado_final_id }));
  }, [dispatch, values?.estado?.estado_final_id]);

  useEffect(() => {
    if (fluxoId && values?.estado?.id)
      dispatch(getFromParametrizacao('checklist', { fluxoId, transicaoId: values?.estado?.id, reset: { val: [] } }));
  }, [dispatch, fluxoId, values?.estado?.id]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <GridItem md={(parecer && numOperacao && 6) || ((parecer || numOperacao) && 8) || 12}>
          <RHFAutocompleteObj dc name="estado" label="Estado" options={destinos} />
        </GridItem>
        {aberturaSemEntGer || creditoSemMetadados ? (
          <GridItem>
            {creditoSemMetadados ? (
              <Alert severity="warning" sx={{ justifyContent: 'left' }}>
                <AlertTitle sx={{ typography: 'subtitle2' }}>Processo incompleto</AlertTitle>
                <Typography variant="body2">
                  O processo não pode ser encaminhado para um estado decisor sem que as <b>condições financeiras</b>{' '}
                  tenham sido preenchidos.
                </Typography>
                <Typography variant="body2">
                  Para inserir os dados necessários, aceda ao menu <b>Info. Crédito</b> e selecione o item{' '}
                  <b>Condições financeiras</b>.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ justifyContent: 'left' }}>
                <AlertTitle sx={{ typography: 'subtitle2' }}>Processo incompleto</AlertTitle>
                <Typography variant="body2">
                  O processo não pode ser encaminhado sem que a(s) <b>entidade(s)</b> tenham sido adicionadas.
                </Typography>
                <Typography variant="body2">
                  Por favor, edite o processo, adicione a(s) entidade(s) necessária(s) e depois prossiga com o
                  encaminhamento.
                </Typography>
              </Alert>
            )}
          </GridItem>
        ) : (
          <>
            {parecer && (
              <GridItem xs={numOperacao ? 6 : 12} md={numOperacao ? 3 : 4}>
                <RHFAutocompleteSmp label="Parecer" name="parecer" options={['Favorável', 'Não favorável']} />
              </GridItem>
            )}
            {numOperacao && (
              <GridItem xs={parecer ? 6 : 12} md={parecer ? 3 : 4}>
                <RHFNumberField noFormat name="noperacao" label="Nº de operação" />
              </GridItem>
            )}
            {indicarMotivo && (
              <GridItem children={<RHFAutocompleteObj name="motivo" label="Motivo" options={motivosTransicao} />} />
            )}
            <GridItem children={<RHFTextField multiline rows={6} name="observacao" label="Observação" />} />
            {/* <GridItem>
              <Accordion
                expanded={values?.confidencial}
                onChange={() => setValue('confidencial', !values?.confidencial)}
              >
                <AccordionSummary sx={{ py: 0.5, typography: 'body2' }}>Confidencialidade</AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Confidencialidade
                    perfisIncluidos="perfis_incluidos"
                    perfisExcluidos="perfis_excluidos"
                    estadosIncluidos="estados_incluidos"
                    estadosExcluidos="estados_excluidos"
                  />
                </AccordionDetails>
              </Accordion>
            </GridItem> */}
          </>
        )}
      </Grid>
      <ButtonsStepper
        onClose={onClose}
        isSaving={isSaving}
        labelCancel="Cancelar"
        hideSubmit={aberturaSemEntGer || creditoSemMetadados}
      />
    </FormProvider>
  );
}

export function OutrosEmSerie({ acao }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, colaboradoresEstado, checklist } = useSelector((state) => state.parametrizacao);
  const { id, estado, estadoPreso, criador: criadorP } = processo;

  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const mesmaUo = useMemo(
    () => meusAmbientes?.find(({ id }) => id === estado?.estado_id)?.uo_id === dadosStepper?.estado?.uo_id,
    [dadosStepper?.estado?.uo_id, estado?.estado_id, meusAmbientes]
  );
  const checkList = useMemo(
    () =>
      checklist.filter(
        ({ transicao_id: trId, designacao }) => trId === dadosStepper?.estado?.id && designacao !== 'OUTROS'
      ),
    [checklist, dadosStepper?.estado?.id]
  );

  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );
  const criador = useMemo(() => {
    if (acao !== 'DEVOLVER' || !dadosStepper?.estado?.inicial) return null;
    return colaboradoresList?.find((c) => c.mail?.toLowerCase() === criadorP?.toLowerCase()) || null;
  }, [acao, colaboradoresList, dadosStepper?.estado?.inicial, criadorP]);

  const formSchema = shapeAnexos(outros, checkList, true);
  const defaultValues = useMemo(
    () => ({
      ...defaultAnexos(dadosStepper, checkList, []),
      colaborador: colaboradoresList?.find(({ id }) => id === dadosStepper?.colaborador?.id) || criador,
    }),
    [checkList, colaboradoresList, criador, dadosStepper]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('transicao_id', dadosStepper?.estado?.id);
      if (dadosStepper?.noperacao) formData.append('noperacao', dadosStepper.noperacao);
      if (dadosStepper?.observacao) formData.append('observacao', dadosStepper.observacao);
      if (dadosStepper?.motivo?.id) formData.append('motivo_id', dadosStepper?.motivo?.id);
      if (values?.colaborador?.id) formData.append('perfil_afeto_id', values.colaborador.id);
      else if (criador?.id) formData.append('perfil_afeto_id', criador.id);

      if (dadosStepper?.parecer === 'Favorável') formData.append('parecer_favoravel', true);
      else if (dadosStepper?.parecer === 'Não favorável') formData.append('parecer_favoravel', false);

      // if (dadosStepper?.confidencial) {
      //   dadosStepper?.perfis_incluidos?.forEach((item) => formData.append('confidencia.perfis_incluidos', item?.id));
      //   dadosStepper?.perfis_excluidos?.forEach((item) => formData.append('confidencia.perfis_excluidos', item?.id));
      //   dadosStepper?.estados_incluidos?.forEach((item) => formData.append('confidencia.estados_incluidos', item?.id));
      //   dadosStepper?.estados_excluidos?.forEach((item) => formData.append('confidencia.estados_excluidos', item?.id));
      // }

      appendAnexos(formData, values.anexos, outros, values.checklist);

      const params = { mfd: true, id, estadoId: estadoPreso };
      const msg = acao === 'DEVOLVER' ? 'Processo devolvido' : 'Processo encaminhado';
      dispatch(updateItem('encaminhar serie', formData, { ...params, msg }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {mesmaUo && <RHFAutocompleteObj name="colaborador" label="Atribuir processo a" options={colaboradoresList} />}
        <Anexos anexos={[]} outros={!!outros} solto />
      </Stack>
      <ButtonsStepper
        label="Enviar"
        isSaving={isSaving}
        labelCancel="Voltar"
        onClose={() => {
          dispatch(backStep());
          dispatch(updateDados({ dados: values }));
        }}
      />
    </FormProvider>
  );
}

// --- ENCAMINHAR EM PARALELO ------------------------------------------------------------------------------------------

export function EncaminharEmParalelo({ destinos, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const estado = useMemo(
    () => ({ id: processo?.estado?.estado_id, label: processo?.estado?.estado }),
    [processo?.estado?.estado, processo?.estado?.estado_id]
  );
  const estados = useMemo(() => destinos?.map(({ estado_final_id: id, label }) => ({ id, label })), [destinos]);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Focal Point não pode ficar vazio'),
    destinos: Yup.array(Yup.object({ estado: Yup.mixed().required('Escolhe o estado') })),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { estado, destinos: [destinoItem, destinoItem] },
  });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });
  const { fields, append, remove } = useFieldArray({ control, name: 'destinos' });

  const onSubmit = async () => {
    try {
      const formData = [];
      values?.destinos?.forEach(({ observacao, estado, data }) => {
        formData?.push({ observacao, transicao_id: estado?.id, data_limite_parecer: data });
      });
      const params = { id: processo.id, msg: 'Processo encaminhado', estadoId: processo?.estado?.estado_id };
      dispatch(updateItem('encaminhar paralelo', JSON.stringify(formData), { ...params, dono: values?.estado?.id }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <RHFAutocompleteObj dc label="Focal Point" options={[estado, ...estados]} name="estado" />
        {fields.map((item, index) => (
          <Card key={`destino_${index}`} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <GridItem sm={8}>
                    <RHFAutocompleteObj
                      dc
                      label="Estado"
                      options={destinos}
                      name={`destinos[${index}].estado`}
                      getOptionDisabled={(option) => values.destinos.some(({ estado }) => estado?.id === option.id)}
                    />
                  </GridItem>
                  <GridItem sm={4}>
                    <RHFDatePicker dateTime disablePast name={`destinos[${index}].data`} label="Data limite parecer" />
                  </GridItem>
                  <GridItem>
                    <RHFTextField multiline rows={2} label="Observação" name={`destinos[${index}].observacao`} />
                  </GridItem>
                  {/* <GridItem>
                    <RHFSwitch
                      omt
                      label="Confidencialidade"
                      name={`destinos[${index}].confidencial`}
                    />
                    {values?.destinos?.[index]?.confidencial && (
                      <Confidencialidade
                        perfisIncluidos={`destinos[${index}].perfis_incluidos`}
                        perfisExcluidos={`destinos[${index}].perfis_excluidos`}
                        estadosIncluidos={`destinos[${index}].estados_incluidos`}
                        estadosExcluidos={`destinos[${index}].estados_excluidos`}
                      />
                    )}
                  </GridItem> */}
                </Grid>
              </Box>
              {fields?.length > 2 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
            </Stack>
          </Card>
        ))}
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
        <DefaultAction small button label="Adicionar" onClick={() => append(destinoItem)} />
      </Stack>
      <ButtonsStepper label="Enviar" onClose={onClose} isSaving={isSaving} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// --- CONFIDENCILAIDADES --------------------------------------------------------------------------------------

export function Confidencialidade({ estadosIncluidos, estadosExcluidos, perfisIncluidos, perfisExcluidos }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { estados } = useSelector((state) => state.parametrizacao);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={estadosIncluidos}
          label="Estados com acesso"
          options={estados?.map(({ id, nome }) => ({ id, label: nome }))}
        />
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={estadosExcluidos}
          label="Estados sem acesso"
          options={estados?.map(({ id, nome }) => ({ id, label: nome }))}
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={perfisIncluidos}
          label="Colaboradores com acesso"
          options={colaboradores?.map(({ perfil_id: id, nome }) => ({ id, label: nome }))}
        />
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={perfisExcluidos}
          label="Colaboradores sem acesso"
          options={colaboradores?.map(({ perfil_id: id, nome }) => ({ id, label: nome }))}
        />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function confidenciaIds(dados, item) {
  return dados?.confidencial && dados?.[item]?.length > 0 ? dados?.[item]?.map(({ id }) => id) : null;
}
