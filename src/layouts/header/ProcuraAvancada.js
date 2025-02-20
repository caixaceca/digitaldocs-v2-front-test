import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
import { setItemValue } from '../../utils/formatObject';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getListaProcessos } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import { Notificacao } from '../../components/NotistackProvider';

// ----------------------------------------------------------------------

export default function ProcuraAvancada() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc, uos } = useSelector((state) => state.intranet);
  const { error } = useSelector((state) => state.digitaldocs);

  const [uo, setUo] = useState(null);
  const [conta, setConta] = useState(localStorage.getItem('conta') || '');
  const [chave, setChave] = useState(localStorage.getItem('chave') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('cliente') || '');
  const [nentrada, setNentrada] = useState(localStorage.getItem('entrada') || '');
  const [entidade, setEntidade] = useState(localStorage.getItem('entidade') || '');
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao') || '');
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const [fromArquivo, setFromArquivo] = useState(localStorage.getItem('fromArquivo') === 'true');
  const uosList = useMemo(() => uos?.map((row) => ({ id: row?.id, label: row?.label })) || [], [uos]);

  useEffect(() => {
    if (uosList?.length > 0 && (localStorage.getItem('uoSearch') || cc?.uo?.id))
      setUo(
        uosList?.find((row) => row?.id === Number(localStorage.getItem('uoSearch'))) ||
          uosList?.find((row) => row?.id === cc?.uo?.id) ||
          null
      );
  }, [cc?.uo?.id, dispatch, uosList]);

  const searchProcessos = () => {
    dispatch(
      getListaProcessos(avancada ? 'pesquisaAvancada' : 'pesquisaGlobal', {
        cursor: 0,
        item: 'pesquisa',
        chave: avancada ? '' : chave,
        conta: avancada ? conta : '',
        cliente: avancada ? cliente : '',
        nentrada: avancada ? nentrada : '',
        entidade: avancada ? entidade : '',
        uo: avancada && uo?.id ? uo?.id : '',
        noperacao: avancada ? noperacao : '',
        fromArquivo: fromArquivo ? 'true' : 'false',
        afterSuccess: () => {
          navigate(PATH_DIGITALDOCS.filaTrabalho.procurar);
          onClose();
        },
      })
    );
  };

  return (
    <>
      <Notificacao error={error} />
      <Button
        size="large"
        onClick={onOpen}
        sx={{ fontSize: { md: 18 } }}
        startIcon={<SearchIcon sx={{ width: 28, height: 28 }} />}
      >
        Procurar...
      </Button>

      {open && (
        <Dialog
          open
          fullWidth
          onClose={onClose}
          maxWidth={avancada ? 'md' : 'sm'}
          sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
        >
          <DialogTitle>
            <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
              <Box>Procurar</Box>
              <FormControlLabel
                label="Avançada"
                control={
                  <Switch
                    size="small"
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
                    <TextFieldNumb value={nentrada} setValue={setNentrada} label="Nº de entrada" localS="entrada" />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextFieldNumb
                      value={noperacao}
                      localS="noperacao"
                      label="Nº de operação"
                      setValue={setNoperacao}
                    />
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
                      onKeyUp={(event) => {
                        if (event.key === 'Enter' && chave) searchProcessos();
                      }}
                      placeholder="Introduza uma palavra/texto chave..."
                      onChange={(event) => setItemValue(event.target.value, setChave, 'chave', false)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="center">
                  <FormControlLabel
                    label="Procurar no arquivo"
                    control={
                      <Switch
                        checked={fromArquivo}
                        onChange={(event, value) => {
                          setFromArquivo(value);
                          localStorage.setItem('fromArquivo', value === true ? 'true' : 'false', false);
                        }}
                      />
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancelar
            </Button>
            {(avancada || chave) && (
              <Button variant="contained" onClick={() => searchProcessos()}>
                Procurar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

TextFieldNumb.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  localS: PropTypes.string,
  setValue: PropTypes.func,
};

export function TextFieldNumb({ value = '', setValue, label, localS }) {
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
