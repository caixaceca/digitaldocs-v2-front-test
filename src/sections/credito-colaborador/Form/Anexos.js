import PropTypes from 'prop-types';
import { useCallback } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// redux
import { deleteAnexo } from '../../../redux/slices/cc';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import { AddItem, DeleteItem, AnexosExistente } from '../../../components/Actions';
import { RHFDatePicker, RHFUploadFileSimple, RHFAutocompleteObject } from '../../../components/hook-form';

// ----------------------------------------------------------------------

Anexos.propTypes = { anexos: PropTypes.array };

export default function Anexos({ anexos }) {
  const dispatch = useDispatch();
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const { anexosProcesso } = useSelector((state) => state.cc);
  const { fields, append, remove } = useFieldArray({ control, name: 'anexos' });
  const anexosAtivos = anexos?.filter((item) => item.ativo);
  const anexosFiltered = applyFilter(
    anexosProcesso?.filter((row) => !row?.reutilizavel),
    [...anexosAtivos?.map((row) => row?.designacao_id), ...values?.anexos?.map((row) => row?.descricao?.id)]
  );

  const handleAdd = () => {
    append({ descricao: null, data_validade: null, anexo: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  const handleDeleteAnexo = async (itemId) => {
    dispatch(deleteAnexo({ itemId, tipoItem: 'anexo processo' }));
  };

  return (
    <Card>
      <CardHeader
        title="2. Anexos do processo"
        sx={{ pb: fields?.length === 0 && anexosAtivos?.length === 0 && 3 }}
        action={anexosFiltered?.length > 0 && <AddItem button label="Anexo" handleClick={handleAdd} />}
      />
      {(fields?.length > 0 || anexosAtivos?.length > 0) && (
        <CardContent>
          <Stack spacing={2}>
            {fields.map((item, index) => {
              const anexoSel = values?.anexos?.[index]?.descricao;
              return (
                <Stack spacing={2} key={item.id} direction="row" alignItems="center" justifyContent="center">
                  <Box sx={{ width: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={anexoSel?.prazo ? 8 : 12} md={3}>
                        <RHFAutocompleteObject
                          options={anexosFiltered}
                          label={`Anexo ${index + 1}`}
                          name={`anexos[${index}].descricao`}
                        />
                      </Grid>
                      {anexoSel?.prazo && (
                        <Grid item xs={12} sm={4} md={2}>
                          <RHFDatePicker
                            disablePast
                            required
                            name={`anexos[${index}].data_validade`}
                            label="Validade"
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={anexoSel?.prazo ? 7 : 9}>
                        <RHFUploadFileSimple
                          sx={{ height: 56 }}
                          name={`anexos[${index}].anexo`}
                          onDrop={(file) => handleDrop(`anexos[${index}].anexo`, file)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <DeleteItem small handleClick={() => handleRemove(index)} />
                </Stack>
              );
            })}
            {anexosAtivos?.length > 0 && (
              <AnexosExistente
                onOpen={handleDeleteAnexo}
                anexos={anexosAtivos?.map((row) => ({
                  id: row?.id,
                  path: row?.anexo,
                  name: row?.designacao,
                  data_validade: row?.data_validade,
                }))}
              />
            )}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

AnexosGarantias.propTypes = { indexGarantia: PropTypes.number, garantiaId: PropTypes.number };

export function AnexosGarantias({ indexGarantia, garantiaId }) {
  const dispatch = useDispatch();
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const { anexosAtivos, pedidoCC } = useSelector((state) => state.cc);
  const anexosProcesso =
    pedidoCC?.garantias?.find((row) => row?.id === garantiaId)?.anexos?.filter((item) => item.ativo) || [];
  const { fields, append, remove } = useFieldArray({ control, name: `garantias[${indexGarantia}].anexos` });
  const anexosFiltered = applyFilter(anexosAtivos, [
    ...anexosProcesso?.map((row) => row?.designacao_id),
    ...values?.garantias?.[indexGarantia]?.anexos?.map((row) => row?.descricao?.id),
  ]);

  const handleAdd = () => {
    append({ descricao: null, data_validade: null, anexo: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  const handleDeleteAnexo = async (itemId) => {
    dispatch(deleteAnexo({ itemId, garantiaId, tipoItem: 'anexo garantia' }));
  };

  return (
    <>
      <Divider sx={{ mt: 3 }} />
      <Card sx={{ boxShadow: 'none' }}>
        <CardHeader
          title="Anexos"
          sx={{ pb: 1 }}
          titleTypographyProps={{ variant: 'subtitle1' }}
          action={anexosFiltered?.length > 0 && <AddItem label="Anexo" handleClick={handleAdd} />}
        />
        {(fields?.length > 0 || anexosProcesso?.length > 0) && (
          <CardContent>
            <Stack spacing={2}>
              {fields.map((item, index) => {
                const anexoSel = values?.garantias?.[indexGarantia]?.anexos?.[index]?.descricao;
                return (
                  <Stack spacing={2} key={item.id} direction="row" alignItems="center" justifyContent="center">
                    <Box sx={{ width: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={anexoSel?.prazo ? 8 : 12} md={3}>
                          <RHFAutocompleteObject
                            small
                            options={anexosFiltered}
                            label={`Anexo ${index + 1}`}
                            name={`garantias[${indexGarantia}].anexos[${index}].descricao`}
                          />
                        </Grid>
                        {anexoSel?.prazo && (
                          <Grid item xs={12} sm={4} md={2}>
                            <RHFDatePicker
                              small
                              required
                              disablePast
                              label="Validade"
                              name={`garantias[${indexGarantia}].anexos[${index}].data_validade`}
                            />
                          </Grid>
                        )}
                        <Grid item xs={12} md={anexoSel?.prazo ? 7 : 9}>
                          <RHFUploadFileSimple
                            name={`garantias[${indexGarantia}].anexos[${index}].anexo`}
                            onDrop={(file) => handleDrop(`garantias[${indexGarantia}].anexos[${index}].anexo`, file)}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <DeleteItem small handleClick={() => handleRemove(index)} />
                  </Stack>
                );
              })}
              {anexosProcesso?.length > 0 && (
                <AnexosExistente
                  onOpen={handleDeleteAnexo}
                  anexos={anexosProcesso?.map((row) => ({
                    id: row?.id,
                    path: row?.anexo,
                    name: row?.designacao,
                    data_validade: row?.data_validade,
                  }))}
                />
              )}
            </Stack>
          </CardContent>
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

AnexosEntidades.propTypes = { indexEntidade: PropTypes.number, entidadeId: PropTypes.number };

export function AnexosEntidades({ indexEntidade, entidadeId }) {
  const dispatch = useDispatch();
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const { anexosProcesso, pedidoCC } = useSelector((state) => state.cc);
  const anexosAtivos =
    pedidoCC?.entidades?.find((row) => row?.id === entidadeId)?.anexos?.filter((item) => item.ativo) || [];
  const { fields, append, remove } = useFieldArray({ control, name: `entidades[${indexEntidade}].anexos` });
  const anexosFiltered = applyFilter(
    anexosProcesso?.filter((row) => row?.reutilizavel),
    [
      ...anexosAtivos?.map((row) => row?.designacao_id),
      ...values?.entidades?.[indexEntidade]?.anexos?.map((row) => row?.descricao?.id),
    ]
  );

  const handleAdd = () => {
    append({ descricao: null, data_validade: null, anexo: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  const handleDeleteAnexo = async (itemId) => {
    dispatch(deleteAnexo({ itemId, entidadeId, tipoItem: 'anexo entidade' }));
  };

  return (
    <>
      <Divider sx={{ mt: 3 }} />
      <Card sx={{ boxShadow: 'none' }}>
        <CardHeader
          title="Anexos"
          sx={{ pb: 1 }}
          titleTypographyProps={{ variant: 'subtitle1' }}
          action={anexosFiltered?.length > 0 && <AddItem button label="Anexo" handleClick={handleAdd} />}
        />
        {(fields?.length > 0 || anexosAtivos?.length > 0) && (
          <CardContent>
            <Stack spacing={2}>
              {fields.map((item, index) => {
                const anexoSel = values?.entidades?.[indexEntidade]?.anexos?.[index]?.descricao;
                return (
                  <Stack spacing={2} key={item.id} direction="row" alignItems="center" justifyContent="center">
                    <Box sx={{ width: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={anexoSel?.prazo ? 8 : 12} md={3}>
                          <RHFAutocompleteObject
                            small
                            options={anexosFiltered}
                            label={`Anexo ${index + 1}`}
                            name={`entidades[${indexEntidade}].anexos[${index}].descricao`}
                          />
                        </Grid>
                        {anexoSel?.prazo && (
                          <Grid item xs={12} sm={4} md={2}>
                            <RHFDatePicker
                              small
                              required
                              disablePast
                              label="Validade"
                              name={`entidades[${indexEntidade}].anexos[${index}].data_validade`}
                            />
                          </Grid>
                        )}
                        <Grid item xs={12} md={anexoSel?.prazo ? 7 : 9}>
                          <RHFUploadFileSimple
                            name={`entidades[${indexEntidade}].anexos[${index}].anexo`}
                            onDrop={(file) => handleDrop(`entidades[${indexEntidade}].anexos[${index}].anexo`, file)}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <DeleteItem small handleClick={() => handleRemove(index)} />
                  </Stack>
                );
              })}
              {anexosAtivos?.length > 0 && (
                <AnexosExistente
                  onOpen={handleDeleteAnexo}
                  anexos={anexosAtivos?.map((row) => ({
                    id: row?.id,
                    path: row?.anexo,
                    name: row?.designacao,
                    data_validade: row?.data_validade,
                  }))}
                />
              )}
            </Stack>
          </CardContent>
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter(anexos, anexosSelect) {
  return anexos
    ?.filter((item) => !anexosSelect.includes(item?.id))
    ?.map((row) => ({ id: row?.id, label: row?.designacao, prazo: row?.obriga_prazo_validade }));
}
