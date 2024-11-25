import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useCallback } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { newLineText } from '../../utils/formatText';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem } from '../../redux/slices/gaji9';
import { updateDados, resetDados, backStep, gotoStep } from '../../redux/slices/stepper';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import Steps from '../../components/Steps';
import Label from '../../components/Label';
import { DefaultAction, ButtonsStepper } from '../../components/Actions';
//
import { ItemComponent } from './Gaji9Form';

// ---------------------------------------------------------------------------------------------------------------------

ClausulaForm.propTypes = { onCancel: PropTypes.func, dados: PropTypes.object };

export default function ClausulaForm({ onCancel, dados }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);
  const { isEdit, selectedItem } = useSelector((state) => state.gaji9);

  const onClose = useCallback(() => {
    onCancel();
    dispatch(resetDados());
  }, [onCancel, dispatch]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar cláusula' : 'Adicionar cláusula'}</DialogTitle>
      <DialogContent>
        <Steps activeStep={activeStep} steps={['Cláusula', 'Incisos/Alíneas', 'Resumo']} sx={{ mt: 3 }} />
        <ItemComponent item={selectedItem} rows={1}>
          {activeStep === 0 && <Clausula onClose={onClose} dados={dados} />}
          {activeStep === 1 && <Incisos />}
          {activeStep === 2 && <Resumo />}
        </ItemComponent>
      </DialogContent>
    </Dialog>
  );
}

Clausula.propTypes = { onCancel: PropTypes.func, dados: PropTypes.object };

