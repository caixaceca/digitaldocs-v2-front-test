import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updateItemCC, closeModalAnexo } from '../../../redux/slices/cc';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// components
import DialogConfirmar from '../../../components/DialogConfirmar';
import { Notificacao } from '../../../components/NotistackProvider';
import {
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFDatePicker,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
//
import Anexos from './Anexos';
import Despesas from './Despesas';
import Garantias from './Garantias';
import Entidades from './Entidades';
import OutrosCreditos from './OutrosCreditos';
// _mock
import { escaloes } from '../../../_mock';

// ----------------------------------------------------------------------

PedidoForm.propTypes = { dados: PropTypes.object };

export default function PedidoForm({ dados }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [estado, setEstado] = useState(dados?.situacao);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { linhas } = useSelector((state) => state.parametrizacao);
  const { done, error, itemId, isSaving, tipoItem, entidadeId, garantiaId, pedidoCC } = useSelector(
    (state) => state.cc
  );

  const formSchema = Yup.object().shape({
    salario: Yup.number().typeError('Introduza o salário bruto'),
    cliente: Yup.number().typeError('Introduza o nº de cliente'),
    taxa_juros: Yup.number().typeError('Introduza a taxa de juros'),
    conta_salario: Yup.number().typeError('Introduza o nº de conta'),
    finalidade: Yup.string().required('Finalidade não pode ficar vazio'),
    linha: Yup.mixed().required('Seleciona a linha do crédito pretendido'),
    montante_solicitado: Yup.number().typeError('Introduza o capital pretendido'),
    prazo_amortizacao: Yup.number().typeError('Introduza o prazo de amortização'),
    categoria_nivel: Yup.string().required('Categoria/Nível não pode ficar vazio'),
    setor_atividade: Yup.string().required('Setor de atividade não pode ficar vazio'),
    montante_contratado: estado === 'Contratado' && Yup.number().typeError('Introduza o montante contratado'),
    data_desistido:
      estado === 'Desistido' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de desistência não pode ficar vazio'),
    escalao_decisao: estado === 'Contratado' && Yup.string().required('Escalão de decisão não pode ficar vazio'),
    data_contratacao:
      estado === 'Contratado' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de contratação não pode ficar vazio'),
    data_indeferido:
      estado === 'Indeferido' &&
      Yup.date().typeError('Introduza uma data válida').required('Data de indeferimento não pode ficar vazio'),
    data_aprovacao:
      (estado === 'Aprovado' || estado === 'Contratado') &&
      Yup.date().typeError('Introduza uma data válida').required('Data de aprovação não pode ficar vazio'),
    montante_aprovado:
      (estado === 'Aprovado' || estado === 'Contratado') && Yup.number().typeError('Introduza o montante aprovado'),
    anexos: Yup.array(
      Yup.object({
        anexo: Yup.mixed().required('Introduza o anexo'),
        descricao: Yup.mixed().required('Seleciona o tipo de anexo'),
      })
    ),
    despesas: Yup.array(
      Yup.object({
        valor: Yup.number().typeError('Introduza o valor'),
        despesa: Yup.mixed().required('Seleciona a despesa'),
      })
    ),
    outros_creditos: Yup.array(
      Yup.object({
        taxa_juro: Yup.number().typeError('Introduza a taxa de juros'),
        montante: Yup.number().typeError('Introduza o capital inicial'),
        prazo_restante: Yup.number().typeError('Introduza o prazo restante'),
        capital_em_divida: Yup.number().typeError('Introduza o capital em dívida'),
        prazo_amortizacao: Yup.number().typeError('Introduza o prazo de amortização'),
      })
    ),
    garantias: Yup.array(
      Yup.object({
        tipo: Yup.mixed().required('Seleciona o tipo da garantia'),
        anexos: Yup.array(
          Yup.object({
            anexo: Yup.mixed().required('Introduza o anexo'),
            descricao: Yup.mixed().required('Seleciona o tipo de anexo'),
          })
        ),
      })
    ),
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
      anexos: [],
      uo_origem_id: cc?.uo?.id,
      perfil_id: cc?.perfil?.id,
      fluxo_id: dados?.fluxo_id,
      salario: dados?.salario || '',
      cliente: dados?.cliente || '',
      observacao: dados?.observacao || '',
      situacao: dados?.credito?.situacao || '',
      conta_salario: dados?.conta_salario || '',
      estado_origem_id: dados?.estado_origem_id,
      taxa_juros: dados?.credito?.taxa_juros || '',
      finalidade: dados?.credito?.finalidade || '',
      categoria_nivel: dados?.categoria_nivel || '',
      salario_conjuge: dados?.salario_conjuge || '',
      setor_atividade: dados?.credito?.setor_atividade || '',
      prazo_amortizacao: dados?.credito?.prazo_amortizacao || '',
      montante_aprovado: dados?.credito?.montante_aprovado || '',
      montante_contratado: dados?.credito?.montante_contratado || '',
      montante_solicitado: dados?.credito?.montante_solicitado || '',
      entidade_patronal_conjuge: dados?.entidade_patronal_conjuge || '',
      linha: dados?.credito?.linha_id ? { id: dados?.credito?.linha_id, label: dados?.credito?.linha } : null,
      data_desistido: dados?.credito?.data_desistido
        ? add(new Date(dados?.credito?.data_desistido), { hours: 2 })
        : null,
      data_aprovacao: dados?.credito?.data_aprovacao
        ? add(new Date(dados?.credito?.data_aprovacao), { hours: 2 })
        : null,
      data_indeferido: dados?.credito?.data_indeferido
        ? add(new Date(dados?.credito?.data_indeferido), { hours: 2 })
        : null,
      data_contratacao: dados?.credito?.data_contratacao
        ? add(new Date(dados?.credito?.data_contratacao), { hours: 2 })
        : null,
      despesas:
        dados?.despesas
          ?.filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            valor: row?.valor || '',
            despesa: { id: row?.designacao_id, label: row?.designacao },
          })) || [],
      outros_creditos:
        dados?.outros_creditos
          ?.filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            na_caixa: row?.na_caixa,
            montante: row?.montante,
            taxa_juro: row?.taxa_juro,
            prazo_restante: row?.prazo_restante,
            capital_em_divida: row?.capital_em_divida,
            prazo_amortizacao: row?.prazo_amortizacao,
          })) || [],
      garantias:
        dados?.garantias
          ?.filter((item) => item?.ativo)
          ?.map((row) => ({
            idItem: row?.id,
            tipo: row?.tipo,
            conta_dp: row?.conta_dp || '',
            descritivo: row?.descritivo || '',
            is_colaborador: row?.is_colaborador,
            numero_hipoteca: row?.numero_hipoteca || '',
            anexos: [],
          })) || [],
      entidades:
        dados?.entidades?.map((row) => ({
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
        })) || [],
    }),
    [dados, cc]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('cliente', values.cliente);
      formData.append('salario', values.salario);
      formData.append('linha_id', values.linha.id);
      formData.append('fluxo_id', values?.fluxo_id);
      formData.append('perfil_id', values?.perfil_id);
      formData.append('taxa_juros', values.taxa_juros);
      formData.append('finalidade', values.finalidade);
      formData.append('uo_origem_id', values?.uo_origem_id);
      formData.append('conta_salario', values.conta_salario);
      formData.append('categoria_nivel', values.categoria_nivel);
      formData.append('setor_atividade', values.setor_atividade);
      formData.append('estado_origem_id', values?.estado_origem_id);
      formData.append('prazo_amortizacao', values.prazo_amortizacao);
      formData.append('montante_solicitado', values.montante_solicitado);
      if (values.observacao) {
        formData.append('observacao', values.observacao);
      }
      if (values.salario_conjuge) {
        formData.append('salario_conjuge', values.salario_conjuge);
      }
      if (values.entidade_patronal_conjuge) {
        formData.append('entidade_patronal_conjuge', values.entidade_patronal_conjuge);
      }
      if (
        values.situacao === 'Aprovado' ||
        values.situacao === 'Contratado' ||
        (values.situacao === 'Desistido' && values.montante_aprovado && values.data_aprovacao)
      ) {
        formData.append('montante_aprovado', values.montante_aprovado);
        formData.append('data_aprovacao', format(values.data_aprovacao, 'yyyy-MM-dd'));
      } else {
        formData.append('data_aprovacao', '');
        formData.append('montante_aprovado', '');
      }
      if (values.situacao === 'Indeferido' && values.data_indeferido) {
        formData.append('data_indeferido', format(values.data_indeferido, 'yyyy-MM-dd'));
      } else {
        formData.append('data_indeferido', '');
      }
      if (values.situacao === 'Desistido' && values.data_desistido) {
        formData.append('data_desistido', format(values.data_desistido, 'yyyy-MM-dd'));
      } else {
        formData.append('data_desistido', '');
      }
      if (values.situacao === 'Contratado') {
        formData.append('escalao_decisao', values.escalao_decisao);
        formData.append('montante_contratado', values.montante_contratado);
        formData.append('data_contratacao', format(values.data_contratacao, 'yyyy-MM-dd'));
      } else {
        formData.append('escalao_decisao', '');
        formData.append('data_contratacao', '');
        formData.append('montante_contratado', '');
      }
      values?.anexos?.forEach((row, index) => {
        if (row?.anexo instanceof File) {
          if (row?.idItem) {
            formData.append(`anexos[${index}].id`, row?.idItem);
          }
          formData.append(`anexos[${index}].anexo`, row?.anexo);
          formData.append(`anexos[${index}].designacao_id`, row?.descricao?.id);
          formData.append(
            `anexos[${index}].data_validade`,
            row?.data_validade ? format(row.data_validade, 'yyyy-MM-dd') : null
          );
        }
      });
      values?.despesas?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`despesas[${index}].id`, row?.idItem);
        }
        formData.append(`despesas[${index}].valor`, row?.valor);
        formData.append(`despesas[${index}].designacao_id`, row?.despesa?.id);
      });
      values?.outros_creditos?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`outros_creditos[${index}].id`, row?.idItem);
        }
        formData.append(`outros_creditos[${index}].na_caixa`, row?.na_caixa);
        formData.append(`outros_creditos[${index}].montante`, row?.montante);
        formData.append(`outros_creditos[${index}].taxa_juro`, row?.taxa_juro);
        formData.append(`outros_creditos[${index}].prazo_restante`, row?.prazo_restante);
        formData.append(`outros_creditos[${index}].capital_em_divida`, row?.capital_em_divida);
        formData.append(`outros_creditos[${index}].prazo_amortizacao`, row?.prazo_amortizacao);
      });
      values?.garantias?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`garantias[${index}].id`, row?.idItem);
        }
        formData.append(`garantias[${index}].tipo`, row?.tipo);
        formData.append(`garantias[${index}].conta_dp`, row?.conta_dp);
        formData.append(`garantias[${index}].descritivo`, row?.descritivo);
        formData.append(`garantias[${index}].is_colaborador`, row?.is_colaborador);
        formData.append(`garantias[${index}].numero_hipoteca`, row?.numero_hipoteca);
        row?.anexos?.forEach((item, index1) => {
          if (item?.anexo instanceof File) {
            if (row?.idItem) {
              formData.append(`garantias[${index}].id`, item?.idItem);
            }
            formData.append(`garantias[${index}].anexos[${index1}].anexo`, item?.anexo);
            formData.append(`garantias[${index}].anexos[${index1}].designacao_id`, item?.descricao?.id);
            formData.append(
              `garantias[${index}].anexos[${index1}].data_validade`,
              item?.data_validade ? format(item.data_validade, 'yyyy-MM-dd') : null
            );
          }
        });
      });
      values?.entidades?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`entidades[${index}].id`, row?.idItem);
        }
        if (!row?.titularidade && row?.is_cliente) {
          formData.append(`entidades[${index}].entidade`, row?.entidade);
        } else if (!row?.titularidade && !row?.is_cliente) {
          formData.append(`entidades[${index}].nome`, row?.nome);
          if (row?.relacao) {
            formData.append(`entidades[${index}].relacao`, row?.relacao);
          }
          if (row?.nif) {
            formData.append(`entidades[${index}].nif`, row?.nif);
          }
          if (row?.email) {
            formData.append(`entidades[${index}].email`, row?.email);
          }
          if (row?.doc_id) {
            formData.append(`entidades[${index}].doc_id`, row?.doc_id);
          }
          if (row?.morada) {
            formData.append(`entidades[${index}].morada`, row?.morada);
          }
          if (row?.telefone) {
            formData.append(`entidades[${index}].telefone`, row?.telefone);
          }
          if (row?.telefone_sec) {
            formData.append(`entidades[${index}].telefone_sec`, row?.telefone_sec);
          }
          if (row?.estado_civil) {
            formData.append(`entidades[${index}].estado_civil`, row?.estado_civil);
          }
          if (row?.regime_casamento) {
            formData.append(`entidades[${index}].regime_casamento`, row?.regime_casamento);
          }
          if (row?.data_nascimento) {
            formData.append(`entidades[${index}].data_nascimento`, format(row.data_nascimento, 'yyyy-MM-dd'));
          }
          if (row?.doc_data_emissao) {
            formData.append(`entidades[${index}].doc_data_emissao`, format(row.doc_data_emissao, 'yyyy-MM-dd'));
          }
          if (row?.doc_data_validade) {
            formData.append(`entidades[${index}].doc_data_validade`, format(row.doc_data_validade, 'yyyy-MM-dd'));
          }
        }
        row?.anexos?.forEach((item, index1) => {
          if (item?.anexo instanceof File) {
            if (row?.idItem) {
              formData.append(`entidades[${index}].id`, item?.idItem);
            }
            formData.append(`entidades[${index}].anexos[${index1}].anexo`, item?.anexo);
            formData.append(`entidades[${index}].anexos[${index1}].designacao_id`, item?.descricao?.id);
            formData.append(
              `entidades[${index}].anexos[${index1}].data_validade`,
              item?.data_validade ? format(item.data_validade, 'yyyy-MM-dd') : null
            );
          }
        });
      });

      dispatch(
        updateItemCC('pedido credito', formData, {
          mail,
          id: dados?.id,
          perfilId: cc?.perfil_id,
          msg: 'Pedido atualizado',
          estadoId: dados?.ultimo_estado_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleConfirmeDelete = async () => {
    try {
      dispatch(
        updateItemCC(tipoItem, null, {
          mail,
          itemId,
          entidadeId,
          garantiaId,
          processoId: dados?.id,
          perfilId: cc?.perfil_id,
          msg: `${tipoItem?.includes('anexo') ? 'Anexo' : 'Item'} eliminado`,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  const handleCancel = () => {
    dispatch(closeModalAnexo());
  };

  const goToDetail = () => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${pedidoCC?.id}`);
  };

  return (
    <>
      <Notificacao
        done={done}
        error={error}
        afterSuccess={() => {
          if (done === 'Pedido adicionado' || done === 'Pedido atualizado') {
            goToDetail();
          }
        }}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="1. Dados gerais" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField name="cliente" label="Nº cliente" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField name="conta_salario" label="Nº conta salário" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField tipo="moeda" name="salario" label="Salário bruto" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFTextField name="categoria_nivel" label="Categoria/Nível" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFTextField name="setor_atividade" label="Setor de atividade" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFAutocompleteObject
                      name="linha"
                      label="Linha de crédito"
                      options={linhas
                        ?.filter((row) => row?.descricao === 'Particular')
                        ?.map((item) => ({ id: item?.id, label: item?.linha }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField tipo="moeda" name="salario_conjuge" label="Salário bruto do conjuge" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFTextField name="entidade_patronal_conjuge" label="Entidade patronal do conjuge" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField tipo="moeda" name="montante_solicitado" label="Capital pretendido" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField tipo="prestacao" name="prazo_amortizacao" label="Prazo amortização" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFNumberField tipo="percentagem" name="taxa_juros" label="Taxa de juros" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <RHFTextField name="finalidade" label="Finalidade" />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={3} justifyContent="center">
                      <Grid item xs={12} sm={3}>
                        <RHFAutocompleteSimple
                          name="situacao"
                          label="Situação"
                          options={['Entrada', 'Aprovado', 'Contratado', 'Indeferido', 'Desistido']}
                          onChange={(event, newValue) => {
                            setValue('situacao', newValue);
                            setEstado(newValue);
                          }}
                        />
                      </Grid>
                      {(values?.situacao === 'Aprovado' ||
                        values?.situacao === 'Contratado' ||
                        values?.situacao === 'Desistido') && (
                        <>
                          <Grid item xs={12} sm={6} md={3}>
                            <RHFDatePicker name="data_aprovacao" label="Data de aprovação" disableFuture />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <RHFNumberField tipo="moeda" name="montante_aprovado" label="Montante aprovado" />
                          </Grid>
                        </>
                      )}
                      {values?.situacao === 'Contratado' && (
                        <Grid item xs={12}>
                          <Grid container spacing={3} justifyContent="center">
                            <Grid item xs={12} sm={6} md={3}>
                              <RHFDatePicker name="data_contratacao" label="Data de contratação" disableFuture />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <RHFNumberField tipo="moeda" name="montante_contratado" label="Montante contratado" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <RHFAutocompleteSimple
                                options={escaloes}
                                name="escalao_decisao"
                                label="Escalão de decisão"
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                      {values?.situacao === 'Indeferido' && (
                        <Grid item xs={12} sm={3}>
                          <RHFDatePicker name="data_indeferido" label="Data de indeferimento" disableFuture />
                        </Grid>
                      )}
                      {values?.situacao === 'Desistido' && (
                        <Grid item xs={12} sm={3}>
                          <RHFDatePicker name="data_desistido" label="Data de desistência" disableFuture />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="observacao" label="Observações" multiline minRows={2} maxRows={4} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Anexos anexos={dados?.anexos || []} />
          </Grid>
          <Grid item xs={12}>
            <Despesas />
          </Grid>
          <Grid item xs={12}>
            <OutrosCreditos />
          </Grid>
          <Grid item xs={12}>
            <Garantias />
          </Grid>
          <Grid item xs={12}>
            <Entidades />
          </Grid>

          <Grid item xs={12} textAlign="center">
            <LoadingButton type="submit" variant="contained" size="large" loading={isSaving}>
              Guardar
            </LoadingButton>
          </Grid>
        </Grid>
      </FormProvider>

      <DialogConfirmar
        open={!!itemId}
        isSaving={isSaving}
        onClose={handleCancel}
        handleOk={() => handleConfirmeDelete()}
        title={`Eliminar ${tipoItem?.includes('anexo') ? 'anexo' : tipoItem}`}
        desc={`eliminar ${tipoItem?.includes('anexo') ? 'este anexo' : `esta ${tipoItem}`}`}
      />
    </>
  );
}
