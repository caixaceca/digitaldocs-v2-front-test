import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
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
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useToggle from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export default function ProcuraAvancada() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const { toggle: open, onOpen, onClose } = useToggle();
  const [conta, setConta] = useState(parametros?.get('conta') || '');
  const [cliente, setCliente] = useState(parametros?.get('cliente') || '');
  const [entidade, setEntidade] = useState(parametros?.get('entidade') || '');
  const [nentrada, setNentrada] = useState(parametros?.get('nentrada') || '');
  const [noperacao, setNoperacao] = useState(parametros?.get('noperacao') || '');
  const [searchQuery, setSearchQuery] = useState(parametros?.get('chave') || '');
  const [avancada, setAvancada] = useState(parametros?.get('avancada') === 'true');
  const { uos, colaboradores, currentColaborador } = useSelector((state) => state.intranet);
  const [data, setData] = useState([
    parametros?.get('datai') ? add(new Date(parametros?.get('datai')), { hours: 2 }) : null,
    parametros?.get('dataf') ? add(new Date(parametros?.get('dataf')), { hours: 2 }) : null,
  ]);
  const [colaborador, setColaborador] = useState(
    parametros?.get('perfilId')
      ? {
          id: Number(parametros?.get('perfilId')),
          label: colaboradores?.find((row) => row?.perfil_id === Number(parametros?.get('perfilId')))?.perfil
            ?.displayName,
        }
      : null
  );
  const [uo, setUo] = useState(
    (parametros?.get('uoId') && {
      id: Number(parametros?.get('uoId')),
      label: uos?.find((row) => row?.id === Number(parametros?.get('uoId')))?.label,
    }) ||
      (currentColaborador?.uo?.tipo === 'Agências' && {
        id: currentColaborador?.uo?.id,
        label: currentColaborador?.uo?.label,
      }) ||
      null
  );

  useEffect(() => {
    if (parametros?.get('perfilId')) {
      setColaborador({
        id: Number(parametros?.get('perfilId')),
        label: colaboradores?.find((row) => row?.perfil_id === Number(parametros?.get('perfilId')))?.perfil
          ?.displayName,
      });
    }
    if (parametros?.get('uoId')) {
      setUo({
        id: Number(parametros?.get('uoId')),
        label: uos?.find((row) => row?.id === Number(parametros?.get('uoId')))?.label,
      });
    }
  }, [colaboradores, uos, parametros]);

  const handleSearch = () => {
    if (avancada) {
      navigate({
        pathname: PATH_DIGITALDOCS.processos.procurar,
        search: createSearchParams({
          avancada,
          conta,
          cliente,
          entidade,
          nentrada,
          noperacao,
          uoId: uo?.id || '',
          perfilId: colaborador?.id || '',
          datai: data[0] ? format(data[0], 'yyyy-MM-dd') : '',
          dataf: data[1] ? format(data[1], 'yyyy-MM-dd') : '',
        }).toString(),
      });
    } else {
      navigate({
        pathname: PATH_DIGITALDOCS.processos.procurar,
        search: createSearchParams({ chave: searchQuery, avancada }).toString(),
      });
    }
    onClose();
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && searchQuery.length > 0) {
      navigate({
        pathname: PATH_DIGITALDOCS.processos.procurar,
        search: createSearchParams({ chave: searchQuery, avancada }).toString(),
      });
      onClose();
    }
  };

  const handleCancelar = () => {
    setConta('');
    setCliente('');
    setEntidade('');
    setNentrada('');
    setNoperacao('');
    setAvancada(false);
    setSearchQuery('');
    setColaborador(null);
    setData([null, null]);
    setUo(
      currentColaborador?.uo?.tipo === 'Agências'
        ? { id: currentColaborador?.uo?.id, label: currentColaborador?.uo?.label }
        : null
    );
    onClose();
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

      <Dialog open={open} onClose={onClose} fullWidth maxWidth={avancada ? 'md' : 'sm'}>
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
                    onChange={(event) => setConta(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={cliente}
                    label="Nº de cliente"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setCliente(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    value={entidade}
                    label="Nº de entidade"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setEntidade(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    value={nentrada}
                    label="Nº de entrada"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setNentrada(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    value={noperacao}
                    label="Nº de operação"
                    InputProps={{ type: 'number' }}
                    onChange={(event) => setNoperacao(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateRangePicker
                    disableFuture
                    value={[data[0], data[1]]}
                    slots={{ field: SingleInputDateRangeField }}
                    onChange={(newValue) => setData([newValue?.[0], newValue?.[1]])}
                    slotProps={{
                      textField: {
                        label: 'Data',
                        fullWidth: true,
                      },
                    }}
                  />
                  {(data[0] || data[1]) && (
                    <IconButton onClick={() => setData([null, null])} sx={{ mt: 1, position: 'absolute', right: 35 }}>
                      <CloseOutlinedIcon sx={{ width: 18 }} />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    value={uo}
                    disableClearable
                    getOptionLabel={(option) => option.label}
                    onChange={(event, newValue) => setUo(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="U.O origem" />}
                    options={applySort(
                      uos?.map((row) => ({ id: row?.id, label: row?.label })),
                      getComparator('asc', 'label')
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    value={colaborador}
                    getOptionLabel={(option) => option.label}
                    onChange={(event, newValue) => setColaborador(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="Criado por" />}
                    options={applySort(
                      colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName })),
                      getComparator('asc', 'label')
                    )}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  value={searchQuery}
                  onKeyUp={handleKeyUp}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Introduza uma palavra/texto chave..."
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                <FormControlLabel
                  label="Pesquisa avançada"
                  control={<Switch checked={avancada} onChange={(event, value) => setAvancada(value)} />}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button variant="outlined" color="inherit" onClick={handleCancelar}>
            Cancelar
          </Button>
          {!avancada && searchQuery && (
            <Button variant="contained" onClick={handleSearch}>
              Procurar
            </Button>
          )}
          {avancada &&
            (conta ||
              cliente ||
              entidade ||
              uo?.id ||
              colaborador?.id ||
              noperacao ||
              nentrada ||
              data[0] ||
              data[1]) && (
              <Button variant="contained" onClick={handleSearch}>
                Procurar
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </>
  );
}
