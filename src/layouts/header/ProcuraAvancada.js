import { useState } from 'react';
import PropTypes from 'prop-types';
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
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { setItemValue } from '../../utils/normalizeText';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem } from '../../redux/slices/digitaldocs';
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
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao') || '');
  const [arquivo, setArquivo] = useState(localStorage.getItem('procArquivo') === 'true');
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleSearch = () => {
    if (mail && cc?.perfil_id) {
      dispatch(resetItem('pesquisa'));
      if (localStorage.getItem('tipoPesquisa') === 'avancada') {
        dispatch(
          getAll('pesquisa avancada', {
            mail,
            conta,
            cliente,
            entidade,
            noperacao,
            pagina: 0,
            perfilId: cc?.perfil_id,
            arquivo: arquivo ? 'true' : 'false',
          })
        );
      } else if (cc?.uo_id) {
        dispatch(
          getAll('pesquisa global', { mail, uoID: cc?.uo_id, perfilId: cc?.perfil_id, pagina: 0, chave: search })
        );
      }
    }
    navigate(PATH_DIGITALDOCS.processos.procurar);
    onClose();
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && search && cc?.uo_id) {
      dispatch(getAll('pesquisa global', { mail, uoID: cc?.uo_id, perfilId: cc?.perfil_id, pagina: 0, chave: search }));
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
        maxWidth="sm"
        onClose={onClose}
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
                <Grid item xs={12} sm={6}>
                  <TextFieldNumb value={cliente} setValue={setCliente} label="Nº de cliente" localS="cliente" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextFieldNumb value={conta} setValue={setConta} label="Nº de conta" localS="conta" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextFieldNumb value={entidade} setValue={setEntidade} label="Nº de entidade" localS="entidade" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextFieldNumb value={noperacao} setValue={setNoperacao} label="Nº de operação" localS="noperacao" />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="center">
                    <FormControlLabel
                      label="Processo(s) arquivado(s)"
                      control={
                        <Switch
                          checked={arquivo}
                          onChange={(event, value) => {
                            setArquivo(value);
                            localStorage.setItem('procArquivo', value === true ? 'true' : 'false');
                          }}
                        />
                      }
                    />
                  </Stack>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  autoFocus
                  value={search}
                  onKeyUp={handleKeyUp}
                  placeholder="Introduza uma palavra/texto chave..."
                  onChange={(event) => setItemValue(event.target.value, setSearch, 'search')}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          {(avancada || search) && (
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
      onChange={(event) => setItemValue(event.target.value, setValue, localS)}
      InputProps={{ type: 'number', inputProps: { style: { textAlign: 'right' } } }}
    />
  );
}
