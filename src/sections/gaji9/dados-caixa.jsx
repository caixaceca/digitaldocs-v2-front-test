import * as Yup from 'yup';
import { useMemo } from 'react';
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
import { usePermissao } from '../../hooks/useAcesso';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem } from '../../redux/slices/gaji9';
// components
import GridItem from '../../components/GridItem';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { DefaultAction, DialogButons, Fechar } from '../../components/Actions';
import { FormProvider, RHFTextField, RHFNumberField } from '../../components/hook-form';
//
import { DetalhesContent } from './detalhes-gaji9';

// ---------------------------------------------------------------------------------------------------------------------

export default function InfoCaixa({ onClose, item }) {
  const { temPermissao } = usePermissao();
  const { toggle: open, onOpen, onClose: onClose1 } = useToggle();
  const { isLoading, infoCaixa } = useSelector((state) => state.gaji9);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt
        title="Informações da Caixa"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {!open && !isLoading && (
              <>
                {!infoCaixa && temPermissao(['CREATE_INSTITUICAO']) && (
                  <DefaultAction label="ADICIONAR" onClick={onOpen} />
                )}
                {infoCaixa && temPermissao(['UPDATE_INSTITUICAO']) && (
                  <DefaultAction button small color="warning" label="EDITAR" onClick={onOpen} />
                )}
              </>
            )}
            <Fechar onClick={onClose} />
          </Stack>
        }
      />
      <DialogContent>
        {open ? <InfoForm onClose={onClose1} /> : <DetalhesContent dados={infoCaixa} item={item} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function InfoForm({ onClose }) {
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
    const params = {
      onClose,
      id: infoCaixa?.id,
      getItem: 'infoCaixa',
      msg: `Informações ${infoCaixa ? 'atualizadas' : 'adicionadas'}`,
    };
    dispatch((infoCaixa ? updateItem : createItem)('infoCaixa', JSON.stringify(values), params));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ pt: 3 }}>
        <GridItem sm={8} children={<RHFTextField name="nome" label="Nome" />} />
        <GridItem sm={4} children={<RHFTextField name="designacao" label="Designação" />} />
        <GridItem sm={6} children={<RHFNumberField noFormat name="nif" label="NIF" />} />
        <GridItem sm={6} children={<RHFNumberField name="capital_social" label="Capital social" />} />
        <GridItem sm={6} children={<RHFNumberField noFormat name="num_matricula" label="Nº matricula" />} />
        <GridItem sm={6} children={<RHFTextField name="local_matricula" label="Local matricula" />} />
        <GridItem sm={6} children={<RHFTextField name="morada_eletronico" label="Email" />} />
        <GridItem sm={6} children={<RHFTextField name="morada_sede" label="Endereço" />} />
      </Grid>
      <DialogButons edit={!!infoCaixa} isSaving={isSaving} onClose={onClose} />
    </FormProvider>
  );
}
