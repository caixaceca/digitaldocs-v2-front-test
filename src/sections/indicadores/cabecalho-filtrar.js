import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
// utils
import { setItemValue } from '../../utils/formatObject';
import { ptDate, getDataLS, dataValido, setDataUtil } from '../../utils/formatTime';
import { UosAcesso, estadosAcesso, ColaboradoresAcesso } from '../../utils/validarAcesso';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getIndicadores } from '../../redux/slices/indicadores';
// components
import Panel from '../../components/Panel';
import { DTFechar } from '../../components/Actions';
import { FilterSwitch } from '../../components/hook-form';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// --------------------------------------------------------------------------------------------------------------------------------------------

Cabecalho.propTypes = {
  tab: PropTypes.string,
  top: PropTypes.string,
  setTop: PropTypes.func,
  title: PropTypes.string,
  vista: PropTypes.string,
  setVista: PropTypes.func,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export function Cabecalho({ title, tab, top, vista, setTop, setVista, tabsList = [], currentTab = '', changeTab }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { perfilId, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const { isAdmin, isAuditoria, meusAmbientes, fluxos, estados } = useSelector((state) => state.parametrizacao);
  const uosList = useMemo(
    () => UosAcesso(uos, cc, isAdmin || isAuditoria, meusAmbientes, 'id'),
    [cc, isAdmin, isAuditoria, meusAmbientes, uos]
  );
  const [uo, setUo] = useState(
    uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
      uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );

  // LISTA DE ITEMS
  const fluxosList = useMemo(() => fluxos?.map((row) => ({ id: row?.id, label: row?.assunto })), [fluxos]);
  const balcoesList = useMemo(
    () => UosAcesso(uos, cc, isAdmin || isAuditoria, meusAmbientes, 'balcao'),
    [cc, isAdmin, isAuditoria, meusAmbientes, uos]
  );
  const colaboradoresList = useMemo(
    () =>
      uo?.id && tab !== 'execucao' && tab !== 'conclusao'
        ? ColaboradoresAcesso(colaboradores, cc, isAdmin || isAuditoria, meusAmbientes)?.filter(
            (row) => row?.uoId === uo?.id
          )
        : ColaboradoresAcesso(colaboradores, cc, isAdmin || isAuditoria, meusAmbientes),
    [cc, colaboradores, isAdmin, isAuditoria, meusAmbientes, tab, uo?.id]
  );
  const estadosList = useMemo(
    () => estadosAcesso(uos, cc, isAdmin || isAuditoria, estados, meusAmbientes),
    [cc, estados, isAdmin, isAuditoria, meusAmbientes, uos]
  );

  // VARIAVEIS
  const [datai, setDatai] = useState(getDataLS('dataIIndic', null));
  const [dataf, setDataf] = useState(getDataLS('dataFIndic', null));
  const [origem, setOrigem] = useState(localStorage.getItem('origem') || 'Interna');
  const [entrada, setEntrada] = useState(localStorage.getItem('entrada') === 'true');
  const [momento, setMomento] = useState(localStorage.getItem('momento') || 'Criação no sistema');
  const [agrEntradas, setAgrEntradas] = useState(localStorage.getItem('agrEntradas') || 'Balcão');
  const [agrupamento, setAgrupamento] = useState(localStorage.getItem('agrupamento') || 'Unidade orgânica');
  const [ano, setAno] = useState(
    localStorage.getItem('anoIndic') ? add(new Date(localStorage.getItem('anoIndic')), { hours: 2 }) : new Date()
  );
  const [fluxo, setFluxo] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))) || null
  );
  const [balcao, setBalcao] = useState(
    balcoesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('balcaoIndic'))) ||
      balcoesList?.find((row) => Number(row?.id) === Number(cc?.uo?.id)) ||
      null
  );
  const [estado, setEstado] = useState(
    estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))) || null
  );
  const [perfil, setPerfil] = useState(
    colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
      colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId)) ||
      null
  );

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoIndic') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('uoIndic'))) ||
          uosList?.find((row) => Number(row?.id) === Number(cc?.uo?.id))
      );
      localStorage.setItem('uoIndic', localStorage.getItem('uoIndic') || cc?.uo?.id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uosList, cc?.uo?.id]);

  useEffect(() => {
    if (!perfil?.id && colaboradoresList && (localStorage.getItem('colaboradorIndic') || perfilId)) {
      setPerfil(
        colaboradoresList?.find((row) => Number(row?.id) === Number(localStorage.getItem('colaboradorIndic'))) ||
          colaboradoresList?.find((row) => Number(row?.id) === Number(perfilId))
      );
      localStorage.setItem('colaboradorIndic', localStorage.getItem('colaboradorIndic') || perfilId || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList, perfilId]);

  useEffect(() => {
    if (!fluxo && fluxosList && localStorage.getItem('fluxoIndic')) {
      setFluxo(fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoIndic'))));
    }
  }, [fluxosList, fluxo]);

  useEffect(() => {
    if (!estado && estadosList && localStorage.getItem('estadoIndic')) {
      setEstado(estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoIndic'))));
    }
  }, [estadosList, estado]);

  useEffect(() => {
    if (tab) {
      const uoId = uo?.id || '';
      const fluxoId = fluxo?.id || '';
      const perfilId = perfil?.id || '';
      const estadoId = estado?.id || '';
      const porEstado = agrEntradas === 'Estado';
      const validarDistinto = tab === 'entradaTrabalhado';
      const destinoId = porEstado ? estado?.id : balcao?.id;
      const destino = porEstado ? 'num_estado' : 'num_balcao';
      const de = momento === 'Criação no sistema' ? 'c' : 'e';
      const validarEntrada = tab === 'totalTrabalhados' || tab === 'acao';

      const fluxoKey = (tab === 'execucao' && 'fluxoIDFilter') || 'fluxoID';
      const uoKey = ((tab === 'data' || tab === 'tipos') && 'uoID') || 'uo_id';
      const estadoKey = (tab === 'execucao' && 'estadoIDFilter') || 'estado_id';
      const perfilKey = (tab === 'execucao' && 'perfilIDFilter') || (tab === 'data' && 'perfilID1') || 'perfilPID';

      const datas = {
        dataFinal: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
        dataInicial: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
      };

      if (tab === 'data') dispatch(getIndicadores(tab, { vista, uoId, uoKey, perfilId, perfilKey }));
      if (tab === 'criacao' && uo?.id) dispatch(getIndicadores(tab, { uoId, ...datas }));
      if (tab === 'trabalhados' && estadoId) dispatch(getIndicadores(tab, { estadoId, ...datas }));
      if (tab === 'devolucoes' && estadoId) dispatch(getIndicadores(tab, { estadoId, origem, ...datas }));
      if (tab === 'origem') dispatch(getIndicadores(tab, { escopo: agrupamento === 'Colaborador' ? 'perfil' : 'uo' }));
      if (tab === 'tipos') dispatch(getIndicadores(tab, { uoId, uoKey, perfilId, perfilKey, ...datas }));
      if (tab === 'conclusao') dispatch(getIndicadores(tab, { de, perfilId, perfilKey, fluxoId, fluxoKey, ...datas }));
      if (tab === 'entradas' && ((porEstado && estadoId) || balcao?.id))
        dispatch(getIndicadores(tab, { destino, destinoId, ...datas }));
      if (tab === 'execucao' && (perfilId || fluxoId || estadoId))
        dispatch(getIndicadores(tab, { perfilId, perfilKey, fluxoId, fluxoKey, estadoId, estadoKey }));
      if (
        (tab === 'acao' ||
          tab === 'equipa' ||
          tab === 'colaboradores' ||
          tab === 'totalTrabalhados' ||
          tab === 'entradaTrabalhado') &&
        ((porEstado && estadoId) || (!porEstado && uoId)) &&
        dataValido(ano)
      )
        dispatch(
          getIndicadores(tab, {
            uoKey,
            perfilKey,
            estadoKey,
            ano: format(ano, 'yyyy'),
            uoId: !porEstado && uoId ? uoId : '',
            estadoId: porEstado && estadoId ? estadoId : '',
            perfilId: validarEntrada && perfilId ? perfilId : '',
            entrada: (validarEntrada && entrada && 'true') || (validarEntrada && !entrada && 'false') || '',
            distinto: (validarDistinto && entrada && 'true') || (validarDistinto && !entrada && 'false') || '',
          })
        );
    }
  }, [
    tab,
    ano,
    datai,
    dataf,
    vista,
    balcao,
    estado,
    uo?.id,
    origem,
    entrada,
    momento,
    dispatch,
    perfilId,
    fluxo?.id,
    perfil?.id,
    agrupamento,
    agrEntradas,
  ]);

  const haveColaborador =
    tab === 'acao' ||
    tab === 'data' ||
    tab === 'tipos' ||
    tab === 'execucao' ||
    tab === 'conclusao' ||
    tab === 'totalTrabalhados';
  const haveEstado =
    tab === 'execucao' ||
    tab === 'devolucoes' ||
    tab === 'trabalhados' ||
    (tab === 'equipa' && agrEntradas === 'Estado') ||
    (tab === 'entradas' && agrEntradas === 'Estado') ||
    (tab === 'colaboradores' && agrEntradas === 'Estado') ||
    (tab === 'entradaTrabalhado' && agrEntradas === 'Estado') ||
    ((tab === 'totalTrabalhados' || tab === 'acao') && agrEntradas === 'Estado');
  const havePeriodo =
    tab === 'tipos' ||
    tab === 'criacao' ||
    tab === 'entradas' ||
    tab === 'devolucoes' ||
    tab === 'trabalhados' ||
    tab === 'conclusao';

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={title}
        action={
          <Button variant="contained" endIcon={<FilterListOutlinedIcon />} onClick={onOpen}>
            Filtrar
          </Button>
        }
      />

      {currentTab && (
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={changeTab} sx={{ mb: 1.5 }} />
      )}

      <Stack direction="row" justifyContent="center" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={1}>
          {tab === 'conclusao' && momento && <Panel label="Momento" value={momento} />}
          {tab === 'origem' && (agrupamento || top !== 'Todos') && (
            <>
              {agrupamento && <Panel label="Agrupamento" value={agrupamento} />}
              {top !== 'Todos' && <Panel value={top} />}
            </>
          )}
          {tab === 'data' && vista && <Panel label="Vista" value={vista} />}
          {(tab === 'acao' ||
            tab === 'equipa' ||
            tab === 'colaboradores' ||
            tab === 'totalTrabalhados' ||
            tab === 'entradaTrabalhado') &&
            ano &&
            dataValido(ano) && <Panel label="Ano" value={format(ano, 'yyyy')} />}

          {(tab === 'data' ||
            tab === 'tipos' ||
            tab === 'criacao' ||
            ((tab === 'acao' ||
              tab === 'equipa' ||
              tab === 'entradaTrabalhado' ||
              tab === 'totalTrabalhados' ||
              tab === 'colaboradores') &&
              agrEntradas === 'Balcão')) &&
            uo?.label && <Panel label="Balcão/U.O" value={uo?.label} />}
          {tab === 'entradas' && balcao?.label && agrEntradas === 'Balcão' && (
            <Panel label="Balcão" value={balcao?.label} />
          )}
          {haveEstado && estado?.label && <Panel label="Estado" value={estado?.label} />}
          {haveColaborador && perfil?.label && <Panel label="Colaborador" value={perfil?.label} />}
          {tab === 'devolucoes' && origem && <Panel label="Origem" value={origem} />}
          {(tab === 'conclusao' || tab === 'execucao') && fluxo?.label && (
            <Panel label="Assunto" value={balcao?.fluxo} />
          )}
          {(tab === 'entradaTrabalhado' || tab === 'totalTrabalhados' || tab === 'acao') && entrada && (
            <Panel value={tab === 'entradaTrabalhado' ? 'Distinto' : 'Entrada'} />
          )}
          {havePeriodo && (datai || dataf) && (
            <Panel
              label={(datai && dataf && 'Período') || (datai && 'Desde') || (dataf && 'Até')}
              value={
                (datai && dataf && `${ptDate(datai)}-${ptDate(dataf)}`) ||
                (datai && ptDate(datai)) ||
                (dataf && ptDate(dataf))
              }
            />
          )}
        </Stack>
      </Stack>

      {open && (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
          <DTFechar title="Filtrar" handleClick={() => onClose()} />
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 3 }}>
              {tab === 'devolucoes' && (
                <FilterRG localS="origem" value={origem} setValue={setOrigem} options={['Interna', 'Externa']} />
              )}
              {tab === 'conclusao' && (
                <FilterRG
                  localS="momento"
                  value={momento}
                  setValue={setMomento}
                  options={['Criação no sistema', 'Data de entrada']}
                />
              )}
              {(tab === 'acao' ||
                tab === 'equipa' ||
                tab === 'entradas' ||
                tab === 'colaboradores' ||
                tab === 'totalTrabalhados' ||
                tab === 'entradaTrabalhado') && (
                <FilterRG
                  localS="agrEntradas"
                  value={agrEntradas}
                  setValue={setAgrEntradas}
                  options={['Balcão', 'Estado']}
                />
              )}
              {tab === 'origem' && (
                <>
                  <FilterRG
                    localS="agrupamento"
                    value={agrupamento}
                    setValue={setAgrupamento}
                    options={['Unidade orgânica', 'Colaborador']}
                  />
                  <FilterRG
                    localS="top"
                    value={top}
                    setValue={setTop}
                    options={['Todos', 'Top 5', 'Top 10', 'Top 20']}
                  />
                </>
              )}
              {tab === 'data' && (
                <FilterRG
                  value={vista}
                  label="Vista"
                  localS="vista"
                  setValue={setVista}
                  options={['Mensal', 'Anual']}
                />
              )}
              {(tab === 'acao' ||
                tab === 'equipa' ||
                tab === 'colaboradores' ||
                tab === 'totalTrabalhados' ||
                tab === 'entradaTrabalhado') && (
                <DatePicker
                  value={ano}
                  label="Ano"
                  disableFuture
                  views={['year']}
                  onChange={(newValue) => setDataUtil(newValue, setAno, 'anoIndic', null, '', null)}
                />
              )}
              {(tab === 'data' ||
                tab === 'tipos' ||
                tab === 'criacao' ||
                ((tab === 'acao' ||
                  tab === 'equipa' ||
                  tab === 'colaboradores' ||
                  tab === 'totalTrabalhados' ||
                  tab === 'entradaTrabalhado') &&
                  agrEntradas === 'Balcão')) && (
                <FilterAutocomplete
                  value={uo}
                  setValue={setUo}
                  options={uosList}
                  label="Unidade orgânica"
                  disableClearable={tab === 'criacao'}
                />
              )}
              {tab === 'entradas' && agrEntradas === 'Balcão' && (
                <FilterAutocomplete
                  value={balcao}
                  label="Balcão"
                  disableClearable
                  setValue={setBalcao}
                  options={balcoesList}
                />
              )}
              {haveEstado && (
                <FilterAutocomplete
                  label="Estado"
                  value={estado}
                  setValue={setEstado}
                  options={estadosList}
                  disableClearable={haveEstado && !perfil && !fluxo}
                />
              )}
              {haveColaborador && (
                <FilterAutocomplete
                  value={perfil}
                  label="Colaborador"
                  setValue={setPerfil}
                  options={colaboradoresList}
                  disableClearable={tab === 'execucao' && !estado && !fluxo}
                />
              )}
              {(tab === 'conclusao' || tab === 'execucao') && (
                <FilterAutocomplete
                  value={fluxo}
                  setValue={setFluxo}
                  options={fluxosList}
                  label="Assunto"
                  disableClearable={tab === 'execucao' && !perfil && !estado}
                />
              )}
              {(tab === 'entradaTrabalhado' || tab === 'totalTrabalhados' || tab === 'acao') && (
                <FilterSwitch
                  value={entrada}
                  localS="entrada"
                  setValue={setEntrada}
                  label={tab === 'entradaTrabalhado' ? 'Distinto' : 'Entrada'}
                />
              )}
              {havePeriodo && (
                <Stack direction="row" spacing={1}>
                  <DatePicker
                    disableFuture
                    value={datai}
                    label="Data inicial"
                    slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                    onChange={(newValue) =>
                      setDataUtil(newValue, setDatai, 'dataIIndic', setDataf, 'dataFIndic', dataf)
                    }
                  />
                  <DatePicker
                    disableFuture
                    value={dataf}
                    minDate={datai}
                    disabled={!datai}
                    label="Data final"
                    slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                    onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFIndic', '', '', '')}
                  />
                </Stack>
              )}
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterAutocomplete.propTypes = {
  label: PropTypes.string,
  value: PropTypes.object,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterAutocomplete({ label, value, options, setValue, ...other }) {
  const localS =
    (label === 'Estado' && 'estadoIndic') ||
    (label === 'Unidade orgânica' && 'uoIndic') ||
    (label === 'Assunto' && 'fluxoIndic') ||
    (label === 'Colaborador' && 'colaboradorIndic') ||
    '';
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={options}
      getOptionLabel={(option) => option?.label}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      onChange={(event, newValue) => setItemValue(newValue, setValue, localS, true)}
      {...other}
    />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterRG.propTypes = {
  value: PropTypes.string,
  localS: PropTypes.string,
  options: PropTypes.array,
  setValue: PropTypes.func,
};

function FilterRG({ localS, value, setValue, options = [] }) {
  return (
    <Stack>
      <RadioGroup
        row
        value={value}
        sx={{ justifyContent: 'center' }}
        onChange={(event, newValue) => setItemValue(newValue, setValue, localS)}
      >
        {options?.map((row) => (
          <FormControlLabel key={row} value={row} label={row} control={<Radio size="small" />} />
        ))}
      </RadioGroup>
    </Stack>
  );
}
