import PropTypes from 'prop-types';
// @mui
import { Stack, Tooltip, InputAdornment, IconButton, TextField, Autocomplete } from '@mui/material';
// components
import SvgIconStyle from '../SvgIconStyle';

// ----------------------------------------------------------------------

TableToolbarPerfilEstados.propTypes = {
  filterSearch: PropTypes.object,
  onFilterSearch: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string),
};

export default function TableToolbarPerfilEstados({ filterSearch, onFilterSearch, options }) {
  const isFiltered =
    (filterSearch.get('uo') && filterSearch.get('uo') !== 'Todos') ||
    (filterSearch.get('filter') && filterSearch.get('filter') !== '');

  const handleResetFilter = () => {
    onFilterSearch({ uo: 'Todos', filter: '' });
  };

  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pt: 0.5, pb: 1.5, px: 0 }}>
      <Autocomplete
        fullWidth
        value={filterSearch.get('uo') || 'Todos'}
        onChange={(event, value) => {
          onFilterSearch({ uo: value || 'Todos', filter: filterSearch.get('filter') || '' });
        }}
        options={options.map((option) => option)}
        getOptionLabel={(option) => option}
        sx={{ maxWidth: { md: 250, sm: 200 }, minWidth: { md: 250, sm: 200 } }}
        renderInput={(params) => <TextField {...params} label="Unidade orgânicas" margin="none" />}
      />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          value={filterSearch.get('filter') || ''}
          onChange={(event) => {
            onFilterSearch({ uo: filterSearch.get('uo') || 'Todos', filter: event.target.value || '' });
          }}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SvgIconStyle src="/assets/icons/search.svg" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {isFiltered && (
          <Tooltip title="Remover pesquiza" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <SvgIconStyle src="/assets/icons/reset.svg" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
