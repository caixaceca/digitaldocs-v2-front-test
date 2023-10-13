import PropTypes from 'prop-types';
// @mui
import TodayIcon from '@mui/icons-material/Today';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { Fab, Stack, Tooltip, TableRow, TableCell, TextField, Autocomplete } from '@mui/material';
// utils
import { add, format } from 'date-fns';
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados } from '../../utils/normalizeText';
// components
import { ViewItem, CriadoEmPor } from '../../components/Actions';

// ----------------------------------------------------------------------

UoData.propTypes = {
  uo: PropTypes.object,
  setUo: PropTypes.func,
  fase: PropTypes.string,
  setData: PropTypes.func,
  cartoes: PropTypes.bool,
  entradas: PropTypes.bool,
  uosList: PropTypes.array,
  dataRange: PropTypes.array,
  dataSingle: PropTypes.string,
  setDataSingle: PropTypes.func,
};

export function UoData({
  uo,
  setUo,
  setData,
  uosList,
  fase = '',
  setDataSingle,
  dataRange = [],
  dataSingle = '',
  cartoes = false,
  entradas = false,
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
      {uosList?.length > 1 && (!cartoes || (cartoes && fase === 'Receção')) && (
        <Stack>
          <Autocomplete
            fullWidth
            value={uo}
            size="small"
            disableClearable
            options={uosList}
            onChange={(event, newValue) => {
              setUo(newValue);
              localStorage.setItem('uoC', newValue?.id || '');
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label={cartoes ? 'Balcão' : 'Agência/U.O'} sx={{ width: { md: 200 } }} />
            )}
          />
        </Stack>
      )}
      {entradas || cartoes ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <DateRangePicker
            disableFuture
            slots={{ field: SingleInputDateRangeField }}
            value={[add(new Date(dataRange[0]), { hours: 2 }), add(new Date(dataRange[1]), { hours: 2 })]}
            slotProps={{ textField: { fullWidth: true, size: 'small', label: 'Data', sx: { minWidth: 220 } } }}
            onChange={(newValue) => {
              setData([format(newValue?.[0], 'yyyy-MM-dd'), format(newValue?.[1], 'yyyy-MM-dd')]);
              localStorage.setItem('dataIC', newValue?.[0] ? format(newValue?.[0], 'yyyy-MM-dd') : '');
              localStorage.setItem('dataFC', newValue?.[1] ? format(newValue?.[1], 'yyyy-MM-dd') : '');
            }}
          />
          {(dataRange[0] !== format(new Date(), 'yyyy-MM-dd') || dataRange[1] !== format(new Date(), 'yyyy-MM-dd')) && (
            <Stack>
              <Tooltip title="Hoje" arrow>
                <Fab
                  size="small"
                  variant="soft"
                  color="inherit"
                  onClick={() => {
                    localStorage.setItem('dataIC', format(new Date(), 'yyyy-MM-dd'));
                    localStorage.setItem('dataFC', format(new Date(), 'yyyy-MM-dd'));
                    setData([format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]);
                  }}
                >
                  <TodayIcon />
                </Fab>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      ) : (
        <DatePicker
          label="Data"
          value={add(new Date(dataSingle), { hours: 2 })}
          onChange={(newValue) => {
            setDataSingle(format(newValue, 'yyyy-MM-dd'));
            localStorage.setItem('dataC', newValue ? format(newValue, 'yyyy-MM-dd') : '');
          }}
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
          <CriadoEmPor tipo="date" value={ptDateTime(row.criado_em || row?.trabalhado_em)} />
        )}
        {row?.colaborador && <CriadoEmPor tipo="user" value={row.colaborador} />}
      </TableCell>
      <TableCell align="center">
        <ViewItem handleClick={() => handleViewRow(row?.id)} />
      </TableCell>
    </TableRow>
  );
}
