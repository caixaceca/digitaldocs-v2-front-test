import * as Yup from 'yup';
import { add } from 'date-fns';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updatePedidoForm, deleteAnexo } from '../../../redux/slices/cc';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
} from '../../../components/hook-form';
import { DefaultAction } from '../../../components/Actions';
//
import { NextPrev } from './PedidoSteps';
import { AnexosEntidades } from './Anexos';
// _mock_
import { estadosCivil } from '../../../_mock';

// ----------------------------------------------------------------------

EntidadesRelacionadas.propTypes = { entidades: PropTypes.array };

export default function EntidadesRelacionadas({ entidades = [] }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pedidoForm } = useSelector((state) => state.cc);

  const formSchema = Yup.object().shape({
    entidades: Yup.array(
      Yup.object({
        anexos: Yup.array(
          Yup.object({
            anexo: Yup.mixed().required('Introduza o anexo'),
            descricao: Yup.mixed().required('Seleciona o tipo de anexo'),
          })
        ),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      entidades:
        pedidoForm?.entidades ||
        entidades?.map((row) => ({
          nif: row?.nif,
          idItem: row?.id,
          nome: row?.nome,
          email: row?.email,
          doc_id: row?.doc_id,
          morada: row?.morada,
          relacao: row?.relacao,
          entidade: row?.entidade,
          telefone: row?.telefone,
          is_cliente: !!row?.entidade,
          titularidade: row?.titularidade,
          estado_civil: row?.estado_civil,
          telefone_sec: row?.telefone_sec,
          regime_casamento: row?.regime_casamento,
          data_nascimento: row?.data_nascimento ? add(new Date(row?.data_nascimento), { hours: 2 }) : null,
          doc_data_validade: row?.data_validade ? add(new Date(row?.data_validade), { hours: 2 }) : null,
          doc_data_emissao: row?.doc_data_emissao ? add(new Date(row?.doc_data_emissao), { hours: 2 }) : null,
          anexos: [],
        })) ||
        [],
    }),
    [entidades, pedidoForm?.entidades]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoForm, entidades]);

  const onSubmit = async () => {
    try {
      dispatch(updatePedidoForm(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleAdd = () => {
    append({
      anexos: [],
      nif: '',
      nome: '',
      email: '',
      idItem: '',
      doc_id: '',
      morada: '',
      relacao: '',
      entidade: '',
      telefone: '',
      is_cliente: true,
      estado_civil: '',
      telefone_sec: '',
      titularidade: '',
      regime_casamento: '',
      data_nascimento: null,
      doc_data_emissao: null,
      doc_data_validade: null,
    });
  };

  const handleRemove = (index, itemId) => {
    if (itemId) {
      dispatch(deleteAnexo({ itemId, tipoItem: 'entidade' }));
    } else {
      remove(index);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title="6. Entidades"
          sx={{ p: 2, pr: 2.5 }}
          action={<DefaultAction button label="Adicionar" handleClick={handleAdd} />}
        />
      </Card>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((item, index) => {
          const entidade = values?.entidades?.find((row, _index) => _index === index);
          return (
            <Card key={item.id} sx={{ p: 2 }}>
              <Stack spacing={2} alignItems="center" justifyContent="center" direction="row">
                <Grid container spacing={3} justifyContent="center">
                  {entidade?.titularidade ? (
                    <>
                      <Grid item xs={12}>
                        <EntidadeInfo title="Titularidade" text={entidade?.titularidade} />
                        <EntidadeInfo title="Nº entidade" text={entidade?.entidade} />
                        <EntidadeInfo title="Nome" text={entidade?.nome} />
                      </Grid>
                    </>
                  ) : (
                    <>
                      {entidade?.is_cliente && (entidade?.entidade || entidade?.nome) && (
                        <Grid item xs={12}>
                          {entidade?.entidade && <EntidadeInfo title="Nº entidade" text={entidade?.entidade} />}
                          {entidade?.nome && <EntidadeInfo title="Nome" text={entidade?.nome} />}
                        </Grid>
                      )}
                      <Grid item xs={12} sm={entidade?.is_cliente ? 6 : 4} lg={3}>
                        <RHFSwitch label="Cliente da caixa" name={`entidades[${index}].is_cliente`} />
                      </Grid>
                      {entidade?.is_cliente ? (
                        <Grid item xs={12} sm={6} lg={3}>
                          <RHFNumberField required label="Nº entidade" name={`entidades[${index}].entidade`} />
                        </Grid>
                      ) : (
                        <>
                          <Grid item xs={12} sm={8} lg={9}>
                            <RHFTextField required label="Nome" name={`entidades[${index}].nome`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="NIF" required name={`entidades[${index}].nif`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Doc. identificação" required name={`entidades[${index}].doc_id`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFDatePicker
                              label="Emissão doc. identificação"
                              name={`entidades[${index}].doc_data_emissao`}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFDatePicker
                              label="Validade doc. identificação"
                              name={`entidades[${index}].doc_data_validade`}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFDatePicker
                              required
                              label="Data nascimento"
                              name={`entidades[${index}].data_nascimento`}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFAutocompleteSimple
                              label="Estado civil"
                              options={estadosCivil}
                              name={`entidades[${index}].estado_civil`}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Regime casamento" name={`entidades[${index}].regime_casamento`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Relação com o proponente" name={`entidades[${index}].relacao`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Telefone" name={`entidades[${index}].telefone`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Telefone secundário" name={`entidades[${index}].telefone_sec`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Email" name={`entidades[${index}].email`} />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={3}>
                            <RHFTextField label="Morada" name={`entidades[${index}].morada`} />
                          </Grid>
                        </>
                      )}
                    </>
                  )}
                </Grid>
                {!item?.titularidade && (
                  <DefaultAction
                    small
                    label="ELIMINAR"
                    color="error"
                    handleClick={() => handleRemove(index, item?.idItem)}
                  />
                )}
              </Stack>
              <AnexosEntidades indexEntidade={index} entidadeId={item?.idItem} />
            </Card>
          );
        })}
      </Stack>
      <NextPrev back />
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

EntidadeInfo.propTypes = { title: PropTypes.string, text: PropTypes.string };

function EntidadeInfo({ title, text }) {
  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <Typography sx={{ color: 'text.secondary' }}>{title}:</Typography>
      <Typography>{text}</Typography>
    </Stack>
  );
}
