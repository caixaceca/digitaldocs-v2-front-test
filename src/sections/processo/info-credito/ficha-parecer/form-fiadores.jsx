import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useDispatch, useSelector } from '@/redux/store';
import { getFromIntranet, updateFicha } from '@/redux/slices/intranet';
// components
import { Dividas } from './form-ficha';
import GridItem from '@/components/GridItem';
import { DialogButons } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { FormProvider, RHFNumberField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormFiadores({ onClose, dados, fiadores }) {
  const dispatch = useDispatch();
  const { fichaFiador } = useSelector((state) => state.intranet);

  useEffect(() => {
    const entidade = dados.numero_entidade;
    if (!fichaFiador || fichaFiador?.entidade !== entidade)
      dispatch(getFromIntranet('fichaFiador', { entidade, noLoading: true, reset: { dados: null } }));
  }, [dispatch, fichaFiador, dados?.numero_entidade]);

  const formSchema = Yup.object().shape({
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
    fiancas: Yup.array(
      Yup.object({
        valor: Yup.number().positive().label('Capital inicial'),
        saldo_divida: Yup.number().positive().label('Saldo em dívida'),
        valor_prestacao: Yup.number().positive().label('Valor da prestação'),
      })
    ),
  });

  const defaultValues = useMemo(() => {
    const fiancasRaw = dados?.fiancas || fichaFiador?.fiancas || [];

    const fiancasFormatadas = fiancasRaw.map((fianca) => ({
      ...fianca,
      valor: Math.abs(fianca.valor || 0),
      saldo_divida: Math.abs(fianca.saldo_divida || 0),
      valor_prestacao: Math.abs(fianca.valor_prestacao || 0),
    }));

    return {
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
      fiancas: fiancasFormatadas,
    };
  }, [dados, fichaFiador]);

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichaFiador]);

  const onSubmit = async (values) => {
    const fiadoresAtualizados = fiadores.map((f) => {
      if (f.numero_entidade === dados.numero_entidade) return { ...f, ...values };
      return f;
    });

    dispatch(updateFicha({ fiadores: fiadoresAtualizados }));
    onClose();
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt onClose={onClose} title="Informações do fiador" sx={{ pb: 2 }} />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} justifyContent="center" sx={{ pt: 1 }}>
            <GridItem sm={6}>
              <RHFNumberField tipo="CVE" name="renda_bruto_mensal" label="Rendimento bruto" />
            </GridItem>
            <GridItem sm={6}>
              <RHFNumberField tipo="CVE" name="renda_liquido_mensal" label="Rendimento liquido" />
            </GridItem>
            <GridItem children={<Dividas name="fiancas" />} />
          </Grid>
          <DialogButons onClose={onClose} edit />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
