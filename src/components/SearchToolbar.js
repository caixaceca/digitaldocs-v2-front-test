import PropTypes from 'prop-types';
// @mui
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Stack, Tooltip, TextField, IconButton, Autocomplete, InputAdornment } from '@mui/material';
// redux
import { useSelector } from '../redux/store';
// sections
import { Ambiente, Fluxo } from '../sections/AmbienteFluxo';

// ----------------------------------------------------------------------

SearchToolbar.propTypes = { filter: PropTypes.object, setFilter: PropTypes.func };

export function SearchToolbar({ filter, setFilter }) {
  const handleResetFilter = () => {
    setFilter({ tab: filter?.get('tab'), filter: '' });
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filter?.get('filter') || ''}
        onChange={(event) => setFilter({ tab: filter?.get('tab'), filter: event.target.value || '' })}
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

SearchToolbarSimple.propTypes = { filter: PropTypes.string, from: PropTypes.string, setFilter: PropTypes.func };

export function SearchToolbarSimple({ filter, from = '', setFilter }) {
  const resetFilter = () => {
    setFilter('');
    if (from === 'arquivo') {
      localStorage.setItem('filterA', '');
    } else if (from === 'con') {
      localStorage.setItem('filterCon', '');
    } else if (from === 'params') {
      localStorage.setItem('filterParams', '');
    } else if (from === 'estado') {
      localStorage.setItem('filterEstado', '');
    } else if (from === 'acesso') {
      localStorage.setItem('filterAcesso', '');
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filter}
        onChange={(event) => {
          setFilter(event.target.value);
          if (from === 'arquivo') {
            localStorage.setItem('filterA', event.target.value || '');
          } else if (from === 'con') {
            localStorage.setItem('filterCon', event.target.value || '');
          } else if (from === 'params') {
            localStorage.setItem('filterParams', event.target.value || '');
          } else if (from === 'estado') {
            localStorage.setItem('filterEstado', event.target.value || '');
          } else if (from === 'acesso') {
            localStorage.setItem('filterAcesso', event.target.value || '');
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {filter && (
        <Tooltip title="Limpar" arrow>
          <IconButton color="inherit" onClick={() => resetFilter()}>
            <ClearAllIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarProcura.propTypes = {
  uo: PropTypes.string,
  setUo: PropTypes.func,
  estado: PropTypes.string,
  search: PropTypes.string,
  assunto: PropTypes.string,
  setSearch: PropTypes.func,
  setEstado: PropTypes.func,
  setAssunto: PropTypes.func,
  estadosList: PropTypes.array,
  assuntosList: PropTypes.array,
  uosorigemList: PropTypes.array,
};

export function SearchToolbarProcura({
  uo,
  setUo,
  estado,
  search,
  assunto,
  setSearch,
  setEstado,
  setAssunto,
  estadosList,
  assuntosList,
  uosorigemList,
}) {
  const isFiltered = uo || search || assunto || estado;
  const handleResetFilter = () => {
    setUo(null);
    setSearch('');
    setEstado(null);
    setAssunto(null);
    localStorage.setItem('uoFSearch', '');
    localStorage.setItem('estadoSearch', '');
    localStorage.setItem('filterSearch', '');
    localStorage.setItem('assuntoSearch', '');
  };
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(assuntosList?.length > 1 || estadosList?.length > 1 || uosorigemList?.length > 1) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {assuntosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={assunto}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Assunto" margin="none" />}
              onChange={(event, newValue) => {
                setAssunto(newValue);
                localStorage.setItem('assuntoSearch', newValue || '');
              }}
            />
          )}
          {estadosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={estado}
              onChange={(event, newValue) => {
                setEstado(newValue);
                localStorage.setItem('estadoSearch', newValue || '');
              }}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Estado" margin="none" />}
            />
          )}
          {uosorigemList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={uo}
              onChange={(event, newValue) => {
                setUo(newValue);
                localStorage.setItem('uoFSearch', newValue || '');
              }}
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
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            localStorage.setItem('filterSearch', event.target.value);
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
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  segmento: PropTypes.string,
  setSegmento: PropTypes.func,
  colaborador: PropTypes.string,
  setColaborador: PropTypes.func,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarProcessos({
  tab,
  filter,
  segmento,
  setFilter,
  colaborador,
  setSegmento,
  setColaborador,
  colaboradoresList,
}) {
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
              value={colaborador}
              options={colaboradoresList}
              sx={{ width: { md: 250, xl: 300 } }}
              onChange={(event, newValue) => {
                setColaborador(newValue);
                localStorage.setItem('colaboradorP', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Colaborador" />}
            />
          )}
          {cc?.uo?.tipo !== 'Agências' && (
            <Autocomplete
              fullWidth
              value={segmento}
              sx={{ width: { md: 150, xl: 200 } }}
              options={['Particulares', 'Empresas']}
              onChange={(event, newValue) => {
                setSegmento(newValue);
                localStorage.setItem('segmento', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Segmento" />}
            />
          )}
        </Stack>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          placeholder="Procurar..."
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            localStorage.setItem('filterP', event.target.value || '');
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {(filter || segmento) && (
          <Stack>
            <Tooltip title="Remover filtros" arrow>
              <IconButton
                color="inherit"
                onClick={() => {
                  setFilter('');
                  setSegmento('');
                  localStorage.setItem('filterP', '');
                  localStorage.setItem('segmento', '');
                }}
              >
                <ClearAllIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarEntradas.propTypes = {
  tab: PropTypes.string,
  filter: PropTypes.string,
  estado: PropTypes.string,
  assunto: PropTypes.string,
  setFilter: PropTypes.func,
  setEstado: PropTypes.func,
  setAssunto: PropTypes.func,
  estadosList: PropTypes.array,
  assuntosList: PropTypes.array,
  colaborador: PropTypes.string,
  setColaborador: PropTypes.func,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarEntradas({
  filter,
  estado,
  assunto,
  setFilter,
  setEstado,
  setAssunto,
  colaborador,
  estadosList,
  assuntosList,
  setColaborador,
  colaboradoresList,
}) {
  const isFiltered = filter || assunto || colaborador || estado;
  const handleResetFilter = () => {
    setFilter('');
    setEstado('');
    setAssunto('');
    setColaborador('');
    localStorage.setItem('filterC', '');
    localStorage.setItem('estadoC', '');
    localStorage.setItem('assuntoC', '');
    localStorage.setItem('colaboradorC', '');
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(estadosList?.length > 0 || assuntosList?.length > 0 || colaboradoresList?.length > 0) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {estadosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={estado}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => {
                setEstado(newValue);
                localStorage.setItem('estadoC', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Estado" />}
            />
          )}
          {assuntosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={assunto}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => {
                setAssunto(newValue);
                localStorage.setItem('assuntoC', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Assunto" />}
            />
          )}
          {colaboradoresList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={colaborador}
              options={colaboradoresList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              onChange={(event, newValue) => {
                setColaborador(newValue);
                localStorage.setItem('colaboradorC', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Colaborador" margin="none" />}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            localStorage.setItem('filterC', event.target.value || '');
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

SearchToolbarCartoes.propTypes = {
  balcoes: PropTypes.array,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  tiposCartao: PropTypes.array,
  tipoCartao: PropTypes.string,
  setTipoCartao: PropTypes.func,
  balcaoEntrega: PropTypes.string,
  setBalcaoEntrega: PropTypes.func,
};

export function SearchToolbarCartoes({
  filter,
  balcoes,
  setFilter,
  tipoCartao,
  tiposCartao,
  setTipoCartao,
  balcaoEntrega,
  setBalcaoEntrega,
}) {
  const handleResetFilter = () => {
    setFilter('');
    setTipoCartao('');
    setBalcaoEntrega('');
    localStorage.setItem('balcaoE', '');
    localStorage.setItem('tipoCartao', '');
    localStorage.setItem('filterCartao', '');
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(balcoes?.length > 1 || tiposCartao?.length > 1) && (
        <Stack spacing={1} direction="row" alignItems="center">
          {balcoes?.length > 1 && (
            <Autocomplete
              fullWidth
              options={balcoes?.sort()}
              sx={{ width: { md: 230 } }}
              value={balcaoEntrega || null}
              onChange={(event, newValue) => {
                setBalcaoEntrega(newValue);
                localStorage.setItem('balcaoE', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Balcão entrega" margin="none" />}
            />
          )}
          {tiposCartao?.length > 1 && (
            <Autocomplete
              fullWidth
              value={tipoCartao || null}
              sx={{ width: { md: 230 } }}
              options={tiposCartao?.sort()}
              onChange={(event, newValue) => {
                setTipoCartao(newValue);
                localStorage.setItem('tipoCartao', newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Tipo de cartão" margin="none" />}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            localStorage.setItem('filterCartao', event.target.value || '');
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
        {(filter || balcaoEntrega) && (
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
  uo: PropTypes.string,
  setUo: PropTypes.func,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
};

export function TableToolbarPerfilEstados({ uo, filter, setUo, setFilter }) {
  const { uos } = useSelector((state) => state.intranet);

  const handleResetFilter = () => {
    setUo('');
    setFilter('');
    localStorage.setItem('uoParams', '');
    localStorage.setItem('filterParams', '');
  };

  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pt: 0.5, pb: 1.5, px: 0 }}>
      <Autocomplete
        fullWidth
        value={uo || null}
        onChange={(event, newValue) => {
          setUo(newValue);
          localStorage.setItem('uoParams', newValue || '');
        }}
        getOptionLabel={(option) => option}
        options={uos?.map((row) => row?.label)?.sort()}
        sx={{ maxWidth: { md: 250, sm: 200 }, minWidth: { md: 250, sm: 200 } }}
        renderInput={(params) => <TextField {...params} label="Unidade orgânica" />}
      />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            localStorage.setItem('filterParams', event.target.value || '');
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
        {(filter || uo) && (
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
