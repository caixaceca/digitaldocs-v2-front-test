import * as Yup from 'yup';
import PropTypes from 'prop-types';
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
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { newLineText } from '../../utils/formatText';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromGaji9, createItem, updateItem } from '../../redux/slices/gaji9';
import { updateDados, resetDados, backStep, gotoStep } from '../../redux/slices/stepper';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObj,
  RHFAutocompleteSmp,
} from '../../components/hook-form';
import Steps from '../../components/Steps';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { AddItem, DefaultAction, ButtonsStepper } from '../../components/Actions';
//
import { ItemComponent } from './form-gaji9';
import { LabelSN } from '../parametrizacao/Detalhes';
import { listaTitrulares, listaGarantias, listaProdutos } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

ClausulaForm.propTypes = { onCancel: PropTypes.func, minutaId: PropTypes.number };

export default function ClausulaForm({ onCancel, minutaId = 0 }) {
  const dispatch = useDispatch();
  const [variavel, setVariavel] = useState(null);
  const { activeStep } = useSelector((state) => state.stepper);
  const { isEdit, variaveis, selectedItem } = useSelector((state) => state.gaji9);

  const onClose = useCallback(() => {
    onCancel();
    dispatch(resetDados());
  }, [onCancel, dispatch]);

  useEffect(() => {
    dispatch(getFromGaji9('variaveis'));
  }, [dispatch]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        title={isEdit ? 'Editar cláusula' : 'Adicionar cláusula'}
        subtitle={
          <>
            <Steps activeStep={activeStep} steps={['Identificação', 'Conteúdo', 'Alíneas', 'Resumo']} sx={{ mt: 3 }} />
            {(activeStep === 1 || activeStep === 2) && (
              <Stack sx={{ mb: 2 }}>
                <Autocomplete
                  fullWidth
                  value={variavel}
                  onChange={(event, newValue) => setVariavel(newValue)}
                  sx={{ borderRadius: 1, bgcolor: 'background.neutral' }}
                  options={variaveis
                    ?.map(({ nome, descritivo }) => `${nome}${descritivo ? ` - ${descritivo}` : ''}`)
                    ?.sort()}
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
            )}
          </>
        }
      />
      <DialogContent>
        <ItemComponent item={selectedItem} rows={4}>
          {activeStep === 0 && <Identificacao onCancel={onClose} />}
          {activeStep === 1 && <Conteudo />}
          {activeStep === 2 && <Alineas />}
          {activeStep === 3 && <Resumo minutaId={minutaId} onClose={onClose} />}
        </ItemComponent>
      </DialogContent>
    </Dialog>
  );
}

Identificacao.propTypes = { onCancel: PropTypes.func };

function Identificacao({ onCancel }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { tiposTitulares, tiposGarantias, componentes, selectedItem, isEdit } = useSelector((state) => state.gaji9);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);

  const defaultValues = useMemo(
    () => ({
      ativo: dadosStepper?.ativo || (selectedItem && selectedItem?.ativo) || true,
      titular:
        dadosStepper?.titular ||
        titularesList?.find((row) => Number(row?.id) === Number(selectedItem?.tipo_titular_id)) ||
        titularesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('titularCl'))) ||
        null,
      garantia:
        dadosStepper?.garantia ||
        garantiasList?.find((row) => Number(row?.id) === Number(selectedItem?.tipo_garantia_id)) ||
        garantiasList?.find((row) => Number(row?.id) === Number(localStorage.getItem('garantiaCl'))) ||
        null,
      componente:
        dadosStepper?.componente ||
        componentesList?.find((row) => Number(row?.id) === Number(selectedItem?.componente_id)) ||
        componentesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('componenteCl'))) ||
        null,
      seccao:
        dadosStepper?.seccao ||
        (selectedItem?.solta && 'Solta') ||
        (selectedItem?.seccao_identificacao && 'Secção de identificação') ||
        (selectedItem?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
        null,
    }),
    [dadosStepper, selectedItem, titularesList, garantiasList, componentesList]
  );

  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3} sx={{ pt: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={{ xs: 1, sm: 3 }}>
          <Stack direction="row" spacing={3} sx={{ flexGrow: 1 }}>
            <RHFAutocompleteSmp
              name="seccao"
              label="Secção"
              options={['Solta', 'Secção de identificação', 'Secção de identificação Caixa']}
            />
            {isEdit && (
              <Stack>
                <RHFSwitch name="ativo" label="Ativo" />
              </Stack>
            )}
          </Stack>
        </Stack>
        <RHFAutocompleteObj name="titular" label="Tipo de titular" options={titularesList} />
        <RHFAutocompleteObj name="componente" label="Componente" options={componentesList} />
        <RHFAutocompleteObj name="garantia" label="Tipo de garantia" options={garantiasList} />
      </Stack>
      <ButtonsStepper onCancel={onCancel} labelCancel="Cancelar" />
    </FormProvider>
  );
}

