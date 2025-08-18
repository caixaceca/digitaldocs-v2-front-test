import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useCallback } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
// utils
import { vdt } from '../../../utils/formatObject';
import { PATH_DIGITALDOCS } from '../../../routes/paths';
import { numeroParaLetra } from '../../../utils/formatText';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updateDados, resetDados, backStep, gotoStep } from '../../../redux/slices/stepper';
import { getSuccess, getFromGaji9, createItem, updateItem } from '../../../redux/slices/gaji9';
// components
import {
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObj,
  RHFAutocompleteSmp,
} from '../../../components/hook-form';
import Steps from '../../../components/Steps';
import { SemDados, newLineText } from '../../../components/Panel';
import { DialogTitleAlt, DialogConfirmar } from '../../../components/CustomDialog';
import { AddItem, DefaultAction, ButtonsStepper } from '../../../components/Actions';
//
import { sitClausulas } from '../../../_mock';
import { listaTitrulares, listaGarantias, subTiposGarantia } from '../applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export const getItem = (list, ...ids) => list?.find(({ id }) => ids.some((val) => Number(id) === Number(val))) || null;

// ---------------------------------------------------------------------------------------------------------------------

export default function ClausulaForm({ onClose, clausula = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeStep } = useSelector((state) => state.stepper);
  const { isEdit, modalGaji9, cid, done } = useSelector((state) => state.gaji9);

  const onClose1 = useCallback(() => {
    onClose();
    dispatch(resetDados());
  }, [onClose, dispatch]);

  useEffect(() => {
    if (cid?.id && (done === 'Cláusula adicionada' || done === 'Cláusula clonada'))
      navigate(`${PATH_DIGITALDOCS.gaji9.root}/clausula/${cid?.id}`);
  }, [cid?.id, done, navigate]);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose1()}
        title={`${(modalGaji9 === 'clonar-clausula' && 'Clonar') || (isEdit && 'Editar') || 'Adicionar'} cláusula`}
        content={
          <>
            <Steps activeStep={activeStep} steps={['Identificação', 'Conteúdo', 'Números', 'Resumo']} sx={{ mt: 3 }} />
            {(activeStep === 1 || activeStep === 2) && <SearchVariavel />}
          </>
        }
      />
      <DialogContent>
        {activeStep === 0 && <Identificacao onClose={onClose1} clausula={clausula} />}
        {activeStep === 1 && <Conteudo clausula={clausula} />}
        {activeStep === 2 && <Numeros clausula={clausula} />}
        {activeStep === 3 && <Resumo clausula={clausula} onClose={onClose1} />}
      </DialogContent>
    </Dialog>
  );
}

