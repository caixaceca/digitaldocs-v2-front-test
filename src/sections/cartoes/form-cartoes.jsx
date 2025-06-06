import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { format, add, sub } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { ptDate } from '../../utils/formatTime';
import { baralharString } from '../../utils/formatText';
// hooks
import useTable from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { updateItem, alterarBalcaopSuccess } from '../../redux/slices/digitaldocs';
// components
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';
import { TableHeadCustom } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { FormProvider, RHFTextField, RHFDatePicker, RHFAutocompleteObj } from '../../components/hook-form';

// --------------------------------------------------------------------------------------------------------------------------------------------

ValidarMultiploForm.propTypes = {
  fase: PropTypes.string,
  balcao: PropTypes.number,
  cartoes: PropTypes.array,
  onClose: PropTypes.func,
};

export function ValidarMultiploForm({ fase, cartoes = [], balcao, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({
      cartoes: cartoes?.map(({ id, nome, tipo, numero }) => ({
        nome,
        tipo,
        numero,
        nota: '',
        idItem: id,
        dataSisp: new Date(),
      })),
    }),
    [cartoes]
  );
  const methods = useForm({ defaultValues });
  const { watch, control, handleSubmit } = methods;
  const { fields } = useFieldArray({ control, name: 'cartoes' });
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          fase === 'Emissão' ? 'confirmar emissao multiplo' : 'confirmar rececao multiplo',
          JSON.stringify(
            values?.cartoes?.map(({ idItem, nota, dataSisp }) => ({
              nota,
              id: idItem,
              data_rececao_sisp: fase === 'Emissão' ? dataSisp : '',
            }))
          ),
          { balcao, onClose: () => onClose(), msg: 'Receção dos cartões confirmada' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt title="Confirmar receção de cartões" onClose={onClose} sx={{ mb: 2 }} />
      <DialogContent sx={{ p: 0 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Table size="small">
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={`cartao__${index}`} hover>
                  <TableCell>
                    <Typography variant="subtitle2" noWrap sx={{ color: 'success.main' }}>
                      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        Nº cartão:&nbsp;
                      </Typography>
                      {baralharString(item?.numero)}
                    </Typography>
                    <Typography variant="subtitle2" noWrap sx={{ color: 'info.main' }}>
                      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {fase === 'Emissão' ? 'Tipo' : 'Nome'}:&nbsp;
                      </Typography>
                      {fase === 'Emissão' ? item?.tipo : baralharString(item?.nome)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ py: 0.25 }}>
                      {fase === 'Emissão' && (
                        <RHFDatePicker
                          disableFuture
                          label="Data recessão SISP"
                          name={`cartoes[${index}].dataSisp`}
                          slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 220 } } }}
                        />
                      )}
                      <RHFTextField
                        size="small"
                        label="Nota"
                        name={`cartoes[${index}].nota`}
                        sx={{ minWidth: fase === 'Emissão' ? 200 : 300 }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack sx={{ pb: 3, pr: 3 }}>
            <DialogButons isSaving={isSaving} onClose={onClose} label="Confirmar" />
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ConfirmarPorDataForm.propTypes = {
  fase: PropTypes.string,
  datai: PropTypes.object,
  dataf: PropTypes.object,
  balcao: PropTypes.object,
  onClose: PropTypes.func,
};

export function ConfirmarPorDataForm({ balcao, fase, datai = null, dataf = null, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    data: Yup.date().typeError('Introduza uma data válida').required('Data de emissão não pode ficar vazio'),
    dataSisp: Yup.date().typeError('Introduza uma data válida').required('Data de receção não pode ficar vazio'),
  });
  const defaultValues = useMemo(
    () => ({ data: datai, balcao: balcao?.id, dataSisp: add(datai, { days: 1 }), nota: '' }),
    [balcao?.id, datai]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          fase === 'Emissão' ? 'confirmar emissao por data' : 'confirmar rececao por data',
          JSON.stringify({
            nota: values?.nota,
            balcao: values?.balcao,
            data_emissao: format(values.data, 'yyyy-MM-dd'),
            data_rececao_sisp: fase === 'Emissão' ? values.dataSisp : null,
          }),
          { fase, balcao: balcao?.id, onClose, msg: 'Receção dos cartões confirmada' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={fase === 'Emissão' ? 'sm' : 'xs'}>
      <DialogTitle>Confirmar receção de cartões</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ py: 3 }}>
          <Typography sx={{ color: 'text.secondary' }}>Balcão de entrega:</Typography>
          <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
            {balcao?.id} ({balcao?.label})
          </Typography>
        </Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <GridItem sm={fase === 'Emissão' ? 6 : 12}>
              <RHFDatePicker name="data" label="Data de emissão" minDate={datai} maxDate={dataf} disableFuture />
            </GridItem>
            {fase === 'Emissão' && (
              <GridItem sm={6}>
                <RHFDatePicker name="dataSisp" label="Data de recessão SISP" disableFuture />
              </GridItem>
            )}
            <GridItem children={<RHFTextField name="nota" label="Nota" />} />
          </Grid>
          <DialogButons edit isSaving={isSaving} onClose={onClose} label="Confirmar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

BalcaoEntregaForm.propTypes = { onClose: PropTypes.func };

export function BalcaoEntregaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { uos } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const uosList = uos
    ?.filter(({ tipo }) => tipo === 'Agências')
    ?.map(({ balcao, label }) => ({ id: balcao, label: `${balcao} - ${label}` }));

  const formSchema = Yup.object().shape({ balcao: Yup.mixed().required('Balcão de entrega não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ balcao: uosList?.find(({ id }) => id === selectedItem?.balcao_entrega) }),
    [selectedItem, uosList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem?.balcao_entrega === values?.balcao?.id) {
        enqueueSnackbar('Escolhe um balcão diferente do atual', { variant: 'error' });
      } else {
        dispatch(
          updateItem('alterar balcao', JSON.stringify({ balcaoEntrega: values?.balcao?.id }), {
            id: selectedItem?.id,
            msg: 'Balcão de entrega alterado',
            onClose: () => dispatch(alterarBalcaopSuccess({ id: selectedItem?.id, balcao: values?.balcao?.id })),
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Alterar balão de entrega</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="balcao" label="Balcão de entrega" options={uosList} />
          </Stack>
          <DialogButons edit isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AnularForm.propTypes = {
  uo: PropTypes.number,
  fase: PropTypes.string,
  uosList: PropTypes.array,
  cartoes: PropTypes.array,
  onClose: PropTypes.func,
};

export function AnularForm({ fase, cartoes, uo, uosList, onClose }) {
  const { order, orderBy, selected, onSelectRow, onSelectAllRows, onSort } = useTable({
    defaultOrder: 'asc',
    defaultOrderBy: 'numero',
  });

  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [uoData, setUoData] = useState(false);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    uo: Yup.mixed().required('Data de receção não pode ficar vazio'),
    data: Yup.date().typeError('Introduza uma data válida').required('Data de emissão não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ data: null, uo }), [uo]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();
  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'anular por balcao e data',
          JSON.stringify({ balcao: values?.uo?.id, data_emissao: format(values.data, 'yyyy-MM-dd') }),
          { emissao: fase === 'Emissão' ? 'true' : 'false', msg: 'Confirmação anulada' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleAnular = async () => {
    try {
      const params = {
        onClose,
        msg: 'Confirmação anulada',
        emissao: fase === 'Emissão' ? 'true' : 'false',
      };
      dispatch(updateItem('anular multiplo', JSON.stringify(selected?.map((row) => ({ id: row }))), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ mb: 2 }}>Anular confirmação de receção de cartões</DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="center" sx={{ mb: 2, width: 1 }}>
          <FormControlLabel
            label="Anular por balcão e data de emissão"
            control={<Switch checked={uoData} onChange={(event, value) => setUoData(value)} />}
          />
        </Stack>
        {uoData ? (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <GridItem sm={8}>
                <RHFAutocompleteObj name="uo" label="Balcão de entrega" options={uosList} />
              </GridItem>
              <GridItem sm={4}>
                <RHFDatePicker
                  name="data"
                  disableFuture
                  label="Data de emissão"
                  minDate={fase === 'Emissão' ? sub(new Date(), { years: 1 }) : sub(new Date(), { months: 1 })}
                />
              </GridItem>
            </Grid>
            <DialogButons isSaving={isSaving} onClose={onClose} color="error" label="Anular" />
          </FormProvider>
        ) : (
          <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
            <Table size="small">
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                rowCount={cartoes.length}
                numSelected={selected.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    cartoes.map(({ id }) => id)
                  )
                }
                headLabel={[
                  { id: 'data_emissao', label: 'Data emissão' },
                  { id: 'numero', label: 'Nº cartão', align: 'center' },
                  { id: 'nome', label: 'Nome cliente' },
                  { id: 'tipo', label: 'Tipo cartão' },
                ]}
              />
              <TableBody>
                {cartoes.map((row, index) => (
                  <TableRow key={`${row.id}_${index}`} hover>
                    <TableCell padding="checkbox" sx={{ '&.MuiTableCell-paddingCheckbox': { padding: 1 } }}>
                      <Checkbox checked={selected.includes(row.id)} onClick={() => onSelectRow(row.id)} />
                    </TableCell>
                    <TableCell>{ptDate(row.data_emissao)}</TableCell>
                    <TableCell align="center">{row?.numero}</TableCell>
                    <TableCell>{row?.nome}</TableCell>
                    <TableCell>{row?.tipo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      {!uoData && (
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          {selected.length > 0 && (
            <Button onClick={handleAnular} variant="soft" color="error" loading={isSaving}>
              Anular
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
