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
import { setItemValue } from '../utils/formatObject';
// redux
import { useSelector } from '../redux/store';
// sections
import { FilterSwitch } from './hook-form';
import { Ambiente, Fluxo } from '../sections/AmbienteFluxo';
// _mock_
import { meses } from '../_mock';

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbarSimple({ filter, item = '', setFilter, children = null }) {
  return (
    <Stack direction={{ xs: children ? 'column' : 'row', sm: 'row' }} alignItems="center" spacing={1} sx={{ pb: 1 }}>
      {children}
      <SearchField item={item} filter={filter} setFilter={setFilter} />
      {filter && <RemoverFiltros removerFiltro={() => setItemValue('', setFilter, item, false)} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchTransicao({ options }) {
  const { modo, origem, destino, setModo, setDestino, setOrigem, estadosList } = options;
  return (
    <Stack direction="row" sx={{ pb: 1, pt: 0 }} alignItems="center" spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
        <Autocomplete
          fullWidth
          value={origem || null}
          options={estadosList?.sort()}
          renderInput={(params) => <TextField {...params} label="Origem" />}
          onChange={(event, newValue) => setItemValue(newValue, setOrigem, 'origemTransicao')}
        />
        <Autocomplete
          fullWidth
          value={destino || null}
          options={estadosList?.sort()}
          renderInput={(params) => <TextField {...params} label="Destino" />}
          onChange={(event, newValue) => setItemValue(newValue, setDestino, 'destinoTransicao')}
        />
        <Autocomplete
          fullWidth
          value={modo || null}
          options={['Seguimento', 'Seguimento depois devolução', 'Devolução']}
          renderInput={(params) => <TextField {...params} label="Modo" />}
          onChange={(event, newValue) => setItemValue(newValue, setModo, 'modoTransicao')}
        />
      </Stack>
      {(modo || origem || destino) && (
        <RemoverFiltros
          removerFiltro={() => {
            setItemValue('', setModo, 'modoTransicao');
            setItemValue('', setOrigem, 'origemTransicao');
            setItemValue('', setDestino, 'destinoTransicao');
          }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbarProcura({ options }) {
  const {
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
  } = options;
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

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbarProcessos({
  tab,
  filter,
  segmento,
  setFilter,
  colaborador,
  setSegmento,
  setColaborador,
  colaboradoresList,
  meuAmbiente = null,
}) {
  // const { cc } = useSelector((state) => state.intranet);
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      {tab !== 'Agendados' && tab !== 'Finalizados' && tab !== 'Executados' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {(tab === 'Tarefas' || tab === 'Pendentes') && (
            <>
              <Ambiente />
              {!!meuAmbiente && <Fluxo />}
            </>
          )}
          {tab === 'Tarefas' && (
            <Autocomplete
              fullWidth
              value={segmento || null}
              sx={{ width: { md: 170 } }}
              options={['Particulares', 'Empresas']}
              renderInput={(params) => <TextField {...params} label="Segmento" />}
              onChange={(event, newValue) => setItemValue(newValue, setSegmento, 'segmento-processo')}
            />
          )}
          {(tab === 'Retidos' || tab === 'Atribuídos') && (
            <Autocomplete
              fullWidth
              value={colaborador || null}
              options={colaboradoresList}
              sx={{ width: { md: 250, xl: 300 } }}
              getOptionLabel={(option) => option?.label}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Colaborador" />}
              onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorP', true)}
            />
          )}
        </Stack>
      )}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        <SearchField item="filter-processo" filter={filter} setFilter={setFilter} />
        {(filter || segmento) && (
          <RemoverFiltros
            removerFiltro={() => {
              setItemValue('', setFilter, 'filter-processo');
              setItemValue('', setSegmento, 'segmento-processo');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbarEntradas({
  from,
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
          {from !== 'Por concluir' && colaboradoresList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={colaborador || null}
              options={colaboradoresList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              disableClearable={colaboradoresList?.length === 1}
              renderInput={(params) => <TextField {...params} label="Colaborador" />}
              onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorC')}
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
          {estadosList?.length > 0 && (
            <Autocomplete
              fullWidth
              value={estado || null}
              options={estadosList?.sort()}
              sx={{ width: { md: 180, xl: 230 } }}
              renderInput={(params) => <TextField {...params} label="Estado atual" />}
              onChange={(event, newValue) => setItemValue(newValue, setEstado, 'estadoC')}
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
              setItemValue(colaboradoresList?.length === 1 ? colaboradoresList[0] : '', setColaborador, 'colaboradorC');
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchToolbarCartoes({ options }) {
  const { filter, setFilter, tipoCartao, tiposCartao, setTipoCartao } = options;
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ pb: 1, pt: 0 }} spacing={1}>
      <Autocomplete
        fullWidth
        value={tipoCartao || null}
        sx={{ width: { md: 230 } }}
        options={tiposCartao?.sort()}
        renderInput={(params) => <TextField {...params} label="Tipo de cartão" />}
        onChange={(event, newValue) => setItemValue(newValue, setTipoCartao, 'tipoCartao')}
      />
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

// ---------------------------------------------------------------------------------------------------------------------

export function TableToolbarPerfilEstados({ options }) {
  const { uo, filter, setUo, setFilter } = options;
  const { uos } = useSelector((state) => state.intranet);

  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ pb: 1, px: 0 }}>
      <Autocomplete
        fullWidth
        value={uo || null}
        getOptionLabel={(option) => option}
        options={uos?.map(({ label }) => label)?.sort()}
        sx={{ maxWidth: { md: 250, sm: 200 }, minWidth: { md: 250, sm: 200 } }}
        onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoParams')}
        renderInput={(params) => <TextField {...params} label="Unidade orgânica" />}
      />
      <Stack spacing={1} direction="row" justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
        <SearchField item="filterAcessos" filter={filter} setFilter={setFilter} />
        {(filter || uo) && (
          <Tooltip title="Remover pesquisa" arrow>
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

// ---------------------------------------------------------------------------------------------------------------------

export function SearchIndicadores({
  mes,
  setMes,
  detalhes,
  indicador,
  setDetalhes,
  item = null,
  itemsList = [],
  setItem = null,
  colaborador = null,
  viewEntrada = false,
  setColaborador = null,
  setViewEntrada = null,
  colaboradoresList = [],
}) {
  return (
    <Stack
      spacing={1}
      sx={{ p: 1 }}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', sm: 'row' }}
    >
      <Stack spacing={1} alignItems="center" justifyContent="center" direction="row">
        {indicador === 'Colaboradores' && (
          <FilterSwitch value={viewEntrada} localS="viewEntrada" setValue={setViewEntrada} label="Dados entrada" />
        )}
        <FilterSwitch value={detalhes} localS="detalhes" setValue={setDetalhes} label="Dados mensais" />
      </Stack>
      <Autocomplete
        fullWidth
        options={meses}
        value={mes || null}
        sx={{ width: { sm: 180 } }}
        getOptionLabel={(option) => option?.label}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        onChange={(event, newValue) => setItemValue(newValue, setMes, '', '')}
        renderInput={(params) => <TextField {...params} label="Mês" size="small" />}
      />
      {(indicador === 'Trabalhados' || indicador === 'Ação') && (
        <Autocomplete
          fullWidth
          value={item || null}
          options={itemsList?.sort()}
          sx={{ width: { sm: 250, md: 350 } }}
          onChange={(event, newValue) => setItemValue(newValue, setItem, '', '')}
          renderInput={(params) => (
            <TextField {...params} label={indicador === 'Ação' ? 'Ação' : 'Assunto'} size="small" />
          )}
        />
      )}
      {indicador === 'Colaboradores' && (
        <Autocomplete
          fullWidth
          value={colaborador}
          options={colaboradoresList}
          sx={{ width: { sm: 250, md: 350 } }}
          getOptionLabel={(option) => option?.label}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(event, newValue) => setItemValue(newValue, setColaborador, '', '')}
          renderInput={(params) => <TextField {...params} label="Colaborador" size="small" />}
        />
      )}
      {(mes || item || colaborador) && (
        <RemoverFiltros
          removerFiltro={() => {
            setItemValue(null, setMes, '', '');
            setItemValue(null, setItem, '', '');
            setItemValue(null, setColaborador, '', '');
          }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchAutocomplete({ options, ...others }) {
  const { value = null, label, valuel = null, setValue, dados = [] } = options;
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={dados}
      sx={{ maxWidth: { md: 300 } }}
      getOptionLabel={(option) => option?.label}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setValue, valuel, true)}
      {...others}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SearchField({ item, filter, setFilter, ...others }) {
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
      {...others}
    />
  );
}

export function RemoverFiltros({ removerFiltro }) {
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
