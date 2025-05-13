import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
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

EncaminharStepper.propTypes = { dados: PropTypes.object };

export default function EncaminharStepper({ dados }) {
  const dispatch = useDispatch();
  const { acao, destinos, gerencia = false, onClose } = dados;
  const { activeStep } = useSelector((state) => state.stepper);
  const destinosParalelo = useMemo(() => destinos?.filter((row) => row?.paralelo), [destinos]);
  const destinosSingulares = useMemo(() => destinos?.filter((row) => !row?.paralelo), [destinos]);
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>
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

EncaminharEmSerie.propTypes = { dados: PropTypes.object };

export function EncaminharEmSerie({ dados }) {
  const dispatch = useDispatch();
  const { acao, destinos, gerencia = false, onClose } = dados;
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { motivosTransicao } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Escolhe o estado'),
    motivo_devolucao: acao === 'DEVOLVER' && Yup.mixed().required('Indica o motivo da devolução'),
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
      parecer: dadosStepper?.parecer || null,
      noperacao: dadosStepper?.noperacao || '',
      observacao: dadosStepper?.observacao || '',
      motivo_devolucao: dadosStepper?.motivo_devolucao || null,
      estado: dadosStepper?.estado || (destinos?.length === 1 && destinos?.[0]) || null,
    }),
    [dadosStepper, destinos]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const aberturaSemEntGer = useMemo(
    () =>
      gerencia &&
      values?.estado &&
      !processo?.entidade &&
      acao === 'ENCAMINHAR' &&
      processo?.fluxo === 'Abertura de Conta' &&
      !values?.estado?.label?.includes('Atendimento'),
    [gerencia, processo?.fluxo, processo?.entidade, acao, values?.estado]
  );
  const numOperacao = useMemo(() => !!values?.estado?.hasopnumero, [values?.estado?.hasopnumero]);
  const parecer = useMemo(() => !!values?.estado?.requer_parecer, [values?.estado?.requer_parecer]);

  const onSubmit = async () => {
    dispatch(updateDados({ forward: true, dados: values }));
  };

  useEffect(() => {
    if (values?.estado?.estado_final_id)
      dispatch(getFromParametrizacao('colaboradoresEstado', { id: values?.estado?.estado_final_id }));
  }, [dispatch, values?.estado?.estado_final_id]);

  useEffect(() => {
    if (processo?.fluxo_id) {
      const params = { fluxoId: processo?.fluxo_id, transicaoId: values?.estado?.id, reset: { val: [] } };
      dispatch(getFromParametrizacao('checklist', params));
    }
  }, [dispatch, processo?.fluxo_id, values?.estado?.id]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={(parecer && numOperacao && 6) || ((parecer || numOperacao) && 8) || 12}>
          <RHFAutocompleteObj dc name="estado" label="Estado" options={destinos} />
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
            {parecer && (
              <Grid item xs={numOperacao ? 6 : 12} md={numOperacao ? 3 : 4}>
                <RHFAutocompleteSmp label="Parecer" name="parecer" options={['Favorável', 'Não favorável']} />
              </Grid>
            )}
            {numOperacao && (
              <Grid item xs={parecer ? 6 : 12} md={parecer ? 3 : 4}>
                <RHFNumberField noFormat name="noperacao" label="Nº de operação" />
              </Grid>
            )}
            {acao === 'DEVOLVER' && (
              <Grid item xs={12}>
                <RHFAutocompleteObj name="motivo_devolucao" label="Motivo da devolução" options={motivosTransicao} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField multiline rows={6} name="observacao" label="Observação" />
            </Grid>
            {/* <Grid item xs={12}>
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
            </Grid> */}
          </>
        )}
      </Grid>
      <ButtonsStepper onCancel={onClose} isSaving={isSaving} labelCancel="Cancelar" hideSubmit={aberturaSemEntGer} />
    </FormProvider>
  );
}

OutrosEmSerie.propTypes = { acao: PropTypes.string };

