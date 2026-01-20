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
  const { uo, periodo, setUo, setPeriodo, tab, uosList } = dados;

  // estados
  const [data, setData] = useState(getDataLS('dataEst', new Date()));
  const [dataf, setDataf] = useState(getDataLS('dataFEst', new Date()));
  const [datai, setDatai] = useState(
    getDataLS('dataIEst', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );

  const [semestre, setSemestre] = useState(localStorage.getItem('semestreEst') || '1º Semestre');
  const [trimestre, setTrimestre] = useState(localStorage.getItem('trimestreEst') || '1º Trimestre');

  useEffect(() => {
    if (!perfilId || !uo?.id || !dataValido(data)) return;

    const ano = formatDate(data, 'yyyy');

    switch (periodo) {
      case 'Mensal': {
        const mes = formatDate(data, 'M');
        const intervalo = `?data_inicio=${formatDate(data, 'yyyy-MM')}-01&data_final=${formatDate(
          data,
          'yyyy-MM'
        )}-${ultimoDiaDoMes(data)}`;
        dispatch(getEstatisticaCredito('estCreditoMensal', { uoID: uo.id, mes, ano, intervalo }));
        break;
      }

      case 'Anual': {
        const intervalo = `?data_inicio=${ano}-01-01&data_final=${ano}-12-31`;
        dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo.id, intervalo }));
        break;
      }

      case 'Trimestral': {
        const intervalo = intervaloTrimestre(ano, trimestre);
        dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo.id, intervalo }));
        break;
      }

      case 'Semestral': {
        const intervalo = intervaloSemestre(ano, semestre);
        dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo.id, intervalo }));
        break;
      }

      default:
        break;
    }
  }, [perfilId, data, uo.id, periodo, trimestre, semestre, dispatch]);

  useEffect(() => {
    if (periodo !== 'Intervalo') return;
    if (!perfilId || !uo?.id || !dataValido(datai) || !dataValido(dataf)) return;

    const intervalo = `?data_inicio=${formatDate(datai, 'yyyy-MM-dd')}&data_final=${formatDate(dataf, 'yyyy-MM-dd')}`;
    dispatch(getEstatisticaCredito('estCreditoIntervalo', { uoID: uo.id, intervalo }));
  }, [perfilId, datai, dataf, uo.id, periodo, dispatch]);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Autocomplete
          fullWidth
          size="small"
          value={periodo}
          disableClearable
          sx={{ maxWidth: { md: 130 }, minWidth: { md: 130 } }}
          options={['Mensal', 'Anual', 'Trimestral', 'Semestral', 'Intervalo']}
          onChange={(e, v) => setItemValue(v, setPeriodo, 'periodoEst', false)}
          renderInput={(params) => <TextField {...params} fullWidth label="Período" />}
        />

        {(periodo === 'Trimestral' || periodo === 'Semestral') && (
          <Autocomplete
            size="small"
            disableClearable
            sx={{ maxWidth: { md: 150 }, minWidth: { md: 150 } }}
            value={periodo === 'Trimestral' ? trimestre : semestre}
            options={
              periodo === 'Trimestral'
                ? ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre']
                : ['1º Semestre', '2º Semestre']
            }
            renderInput={(params) => (
              <TextField {...params} fullWidth label={periodo === 'Trimestral' ? 'Trimestre' : 'Semestre'} />
            )}
            onChange={(e, v) =>
              setItemValue(
                v,
                periodo === 'Trimestral' ? setTrimestre : setSemestre,
                periodo === 'Trimestral' ? 'trimestreEst' : 'semestreEst',
                false
              )
            }
          />
        )}

        {periodo !== 'Intervalo' ? (
          <DatePicker
            value={data}
            maxDate={new Date()}
            minDate={new Date('2020-01-01')}
            label={periodo === 'Mensal' ? 'Mês' : 'Ano'}
            onChange={(v) => setDataUtil(v, setData, 'dataEst')}
            views={periodo === 'Mensal' ? ['month', 'year'] : ['year']}
            slotProps={{
              textField: { fullWidth: true, size: 'small', sx: { maxWidth: periodo === 'Mensal' ? 175 : 110 } },
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
          getOptionLabel={(o) => o?.label}
          isOptionEqualToValue={(o, v) => o?.id === v?.id}
          onChange={(e, v) => setItemValue(v, setUo, 'uoEst', true)}
          renderInput={(params) => <TextField {...params} fullWidth label="Agência/U.O" />}
          options={[...(periodo === 'Mensal' && tab !== 'Resumo' ? [] : geral), ...uosList]}
        />

        <Autocomplete
          fullWidth
          size="small"
          value={moeda}
          disableClearable
          sx={{ width: 110 }}
          options={['Conto', 'Escudo']}
          onChange={(e, v) => dispatch(setMoeda(v))}
          renderInput={(params) => <TextField {...params} fullWidth label="Moeda" />}
        />

        <ExportarEstatisticaCredito
          uo={uo?.label}
          periodo={periodo}
          data={
            (periodo === 'Anual' && formatDate(data, 'yyyy')) ||
            (periodo === 'Intervalo' && dataLabel(datai, dataf)) ||
            (periodo === 'Mensal' && formatDate(data, "MMMM 'de' yyyy")) ||
            (periodo === 'Trimestral' && `${trimestre} de ${formatDate(data, 'yyyy')}`) ||
            (periodo === 'Semestral' && `${semestre} de ${formatDate(data, 'yyyy')}`)
          }
        />
      </Stack>
    </Stack>
  );
}

// -------------------------- INTERVALOS -----------------------------------------

function intervaloTrimestre(ano, trimestre) {
  const mapping = {
    '1º Trimestre': ['01-01', '03-31'],
    '2º Trimestre': ['04-01', '06-30'],
    '3º Trimestre': ['07-01', '09-30'],
    '4º Trimestre': ['10-01', '12-31'],
  };
  const [ini, fim] = mapping[trimestre];
  return `?data_inicio=${ano}-${ini}&data_final=${ano}-${fim}`;
}

function intervaloSemestre(ano, semestre) {
  const mapping = {
    '1º Semestre': ['01-01', '06-30'],
    '2º Semestre': ['07-01', '12-31'],
  };
  const [ini, fim] = mapping[semestre];
  return `?data_inicio=${ano}-${ini}&data_final=${ano}-${fim}`;
}
