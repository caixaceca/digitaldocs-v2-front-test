import { format } from 'date-fns';
import PropTypes from 'prop-types';
// @mui
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Stack, Tooltip, TextField, IconButton, Autocomplete, InputAdornment } from '@mui/material';
// utils
import { paramsObject } from '../utils/normalizeText';
// redux
import { useSelector } from '../redux/store';
// hooks
import { getComparator, applySort } from '../hooks/useTable';
// sections
import Fluxo from '../sections/Fluxo';
import Ambiente from '../sections/Ambiente';

// ----------------------------------------------------------------------

SearchToolbar.propTypes = { tab: PropTypes.string, filter: PropTypes.object, setFilter: PropTypes.func };

export function SearchToolbar({ tab, filter, setFilter }) {
  const handleResetFilter = () => {
    setFilter({ tab, filter: '' });
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filter?.get('filter') || ''}
        onChange={(event) => setFilter({ tab, filter: event.target.value || '' })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {filter?.get('filter') && (
        <Tooltip title="Limpar" arrow>
          <IconButton color="inherit" onClick={() => handleResetFilter()}>
            <ClearAllIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
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
    onFilterUo(null);
    onFilterSearch(null);
    onFilterEstado(null);
    onFilterAssunto(null);
  };
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(filterAssunto?.length > 1 || estadosList?.length > 1 || uosorigemList?.length > 1) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {assuntosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={filterAssunto}
              onChange={(event, newValue) => onFilterAssunto(newValue)}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Assunto" margin="none" />}
            />
          )}
          {estadosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={filterEstado}
              onChange={(event, newValue) => onFilterEstado(newValue)}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
            />
          )}
          {uosorigemList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={filterUo}
              onChange={(event, newValue) => onFilterUo(newValue)}
              options={uosorigemList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="U.O origem" margin="none" />}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filterSearch || ''}
          onChange={(event) => onFilterSearch(event.target.value)}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {isFiltered && (
          <Tooltip title="Remover filtros" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarProcessos.propTypes = {
  tab: PropTypes.string,
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarProcessos({ tab, filter, setFilter, colaboradoresList }) {
  const { cc } = useSelector((state) => state.intranet);
  const { meusAmbientes, meusFluxos } = useSelector((state) => state.digitaldocs);
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(meusAmbientes?.length > 1 ||
        meusFluxos?.length > 1 ||
        colaboradoresList?.length > 0 ||
        cc?.uo?.tipo !== 'Agências') && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {(meusAmbientes?.length > 1 || meusFluxos?.length > 1) && tab !== 'retidos' && tab !== 'atribuidos' && (
            <>
              {meusAmbientes?.length > 1 && <Ambiente />}
              {meusFluxos?.length > 1 && <Fluxo />}
            </>
          )}
          {colaboradoresList?.length > 0 && (
            <Autocomplete
              fullWidth
              options={colaboradoresList}
              sx={{ width: { md: 150, xl: 200 } }}
              value={filter.get('colaborador') || null}
              onChange={(event, newValue) => setFilter({ tab, ...paramsObject(filter), colaborador: newValue || '' })}
              renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
            />
          )}
          {cc?.uo?.tipo !== 'Agências' && (
            <Autocomplete
              fullWidth
              value={filter.get('segmento') || null}
              sx={{ width: { md: 150, xl: 200 } }}
              options={['Particulares', 'Empresas']}
              onChange={(event, newValue) => setFilter({ tab, ...paramsObject(filter), segmento: newValue || '' })}
              renderInput={(params) => <TextField {...params} label="Segmento" margin="none" />}
            />
          )}
        </Stack>
      )}
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filter.get('filter') || ''}
        onChange={(event) => setFilter({ tab, ...paramsObject(filter), filter: event.target.value || '' })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.disabled' }} />
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
  filter: PropTypes.object,
  setFilter: PropTypes.func,
  estadosList: PropTypes.array,
  assuntosList: PropTypes.array,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarEntradas({ tab, filter, setFilter, estadosList, assuntosList, colaboradoresList }) {
  const isFiltered =
    filter?.get('filter') || filter?.get('assunto') || filter?.get('colaborador') || filter?.get('estado');
  const handleResetFilter = () => {
    setFilter({
      tab,
      data: filter?.get('data') || format(new Date(), 'yyyy-MM-dd'),
      datai: filter?.get('datai') || format(new Date(), 'yyyy-MM-dd'),
      dataf: filter?.get('dataf') || format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(estadosList?.length > 0 || assuntosList?.length > 0 || colaboradoresList?.length > 0) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {estadosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={filter?.get('estado')}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => setFilter({ tab, ...paramsObject(filter), estado: newValue || '' })}
              renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
            />
          )}
          {assuntosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={filter?.get('assunto')}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => setFilter({ tab, ...paramsObject(filter), assunto: newValue || '' })}
              renderInput={(params) => <TextField {...params} label="Assunto" margin="none" />}
            />
          )}
          {colaboradoresList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={filter?.get('colaborador')}
              options={colaboradoresList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => setFilter({ tab, ...paramsObject(filter), colaborador: newValue || '' })}
              renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter?.get('filter') || ''}
          onChange={(event) => setFilter({ tab, ...paramsObject(filter), filter: event.target.value || '' })}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {isFiltered && (
          <Tooltip title="Remover filtros" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarCartoes.propTypes = { filter: PropTypes.object, setFilter: PropTypes.func };

export function SearchToolbarCartoes({ filter, setFilter }) {
  const handleResetFilter = () => {
    setFilter({
      tab: 'cartoes',
      data: filter?.get('data') || format(new Date(), 'yyyy-MM-dd'),
      datai: filter?.get('datai') || format(new Date(), 'yyyy-MM-dd'),
      dataf: filter?.get('dataf') || format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter?.get('filter') || ''}
          onChange={(event) => setFilter({ tab: 'cartoes', ...paramsObject(filter), filter: event.target.value || '' })}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {filter?.get('filter') && (
          <Tooltip title="Remover filtros" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

TableToolbarPerfilEstados.propTypes = { filterSearch: PropTypes.object, onFilterSearch: PropTypes.func };

export function TableToolbarPerfilEstados({ filterSearch, onFilterSearch }) {
  const { uos } = useSelector((state) => state.intranet);
  const _uosList = ['Todos'];
  applySort(uos, getComparator('asc', 'label'))?.forEach((_uo) => {
    _uosList.push(_uo?.label);
  });

  const isFiltered =
    (filterSearch.get('uo') && filterSearch.get('uo') !== 'Todos') ||
    (filterSearch.get('filter') && filterSearch.get('filter') !== '');

  const handleResetFilter = () => {
    onFilterSearch({ tab: 'acessos', uo: 'Todos', filter: '' });
  };

  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pt: 0.5, pb: 1.5, px: 0 }}>
      <Autocomplete
        fullWidth
        value={filterSearch.get('uo') || 'Todos'}
        onChange={(event, value) => {
          onFilterSearch({ tab: 'acessos', uo: value || 'Todos', filter: filterSearch.get('filter') || '' });
        }}
        options={_uosList}
        getOptionLabel={(option) => option}
        sx={{ maxWidth: { md: 250, sm: 200 }, minWidth: { md: 250, sm: 200 } }}
        renderInput={(params) => <TextField {...params} label="Unidade orgânicas" margin="none" />}
      />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          value={filterSearch.get('filter') || ''}
          onChange={(event) => {
            onFilterSearch({ tab: 'acessos', uo: filterSearch.get('uo') || 'Todos', filter: event.target.value || '' });
          }}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {isFiltered && (
          <Tooltip title="Remover pesquiza" arrow>
            <IconButton color="inherit" onClick={() => handleResetFilter()}>
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
