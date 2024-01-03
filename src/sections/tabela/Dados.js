import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados, setDataUtil, setItemValue } from '../../utils/normalizeText';
// components
import { Criado } from '../../components/Panel';
import { ViewItem } from '../../components/Actions';

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
      {uosList?.length > 0 && (
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
      )}
      {entradas || cartoes ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <DatePicker
            disableFuture
            value={datai}
            label="Data inicial"
            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
            onChange={(newValue) => {
              if (cartoes) {
                setSelected([]);
              }
              setDataUtil(newValue, setDatai, cartoes ? '' : 'dataIC', setDataf, cartoes ? '' : 'dataFC', dataf);
            }}
          />
          <DatePicker
            disableFuture
            value={dataf}
            minDate={datai}
            disabled={!datai}
            label="Data final"
            slotProps={{ textField: { fullWidth: true, size: 'small', sx: { width: 160 } } }}
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
      <TableCell>{row.nentrada}</TableCell>
      <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
      <TableCell>{row.conta || row.cliente || entidadesParse(row?.entidades) || noDados()}</TableCell>
      <TableCell>{row?.assunto}</TableCell>
      <TableCell>{row?.nome}</TableCell>
      <TableCell>
        {(row?.criado_em || row?.trabalhado_em) && (
          <Criado tipo="date" value={ptDateTime(row.criado_em || row?.trabalhado_em)} />
        )}
        {row?.colaborador && <Criado tipo="user" value={row.colaborador} />}
      </TableCell>
      <TableCell align="center">
        <ViewItem handleClick={() => handleViewRow(row?.id)} />
      </TableCell>
    </TableRow>
  );
}
