import PropTypes from 'prop-types';
// @mui
import { Box, Stack, Tooltip, TextField, IconButton, Autocomplete, InputAdornment } from '@mui/material';
// redux
import { useSelector } from '../redux/store';
// components
import SvgIconStyle from './SvgIconStyle';
// hooks
import { getComparator, applySort } from '../hooks/useTable';
// sections
import Fluxo from '../sections/digitaldocs/Fluxo';
import Ambiente from '../sections/digitaldocs/Ambiente';

// ----------------------------------------------------------------------

SearchToolbar.propTypes = { filterSearch: PropTypes.string, onFilterSearch: PropTypes.func };

export function SearchToolbar({ filterSearch, onFilterSearch }) {
  return (
    <Box sx={{ pb: 1 }}>
      <TextField
        fullWidth
        value={filterSearch.get('filter') || ''}
        onChange={(event) => {
          const filter = event.target.value;
          if (filter) {
            onFilterSearch({ filter });
          } else {
            onFilterSearch({});
          }
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
    </Box>
  );
}

// ----------------------------------------------------------------------

SearchToolbarProcura.propTypes = {
  estadosList: PropTypes.array,
  assuntosList: PropTypes.array,
  uosorigemList: PropTypes.array,
  filterUo: PropTypes.string,
  filterEstado: PropTypes.string,
  filterAssunto: PropTypes.string,
  filterSearch: PropTypes.string,
  onFilterUo: PropTypes.func,
  onFilterSearch: PropTypes.func,
  onFilterEstado: PropTypes.func,
  onFilterAssunto: PropTypes.func,
};

export function SearchToolbarProcura({
  uosorigemList,
  estadosList,
  assuntosList,
  filterUo,
  filterEstado,
  filterAssunto,
  filterSearch,
  onFilterUo,
  onFilterSearch,
  onFilterEstado,
  onFilterAssunto,
}) {
  const isFiltered = filterUo || filterSearch || filterAssunto || filterEstado;
  const handleResetFilter = () => {
    onFilterUo('');
    onFilterSearch('');
    onFilterEstado('');
    onFilterAssunto('');
  };
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Autocomplete
          fullWidth
          value={filterAssunto}
          onChange={(event, newValue) => {
            onFilterAssunto(newValue);
          }}
          options={assuntosList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="Assunto" margin="none" />}
        />
        <Autocomplete
          fullWidth
          value={filterEstado}
          onChange={(event, newValue) => {
            onFilterEstado(newValue);
          }}
          options={estadosList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
        />
        <Autocomplete
          fullWidth
          value={filterUo}
          onChange={(event, newValue) => {
            onFilterUo(newValue);
          }}
          options={uosorigemList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="U.O origem" margin="none" />}
        />
      </Stack>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filterSearch || ''}
          onChange={(event) => {
            onFilterSearch(event.target.value);
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
          <Tooltip title="Remover filtros" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <SvgIconStyle src="/assets/icons/reset.svg" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbar2.propTypes = { origem: PropTypes.string, filterSearch: PropTypes.string, onFilterSearch: PropTypes.func };

export function SearchToolbar2({ filterSearch, origem, onFilterSearch }) {
  return (
    <Box sx={{ pb: 1 }}>
      <TextField
        fullWidth
        value={filterSearch.get('filter') || ''}
        onChange={(event) => {
          const filter = event.target.value;
          if (filter) {
            onFilterSearch({ tab: origem, filter });
          } else {
            onFilterSearch({ tab: origem, filter: '' });
          }
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
    </Box>
  );
}

// ----------------------------------------------------------------------

SearchToolbarProcessos.propTypes = {
  origem: PropTypes.string,
  filterSearch: PropTypes.string,
  onFilterSearch: PropTypes.func,
};

export function SearchToolbarProcessos({ filterSearch, onFilterSearch, origem }) {
  const { meusAmbientes, meusFluxos } = useSelector((state) => state.digitaldocs);
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(meusAmbientes?.length > 1 || meusFluxos?.length > 1) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {meusAmbientes?.length > 1 && <Ambiente />}
          {meusFluxos?.length > 1 && <Fluxo />}
        </Stack>
      )}
      <TextField
        fullWidth
        value={filterSearch.get('filter') || ''}
        onChange={(event) => {
          const filter = event.target.value;
          if (filter) {
            onFilterSearch({ tab: origem, filter });
          } else {
            onFilterSearch({ tab: origem, filter: '' });
          }
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
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarEntradas.propTypes = {
  tab: PropTypes.string,
  estado: PropTypes.string,
  assunto: PropTypes.string,
  estadosList: PropTypes.array,
  assuntosList: PropTypes.array,
  colaborador: PropTypes.string,
  filterSearch: PropTypes.string,
  onFilterSearch: PropTypes.func,
  onFilterEstado: PropTypes.func,
  onFilterAssunto: PropTypes.func,
  colaboradoresList: PropTypes.array,
  onFilterColaborador: PropTypes.func,
};

export function SearchToolbarEntradas({
  estado,
  assunto,
  colaborador,
  estadosList,
  assuntosList,
  filterSearch,
  onFilterSearch,
  onFilterEstado,
  onFilterAssunto,
  colaboradoresList,
  onFilterColaborador,
  tab,
}) {
  const isFiltered =
    (filterSearch.get('filter') && filterSearch.get('filter') !== '') || assunto || colaborador || estado;
  const handleResetFilter = () => {
    onFilterEstado('');
    onFilterAssunto('');
    onFilterColaborador('');
    onFilterSearch({ tab, filter: '' });
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Autocomplete
          fullWidth
          value={estado}
          onChange={(event, newValue) => {
            onFilterEstado(newValue);
          }}
          options={estadosList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
        />
        <Autocomplete
          fullWidth
          value={assunto}
          onChange={(event, newValue) => {
            onFilterAssunto(newValue);
          }}
          options={assuntosList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="Assunto" margin="none" />}
        />
        <Autocomplete
          fullWidth
          value={colaborador}
          onChange={(event, newValue) => {
            onFilterColaborador(newValue);
          }}
          options={colaboradoresList}
          sx={{ width: { md: 180, xl: 250 } }}
          renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
        />
      </Stack>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filterSearch.get('filter') || ''}
          onChange={(event) => {
            const filter = event.target.value;
            if (filter) {
              onFilterSearch({ tab, filter });
            } else {
              onFilterSearch({ tab, filter: '' });
            }
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
          <Tooltip title="Remover filtros" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <SvgIconStyle src="/assets/icons/reset.svg" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarTrabalhados.propTypes = {
  tab: PropTypes.string,
  ambiente: PropTypes.object,
  colaborador: PropTypes.object,
  filterSearch: PropTypes.string,
  onFilterSearch: PropTypes.func,
  onFilterAmbiente: PropTypes.func,
  onFilterColaborador: PropTypes.func,
};

export function SearchToolbarTrabalhados({
  ambiente,
  colaborador,
  filterSearch,
  onFilterSearch,
  onFilterAmbiente,
  onFilterColaborador,
  tab,
}) {
  const { meusAmbientes } = useSelector((state) => state.digitaldocs);
  const { currentColaborador, colaboradores } = useSelector((state) => state.colaborador);
  const colaboradoresList = [];
  colaboradores
    ?.filter((row) => row.uo_id === currentColaborador?.uo_id)
    ?.forEach((row) => {
      colaboradoresList.push({ id: row?.perfil?.id, label: row?.perfil?.displayName });
    });
  const ambientesList = applySort(
    meusAmbientes?.filter((row) => row.nome !== 'Todos'),
    getComparator('asc', 'nome')
  ).map((row) => ({
    id: row?.id,
    label: row?.nome,
  }));

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Autocomplete
          fullWidth
          value={ambiente}
          onChange={(event, newValue) => {
            onFilterAmbiente(newValue);
          }}
          options={ambientesList}
          sx={{ width: { md: 200, xl: 300 } }}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => <TextField {...params} label="Ambiente" margin="none" />}
        />
        <Autocomplete
          fullWidth
          value={colaborador}
          onChange={(event, newValue) => {
            onFilterColaborador(newValue);
          }}
          options={applySort(colaboradoresList, getComparator('asc', 'label'))}
          sx={{ width: { md: 200, xl: 300 } }}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
        />
      </Stack>
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filterSearch.get('filter') || ''}
        onChange={(event) => {
          const filter = event.target.value;
          if (filter) {
            onFilterSearch({ tab, filter });
          } else {
            onFilterSearch({ tab, filter: '' });
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SvgIconStyle src="/assets/icons/search.svg" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
