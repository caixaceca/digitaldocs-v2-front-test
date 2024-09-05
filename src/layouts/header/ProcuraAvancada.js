import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { setItemValue } from '../../utils/formatText';
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
  const { mail, perfilId, cc, uos } = useSelector((state) => state.intranet);
  const [conta, setConta] = useState(localStorage.getItem('conta') || '');
  const [chave, setChave] = useState(localStorage.getItem('chave') || '');
  const [entrada, setEntrada] = useState(localStorage.getItem('entrada') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('cliente') || '');
  const [entidade, setEntidade] = useState(localStorage.getItem('entidade') || '');
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao') || '');
  const [historico, setHistorico] = useState(localStorage.getItem('procHistorico') === 'true');
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const uosList = useMemo(() => uos?.map((row) => ({ id: row?.id, label: row?.label })) || [], [uos]);
  const [uo, setUo] = useState(
    uosList?.find((row) => row?.id === Number(localStorage.getItem('uoSearch'))) ||
      uosList?.find((row) => row?.id === cc?.uo?.id) ||
      null
  );

  const handleSearch = () => {
    if (mail) {
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', { uo, mail, conta, cliente, entidade, entrada, noperacao, historico, perfilId })
        );
      } else if (cc?.uo_id) {
        dispatch(getAll('pesquisa global', { mail, chave, historico, uoID: cc?.uo_id, perfilId }));
      }
    }
    navigate(PATH_DIGITALDOCS.processos.procurar);
    onClose();
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && chave && cc?.uo_id) {
      dispatch(getAll('pesquisa global', { mail, chave, historico, uoID: cc?.uo_id, perfilId }));
      navigate(PATH_DIGITALDOCS.processos.procurar);
      onClose();
    }
  };

  return (
    <>
      <Button
        size="large"
        onClick={onOpen}
        sx={{ fontSize: { md: 18 } }}
        startIcon={<SearchIcon sx={{ width: 28, height: 28 }} />}
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
        <DialogTitle>
          <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
            Procurar
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
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {avancada ? (
              <>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    fullWidth
                    options={uosList}
                    value={uo || null}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} label="Unidade orgânica" />}
                    onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoSearch', true)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextFieldNumb value={entrada} setValue={setEntrada} label="Nº de entrada" localS="entrada" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextFieldNumb value={noperacao} setValue={setNoperacao} label="Nº de operação" localS="noperacao" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextFieldNumb value={entidade} setValue={setEntidade} label="Nº de entidade" localS="entidade" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextFieldNumb value={cliente} setValue={setCliente} label="Nº de cliente" localS="cliente" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextFieldNumb value={conta} setValue={setConta} label="Nº de conta" localS="conta" />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    autoFocus
                    value={chave}
                    onKeyUp={handleKeyUp}
                    placeholder="Introduza uma palavra/texto chave..."
                    onChange={(event) => setItemValue(event.target.value, setChave, 'chave', false)}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center">
                <FormControlLabel
                  label="Histórico"
                  control={
                    <Switch
                      checked={historico}
                      onChange={(event, value) => {
                        setHistorico(value);
                        localStorage.setItem('procHistorico', value === true ? 'true' : 'false', false);
                      }}
                    />
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          {(avancada || chave) && (
            <Button variant="contained" onClick={handleSearch}>
              Procurar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

TextFieldNumb.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  localS: PropTypes.string,
  setValue: PropTypes.func,
};

function TextFieldNumb({ value, setValue, label, localS }) {
  return (
    <TextField
      fullWidth
      value={value}
      label={label}
      InputProps={{ type: 'number', inputProps: { style: { textAlign: 'right' } } }}
      onChange={(event) => setItemValue(event.target.value, setValue, localS, false)}
    />
  );
}
