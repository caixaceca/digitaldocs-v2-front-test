import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { setItemValue } from '../utils/normalizeText';
// redux
import { useSelector } from '../redux/store';
// sections
import { Ambiente, Fluxo } from '../sections/AmbienteFluxo';

// ----------------------------------------------------------------------

SearchToolbarSimple.propTypes = { filter: PropTypes.string, item: PropTypes.string, setFilter: PropTypes.func };

export function SearchToolbarSimple({ filter, item = '', setFilter }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ pb: 1 }}>
      <TextField
        fullWidth
        placeholder="Procurar..."
        value={filter}
        onChange={(event) => setItemValue(event.target.value, setFilter, item)}
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
          <IconButton color="inherit" onClick={() => setItemValue('', setFilter, item)}>
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
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(assuntosList?.length > 1 || estadosList?.length > 1 || uosorigemList?.length > 1) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {assuntosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={assunto || null}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Assunto" />}
              onChange={(event, newValue) => setItemValue(newValue, setAssunto, 'assuntoSearch')}
            />
          )}
          {estadosList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={estado || null}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Estado" />}
              onChange={(event, newValue) => setItemValue(newValue, setEstado, 'estadoSearch')}
            />
          )}
          {uosorigemList?.length > 1 && (
            <Autocomplete
              fullWidth
              value={uo || null}
              options={uosorigemList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="U.O origem" />}
              onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoFSearch')}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={search}
          onChange={(event) => setItemValue(event.target.value, setSearch, 'filterSearch')}
          placeholder="Procurar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {(uo || search || assunto || estado) && (
          <Stack>
            <Tooltip title="Remover filtros" arrow>
              <IconButton
                color="inherit"
                onClick={() => {
                  setItemValue('', setUo, 'uoFSearch');
                  setItemValue('', setSearch, 'estadoSearch');
                  setItemValue('', setEstado, 'filterSearch');
                  setItemValue('', setAssunto, 'assuntoSearch');
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
              value={colaborador || null}
              options={colaboradoresList}
              sx={{ width: { md: 250, xl: 300 } }}
              renderInput={(params) => <TextField {...params} label="Colaborador" />}
              onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorP')}
            />
          )}
          {cc?.uo?.tipo !== 'Agências' && (
            <Autocomplete
              fullWidth
              value={segmento || null}
              sx={{ width: { md: 150, xl: 200 } }}
              options={['Particulares', 'Empresas']}
              renderInput={(params) => <TextField {...params} label="Segmento" />}
              onChange={(event, newValue) => setItemValue(newValue, setSegmento, 'segmento')}
            />
          )}
        </Stack>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          placeholder="Procurar..."
          value={filter}
          onChange={(event) => setItemValue(event.target.value, setFilter, 'filterP')}
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
                  setItemValue('', setFilter, 'filterP');
                  setItemValue('', setSegmento, 'segmento');
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
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {(estadosList?.length > 0 || assuntosList?.length > 0 || colaboradoresList?.length > 0) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {estadosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={estado || null}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              renderInput={(params) => <TextField {...params} label="Estado" />}
              onChange={(event, newValue) => setItemValue(newValue, setEstado, 'estadoC')}
            />
          )}
          {assuntosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={assunto || null}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              renderInput={(params) => <TextField {...params} label="Assunto" />}
              onChange={(event, newValue) => setItemValue(newValue, setAssunto, 'assuntoC')}
            />
          )}
          {colaboradoresList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={colaborador || null}
              options={colaboradoresList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              renderInput={(params) => <TextField {...params} label="Colaborador" />}
              onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorC')}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter}
          placeholder="Procurar..."
          onChange={(event) => setItemValue(event.target.value, setFilter, 'filterC')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {(filter || assunto || colaborador || estado) && (
          <Stack>
            <Tooltip title="Remover filtros" arrow>
              <IconButton
                color="inherit"
                onClick={() => {
                  setItemValue('', setFilter, 'filterC');
                  setItemValue('', setEstado, 'estadoC');
                  setItemValue('', setAssunto, 'assuntoC');
                  setItemValue('', setColaborador, 'colaboradorC');
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
              renderInput={(params) => <TextField {...params} label="Balcão entrega" />}
              onChange={(event, newValue) => setItemValue(newValue, setBalcaoEntrega, 'balcaoE')}
            />
          )}
          {tiposCartao?.length > 1 && (
            <Autocomplete
              fullWidth
              value={tipoCartao || null}
              sx={{ width: { md: 230 } }}
              options={tiposCartao?.sort()}
              renderInput={(params) => <TextField {...params} label="Tipo de cartão" />}
              onChange={(event, newValue) => setItemValue(newValue, setTipoCartao, 'tipoCartao')}
            />
          )}
        </Stack>
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <TextField
          fullWidth
          value={filter}
          placeholder="Procurar..."
          onChange={(event) => setItemValue(event.target.value, setFilter, 'filterCartao')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        {(filter || balcaoEntrega) && (
          <Stack>
            <Tooltip title="Remover filtros" arrow>
              <IconButton
                color="inherit"
                onClick={() => {
                  setItemValue('', setFilter, 'filterCartao');
                  setItemValue('', setTipoCartao, 'tipoCartao');
                  setItemValue('', setBalcaoEntrega, 'balcaoE');
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

TableToolbarPerfilEstados.propTypes = {
  uo: PropTypes.string,
  setUo: PropTypes.func,
  filter: PropTypes.string,
  setFilter: PropTypes.func,
};

export function TableToolbarPerfilEstados({ uo, filter, setUo, setFilter }) {
  const { uos } = useSelector((state) => state.intranet);

  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pt: 0.5, pb: 1.5, px: 0 }}>
      <Autocomplete
        fullWidth
        value={uo || null}
        getOptionLabel={(option) => option}
        options={uos?.map((row) => row?.label)?.sort()}
        sx={{ maxWidth: { md: 250, sm: 200 }, minWidth: { md: 250, sm: 200 } }}
        onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoParams')}
        renderInput={(params) => <TextField {...params} label="Unidade orgânica" />}
      />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          value={filter}
          placeholder="Procurar..."
          onChange={(event) => setItemValue(event.target.value, setFilter, 'filterParams')}
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
            <IconButton
              color="inherit"
              onClick={() => {
                setItemValue('', setUo, 'uoParams');
                setItemValue('', setFilter, 'filterParams');
              }}
            >
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
