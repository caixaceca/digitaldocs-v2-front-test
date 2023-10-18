import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { add, format } from 'date-fns';
import { dataValido, setDataUtil, setItemValue } from '../../utils/normalizeText';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useToggle from '../../hooks/useToggle';

// ----------------------------------------------------------------------

export default function ProcuraAvancada() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [conta, setConta] = useState(localStorage.getItem('conta') || '');
  const [search, setSearch] = useState(localStorage.getItem('search') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('cliente') || '');
  const [entidade, setEntidade] = useState(localStorage.getItem('entidade') || '');
  const [nentrada, setNentrada] = useState(localStorage.getItem('nentrada') || '');
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao') || '');
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const [datai, setDatai] = useState(
    localStorage.getItem('dataISearch') ? add(new Date(localStorage.getItem('dataISearch')), { hours: 2 }) : null
  );
  const [dataf, setDataf] = useState(
    localStorage.getItem('dataFSearch') ? add(new Date(localStorage.getItem('dataFSearch')), { hours: 2 }) : null
  );
  const uosList = useMemo(() => uos?.map((row) => ({ id: row?.id, label: row?.label })) || [], [uos]);
  const colaboradoresList = useMemo(
    () => colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName })) || [],
    [colaboradores]
  );
  const [colaborador, setColaborador] = useState(
    colaboradoresList?.find((row) => row?.id === Number(localStorage.getItem('colaboradorSearch'))) || null
  );
  const [uo, setUo] = useState(
    uosList?.find((row) => row?.id === Number(localStorage.getItem('uoSearch'))) ||
      uosList?.find((row) => row?.id === cc?.uo?.id) ||
      null
  );

  useEffect(() => {
    if (!uo && uosList && (localStorage.getItem('uoSearch') || cc?.uo?.id)) {
      setUo(
        uosList?.find((row) => row?.id === Number(localStorage.getItem('uoSearch'))) ||
          uosList?.find((row) => row?.id === cc?.uo?.id) ||
          null
      );
    }
  }, [uosList, uo, cc?.uo?.id]);

  useEffect(() => {
    if (!colaborador && colaboradoresList && localStorage.getItem('colaboradorSearch')) {
      setColaborador(
        colaboradoresList?.find((row) => row?.id === Number(localStorage.getItem('colaboradorSearch'))) || null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList]);

  const handleSearch = () => {
    if (mail && cc?.perfil_id) {
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            conta,
            cliente,
            entidade,
            nentrada,
            noperacao,
            uoID: uo?.id,
            perfilID: cc?.perfil_id,
            perfilDono: colaborador?.id,
            datai: dataValido(datai) ? format(datai, 'yyyy-MM-dd') : '',
            dataf: dataValido(dataf) ? format(dataf, 'yyyy-MM-dd') : '',
          })
        );
      } else if (cc?.uo_id) {
        dispatch(getAll('pesquisa v2', { mail, uoID: cc?.uo_id, perfilId: cc?.perfil_id, chave: search }));
      }
    }
    navigate(PATH_DIGITALDOCS.processos.procurar);
    onClose();
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && search && cc?.uo_id) {
      dispatch(getAll('pesquisa v2', { mail, uoID: cc?.uo_id, perfilId: cc?.perfil_id, chave: search }));
      navigate(PATH_DIGITALDOCS.processos.procurar);
      onClose();
    }
  };

  return (
    <>
      <Button
        size="large"
        variant="text"
        onClick={onOpen}
        sx={{ fontSize: { md: 20 }, pr: { md: 10 } }}
        startIcon={<SearchIcon sx={{ width: 30, height: 30 }} />}
      >
        Procurar...
      </Button>

      <Dialog
        fullWidth
        open={open}
        onClose={onClose}
        maxWidth={avancada ? 'md' : 'sm'}
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      >
        <DialogContent sx={{ pb: 0 }}>
          <Grid container spacing={2}>
            {avancada ? (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={conta}
                    label="Nº de conta"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setItemValue(event.target.value, setConta, 'conta')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={cliente}
                    label="Nº de cliente"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setItemValue(event.target.value, setCliente, 'cliente')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={entidade}
                    label="Nº de entidade"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setItemValue(event.target.value, setEntidade, 'entidade')}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    value={nentrada}
                    label="Nº de entrada"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setItemValue(event.target.value, setNentrada, 'nentrada')}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    value={noperacao}
                    label="Nº de operação"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setItemValue(event.target.value, setNoperacao, 'noperacao')}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <DatePicker
                    disableFuture
                    value={datai}
                    label="Data inicial"
                    slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                    onChange={(newValue) =>
                      setDataUtil(newValue, setDatai, 'dataISearch', setDataf, 'dataFSearch', dataf)
                    }
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <DatePicker
                    disableFuture
                    value={dataf}
                    minDate={datai}
                    disabled={!datai}
                    label="Data final"
                    slotProps={{ field: { clearable: true }, textField: { fullWidth: true } }}
                    onChange={(newValue) => setDataUtil(newValue, setDataf, 'dataFSearch', '', '', '')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    disableClearable
                    options={uosList}
                    value={uo || null}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="U.O origem" />}
                    onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoSearch', true)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    value={colaborador}
                    options={colaboradoresList}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="Criado por" />}
                    onChange={(event, newValue) => setItemValue(newValue, setColaborador, 'colaboradorSearch', true)}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  value={search}
                  onKeyUp={handleKeyUp}
                  label="Pesquisa global"
                  placeholder="Introduza uma palavra/texto chave..."
                  onChange={(event) => setItemValue(event.target.value, setSearch, 'search')}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
          <Stack direction="row" justifyContent="center">
            <FormControlLabel
              label="Pesquisa avançada"
              control={
                <Switch
                  checked={avancada}
                  onChange={(event, value) => {
                    setAvancada(value);
                    localStorage.setItem('tipoPesquisa', value === true ? 'avancada' : 'global');
                  }}
                />
              }
            />
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          {(avancada && (
            <Button variant="contained" onClick={handleSearch}>
              Procurar
            </Button>
          )) ||
            (search && (
              <Button variant="contained" onClick={handleSearch}>
                Procurar
              </Button>
            ))}
        </DialogActions>
      </Dialog>
    </>
  );
}
