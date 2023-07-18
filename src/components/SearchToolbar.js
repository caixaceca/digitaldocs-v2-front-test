import PropTypes from 'prop-types';
// @mui
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Box, Stack, Tooltip, TextField, IconButton, Autocomplete, InputAdornment } from '@mui/material';
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

SearchToolbar.propTypes = { filterSearch: PropTypes.string, onFilterSearch: PropTypes.func, tab: PropTypes.string };

export function SearchToolbar({ filterSearch, onFilterSearch, tab }) {
  const handleResetFilter = () => {
    onFilterSearch({ tab, filter: '' });
  };
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
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
              <SearchIcon sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {filterSearch?.get('filter') && (
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
              <SearchIcon sx={{ color: 'text.disabled' }} />
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
  filterSearch: PropTypes.object,
  onFilterSearch: PropTypes.func,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarProcessos({ origem, filterSearch, onFilterSearch, colaboradoresList }) {
  const { cc } = useSelector((state) => state.intranet);
  const { meusAmbientes, meusFluxos } = useSelector((state) => state.digitaldocs);
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(meusAmbientes?.length > 1 ||
        meusFluxos?.length > 1 ||
        colaboradoresList?.length > 0 ||
        cc?.uo?.tipo !== 'Agências') && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {(meusAmbientes?.length > 1 || meusFluxos?.length > 1) && origem !== 'retidos' && origem !== 'atribuidos' && (
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
              value={filterSearch.get('colaborador')}
              onChange={(event, newValue) => {
                onFilterSearch({
                  tab: origem,
                  segmento: filterSearch.get('segmento') || '',
                  colaborador: newValue || '',
                  filter: filterSearch.get('filter') || '',
                });
              }}
              renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
            />
          )}
          {/* {cc?.uo?.tipo !== 'Agências' && ( */}
          <Autocomplete
            fullWidth
            value={filterSearch.get('segmento')}
            sx={{ width: { md: 150, xl: 200 } }}
            options={['Particulares', 'Empresas']}
            onChange={(event, newValue) =>
              onFilterSearch({
                tab: origem,
                segmento: newValue || '',
                colaborador: filterSearch.get('colaborador') || '',
                filter: filterSearch.get('filter') || '',
              })
            }
            renderInput={(params) => <TextField {...params} label="Segmento" margin="none" />}
          />
          {/* )} */}
        </Stack>
      )}
      <TextField
        fullWidth
        value={filterSearch.get('filter') || ''}
        onChange={(event) => {
          onFilterSearch({
            tab: origem,
            segmento: filterSearch.get('segmento') || '',
            colaborador: filterSearch.get('colaborador') || '',
            filter: event?.target?.value || '',
          });
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
    setFilter({ tab, datai: filter?.get('datai'), dataf: filter?.get('dataf') });
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
          value={filter?.get('filter')}
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

TableToolbarPerfilEstados.propTypes = {
  filterSearch: PropTypes.object,
  onFilterSearch: PropTypes.func,
};

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
