import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid, Card, CardContent, Typography } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import ObsNovosAnexos from './ObsNovosAnexos';
import AnexosExistentes from './AnexosExistentes';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = {
  fluxo: PropTypes.object,
  setAgendado: PropTypes.func,
  setPendente: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, setPendente, fluxo }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { motivosPendencias } = useSelector((state) => state.digitaldocs);

  return (
    <Grid container spacing={3}>
      {fluxo?.modelo !== 'Paralelo' && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <DadosCliente isInterno assunto={fluxo?.assunto} />
              {selectedProcesso?.noperacao && (
                <Grid container spacing={3} sx={{ mt: 0 }} justifyContent="center">
                  <Grid item xs={12} sm={6} xl={3}>
                    <RHFTextField name="noperacao" label="Nº de operação" InputProps={{ type: 'number' }} />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
      {(fluxo?.assunto === 'OPE DARH' || fluxo?.assunto === 'Transferência Internacional') && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <RHFSwitch
                    name="agendado"
                    labelPlacement="start"
                    onChange={(event, value) => {
                      setValue('agendado', value);
                      setAgendado(value);
                    }}
                    label={
                      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Agendar
                      </Typography>
                    }
                    sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
                  />
                </Grid>
                {values.agendado && (
                  <>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteSimple
                        name="periodicidade"
                        label="Periodicidade"
                        options={['Mensal', 'Trimestral', 'Semestral', 'Anual']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="diadomes" label="Dia do mês" InputProps={{ type: 'number' }} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFDatePicker name="data_inicio" label="Data de início" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFDatePicker name="data_arquivamento" label="Data de término" />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
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
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                      Pendente
                    </Typography>
                  }
                  sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
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

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <ObsNovosAnexos />
              {hasAnexos && (
                <Grid item xs={12}>
                  <AnexosExistentes anexos={selectedProcesso.anexos} processoId={selectedProcesso.id} />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
