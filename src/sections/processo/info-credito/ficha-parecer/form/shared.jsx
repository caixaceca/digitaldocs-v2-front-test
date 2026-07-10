import * as Yup from 'yup';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { situacoesLaboral } from '../utilss';
// components
import GridItem from '@/components/GridItem';
import { AddItem, DefaultAction } from '@/components/Actions';
import { RHFTextField, RHFNumberField, RHFAutocompleteSmp } from '@/components/hook-form';

const divida = { valor: '', valor_prestacao: '', saldo_divida: '', situacao: '' };

export const shapeDivida = () =>
  Yup.array(
    Yup.object({
      situacao: Yup.string().required().label('Situação'),
      valor: Yup.number().positive().label('Capital inicial'),
      saldo_divida: Yup.number().positive().label('Saldo em dívida'),
      valor_prestacao: Yup.number().positive().label('Valor da prestação'),
    })
  );

// ---------------------------------------------------------------------------------------------------------------------

export function Dividas({ name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const title =
    (name === 'fiancas' && 'Avales/Fianças') ||
    (name === 'dividas_externas' && 'Dívidas em outros bancos') ||
    'Avales/Fianças em outros bancos';

  return (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="subtitle1">{title}</Typography>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
          <AddItem dados={{ small: true }} onClick={() => append(divida)} />
        </Stack>
      </Stack>

      {fields.map((item, index) => (
        <Stack direction="row" spacing={1} key={item.id} alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <Stack direction={{ xs: 'row' }} spacing={2} sx={{ width: 1 }}>
              <RHFNumberField tipo="CVE" label="Capital inicial" name={`${name}[${index}].valor`} />
              <RHFNumberField tipo="CVE" label="Saldo em dívida" name={`${name}[${index}].saldo_divida`} />
            </Stack>
            <Stack direction={{ xs: 'row' }} spacing={2} sx={{ width: 1 }}>
              <RHFNumberField tipo="CVE" label="Valor da prestação" name={`${name}[${index}].valor_prestacao`} />
              <RHFTextField label="Situação" name={`${name}[${index}].situacao`} />
            </Stack>
          </Stack>
          <DefaultAction onClick={() => remove(index)} label="ELIMINAR" small />
        </Stack>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SituacaoLaboral({ prefixo = '' }) {
  return (
    <>
      <GridItem sm={6} md={3}>
        <RHFAutocompleteSmp name={`situacao_laboral${prefixo}`} label="Situação laboral" options={situacoesLaboral} />
      </GridItem>
      <GridItem sm={6} md={3}>
        <RHFTextField name={`entidade_patronal${prefixo}`} label="Entidade patronal" />
      </GridItem>
      <GridItem sm={6} md={3}>
        <RHFNumberField tipo="CVE" name={`renda_bruto_mensal${prefixo}`} label="Rendimento bruto" />
      </GridItem>
      <GridItem sm={6} md={3}>
        <RHFNumberField tipo="CVE" name={`renda_liquido_mensal${prefixo}`} label="Rendimento liquido" />
      </GridItem>
    </>
  );
}
