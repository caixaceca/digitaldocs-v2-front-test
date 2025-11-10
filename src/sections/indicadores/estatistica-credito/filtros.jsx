import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { setItemValue } from '../../../utils/formatObject';
import { dataLabel, getDataLS, dataValido, formatDate, setDataUtil, ultimoDiaDoMes } from '../../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getEstatisticaCredito, setMoeda } from '../../../redux/slices/indicadores';
// components
import { RHFDateIF } from '../../../components/hook-form';
import ExportarEstatisticaCredito from '../../../components/exportar-dados/excel/estatistica-credito';

// ---------------------------------------------------------------------------------------------------------------------

const geral = [
  { id: -1, label: 'Caixa' },
  { id: -2, label: 'DCN' },
  { id: -3, label: 'DCS' },
];

// ---------------------------------------------------------------------------------------------------------------------

export default function FiltrosEstatisticaCredito({ dados }) {
  const dispatch = useDispatch();
  const { perfilId } = useSelector((state) => state.intranet);
  const { moeda } = useSelector((state) => state.indicadores);
  const { uo, periodo, setUo, setPeriodo, currentTab, uosList } = dados;

  const [data, setData] = useState(getDataLS('dataEst', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFEst', new Date()));
  const [datai, setDatai] = useState(
    getDataLS('dataIEst', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );

  useEffect(() => {
    if (perfilId && uo?.id && dataValido(data)) {
      if (periodo === 'Mensal') {
        const mes = formatDate(data, 'M');
        const ano = formatDate(data, 'yyyy');
        const intervalo = `?data_inicio=${formatDate(data, 'yyyy-MM')}-01&data_final=${formatDate(data, 'yyyy-MM')}-${ultimoDiaDoMes(data)}`;
        dispatch(getEstatisticaCredito('estCreditoMensal', { uoID: uo?.id, mes, ano, intervalo }));
      }
      if (periodo === 'Anual') {
        const intervalo = `?data_inicio=${formatDate(data, 'yyyy')}-01-01&data_final=${formatDate(data, 'yyyy')}-12-31`;
        dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo?.id, intervalo }));
      }
    }
  }, [dispatch, perfilId, data, uo?.id, periodo]);

  useEffect(() => {
    if (perfilId && periodo === 'Intervalo' && uo?.id && dataValido(datai) && dataValido(dataf)) {
      const intervalo = `?data_inicio=${formatDate(datai, 'yyyy-MM-dd')}&data_final=${formatDate(dataf, 'yyyy-MM-dd')}`;
      dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo?.id, intervalo }));
    }
  }, [dispatch, perfilId, datai, dataf, uo?.id, periodo]);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Autocomplete
          size="small"
          value={periodo}
          disableClearable
          options={['Mensal', 'Anual', 'Intervalo']}
          sx={{ maxWidth: { md: 120 }, minWidth: { md: 120 } }}
          renderInput={(params) => <TextField {...params} fullWidth label="Período" />}
          onChange={(event, newValue) => setItemValue(newValue, setPeriodo, 'periodoEst', false)}
        />
        {periodo === 'Mensal' || periodo === 'Anual' ? (
          <DatePicker
            label="Data"
            value={data}
            maxDate={new Date()}
            minDate={new Date('2020-01-01')}
            views={periodo === 'Mensal' ? ['month', 'year'] : ['year']}
            onChange={(newValue) => setDataUtil(newValue, setData, 'dataEst', '', '', '')}
            slotProps={{
              textField: { fullWidth: true, size: 'small', sx: { maxWidth: periodo === 'Mensal' ? 175 : 125 } },
            }}
          />
        ) : (
          <RHFDateIF options={{ datai, dataf, setDatai, setDataf, labeli: 'dataIEst', labelf: 'dataFEst' }} />
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1 }}>
        <Autocomplete
          value={uo}
          size="small"
          disableClearable
          sx={{ minWidth: 200 }}
          getOptionLabel={(option) => option?.label}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoEst', true)}
          renderInput={(params) => <TextField {...params} fullWidth label="Agência/U.O" />}
          options={[...(periodo === 'Mensal' && currentTab !== 'Resumo' ? [] : geral), ...uosList]}
        />
        <Autocomplete
          size="small"
          value={moeda}
          disableClearable
          options={['Conto', 'Escudo']}
          sx={{ maxWidth: { md: 120 }, minWidth: { md: 110 } }}
          onChange={(event, newValue) => dispatch(setMoeda(newValue))}
          renderInput={(params) => <TextField {...params} fullWidth label="Moeda" />}
        />
        <ExportarEstatisticaCredito
          uo={uo?.label}
          periodo={periodo}
          data={
            (periodo === 'Anual' && formatDate(data, 'yyyy')) ||
            (periodo === 'Intervalo' && dataLabel(datai, dataf)) ||
            (periodo === 'Mensal' && formatDate(data, "MMMM 'de' yyyy"))
          }
        />
      </Stack>
    </Stack>
  );
}