function Conteudo() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    numero_ordem: Yup.number().min(0).integer().required().label('Nº ordem'),
    conteudo: dadosStepper?.seccao && Yup.string().required().label('Conteúdo'),
    titulo: dadosStepper?.seccao !== 'Solta' && Yup.string().required().label('Título'),
  });

  const defaultValues = useMemo(
    () => ({
      titulo: dadosStepper?.titulo || selectedItem?.titulo || '',
      conteudo: dadosStepper?.conteudo || selectedItem?.conteudo || '',
      numero_ordem: dadosStepper?.numero_ordem || selectedItem?.numero_ordem || 1,
    }),
    [dadosStepper, selectedItem]
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
            {!dadosStepper?.seccao && (
              <RHFNumberField name="numero_ordem" label="Nº ordem" sx={{ width: { xs: 100, md: 150 } }} />
            )}
            <RHFTextField name="titulo" label="Título" />
          </Stack>
        )}
        <RHFTextField name="conteudo" label="Conteúdo" multiline minRows={8} maxRows={12} />
      </Stack>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Alineas() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    alineas: Yup.array(
      Yup.object({
        // conteudo: Yup.string().required().label('Conteúdo'),
        numero_ordem: Yup.number().positive().integer().label('Alínea'),
        sub_alineas: Yup.array(
          Yup.object({
            conteudo: Yup.string().required().label('Conteúdo'),
            numero_ordem: Yup.number().positive().integer().label('Subalínea'),
          })
        ),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({ alineas: dadosStepper?.alineas || selectedItem?.alineas || [] }),
    [dadosStepper, selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'alineas' });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3}>
        {fields?.length === 0 && (
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', fontStyle: 'italic', p: 3, bgcolor: 'background.neutral', borderRadius: 1 }}
          >
            Ainda não foi adicionada nenhuma alínea...
          </Typography>
        )}
        {fields.map((item, index) => (
          <Paper key={`alinea_${index}`} variant="elevation" elevation={10} sx={{ flexGrow: 1, p: 1 }}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                <RHFNumberField name={`alineas[${index}].numero_ordem`} label="Alínea" sx={{ width: 70 }} />
                <RHFTextField multiline minRows={3} maxRows={10} label="Conteúdo" name={`alineas[${index}].conteudo`} />
              </Stack>
              <DefaultAction small variant="filled" color="error" label="ELIMINAR" handleClick={() => remove(index)} />
            </Stack>
            <Subalineas alineaIndex={index} />
          </Paper>
        ))}
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <DefaultAction
            button
            label="Alínea"
            icon="adicionar"
            variant="contained"
            handleClick={() => append({ ativo: true, numero_ordem: fields?.length + 1, conteudo: '', sub_alineas: [] })}
          />
        </Stack>
      </Stack>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

Subalineas.propTypes = { alineaIndex: PropTypes.number };

export function Subalineas({ alineaIndex }) {
  const { control } = useFormContext();
  const { append, remove, fields } = useFieldArray({ control, name: `alineas[${alineaIndex}].sub_alineas` });

  return (
    <Stack spacing={2} sx={{ pl: { md: 9 }, mt: 3 }}>
      {fields.map((item, index) => (
        <Stack spacing={1} direction="row" alignItems="center" key={`alinea_${alineaIndex}_sub_alinea${index}`}>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
            <RHFNumberField
              size="small"
              label="Subalínea"
              sx={{ width: 90 }}
              name={`alineas[${alineaIndex}].sub_alineas[${index}].numero_ordem`}
            />
            <RHFTextField
              multiline
              minRows={3}
              maxRows={10}
              size="small"
              label="Conteúdo"
              name={`alineas[${alineaIndex}].sub_alineas[${index}].conteudo`}
            />
          </Stack>
          <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
        </Stack>
      ))}
      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <AddItem
          small
          label="Subalínea"
          handleClick={() => append({ ativo: true, numero_ordem: fields?.length + 1, conteudo: '' })}
        />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

Resumo.propTypes = { minutaId: PropTypes.number, onClose: PropTypes.func };

function Resumo({ minutaId, onClose }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isEdit, selectedItem, isSaving } = useSelector((state) => state.gaji9);

  console.log(selectedItem);

  const params = useMemo(
    () => ({
      minutaId,
      id: selectedItem?.id,
      afterSuccess: onClose,
      msg: `Cláusula ${isEdit ? 'atualizada' : 'adicionada'}`,
    }),
    [isEdit, minutaId, onClose, selectedItem?.id]
  );

  const handleSubmit = async () => {
    const formData = {
      ativo: dadosStepper?.ativo,
      titulo: dadosStepper?.titulo,
      conteudo: dadosStepper?.conteudo,
      solta: dadosStepper?.seccao === 'Solta',
      tipo_titular_id: dadosStepper?.titular?.id,
      componente_id: dadosStepper?.componente?.id,
      tipo_garantia_id: dadosStepper?.garantia?.id,
      numero_ordem: dadosStepper?.seccao ? 0 : dadosStepper?.numero_ordem,
      seccao_identificacao: dadosStepper?.seccao === 'Secção de identificação',
      seccao_identificacao_caixa: dadosStepper?.seccao === 'Secção de identificação Caixa',
      ...(dadosStepper?.alineas?.length > 0
        ? {
            alineas: dadosStepper?.alineas?.map((row) => ({
              ativo: row?.ativo,
              conteudo: row?.conteudo,
              numero_ordem: row?.numero_ordem,
              ...(row?.sub_alineas?.length > 0
                ? {
                    sub_alineas: row?.sub_alineas?.map((item) => ({
                      ativo: item?.ativo,
                      conteudo: item?.conteudo,
                      numero_ordem: item?.numero_ordem,
                    })),
                  }
                : null),
            })),
          }
        : null),
    };

    if (isEdit) {
      dispatch(updateItem(minutaId > 0 ? 'clausulaMinuta' : 'clausulas', JSON.stringify(formData), params));
    } else {
      dispatch(createItem('clausulas', JSON.stringify(formData), params));
    }
  };

  return (
    <List>
      <TitleResumo title="Identificação" action={() => dispatch(gotoStep(0))} />
      <Table size="small">
        <TableBody>
          <TableRowItem title="Ativo:" item={<LabelSN item={dadosStepper?.ativo} />} />
          <TableRowItem title="Secção :" text={dadosStepper?.seccao || 'Sem secção'} />
          <TableRowItem title="Titular:" text={dadosStepper?.titular?.label} />
          <TableRowItem title="Garantia:" text={dadosStepper?.garantia?.label} />
          <TableRowItem title="Componente:" text={dadosStepper?.componente?.label} />
        </TableBody>
      </Table>
      <TitleResumo title="Conteúdo" action={() => dispatch(gotoStep(1))} />
      <Table size="small">
        <TableBody>
          <TableRowItem title="Nº ordem:" text={dadosStepper?.numero_ordem?.toString()} />
          <TableRowItem title="Título:" text={dadosStepper?.titulo} />
          <TableRowItem title="Contúdo:" text={dadosStepper?.conteudo} />
        </TableBody>
      </Table>
      <TitleResumo title="Alíneas" action={() => dispatch(gotoStep(2))} />
      {dadosStepper?.alineas?.length > 0 ? (
        dadosStepper?.alineas?.map((row, index) => (
          <Stack direction="row" key={`alinea_${index}`} spacing={1} sx={{ py: 0.75 }}>
            <Typography variant="subtitle2">{row?.numero_ordem}.</Typography>
            <Stack>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                {row?.conteudo ? newLineText(row?.conteudo) : ''}
              </Typography>
              {row?.sub_alineas?.map((item, index1) => (
                <Stack direction="row" key={`alinea_${index}_sub_alinea_${index1}`} spacing={1} sx={{ py: 0.25 }}>
                  <Typography variant="subtitle2">{item?.numero_ordem}.</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                    {item?.conteudo ? newLineText(item?.conteudo) : ''}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))
      ) : (
        <Typography variant="body2" sx={{ p: 1, fontStyle: 'italic', color: 'text.secondary' }}>
          Não foi adicionada nenhuma alínea...
        </Typography>
      )}
      <ButtonsStepper onCancel={() => dispatch(backStep())} handleSubmit={handleSubmit} isSaving={isSaving} />
    </List>
  );
}

// ----------------------------------------------------------------------

TitleResumo.propTypes = { title: PropTypes.string, action: PropTypes.func };

function TitleResumo({ title, action }) {
  return (
    <ListItem
      divider
      disableGutters
      secondaryAction={<DefaultAction small color="warning" label="EDITAR" handleClick={() => action()} />}
    >
      <Typography variant="subtitle2">{title}</Typography>
    </ListItem>
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = {
  item: PropTypes.node,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function TableRowItem({ title, text = '', item = null }) {
  return text || item ? (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', pr: 0 }}>
        <Typography noWrap variant="body2">
          {title}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: '100% !important' }}>{(text && newLineText(text)) || item}</TableCell>
    </TableRow>
  ) : (
    ''
  );
}