function Identificacao({ onClose, clausula }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isEdit, tiposTitulares, tiposGarantias, segmentos, tipoGarantia } = useSelector((state) => state.gaji9);

  const titularCl = localStorage.getItem('titularCl');
  const garantiaCl = localStorage.getItem('garantiaCl');
  const segmentoCl = localStorage.getItem('segmentoCl');
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const subTiposGarant = useMemo(() => subTiposGarantia(tipoGarantia?.subtipos || []), [tipoGarantia?.subtipos]);
  const segmentosList = useMemo(() => segmentos?.map(({ id, designacao }) => ({ id, label: designacao })), [segmentos]);

  const defaultValues = useMemo(
    () => ({
      situacao: dadosStepper?.situacao ?? sitClausulas?.find(({ id }) => id === clausula?.situacao),
      segmento: dadosStepper?.segmento || getItem(segmentosList, clausula?.segmento_id, segmentoCl),
      titular: dadosStepper?.titular || getItem(titularesList, clausula?.tipo_titular_id, titularCl),
      garantia: dadosStepper?.garantia || getItem(garantiasList, clausula?.tipo_garantia_id, garantiaCl),
      subtipoGarantia:
        dadosStepper?.subtipoGarantia ||
        (clausula?.subtipo_garantia_id && {
          id: clausula?.subtipo_garantia_id,
          label: clausula?.subtipo_garantia,
        }) ||
        null,
      seccao:
        dadosStepper?.seccao ||
        (clausula?.solta && 'Solta') ||
        (clausula?.seccao_identificacao && 'Secção de identificação') ||
        (clausula?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
        null,
    }),
    [dadosStepper, clausula, titularesList, garantiasList, segmentosList, titularCl, garantiaCl, segmentoCl]
  );

  const methods = useForm({ defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clausula]);

  useEffect(() => {
    getSuccess({ item: 'tipoGarantia', dados: null });
    if (values?.garantia?.id) dispatch(getFromGaji9('tipoGarantia', { id: values?.garantia?.id, notLoading: true }));
  }, [dispatch, values?.garantia?.id]);

  const changeGarantia = (val) => {
    setValue('garantia', val, vdt);
    setValue('subtipoGarantia', null, vdt);
  };

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={{ xs: 1, sm: 3 }}>
            <Stack direction="row" spacing={3} sx={{ flexGrow: 1 }}>
              {isEdit && <RHFAutocompleteObj name="situacao" label="Situação" options={sitClausulas} />}
              <RHFAutocompleteSmp
                name="seccao"
                label="Secção"
                options={['Solta', 'Secção de identificação', 'Secção de identificação Caixa']}
              />
            </Stack>
          </Stack>
          <RHFAutocompleteObj name="titular" label="Tipo de titular" options={titularesList} />
          <RHFAutocompleteObj name="segmento" label="Segmento" options={segmentosList} />
          <Stack direction="row" spacing={3}>
            <RHFAutocompleteObj
              name="garantia"
              label="Tipo de garantia"
              options={garantiasList}
              onChange={(_, val) => changeGarantia(val)}
            />
            {values?.garantia?.id && subTiposGarant?.length > 0 && (
              <RHFAutocompleteObj name="subtipoGarantia" label="Subtipo da garantia" options={subTiposGarant} />
            )}
          </Stack>
        </Stack>

        <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Conteudo({ clausula }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    numero_ordem: Yup.number().min(0).integer().required().label('Nº de cláusula'),
    titulo: dadosStepper?.seccao !== 'Solta' && Yup.string().required().label('Epígrafe'),
    conteudo:
      dadosStepper?.seccao && dadosStepper?.seccao !== 'Condicional' && Yup.string().required().label('Conteúdo'),
  });

  const defaultValues = useMemo(
    () => ({
      titulo: dadosStepper?.titulo || clausula?.titulo || '',
      conteudo: dadosStepper?.conteudo || clausula?.conteudo || '',
      numero_ordem: dadosStepper?.numero_ordem || clausula?.numero_ordem || 1,
    }),
    [dadosStepper, clausula]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3} sx={{ pt: 1 }}>
        {dadosStepper?.seccao !== 'Solta' && (
          <Stack direction="row" spacing={3}>
            {(!dadosStepper?.seccao || dadosStepper?.seccao === 'Condicional') && (
              <RHFNumberField name="numero_ordem" label="Nº de cláusula" sx={{ width: { xs: 100, md: 150 } }} />
            )}
            <RHFTextField name="titulo" label="Epígrafe" />
          </Stack>
        )}
        <RHFTextField name="conteudo" label="Conteúdo" multiline minRows={8} maxRows={12} />
      </Stack>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Numeros({ clausula }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    alineas: Yup.array(
      Yup.object({
        numero_ordem: Yup.number().positive().integer().label('Número'),
        sub_alineas: Yup.array(
          Yup.object({
            conteudo: Yup.string().required().label('Conteúdo'),
            numero_ordem: Yup.number().positive().integer().label('Alínea'),
          })
        ),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({ alineas: dadosStepper?.alineas || clausula?.alineas || [] }),
    [dadosStepper, clausula]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'alineas' });

  const eliminarNumero = async () => {
    await remove(item);
    setItem(null);
  };

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Stack spacing={3}>
          {fields?.length === 0 && <SemDados message="Ainda não foi adicionado nenhum número..." />}
          {fields.map((item, index) => (
            <Paper key={`numero_${item.id}`} variant="elevation" elevation={3} sx={{ flexGrow: 1, p: 1 }}>
              <Stack spacing={1} direction="row" alignItems="center">
                <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                  <RHFNumberField name={`alineas[${index}].numero_ordem`} label="Nº" sx={{ width: 70 }} />
                  <RHFTextField
                    multiline
                    minRows={3}
                    maxRows={10}
                    label="Conteúdo"
                    name={`alineas[${index}].conteudo`}
                  />
                </Stack>
                <DefaultAction small variant="filled" label="ELIMINAR" onClick={() => setItem(index)} />
              </Stack>
              <Alineas numeroIndex={index} />
            </Paper>
          ))}
          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <DefaultAction
              button
              label="Número"
              icon="adicionar"
              variant="contained"
              onClick={() => append({ ativo: true, numero_ordem: fields?.length + 1, conteudo: '', sub_alineas: [] })}
            />
          </Stack>
        </Stack>
        <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
      </FormProvider>

      {item !== null && (
        <DialogConfirmar handleOk={eliminarNumero} desc="eliminar esta alínea" onClose={() => setItem(null)} />
      )}
    </>
  );
}

