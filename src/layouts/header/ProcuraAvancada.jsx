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
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
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
import GridItem from '../../components/GridItem';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcuraAvancada() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc, uos } = useSelector((state) => state.intranet);

  const [uo, setUo] = useState(null);
  const [conta, setConta] = useState(localStorage.getItem('conta') || '');
  const [chave, setChave] = useState(localStorage.getItem('chave') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('cliente') || '');
  const [nentrada, setNentrada] = useState(localStorage.getItem('entrada') || '');
  const [entidade, setEntidade] = useState(localStorage.getItem('entidade') || '');
  const [noperacao, setNoperacao] = useState(localStorage.getItem('noperacao') || '');
  const [avancada, setAvancada] = useState(localStorage.getItem('tipoPesquisa') === 'avancada');
  const [fromArquivo, setFromArquivo] = useState(localStorage.getItem('fromArquivo') === 'true');
  const uosList = useMemo(() => uos?.map(({ id, label }) => ({ id, label })) || [], [uos]);

  useEffect(() => {
    const storedUoId = Number(localStorage.getItem('uoSearch'));
    const selectedUo = uosList.find(({ id }) => id === storedUoId) || uosList.find(({ id }) => id === cc?.uo?.id);
    if (selectedUo) setUo(selectedUo);
  }, [cc?.uo?.id, uosList]);

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
        onClose: () => {
          navigate(PATH_DIGITALDOCS.filaTrabalho.procurar);
          onClose();
        },
      })
    );
  };

  return (
    <>
      <Button
        size="large"
        onClick={onOpen}
        sx={{ fontSize: { md: 18 } }}
        startIcon={<SearchOutlinedIcon sx={{ width: 28, height: 28 }} />}
      >
        Procurar...&nbsp;&nbsp;
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
                  <GridItem md={6}>
                    <Autocomplete
                      fullWidth
                      options={uosList}
                      value={uo || null}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      renderInput={(params) => <TextField {...params} label="Unidade orgânica" />}
                      onChange={(event, newValue) => setItemValue(newValue, setUo, 'uoSearch', true)}
                    />
                  </GridItem>
                  <GridItem sm={3}>
                    <TextFieldNumb value={nentrada} setValue={setNentrada} label="Nº de entrada" localS="entrada" />
                  </GridItem>
                  <GridItem sm={3}>
                    <TextFieldNumb
                      value={noperacao}
                      localS="noperacao"
                      label="Nº de operação"
                      setValue={setNoperacao}
                    />
                  </GridItem>
                  <GridItem sm={4}>
                    <TextFieldNumb value={entidade} setValue={setEntidade} label="Nº de entidade" localS="entidade" />
                  </GridItem>
                  <GridItem sm={4}>
                    <TextFieldNumb value={cliente} setValue={setCliente} label="Nº de cliente" localS="cliente" />
                  </GridItem>
                  <GridItem sm={4}>
                    <TextFieldNumb value={conta} setValue={setConta} label="Nº de conta" localS="conta" />
                  </GridItem>
                </>
              ) : (
                <>
                  <GridItem>
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
                  </GridItem>
                </>
              )}
              <GridItem>
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
              </GridItem>
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

// ---------------------------------------------------------------------------------------------------------------------

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
