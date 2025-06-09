import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { setDataUtil } from '../../utils/formatTime';
import { setItemValue } from '../../utils/formatObject';

// ----------------------------------------------------------------------

UoData.propTypes = {
  uo: PropTypes.object,
  setUo: PropTypes.func,
  data: PropTypes.object,
  cartoes: PropTypes.bool,
  datai: PropTypes.object,
  dataf: PropTypes.object,
  setData: PropTypes.func,
  setDatai: PropTypes.func,
  setDataf: PropTypes.func,
  entradas: PropTypes.bool,
  uosList: PropTypes.array,
  setSelected: PropTypes.func,
};

export function UoData({
  uo,
  data,
  datai,
  dataf,
  setUo,
  uosList,
  setData,
  setDatai,
  setDataf,
  setSelected,
  cartoes = false,
  entradas = false,
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
      <Autocomplete
        fullWidth
        size="small"
        options={uosList}
        value={uo || null}
        disableClearable={!cartoes}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        onChange={(event, newValue) => {
          if (cartoes) setSelected([]);
          setItemValue(newValue, setUo, cartoes ? 'uoCartao' : 'uoC', true);
        }}
        renderInput={(params) => (
          <TextField {...params} label={cartoes ? 'Balcão' : 'Agência/U.O'} sx={{ width: { md: 200 } }} />
        )}
      />
      {entradas || cartoes ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <DatePicker
            value={datai}
            label="Data inicial"
            maxDate={new Date()}
            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 155 } } }}
            onChange={(newValue) => {
              if (cartoes) setSelected([]);
              setDataUtil(newValue, setDatai, cartoes ? '' : 'dataIC', setDataf, cartoes ? '' : 'dataFC', dataf);
            }}
          />
          <DatePicker
            value={dataf}
            minDate={datai}
            disabled={!datai}
            label="Data final"
            maxDate={new Date()}
            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 155 } } }}
            onChange={(newValue) => {
              if (cartoes) setSelected([]);
              setDataUtil(newValue, setDataf, cartoes ? '' : 'dataFC', '', '', '');
            }}
          />
        </Stack>
      ) : (
        <DatePicker
          label="Data"
          value={data}
          maxDate={new Date()}
          onChange={(newValue) => setDataUtil(newValue, setData, 'dataC', '', '', '')}
          slotProps={{ textField: { fullWidth: true, size: 'small', sx: { maxWidth: 170 } } }}
        />
      )}
    </Stack>
  );
}
