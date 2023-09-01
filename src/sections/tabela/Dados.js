import PropTypes from 'prop-types';
// @mui
import TodayIcon from '@mui/icons-material/Today';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { Fab, Stack, Tooltip, TableRow, TableCell, TextField, Autocomplete, Typography } from '@mui/material';
// utils
import { add, format } from 'date-fns';
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, paramsObject, noDados } from '../../utils/normalizeText';
// components
import { ViewItem } from '../../components/Actions';

// ----------------------------------------------------------------------

UoData.propTypes = {
  entradas: PropTypes.bool,
  uo: PropTypes.object,
  filter: PropTypes.object,
  dataSingle: PropTypes.string,
  dataRange: PropTypes.array,
  setUo: PropTypes.func,
  setData: PropTypes.func,
  setFilter: PropTypes.func,
  uosList: PropTypes.array,
};

export function UoData({ entradas, uo, filter, dataSingle = '', dataRange = [], setUo, setData, setFilter, uosList }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
      {uosList?.length > 1 && (
        <Autocomplete
          fullWidth
          value={uo}
          size="small"
          disableClearable
          options={uosList}
          onChange={(event, newValue) => {
            setFilter({ tab: entradas ? 'entradas' : 'trabalhados', ...paramsObject(filter), uoId: newValue.id });
            setUo(newValue);
          }}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => (
            <TextField {...params} label="Agência/U.O" margin="none" sx={{ width: { md: 200 } }} />
          )}
        />
      )}
      {entradas ? (
        <>
          <DateRangePicker
            disableFuture
            slots={{ field: SingleInputDateRangeField }}
            value={[add(new Date(dataRange[0]), { hours: 2 }), add(new Date(dataRange[1]), { hours: 2 })]}
            slotProps={{ textField: { fullWidth: true, size: 'small', label: 'Data', sx: { minWidth: 240 } } }}
            onChange={(newValue) => {
              setFilter({
                tab: entradas ? 'entradas' : 'trabalhados',
                ...paramsObject(filter),
                datai: format(newValue?.[0], 'yyyy-MM-dd'),
                dataf: format(newValue?.[1], 'yyyy-MM-dd'),
              });
              setData([format(newValue?.[0], 'yyyy-MM-dd'), format(newValue?.[1], 'yyyy-MM-dd')]);
            }}
          />
          {(dataRange[0] !== format(new Date(), 'yyyy-MM-dd') || dataRange[1] !== format(new Date(), 'yyyy-MM-dd')) && (
            <Stack>
              <Tooltip title="Hoje" arrow>
                <Fab
                  color="inherit"
                  size="small"
                  variant="soft"
                  onClick={() => {
                    setFilter({
                      tab: 'entradas',
                      ...paramsObject(filter),
                      datai: format(new Date(), 'yyyy-MM-dd'),
                      dataf: format(new Date(), 'yyyy-MM-dd'),
                    });
                    setData([format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]);
                  }}
                >
                  <TodayIcon />
                </Fab>
              </Tooltip>
            </Stack>
          )}
        </>
      ) : (
        <DatePicker
          label="Data"
          value={add(new Date(dataSingle), { hours: 2 })}
          onChange={(newValue) => {
            setFilter({ tab: 'trabalhados', ...paramsObject(filter), data: format(newValue, 'yyyy-MM-dd') });
            setData(format(newValue, 'yyyy-MM-dd'));
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
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
            <Typography noWrap variant="body2">
              {ptDateTime(row.criado_em || row?.trabalhado_em)}
            </Typography>
          </Stack>
        )}
        {row?.colaborador && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
            <Typography noWrap variant="body2">
              {row.colaborador}
            </Typography>
          </Stack>
        )}
      </TableCell>
      <TableCell align="center">
        <ViewItem handleClick={() => handleViewRow(row?.id)} />
      </TableCell>
    </TableRow>
  );
}