function Clausula({ onCancel, dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isEdit, titulares, garantias, produtos, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    // seccao: Yup.mixed().required().label('Secção'),
    // titulo: Yup.string().required().label('Título'),
    // titular: Yup.mixed().required().label('Titular'),
    // garantia: Yup.mixed().required().label('Garantia'),
    // componente: Yup.mixed().required().label('Componente'),
    // numero: Yup.number().positive().typeError().required().label('Nº'),
  });

  const defaultValues = useMemo(
    () => ({
      titulo: dadosStepper?.titulo || selectedItem?.titulo || '',
      conteudo: dadosStepper?.conteudo || selectedItem?.conteudo || '',
      numero: dadosStepper?.numero || selectedItem?.numero_ordem || null,
      seccao: dadosStepper?.seccao || selectedItem?.seccao_identificacao || null,
      ativo: dadosStepper?.ativo || (selectedItem && selectedItem?.ativo) || true,
      seccao_caixa: dadosStepper?.seccao_caixa || selectedItem?.seccao_identificacao_caixa || false,
      titular:
        dadosStepper?.titular ||
        titulares?.find((row) => row?.id === selectedItem?.tipo_titular_id) ||
        titulares?.find((row) => row?.id === dados?.titularId) ||
        null,
      garantia:
        dadosStepper?.garantia ||
        garantias?.find((row) => row?.id === selectedItem?.tipo_garantia_id) ||
        garantias?.find((row) => row?.id === dados?.garantiaId) ||
        null,
      componente:
        dadosStepper?.componente ||
        produtos?.find((row) => row?.id === selectedItem?.componente_id) ||
        produtos?.find((row) => row?.id === dados?.produtoId) ||
        null,
    }),
    [dadosStepper, selectedItem, dados, titulares, garantias, produtos]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
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
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <RHFNumberField name="numero" label="Nº" sx={{ width: { xs: 100, md: 150 } }} />
          <RHFTextField name="titulo" label="Título" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <RHFAutocompleteSimple name="seccao" label="Secção" options={[]} />
          <RHFSwitch name="seccao_caixa" label="Secção Caixa" />
        </Stack>
        <RHFAutocompleteObject name="titular" label="Titular" options={titulares} />
        <RHFAutocompleteObject name="garantia" label="Garantia" options={garantias} />
        <RHFAutocompleteObject name="componente" label="Componente" options={produtos} />
        <RHFTextField name="conteudo" label="Conteúdo" multiline rows={3} />
        {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
      </Stack>
      <ButtonsStepper onCancel={onCancel} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Incisos() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    incisos: Yup.array(
      Yup.object({
        // conteudo: Yup.string().required().label('Conteúdo'),
        numero: Yup.number().positive().typeError().required().label('Nº'),
        alineas: Yup.array(
          Yup.object({
            numero: Yup.string().required().label('Alínea'),
            conteudo: Yup.string().required().label('Conteúdo'),
          })
        ),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ incisos: dadosStepper?.incisos || [] }), [dadosStepper]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'incisos' });

  useEffect(() => {
    reset(defaultValues);
  }, [selectedItem, defaultValues, reset]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Stack spacing={3}>
        {fields.map((item, index) => (
          <Paper key={`inciso_${index}`} variant="elevation" elevation={10} sx={{ flexGrow: 1, p: 1 }}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                <RHFNumberField name={`incisos[${index}].numero`} label="Nº" sx={{ width: 80 }} />
                <RHFTextField multiline rows={3} label="Conteúdo" name={`incisos[${index}].conteudo`} />
              </Stack>
              <DefaultAction small variant="filled" color="error" label="ELIMINAR" handleClick={() => remove(index)} />
            </Stack>
            <AlineasInciso incisoIndex={index} />
          </Paper>
        ))}
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <DefaultAction
            button
            label="Inciso"
            icon="adicionar"
            handleClick={() => append({ ativo: true, numero: fields?.length + 1, conteudo: '', alineas: [] })}
          />
        </Stack>
      </Stack>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

AlineasInciso.propTypes = { incisoIndex: PropTypes.number };

export function AlineasInciso({ incisoIndex }) {
  const { control } = useFormContext();
  const { append, remove, fields } = useFieldArray({ control, name: `incisos[${incisoIndex}].alineas` });

  return (
    <Stack spacing={2}>
      <Divider sx={{ pt: 2 }} />
      {fields.map((item, index) => (
        <Stack spacing={1} direction="row" alignItems="center" key={`inciso_${incisoIndex}_alinea${index}`}>
          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
            <RHFTextField
              size="small"
              label="Alínea"
              sx={{ width: 80 }}
              name={`incisos[${incisoIndex}].alineas[${index}].numero`}
            />
            <RHFTextField
              rows={2}
              multiline
              size="small"
              label="Conteúdo"
              name={`incisos[${incisoIndex}].alineas[${index}].conteudo`}
            />
          </Stack>
          <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
        </Stack>
      ))}
      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <DefaultAction
          small
          button
          label="Alínea"
          icon="adicionar"
          handleClick={() => append({ ativo: true, numero: '', conteudo: '' })}
        />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Resumo() {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isEdit, isSaving } = useSelector((state) => state.gaji9);

  const handleSubmit = async () => {
    const formData = {
      ativo: dadosStepper?.ativo,
      titulo: dadosStepper?.titulo,
      conteudo: dadosStepper?.conteudo,
      numero_ordem: dadosStepper?.numero,
      seccao_identificacao: dadosStepper?.seccao,
      tipo_titular_id: dadosStepper?.titular?.id,
      tipo_garantia_id: dadosStepper?.garantia?.id,
      componente_id: dadosStepper?.componente?.id,
      seccao_identificacao_caixa: dadosStepper?.seccao_caixa,
      ...(dadosStepper?.incisos?.length > 0
        ? {
            alineas: dadosStepper?.incisos?.map((row) => ({
              ativo: row?.ativo,
              conteudo: row?.conteudo,
              numero_ordem: row?.numero,
              ...(row?.alineas?.length > 0
                ? {
                    sub_alineas: row?.alineas?.map((item) => ({
                      ativo: item?.ativo,
                      conteudo: item?.conteudo,
                      numero_ordem: item?.numero,
                    })),
                  }
                : null),
            })),
          }
        : null),
    };

    if (isEdit) {
      dispatch(updateItem('clausulas', JSON.stringify(formData), { msg: 'Cláusula atualizada' }));
    } else {
      dispatch(createItem('clausulas', JSON.stringify(formData), { msg: 'Cláusula adicionada' }));
    }
  };

  return (
    <List>
      <ListItem
        divider
        disableGutters
        secondaryAction={
          <DefaultAction small color="warning" label="EDITAR" handleClick={() => dispatch(gotoStep(0))} />
        }
      >
        <Typography variant="subtitle2">Cláusula</Typography>
      </ListItem>
      <Table size="small">
        <TableBody>
          <TableRowItem title="Título:" text={dadosStepper?.titulo} />
          <TableRowItem title="Secção:" text={dadosStepper?.seccao} />
          <TableRowItem
            title="Secção Caixa:"
            item={
              <Label color={dadosStepper?.seccao_caixa ? 'success' : 'default'}>
                {dadosStepper?.seccao_caixa ? 'Sim' : 'Não'}
              </Label>
            }
          />
          <TableRowItem title="Número:" text={dadosStepper?.numero} />
          <TableRowItem title="Titular:" text={dadosStepper?.titular?.label} />
          <TableRowItem title="Garantia:" text={dadosStepper?.garantia?.label} />
          <TableRowItem title="Componente:" text={dadosStepper?.componente?.label} />
          <TableRowItem title="Contúdo:" text={dadosStepper?.conteudo} />
        </TableBody>
      </Table>
      <ListItem
        divider
        disableGutters
        secondaryAction={
          <DefaultAction small color="warning" label="EDITAR" handleClick={() => dispatch(gotoStep(1))} />
        }
      >
        <Typography variant="subtitle2">Incisos/Alíneas</Typography>
      </ListItem>
      {dadosStepper?.incisos?.length > 0 ? (
        dadosStepper?.incisos?.map((row, index) => (
          <Stack direction="row" key={`inciso_${index}`} spacing={1} sx={{ py: 0.75 }}>
            <Typography variant="subtitle2">{row?.numero}.</Typography>
            <Stack>
              <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                {newLineText(row?.conteudo)}
              </Typography>
              {row?.alineas?.map((item, index1) => (
                <Stack direction="row" key={`inciso_${index}_alinea_${index1}`} spacing={1} sx={{ py: 0.25 }}>
                  <Typography variant="subtitle2">{item?.numero}.</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'justify' }}>
                    {newLineText(item?.conteudo)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))
      ) : (
        <Typography variant="body2" sx={{ p: 1, fontStyle: 'italic', color: 'text.secondary' }}>
          Não foi adicionado nenhum inciso...
        </Typography>
      )}
      <ButtonsStepper onCancel={() => dispatch(backStep())} handleSubmit={handleSubmit} isSaving={isSaving} />
    </List>
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = { title: PropTypes.string, text: PropTypes.string, item: PropTypes.node };

function TableRowItem({ title, text = '', item = null }) {
  return text || item ? (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', pr: 0 }}>
        <Typography noWrap variant="body2">
          {title}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: '100% !important' }}>{text ? newLineText(text) : item}</TableCell>
    </TableRow>
  ) : (
    ''
  );
}
