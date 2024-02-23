import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
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
      <SearchField item={item} filter={filter} setFilter={setFilter} />
      {filter && <RemoverFiltros removerFiltro={() => setItemValue('', setFilter, item, false)} />}
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
      {(assuntosList?.length > 0 || estadosList?.length > 0 || uosorigemList?.length > 0) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {assuntosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={assunto || null}
              options={assuntosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Assunto" />}
              onChange={(event, newValue) => setItemValue(newValue, setAssunto, 'assuntoSearch')}
            />
          )}
          {estadosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={estado || null}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 250 } }}
              renderInput={(params) => <TextField {...params} label="Estado" />}
              onChange={(event, newValue) => setItemValue(newValue, setEstado, 'estadoSearch')}
            />
          )}
          {uosorigemList?.length > 0 && (
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
        <SearchField item="filterSearch" filter={search} setFilter={setSearch} />
        {(uo || search || assunto || estado) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setUo, 'uoFSearch');
              setItemValue('', setSearch, 'estadoSearch');
              setItemValue('', setEstado, 'filterSearch');
              setItemValue('', setAssunto, 'assuntoSearch');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarProcessos.propTypes = {
  tab: PropTypes.string,
  motivo: PropTypes.string,
  filter: PropTypes.string,
  setMotivo: PropTypes.func,
  setFilter: PropTypes.func,
  segmento: PropTypes.string,
  setSegmento: PropTypes.func,
  colaborador: PropTypes.string,
  setColaborador: PropTypes.func,
  colaboradoresList: PropTypes.array,
};

export function SearchToolbarProcessos({
  tab,
  motivo,
  filter,
  segmento,
  setMotivo,
  setFilter,
  colaborador,
  setSegmento,
  setColaborador,
  colaboradoresList,
}) {
  const { cc } = useSelector((state) => state.intranet);
  const { meusAmbientes, meusFluxos } = useSelector((state) => state.parametrizacao);
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        {tab !== 'retidos' && tab !== 'atribuidos' && (
          <>
            {meusAmbientes?.length > 1 && <Ambiente />}
            {meusFluxos?.length > 1 && <Fluxo />}
          </>
        )}
        {cc?.uo?.tipo === 'Agências' && tab === 'pendentes' && (
          <Autocomplete
            fullWidth
            value={motivo || null}
            sx={{ width: { md: 150, xl: 200 } }}
            options={['Levantamento do pedido', 'Outros']}
            renderInput={(params) => <TextField {...params} label="Motivo" />}
            onChange={(event, newValue) => setItemValue(newValue, setMotivo, 'motivoP')}
          />
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
        {cc?.uo?.tipo !== 'Agências' && tab !== 'pendentes' && (
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
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        <SearchField item="filterP" filter={filter} setFilter={setFilter} />
        {(filter || segmento) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filterP');
              setItemValue('', setSegmento, 'segmento');
            }}
          />
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
        <SearchField item="filterC" filter={filter} setFilter={setFilter} />
        {(filter || assunto || colaborador || estado) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filterC');
              setItemValue('', setEstado, 'estadoC');
              setItemValue('', setAssunto, 'assuntoC');
              setItemValue('', setColaborador, 'colaboradorC');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

SearchToolbarCartoes.propTypes = {
  filter: PropTypes.string,
  setFilter: PropTypes.func,
  tiposCartao: PropTypes.array,
  tipoCartao: PropTypes.string,
  setTipoCartao: PropTypes.func,
};

export function SearchToolbarCartoes({ filter, setFilter, tipoCartao, tiposCartao, setTipoCartao }) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {tiposCartao?.length > 0 && (
        <Autocomplete
          fullWidth
          value={tipoCartao || null}
          sx={{ width: { md: 230 } }}
          options={tiposCartao?.sort()}
          renderInput={(params) => <TextField {...params} label="Tipo de cartão" />}
          onChange={(event, newValue) => setItemValue(newValue, setTipoCartao, 'tipoCartao')}
        />
      )}
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ flexGrow: 1 }} alignItems="center">
        <SearchField item="filterCartao" filter={filter} setFilter={setFilter} />
        {(filter || tipoCartao) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filterCartao');
              setItemValue('', setTipoCartao, 'tipoCartao');
            }}
          />
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
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pb: 1, px: 0 }}>
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
        <SearchField item="filterAcessos" filter={filter} setFilter={setFilter} />
        {(filter || uo) && (
          <Tooltip title="Remover pesquiza" arrow>
            <IconButton
              color="inherit"
              onClick={() => {
                setItemValue('', setUo, 'uoParams');
                setItemValue('', setFilter, 'filterAcessos');
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

// ----------------------------------------------------------------------

SearchField.propTypes = { item: PropTypes.string, filter: PropTypes.string, setFilter: PropTypes.func };

function SearchField({ item, filter, setFilter }) {
  return (
    <TextField
      fullWidth
      value={filter}
      placeholder="Procurar..."
      onChange={(event) => setItemValue(event.target.value, setFilter, item)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlinedIcon sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

RemoverFiltros.propTypes = { removerFiltro: PropTypes.func };

function RemoverFiltros({ removerFiltro }) {
  return (
    <Stack>
      <Tooltip title="Remover filtros" arrow>
        <IconButton color="inherit" onClick={removerFiltro}>
          <ClearAllIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
