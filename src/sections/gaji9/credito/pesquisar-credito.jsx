import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { UosAcesso } from '../../../utils/validarAcesso';
import { setItemValue } from '../../../utils/formatObject';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { getFromGaji9, setModal } from '../../../redux/slices/gaji9';
// Components
import { DefaultAction, MaisProcessos } from '../../../components/Actions';
//
import { PropostaForm } from './form-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function PesquisarCredito({ cursor, mais, children }) {
  const dispatch = useDispatch();
  const [balcao, setBalcao] = useState(null);
  const [codigo, setCodigo] = useState(localStorage.getItem('codioContrato') || '');
  const [cliente, setCliente] = useState(localStorage.getItem('clienteContrato') || '');
  const [proposta, setProposta] = useState(localStorage.getItem('propostaContrato') || '');

  const { cc, uos } = useSelector((state) => state.intranet);
  const { modalGaji9 } = useSelector((state) => state.gaji9);
  const { isAdmin, isAuditoria } = useSelector((state) => state.parametrizacao);

  const balcoes = useMemo(
    () =>
      UosAcesso(
        uos?.filter(({ tipo }) => tipo === 'Agências'),
        cc,
        isAdmin || isAuditoria || cc?.uo_tipo !== 'Agências',
        [],
        'balcao'
      ),
    [cc, isAdmin, isAuditoria, uos]
  );

  useEffect(() => {
    if (balcao?.id) {
      if (codigo) setItemValue('', setCodigo, 'codioContrato');
      if (cliente) setItemValue('', setCliente, 'clienteContrato');
      if (proposta) setItemValue('', setProposta, 'propostaContrato');
      handleProcurar(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balcao?.id]);

  useEffect(() => {
    if ((cliente || proposta || codigo) && balcao?.id) setItemValue(null, setBalcao, 'balcaoCred', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente, proposta, codigo]);

  useEffect(() => {
    if (localStorage.getItem('balcaoCred') && balcoes?.length > 0) {
      const balcao = balcoes?.find(({ id }) => id === Number(localStorage.getItem('balcaoCred')));
      if (balcao) setItemValue(balcao, setBalcao, 'balcaoCred', true);
    }
  }, [balcoes]);

  const handleProcurar = (cursor) => {
    const reset = cursor ? null : { val: [] };
    dispatch(getFromGaji9('creditos', { balcao: balcao?.id, cliente, codigo, proposta, cursor, reset }));
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
              <Autocomplete
                fullWidth
                value={balcao}
                options={balcoes}
                disableClearable
                getOptionLabel={(option) => option?.label}
                renderInput={(params) => <TextField {...params} label="Balcão" />}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, newValue) => setItemValue(newValue, setBalcao, 'balcaoCred', true)}
              />
              <TextField
                fullWidth
                label="Cliente"
                value={cliente}
                onChange={(event) => setItemValue(event.target.value, setCliente, 'clienteContrato')}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                label="Código"
                value={codigo}
                onChange={(event) => setItemValue(event.target.value, setCodigo, 'codioContrato')}
              />
              <TextField
                fullWidth
                label="Proposta"
                value={proposta}
                onChange={(event) => setItemValue(event.target.value, setProposta, 'propostaContrato')}
              />
            </Stack>
          </Stack>
          {(codigo || proposta || cliente) && <DefaultAction label="PROCURAR" onClick={() => handleProcurar(0)} />}
        </Stack>
      </Card>

      {children}

      {mais && <MaisProcessos verMais={() => handleProcurar(cursor)} />}

      {modalGaji9 === 'form-proposta' && <PropostaForm onClose={() => dispatch(setModal())} />}
    </Stack>
  );
}
