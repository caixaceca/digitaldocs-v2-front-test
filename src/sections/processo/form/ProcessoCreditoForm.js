import { useEffect } from 'react';
import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import {
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
//
import { ObsNovosAnexos } from './Outros';
import AnexosExistentes from './AnexosExistentes';
// _mock
import { segmentos, escaloes, situacoes } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoCreditoForm.propTypes = { isEdit: PropTypes.bool, processo: PropTypes.object };

export default function ProcessoCreditoForm({ isEdit, processo }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = processo?.anexos?.length > 0;
  const { linhas } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    setValue('linha_id', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.segmento]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFNumberField tipo="moeda" name="montante_solicitado" label="Montante solicitado" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFAutocompleteSimple name="segmento" label="Segmento" options={segmentos} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFAutocompleteObject
                  disabled={!values?.segmento}
                  name="linha_id"
                  label="Linha de crédito"
                  options={applySort(
                    linhas
                      ?.filter((item) => item?.descricao === values.segmento)
                      ?.map((row) => ({ id: row?.id, label: row?.linha })),
                    getComparator('asc', 'label')
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="titular" label="Proponente" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFNumberField name="cliente" label="Nº de cliente" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField name="numero_proposta" label="Nº de proposta" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="setor_atividade" label="Entidade patronal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="finalidade" label="Finalidade" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {isEdit && (
        <>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={3} justifyContent="center">
                  <Grid item xs={12} sm={3}>
                    <RHFAutocompleteSimple
                      label="Situação"
                      disableClearable
                      options={situacoes}
                      name="situacao_final_mes"
                    />
                  </Grid>
                  {(values?.situacao_final_mes === 'Aprovado' ||
                    values?.situacao_final_mes === 'Contratado' ||
                    values?.situacao_final_mes === 'Desistido') && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFDatePicker name="data_aprovacao" label="Data de aprovação" disableFuture />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFNumberField tipo="moeda" name="montante_aprovado" label="Montante aprovado" />
                      </Grid>
                    </>
                  )}
                  {values?.situacao_final_mes === 'Contratado' && (
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFDatePicker name="data_contratacao" label="Data de contratação" disableFuture />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFNumberField tipo="moeda" name="montante_contratado" label="Montante contratado" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFTextField name="prazo_amortizacao" label="Prazo de amortização" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFNumberField name="taxa_juro" tipo="percentagem" label="Taxa de juro" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <RHFAutocompleteSimple name="escalao_decisao" label="Escalão de decisão" options={escaloes} />
                        </Grid>
                        <Grid item xs={12} sm={9}>
                          <RHFTextField name="garantia" label="Garantia" />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  {values?.situacao_final_mes === 'Indeferido' && (
                    <Grid item xs={12} sm={3}>
                      <RHFDatePicker name="data_indeferido" label="Data de indeferimento" disableFuture />
                    </Grid>
                  )}
                  {values?.situacao_final_mes === 'Desistido' && (
                    <Grid item xs={12} sm={3}>
                      <RHFDatePicker name="data_desistido" label="Data de desistência" disableFuture />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <ObsNovosAnexos />
              {hasAnexos && (
                <Grid item xs={12}>
                  <AnexosExistentes anexos={processo.anexos} processoId={processo.id} />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
