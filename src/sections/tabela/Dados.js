import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { ptDateTime, fYear, setDataUtil } from '../../utils/formatTime';
import { entidadesParse, noDados, setItemValue, baralharString } from '../../utils/formatText';
// components
import { Criado } from '../../components/Panel';
import { DefaultAction } from '../../components/Actions';

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
          if (cartoes) {
            setSelected([]);
          }
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
              if (cartoes) {
                setSelected([]);
              }
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
              if (cartoes) {
                setSelected([]);
              }
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

// ----------------------------------------------------------------------

RowItem.propTypes = { row: PropTypes.object, handleViewRow: PropTypes.func };

export function RowItem({ row, handleViewRow }) {
  return (
    <TableRow hover>
      <TableCell>
        {row.nentrada}
        {row?.criado_em ? `/${fYear(row?.criado_em)}` : ''}
      </TableCell>
      <TableCell>{row?.titular ? baralharString(row.titular) : noDados()}</TableCell>
      <TableCell>
        {(row?.conta && baralharString(row?.conta)) ||
          (row?.cliente && baralharString(row?.cliente)) ||
          (row?.entidades && baralharString(entidadesParse(row?.entidades))) ||
          noDados()}
      </TableCell>
      <TableCell>{row?.assunto}</TableCell>
      <TableCell>{row?.nome}</TableCell>
      <TableCell>
        {(row?.criado_em || row?.trabalhado_em) && (
          <Criado tipo="data" value={ptDateTime(row.criado_em || row?.trabalhado_em)} />
        )}
        {row?.colaborador && <Criado tipo="user" value={row.colaborador} baralhar />}
      </TableCell>
      <TableCell align="center">
        <DefaultAction label="DETALHES" handleClick={() => handleViewRow(row?.id)} />
      </TableCell>
    </TableRow>
  );
}
