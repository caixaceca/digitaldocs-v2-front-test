import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem } from '../../redux/slices/gaji9';
// components
import GridItem from '../../components/GridItem';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { DefaultAction, DialogButons, Fechar } from '../../components/Actions';
import { FormProvider, RHFTextField, RHFNumberField } from '../../components/hook-form';
//
import { DetalhesContent } from './DetalhesGaji9';

// ---------------------------------------------------------------------------------------------------------------------

InfoCaixa.propTypes = { onCancel: PropTypes.func, item: PropTypes.string };

export default function InfoCaixa({ onCancel, item }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isLoading, infoCaixa } = useSelector((state) => state.gaji9);

  return (
    <Dialog open onClose={() => onCancel()} fullWidth maxWidth="sm">
      <DialogTitleAlt
        title="Informações da Caixa"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {!open && !isLoading && !infoCaixa && <DefaultAction label="ADICIONAR" handleClick={onOpen} />}
            {!open && !isLoading && infoCaixa && <DefaultAction color="warning" label="EDITAR" handleClick={onOpen} />}
            <Fechar handleClick={() => onCancel()} />
          </Stack>
        }
      />
      <DialogContent>
        {open ? <InfoForm onCancel={() => onClose()} /> : <DetalhesContent dados={infoCaixa} item={item} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

InfoForm.propTypes = { onCancel: PropTypes.func };

export function InfoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isSaving, infoCaixa } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    nome: Yup.string().required().label('Nome'),
    nif: Yup.number().positive().integer().label('NIF'),
    morada_sede: Yup.string().required().label('Endereço'),
    designacao: Yup.string().required().label('Designação'),
    morada_eletronico: Yup.string().required().label('Email'),
    num_matricula: Yup.string().required().label('Nº matricula'),
    local_matricula: Yup.string().required().label('Local matricula'),
    capital_social: Yup.number().positive().integer().label('Capital social'),
  });
  const defaultValues = useMemo(
    () => ({
      nif: infoCaixa?.nif || '',
      nome: infoCaixa?.nome || '',
      designacao: infoCaixa?.designacao || '',
      morada_sede: infoCaixa?.morada_sede || '',
      num_matricula: infoCaixa?.num_matricula || '',
      capital_social: infoCaixa?.capital_social || '',
      local_matricula: infoCaixa?.local_matricula || '',
      morada_eletronico: infoCaixa?.morada_eletronico || '',
    }),
    [infoCaixa]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    if (infoCaixa) {
      dispatch(
        updateItem('infoCaixa', JSON.stringify(values), { onCancel, id: infoCaixa?.id, msg: 'Informações atualizadas' })
      );
    } else {
      dispatch(
        createItem('infoCaixa', JSON.stringify(values), { getSuccess: true, onCancel, msg: 'Informações adicionadas' })
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ pt: 3 }}>
        <GridItem sm={4} children={<RHFTextField name="nome" label="Nome" />} />
        <GridItem sm={8} children={<RHFTextField name="designacao" label="Designação" />} />
        <GridItem sm={6} children={<RHFNumberField name="nif" label="NIF" />} />
        <GridItem sm={6} children={<RHFNumberField name="capital_social" label="Capital social" />} />
        <GridItem sm={6} children={<RHFNumberField name="num_matricula" label="Nº matricula" />} />
        <GridItem sm={6} children={<RHFTextField name="local_matricula" label="Local matricula" />} />
        <GridItem sm={6} children={<RHFTextField name="morada_eletronico" label="Email" />} />
        <GridItem sm={6} children={<RHFTextField name="morada_sede" label="Endereço" />} />
      </Grid>
      <DialogButons edit={!!infoCaixa} isSaving={isSaving} onCancel={onCancel} />
    </FormProvider>
  );
}