export function Alineas({ numeroIndex }) {
  const { control } = useFormContext();
  const [item, setItem] = useState(null);
  const { append, remove, fields } = useFieldArray({ control, name: `alineas[${numeroIndex}].sub_alineas` });

  const eliminarAlinea = async () => {
    await remove(item);
    setItem(null);
  };

  return (
    <Stack spacing={2} sx={{ pl: { md: 9 }, mt: 3 }}>
      {fields.map((item, index) => (
        <Stack spacing={1} direction="row" alignItems="center" key={`numero_${numeroIndex}_alinea_${item.id}`}>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
            <RHFNumberField
              size="small"
              label="Alínea"
              sx={{ width: 70 }}
              name={`alineas[${numeroIndex}].sub_alineas[${index}].numero_ordem`}
            />
            <RHFTextField
              multiline
              minRows={3}
              maxRows={10}
              size="small"
              label="Conteúdo"
              name={`alineas[${numeroIndex}].sub_alineas[${index}].conteudo`}
            />
          </Stack>
          <DefaultAction small label="ELIMINAR" onClick={() => setItem(index)} />
        </Stack>
      ))}
      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <AddItem
          dados={{ small: true, label: 'Alínea' }}
          onClick={() => append({ ativo: true, numero_ordem: fields?.length + 1, conteudo: '' })}
        />
      </Stack>

      {item !== null && (
        <DialogConfirmar handleOk={eliminarAlinea} desc="eliminar esta alínea" onClose={() => setItem(null)} />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Resumo({ onClose, clausula }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isEdit, modalGaji9, isSaving } = useSelector((state) => state.gaji9);

  const handleSubmit = async () => {
    const formData = {
      ativo: true,
      condicional: false,
      titulo: dadosStepper?.titulo,
      conteudo: dadosStepper?.conteudo,
      situacao: dadosStepper?.situacao?.id,
      solta: dadosStepper?.seccao === 'Solta',
      segmento_id: dadosStepper?.segmento?.id,
      tipo_titular_id: dadosStepper?.titular?.id,
      tipo_garantia_id: dadosStepper?.garantia?.id,
      subtipo_garantia_id: dadosStepper?.subtipoGarantia?.id,
      seccao_identificacao: dadosStepper?.seccao === 'Secção de identificação',
      seccao_identificacao_caixa: dadosStepper?.seccao === 'Secção de identificação Caixa',
      numero_ordem: dadosStepper?.seccao && dadosStepper?.seccao !== 'Condicional' ? 0 : dadosStepper?.numero_ordem,
      ...(dadosStepper?.alineas?.length > 0
        ? {
            alineas: dadosStepper?.alineas?.map(({ ativo, conteudo, numero_ordem: num, sub_alineas: alineas }) => ({
              ativo,
              conteudo,
              numero_ordem: num,
              ...(alineas?.length > 0
                ? {
                    sub_alineas: alineas?.map(({ ativo, conteudo, numero_ordem: num }) => ({
                      ativo,
                      conteudo,
                      numero_ordem: num,
                    })),
                  }
                : null),
            })),
          }
        : null),
    };

    const msg = `Cláusula ${(modalGaji9 === 'clonar-clausula' && 'clonada') || (isEdit && 'atualizada') || 'adicionada'}`;
    const params = { onClose, id: clausula?.id, msg, getItem: 'clausula' };

    if (isEdit && modalGaji9 !== 'clonar-clausula') dispatch(updateItem('clausulas', JSON.stringify(formData), params));
    else dispatch(createItem('clausulas', JSON.stringify(formData), { ...params, getItem: 'cid' }));
  };

  return (
    <List>
      <TitleResumo title="Identificação" action={() => dispatch(gotoStep(0))} />
      <Table size="small">
        <TableBody>
          <TableRowItem title="Situação :" text={dadosStepper?.situacao?.label} />
          <TableRowItem title="Secção :" text={dadosStepper?.seccao} />
          <TableRowItem title="Tipo de titular:" text={dadosStepper?.titular?.label} />
          <TableRowItem title="Tipo de garantia:" text={dadosStepper?.garantia?.label} />
          <TableRowItem title="Subtipo da garantia:" text={dadosStepper?.subtipoGarantia?.label} />
          <TableRowItem title="Segmento:" text={dadosStepper?.segmento?.label} />
        </TableBody>
      </Table>
      <TitleResumo title="Conteúdo" action={() => dispatch(gotoStep(1))} />
      <Table size="small">
        <TableBody>
          <TableRowItem title="Nº de cláusula:" text={dadosStepper?.numero_ordem?.toString()} />
          <TableRowItem title="Epígrafe:" text={dadosStepper?.titulo} />
          <TableRowItem title="Contúdo:" text={dadosStepper?.conteudo} />
        </TableBody>
      </Table>
      <TitleResumo title="Números" action={() => dispatch(gotoStep(2))} />
      {dadosStepper?.alineas?.length > 0 ? (
        dadosStepper?.alineas?.map(({ numero_ordem: num, conteudo, sub_alineas: alineas }, index) => (
          <Stack direction="row" key={`res_alinea_${index}`} spacing={1} sx={{ py: 0.75 }}>
            <Typography variant="subtitle2">{num}.</Typography>
            <Stack>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                {newLineText(conteudo)}
              </Typography>
              {alineas?.map(({ conteudo, numero_ordem: num }, index1) => (
                <Stack direction="row" key={`res_alinea_${index}_sub_alinea_${index1}`} spacing={1} sx={{ py: 0.25 }}>
                  <Typography variant="subtitle2">{numeroParaLetra(num)}.</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                    {newLineText(conteudo)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))
      ) : (
        <Typography variant="body2" sx={{ p: 1, fontStyle: 'italic', color: 'text.secondary' }}>
          Não foi adicionado nenhum número...
        </Typography>
      )}
      <ButtonsStepper
        label="Guardar"
        isSaving={isSaving}
        handleSubmit={handleSubmit}
        onClose={() => dispatch(backStep())}
      />
    </List>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TitleResumo({ title, action }) {
  return (
    <ListItem divider disableGutters secondaryAction={<DefaultAction small label="EDITAR" onClick={() => action()} />}>
      <Typography variant="subtitle2">{title}</Typography>
    </ListItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableRowItem({ title, text = '', item = null }) {
  return text || item ? (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', pr: 0 }}>
        <Typography noWrap variant="body2">
          {title}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: '100% !important' }}>{newLineText(text) || item}</TableCell>
    </TableRow>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchVariavel() {
  const dispatch = useDispatch();
  const [variavel, setVariavel] = useState(null);
  const { variaveis } = useSelector((state) => state.gaji9);
  const filterOptions = createFilterOptions({ stringify: (option) => `${option?.nome} ${option?.descritivo}` });
  const options = useMemo(() => variaveis?.map(({ nome, descritivo }) => ({ nome, descritivo })) || [], [variaveis]);

  useEffect(() => {
    dispatch(getFromGaji9('variaveis'));
  }, [dispatch]);

  return (
    <Stack sx={{ mb: 2 }}>
      <Autocomplete
        fullWidth
        value={variavel}
        options={options}
        filterOptions={filterOptions}
        getOptionLabel={(option) => option?.nome || ''}
        onChange={(event, newValue) => setVariavel(newValue)}
        sx={{ borderRadius: 1, bgcolor: 'background.neutral' }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Typography key={key} component="li" {...optionProps}>
              {option?.nome}
              <Typography variant="span" sx={{ color: 'text.secondary' }}>
                &nbsp;({option?.descritivo})
              </Typography>
            </Typography>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Procurar varáveis..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </Stack>
  );
}
