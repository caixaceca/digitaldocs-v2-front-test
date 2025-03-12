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
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
// utils
import { findColaboradores } from '../../../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
import { backStep, resetStep, updateDados } from '../../../../redux/slices/stepper';
import { updateItem } from '../../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../../hooks/useAnexos';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFUploadMultiFile,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import Steps from '../../../../components/Steps';
import { DefaultAction, ButtonsStepper } from '../../../../components/Actions';

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

EncaminharStepper.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
};

export default function EncaminharStepper({ title, destinos, gerencia = false, onClose }) {
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
        {activeStep === 1 && <OutrosEmSerie title={title} />}
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
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { motivosTransicao } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Escolhe o estado'),
    motivo_devolucao: title === 'DEVOLVER' && Yup.mixed().required('Indica o motivo da devolução'),
    parecer_favoravel: Yup.mixed().when(['estado'], {
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

  const aberturaSemEntGer = useMemo(
    () =>
      gerencia &&
      values?.estado &&
      !processo?.entidade &&
      title === 'ENCAMINHAR' &&
      processo?.assunto === 'Abertura de Conta' &&
      !values?.estado?.label?.includes('Atendimento'),
    [gerencia, processo?.assunto, processo?.entidade, title, values?.estado]
  );
  const numOperacao = useMemo(() => !!values?.estado?.hasopnumero, [values?.estado?.hasopnumero]);
  const parecer = useMemo(() => !!values?.estado?.requer_parecer, [values?.estado?.requer_parecer]);

  const onSubmit = async () => {
    dispatch(updateDados({ forward: true, dados: values }));
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  useEffect(() => {
    if (values?.estado?.estado_final_id) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { id: values?.estado?.estado_final_id }));
    }
  }, [dispatch, setValue, values?.estado?.estado_final_id]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={(parecer && numOperacao && 6) || ((parecer || numOperacao) && 8) || 12}>
          <RHFAutocompleteObj name="estado" label="Estado" disableClearable options={destinos} />
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
              <Grid item xs={12} sm={numOperacao ? 6 : 12} md={numOperacao ? 3 : 4}>
                <RHFAutocompleteSmp label="Parecer" name="parecer_favoravel" options={['Favorável', 'Não favorável']} />
              </Grid>
            )}
            {numOperacao && (
              <Grid item xs={12} sm={parecer ? 6 : 12} md={parecer ? 3 : 4}>
                <RHFNumberField name="noperacao" label="Nº de operação" />
              </Grid>
            )}
            {title === 'DEVOLVER' && (
              <Grid item xs={12}>
                <RHFAutocompleteObj name="motivo_devolucao" label="Motivo da devolução" options={motivosTransicao} />
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

OutrosEmSerie.propTypes = { title: PropTypes.string };

export function OutrosEmSerie({ title }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const criador = useMemo(
    () => colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase()),
    [colaboradores, processo?.criador]
  );
  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const formSchema = Yup.object().shape({
    atribuir: Yup.boolean(),
    colaborador: Yup.mixed().when(['atribuir'], {
      is: (atribuir) => atribuir,
      then: () => Yup.mixed().required().label('Colaborador'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      atribuir: dadosStepper?.atribuir || false,
      colaborador: dadosStepper?.colaborador || null,
      confidencial: dadosStepper?.confidencial || false,
      perfis_incluidos: dadosStepper?.perfis_incluidos || [],
      perfis_excluidos: dadosStepper?.perfis_excluidos || [],
      estados_incluidos: dadosStepper?.estados_incluidos || [],
      estados_excluidos: dadosStepper?.estados_excluidos || [],
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
      if (dadosStepper?.motivo_devolucao?.id) formData.append('motivo_id ', dadosStepper?.motivo_devolucao?.id);

      if (dadosStepper?.parecer_favoravel === 'Favorável') formData.append('parecer_favoravel', true);
      else if (dadosStepper?.parecer_favoravel === 'Não favorável') formData.append('parecer_favoravel', false);

      if (values.atribuir && values?.colaborador) {
        formData.append('perfil_afeto_id', values?.colaborador?.id);
      } else if (!!criador && title === 'DEVOLVER' && dadosStepper?.estado?.label?.includes('Atendimento')) {
        formData.append('perfil_afeto_id', criador?.perfil_id);
      }
      if (values?.confidencial) {
        values?.perfis_incluidos?.forEach((item) => formData.append('confidencia.perfis_incluidos', item?.id));
        values?.perfis_excluidos?.forEach((item) => formData.append('confidencia.perfis_excluidos', item?.id));
        values?.estados_incluidos?.forEach((item) => formData.append('confidencia.estados_incluidos', item?.id));
        values?.estados_excluidos?.forEach((item) => formData.append('confidencia.estados_excluidos', item?.id));
      }
      await dadosStepper?.anexos?.forEach((row) => formData.append('anexos', row));

      dispatch(
        updateItem('encaminhar serie', formData, {
          mfd: true,
          id: processo.id,
          msg: title === 'DEVOLVER' ? 'Processo devolvido' : 'Processo encaminhado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {/* CONFIDENCILAIDADE */}
        <Accordion expanded={values?.confidencial} onChange={() => setValue('confidencial', !values?.confidencial)}>
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

        {/* ATRIBUIÇÃO */}
        <Accordion expanded={values?.atribuir} onChange={() => setValue('atribuir', !values?.atribuir)}>
          <AccordionSummary sx={{ py: 0.5, typography: 'body2' }}>Atribuir processo</AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <RHFAutocompleteObj name="colaborador" label="Colaborador" options={colaboradoresList} />
          </AccordionDetails>
        </Accordion>
      </Stack>
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
      });
      dispatch(
        updateItem('encaminhar paralelo', JSON.stringify(formData), { id: processo.id, msg: 'Processo encaminhado' })
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
                    <RHFAutocompleteObj
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
        <RHFAutocompleteObj
          multiple
          limitTags={1}
          label="Estados"
          disableCloseOnSelect
          name={estadosIncluidos}
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
        />
        <RHFAutocompleteObj
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
        <RHFAutocompleteObj
          multiple
          limitTags={1}
          label="Estados"
          disableCloseOnSelect
          name={estadosExcluidos}
          options={estados?.map((row) => ({ id: row?.id, label: row?.nome }))}
        />
        <RHFAutocompleteObj
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

// ---------------------------------------------------------------------------------------------------------------------

function applyFilter(destinos, detinosSelct) {
  return destinos?.filter((item) => !detinosSelct.includes(Number(item?.id)));
}

export function confidenciaIds(dados, item) {
  return dados?.confidencial && dados?.[item]?.length > 0 ? dados?.[item]?.map((row) => row?.id) : null;
}
