import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
// @mui
import {
  Grid,
  Stack,
  Switch,
  Dialog,
  Button,
  TextField,
  IconButton,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
// utils
import { add, format } from 'date-fns';
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
  const [conta, setConta] = useState(localStorage.getItem('conta'));
  const [search, setSearch] = useState(localStorage.getItem('search'));
  const [cliente, setCliente] = useState(localStorage.getItem('cliente'));
  const [entidade, setEntidade] = useState(localStorage.getItem('entidade'));
  const [nentrada, setNentrada] = useState(localStorage.getItem('nentrada'));
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao'));
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const { mail, cc, uos, colaboradores } = useSelector((state) => state.intranet);
  const [data, setData] = useState([
    localStorage.getItem('dataISearch') ? add(new Date(localStorage.getItem('dataISearch')), { hours: 2 }) : null,
    localStorage.getItem('dataFSearch') ? add(new Date(localStorage.getItem('dataFSearch')), { hours: 2 }) : null,
  ]);
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
    setUo(
      uosList?.find((row) => row?.id === Number(localStorage.getItem('uoSearch'))) ||
        uosList?.find((row) => row?.id === cc?.uo?.id) ||
        null
    );
  }, [uosList, cc?.uo]);

  useEffect(() => {
    setColaborador(
      colaboradoresList?.find((row) => row?.id === Number(localStorage.getItem('colaboradorSearch'))) || null
    );
  }, [colaboradoresList]);

  const handleSearch = () => {
    if (mail && cc?.perfil_id) {
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            perfilID: cc?.perfil_id,
            conta: localStorage.getItem('conta'),
            uoID: localStorage.getItem('uoSearch'),
            cliente: localStorage.getItem('cliente'),
            datai: localStorage.getItem('dataISearch'),
            dataf: localStorage.getItem('dataISearch'),
            entidade: localStorage.getItem('entidade'),
            nentrada: localStorage.getItem('nentrada'),
            noperacao: localStorage.getItem('noperacao'),
            perfilDono: localStorage.getItem('colaboradorSearch'),
          })
        );
      } else if (cc?.uo_id) {
        dispatch(
          getAll('pesquisa v2', {
            mail,
            uoID: cc?.uo_id,
            perfilId: cc?.perfil_id,
            chave: localStorage.getItem('search'),
          })
        );
      }
    }
    navigate(PATH_DIGITALDOCS.processos.procurar);
    onClose();
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && search && cc?.uo_id) {
      dispatch(
        getAll('pesquisa v2', {
          mail,
          uoID: cc?.uo_id,
          perfilId: cc?.perfil_id,
          chave: localStorage.getItem('search'),
        })
      );
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
                    onChange={(event) => {
                      setConta(event.target.value);
                      localStorage.setItem('conta', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={cliente}
                    label="Nº de cliente"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => {
                      setCliente(event.target.value);
                      localStorage.setItem('cliente', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={entidade}
                    label="Nº de entidade"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => {
                      setEntidade(event.target.value);
                      localStorage.setItem('entidade', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    value={nentrada}
                    label="Nº de entrada"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => {
                      setNentrada(event.target.value);
                      localStorage.setItem('nentrada', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    value={noperacao}
                    label="Nº de operação"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => {
                      setNoperacao(event.target.value);
                      localStorage.setItem('noperacao', event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateRangePicker
                    disableFuture
                    value={[data[0], data[1]]}
                    slots={{ field: SingleInputDateRangeField }}
                    onChange={(newValue) => {
                      setData([newValue?.[0], newValue?.[1]]);
                      if (format(newValue[0])) {
                        localStorage.setItem('dataISearch', format(newValue[0], 'yyyy-MM-dd'));
                      }
                      if (format(newValue[1])) {
                        localStorage.setItem('dataFSearch', format(newValue[1], 'yyyy-MM-dd'));
                      }
                    }}
                    slotProps={{ textField: { label: 'Data', fullWidth: true } }}
                  />
                  {(data[0] || data[1]) && (
                    <IconButton
                      onClick={() => {
                        setData([null, null]);
                        localStorage.setItem('dataISearch', '');
                        localStorage.setItem('dataFSearch', '');
                      }}
                      sx={{ mt: 1, position: 'absolute', right: 35 }}
                    >
                      <CloseOutlinedIcon sx={{ width: 18 }} />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    value={uo}
                    disableClearable
                    options={uosList}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="U.O origem" />}
                    onChange={(event, newValue) => {
                      setUo(newValue);
                      localStorage.setItem('uoSearch', newValue?.id || '');
                    }}
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
                    onChange={(event, newValue) => {
                      setColaborador(newValue);
                      localStorage.setItem('colaboradorSearch', newValue?.id || '');
                    }}
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    localStorage.setItem('search', event.target.value);
                  }}
                  placeholder="Introduza uma palavra/texto chave..."
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
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
