import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid, Card, CardContent } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import { RHFSwitch, RHFTextField, RHFUploadMultiFile, RHFAutocompleteObject } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export function ObsNovosAnexos() {
  const { watch, setValue } = useFormContext();
  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  return (
    <>
      <Grid item xs={12}>
        <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
      </Grid>
      <Grid item xs={12}>
        <RHFUploadMultiFile name="anexos" onDrop={handleDrop} onRemove={handleRemove} onRemoveAll={handleRemoveAll} />
      </Grid>
    </>
  );
}

// ----------------------------------------------------------------------

Pendencia.propTypes = { setPendente: PropTypes.func };

export function Pendencia({ setPendente }) {
  const { motivosPendencias } = useSelector((state) => state.digitaldocs);
  const { watch, setValue } = useFormContext();
  const values = watch();

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RHFSwitch
                name="ispendente"
                labelPlacement="start"
                onChange={(event, value) => {
                  setValue('ispendente', value);
                  setPendente(value);
                }}
                label="Pendente"
              />
            </Grid>
            {values.ispendente && (
              <>
                <Grid item xs={12} sm={4}>
                  <RHFAutocompleteObject
                    name="mpendencia"
                    label="Motivo"
                    options={applySort(
                      motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                      getComparator('asc', 'label')
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <RHFTextField name="mobs" label="Observação" />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
