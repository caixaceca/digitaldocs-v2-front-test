import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { useDispatch } from '../../../redux/store';
import { deleteAnexo } from '../../../redux/slices/cc';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
} from '../../../components/hook-form';
import { AddItem, DefaultAction } from '../../../components/Actions';
//
import { AnexosEntidades } from './Anexos';
// _mock_
import { estadosCivil } from '../../../_mock';

// ----------------------------------------------------------------------

export default function Entidades() {
  const dispatch = useDispatch();
  const { control, watch } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

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
    <Card>
      <CardHeader
        title="6. Entidades"
        sx={{ pb: fields?.length === 0 && 3 }}
        action={<AddItem button label="Entidade" handleClick={handleAdd} />}
      />
      {fields?.length > 0 && (
        <CardContent>
          <Stack spacing={3}>
            {fields.map((item, index) => {
              const entidade = values?.entidades?.find((row, _index) => _index === index);
              return (
                <Paper key={item.id} elevation={3} sx={{ p: 2 }}>
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
                        color="error"
                        label="ELIMINAR"
                        handleClick={() => handleRemove(index, item?.idItem)}
                      />
                    )}
                  </Stack>
                  <AnexosEntidades indexEntidade={index} entidadeId={item?.idItem} />
                </Paper>
              );
            })}
          </Stack>
        </CardContent>
      )}
    </Card>
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
