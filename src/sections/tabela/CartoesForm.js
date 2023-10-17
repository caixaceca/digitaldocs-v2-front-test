import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
// utils
import { format } from 'date-fns';
import { ptDate, ptDateTime } from '../../utils/formatTime';
// redux
import { updateItem } from '../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../redux/store';
// components
import {
  RHFCheckbox,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import Label from '../../components/Label';
import { Fechar, CriadoEmPor, DialogButons } from '../../components/Actions';

// --------------------------------------------------------------------------------------------------------------------------------------------

ValidarForm.propTypes = {
  open: PropTypes.bool,
  dense: PropTypes.bool,
  fase: PropTypes.string,
  balcao: PropTypes.number,
  cartoes: PropTypes.array,
  onCancel: PropTypes.func,
};

export function ValidarForm({ fase, dense, open, cartoes, balcao, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  const cartoesPorValidar = useMemo(
    () =>
      fase === 'Emissão'
        ? cartoes
            ?.filter((item) => !item?.emissao_validado)
            ?.slice(0, 25)
            ?.map((row) => ({ idItem: row?.id, check: false, numero: row?.numero, nome: row?.nome, nota: '' }))
        : cartoes
            ?.filter((item) => !item?.rececao_validado)
            ?.slice(0, 25)
            ?.map((row) => ({ idItem: row?.id, check: false, numero: row?.numero, nome: row?.nome, nota: '' })),
    [cartoes, fase]
  );

  const defaultValues = useMemo(() => ({ cartoes: cartoesPorValidar }), [cartoesPorValidar]);
  const methods = useForm({ defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const { fields } = useFieldArray({ control, name: 'cartoes' });
  const values = watch();

  useEffect(() => {
    if (cartoesPorValidar) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartoesPorValidar]);

  const onSubmit = async () => {
    const cartoesChecked = values?.cartoes?.filter((row) => row?.check);
    try {
      if (cartoesChecked?.length > 0) {
        dispatch(
          updateItem(
            fase === 'Emissão' ? 'confirmar emissao multiplo' : 'confirmar rececao multiplo',
            JSON.stringify(cartoesChecked?.map((row) => ({ id: row?.idItem, nota: row?.nota }))),
            {
              mail,
              balcao,
              msg: 'rececao confirmada',
            }
          )
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ mb: 2 }}>Confirmar receção de cartões</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <TableContainer sx={{ minWidth: 600, position: 'relative' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableBody>
                {fields.map((item, index) => {
                  const isCheck = values?.cartoes?.find((row) => row?.idItem === item.idItem);
                  return (
                    <TableRow hover key={`cartao__${index}`} sx={{ bgcolor: isCheck?.check && 'action.selected' }}>
                      <TableCell sx={{ pr: 0 }}>
                        <RHFCheckbox name={`cartoes[${index}].check`} />
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">
                            <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                              Nº cartão:&nbsp;
                            </Typography>
                            {item?.numero}
                          </Typography>
                          <Typography variant="body2" noWrap>
                            {item?.nome}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell width={'100%'}>
                        <RHFTextField name={`cartoes[${index}].nota`} label="Nota" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack sx={{ pb: 3, pr: 3 }}>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} label="Confirmar" />
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ConfirmarPorDataForm.propTypes = {
  open: PropTypes.bool,
  fase: PropTypes.string,
  balcao: PropTypes.number,
  onCancel: PropTypes.func,
};

export function ConfirmarPorDataForm({ open, balcao, fase, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({ data: Yup.date().typeError('Data não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ data: new Date(), nota: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          fase === 'Emissão' ? 'confirmar emissao por data' : 'confirmar rececao por data',
          JSON.stringify({ data_emissao: format(values.data, 'yyyy-MM-dd'), nota: values?.nota }),
          { mail, fase, balcao, msg: 'rececao confirmada' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Confirmar receção de cartões</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFDatePicker name="data" label="Data de emissão" disableFuture />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="nota" label="Nota" />
            </Grid>
          </Grid>
          <DialogButons edit isSaving={isSaving} onCancel={onCancel} label="Confirmar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

BalcaoEntregaForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function BalcaoEntregaForm({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, uos } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const uosList = uos
    ?.filter((row) => row?.tipo === 'Agências')
    ?.map((uo) => ({ id: uo?.balcao, label: `${uo?.balcao} - ${uo?.label}` }));

  const formSchema = Yup.object().shape({ balcao: Yup.mixed().required('Balcão de entrega não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ balcao: uosList?.find((row) => row?.id === selectedItem?.balcao_entrega) }),
    [selectedItem, uosList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem?.balcao_entrega === values?.balcao?.id) {
        enqueueSnackbar('Escolhe um balcão diferente do atual', { variant: 'error' });
      } else {
        dispatch(
          updateItem('alterar balcao', JSON.stringify({ balcaoEntrega: values?.balcao?.id }), {
            mail,
            id: selectedItem.id,
            msg: 'balcao alterado',
            balcao: values?.balcao?.id,
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Alterar balão de entrega</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="balcao" label="Balcão de entrega" options={uosList} />
            </Grid>
          </Grid>
          <DialogButons edit isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

Detalhes.propTypes = { closeModal: PropTypes.func };

export function Detalhes({ closeModal }) {
  const { uos } = useSelector((state) => state.intranet);
  const { selectedItem, isOpenModalDesariquivar, isLoading } = useSelector((state) => state.digitaldocs);
  const bEntrega = uos?.find((uo) => Number(uo.balcao) === Number(selectedItem?.balcao_entrega));
  const bDomicilio = uos?.find((uo) => Number(uo.balcao) === Number(selectedItem?.balcao_cliente));
  const bEntregaOriginal = uos?.find((uo) => Number(uo.balcao) === Number(selectedItem?.balcao_entrega_original));
  const bEmissao = uos?.find((uo) => Number(uo.balcao) === Number(selectedItem?.balcao_emissao));

  return (
    <Dialog open={isOpenModalDesariquivar} onClose={closeModal} fullWidth maxWidth="sm">
      <DialogTitle sx={{ mb: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          Detalhes do cartão
          <Fechar handleClick={closeModal} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Stack justifyContent="space-between" alignItems="center" spacing={3}>
            <Skeleton variant="text" sx={{ height: 300, width: 1, mt: 2, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 200, width: 1, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 150, width: 1, transform: 'scale(1)' }} />
          </Stack>
        ) : (
          <>
            <List>
              <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                <Typography variant="subtitle1">Dados</Typography>
              </ListItem>
              {selectedItem?.tipo && <TextItem title="Tipo de cartão:" text={selectedItem.tipo} />}
              {selectedItem?.numero && <TextItem title="Nº do cartão:" text={selectedItem?.numero?.substring(9, 15)} />}
              {selectedItem?.data_emissao && (
                <TextItem title="Data de emissão:" text={ptDate(selectedItem.data_emissao)} />
              )}
              {bDomicilio && (
                <TextItem title="Balcão de domicílio:" text={`${bDomicilio?.balcao} - ${bDomicilio?.label}`} />
              )}
              {bEmissao && <TextItem title="Balcão de emissão:" text={`${bEmissao?.balcao} - ${bEmissao?.label}`} />}
              {bEntrega && (
                <TextItem
                  title="Balcão de entrega:"
                  text={`${bEntrega?.balcao} - ${bEntrega?.label}`}
                  text1={
                    bEntregaOriginal && selectedItem?.balcao_entrega !== selectedItem?.balcao_entrega_original ? (
                      <Typography>ORIGINAL: {`${bEntregaOriginal?.balcao} - ${bEntregaOriginal?.label}`}</Typography>
                    ) : null
                  }
                />
              )}
              {selectedItem?.cliente && <TextItem title="Nº cliente:" text={selectedItem.cliente} />}
              {selectedItem?.nome && <TextItem title="Nome:" text={selectedItem.nome} />}
            </List>
            <List>
              <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                <Typography variant="subtitle1">Confirmação de receção</Typography>
              </ListItem>
              <TextItem
                title="Confirmação DOP-CE:&nbsp;"
                label={
                  <Label
                    variant="ghost"
                    sx={{ py: 1.5, typography: 'subtitle2' }}
                    color={selectedItem?.emissao_validado ? 'success' : 'error'}
                  >
                    {selectedItem?.emissao_validado ? 'Sim' : 'Não'}
                  </Label>
                }
                text1={
                  selectedItem?.emissao_validado ? (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {selectedItem?.emissao_validado_por && (
                        <CriadoEmPor tipo="user" value={selectedItem?.emissao_validado_por} />
                      )}
                      {selectedItem?.emissao_validado_em && (
                        <CriadoEmPor tipo="date" value={ptDateTime(selectedItem?.emissao_validado_em)} />
                      )}
                      {selectedItem?.nota_emissao && <CriadoEmPor tipo="note" value={selectedItem?.nota_emissao} />}
                    </Stack>
                  ) : null
                }
              />
              <TextItem
                title="Confirmação Agência:"
                label={
                  <Label
                    variant="ghost"
                    sx={{ py: 1.5, typography: 'subtitle2' }}
                    color={selectedItem?.rececao_validado ? 'success' : 'error'}
                  >
                    {selectedItem?.rececao_validado ? 'Sim' : 'Não'}
                  </Label>
                }
                text1={
                  selectedItem?.rececao_validado ? (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {selectedItem?.rececao_validado_por && (
                        <CriadoEmPor tipo="user" value={selectedItem?.rececao_validado_por} />
                      )}
                      {selectedItem?.rececao_validado_em && (
                        <CriadoEmPor tipo="date" value={ptDateTime(selectedItem?.rececao_validado_em)} />
                      )}
                      {selectedItem?.nota_rececao && <CriadoEmPor tipo="note" value={selectedItem?.nota_rececao} />}
                    </Stack>
                  ) : null
                }
              />
            </List>
            <List>
              <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                <Typography variant="subtitle1">Registo</Typography>
              </ListItem>
              {selectedItem?.criado_em && <TextItem title="Criado em:" text={ptDateTime(selectedItem.criado_em)} />}
              {selectedItem?.modificado_em && (
                <TextItem title="Modificado em:" text={ptDateTime(selectedItem.modificado_em)} />
              )}
              {selectedItem?.modificado_por && <TextItem title="Modificado por:" text={selectedItem.modificado_por} />}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

TextItem.propTypes = { title: PropTypes.string, text: PropTypes.string, text1: PropTypes.node, label: PropTypes.node };

function TextItem({ title, text = '', text1 = null, label = null }) {
  return (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ p: 1.5, pb: 0 }}>
      <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
      <Stack>
        {text && <Typography>{text}</Typography>}
        {label && <Typography>{label}</Typography>}
        {text1}
      </Stack>
    </Stack>
  );
}