export function OutrosEmSerie({ acao }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { colaboradoresEstado, checklist } = useSelector((state) => state.parametrizacao);

  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
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

  const formSchema = shapeAnexos(outros, checkList, true);
  const defaultValues = useMemo(
    () => ({
      ...defaultAnexos(dadosStepper, checkList, []),
      colaborador:
        colaboradoresList?.find(({ id }) => id === dadosStepper?.colaborador?.id) ||
        (acao === 'DEVOLVER' &&
          colaboradoresList?.find(({ mail }) => mail?.toLowerCase() === processo?.criador?.toLowerCase())) ||
        null,
    }),
    [acao, checkList, colaboradoresList, dadosStepper, processo?.criador]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('transicao_id', dadosStepper?.estado?.id);
      if (dadosStepper?.noperacao) formData.append('noperacao', dadosStepper.noperacao);
      if (dadosStepper?.observacao) formData.append('observacao', dadosStepper.observacao);
      if (values?.colaborador?.id) formData.append('perfil_afeto_id', values.colaborador.id);
      if (dadosStepper?.motivo_devolucao?.id) formData.append('motivo_id', dadosStepper.motivo_devolucao?.id);

      if (dadosStepper?.parecer === 'Favorável') formData.append('parecer_favoravel', true);
      else if (dadosStepper?.parecer === 'Não favorável') formData.append('parecer_favoravel', false);

      // if (dadosStepper?.confidencial) {
      //   dadosStepper?.perfis_incluidos?.forEach((item) => formData.append('confidencia.perfis_incluidos', item?.id));
      //   dadosStepper?.perfis_excluidos?.forEach((item) => formData.append('confidencia.perfis_excluidos', item?.id));
      //   dadosStepper?.estados_incluidos?.forEach((item) => formData.append('confidencia.estados_incluidos', item?.id));
      //   dadosStepper?.estados_excluidos?.forEach((item) => formData.append('confidencia.estados_excluidos', item?.id));
      // }

      appendAnexos(formData, values.anexos, outros, values.checklist);

      const params = { mfd: true, id: processo.id, estadoId: processo?.estadoPreso };
      const msg = acao === 'DEVOLVER' ? 'Processo devolvido' : 'Processo encaminhado';
      dispatch(updateItem('encaminhar serie', formData, { ...params, msg }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFAutocompleteObj name="colaborador" label="Atribuir processo a" options={colaboradoresList} />
        <Anexos anexos={[]} outros={!!outros} solto />
      </Stack>
      <ButtonsStepper
        label="Enviar"
        isSaving={isSaving}
        labelCancel="Voltar"
        onCancel={() => {
          dispatch(backStep());
          dispatch(updateDados({ dados: values }));
        }}
      />
    </FormProvider>
  );
}

// --- ENCAMINHAR EM PARALELO ------------------------------------------------------------------------------------------

EncaminharEmParalelo.propTypes = { onClose: PropTypes.func, destinos: PropTypes.array };

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

  const defaultValues = useMemo(() => ({ estado, destinos: [destinoItem, destinoItem] }), [estado]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'destinos' });

  const onSubmit = async () => {
    try {
      const formData = [];
      values?.destinos?.forEach((row) => {
        formData?.push({ observacao: row?.observacao, transicao_id: row?.estado?.id, data_limite_parecer: row?.data });
      });
      const params = { id: processo.id, msg: 'Processo encaminhado', estadoId: processo?.estado?.estado_id };
      dispatch(updateItem('encaminhar paralelo', JSON.stringify(formData), { ...params, dono: values?.estado?.id }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <RHFAutocompleteObj dc label="Focal Point" options={[estado, ...estados]} name="estado" />
        {fields.map((item, index) => (
          <Card key={`destino_${index}`} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <RHFAutocompleteObj
                      dc
                      label="Estado"
                      options={destinos}
                      name={`destinos[${index}].estado`}
                      getOptionDisabled={(option) => values.destinos.some(({ estado }) => estado?.id === option.id)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFDatePicker dateTime disablePast name={`destinos[${index}].data`} label="Data limite parecer" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField multiline rows={2} label="Observação" name={`destinos[${index}].observacao`} />
                  </Grid>
                  {/* <Grid item xs={12}>
                    <RHFSwitch
                      otherSx={{ mt: 0 }}
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
                  </Grid> */}
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
      <ButtonsStepper label="Enviar" onCancel={onClose} isSaving={isSaving} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// --- CONFIDENCILAIDADES --------------------------------------------------------------------------------------

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
    <Stack direction="column" spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={estadosIncluidos}
          label="Estados com acesso"
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
        />
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={estadosExcluidos}
          label="Estados sem acesso"
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
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
          options={colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }))}
        />
        <RHFAutocompleteObj
          small
          multiple
          limitTags={1}
          disableCloseOnSelect
          name={perfisExcluidos}
          label="Colaboradores sem acesso"
          options={colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }))}
        />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function confidenciaIds(dados, item) {
  return dados?.confidencial && dados?.[item]?.length > 0 ? dados?.[item]?.map(({ id }) => id) : null;
}
