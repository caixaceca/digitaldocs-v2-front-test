import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '@/redux/store';
import { getFromIntranet } from '@/redux/slices/intranet';
// components
import FormFicha from './form-ficha';
import { DefaultAction } from '@/components/Actions';
import { DialogActionsBasic } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export function SearchEntidade({ entidades, actionModal, credito }) {
  const { fichaInformativa, isLoading, modalIntranet } = useSelector((state) => state.intranet);

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <DefaultAction
        button
        icon="Procurar"
        label="Ficha da entidade"
        onClick={() => actionModal({ modal: 'search-ficha' })}
      />
      {fichaInformativa && (
        <DefaultAction
          button
          icon="adicionar"
          label="Info. adicional"
          onClick={() => actionModal({ modal: 'form-ficha' })}
        />
      )}

      {modalIntranet === 'form-ficha' && (
        <FormFicha credito={credito} ficha={fichaInformativa} onClose={() => actionModal({})} />
      )}
      {modalIntranet === 'search-ficha' && (
        <SearchFicha loading={isLoading} entidades={entidades} onClose={() => actionModal({})} />
      )}
    </Stack>
  );
}

export function SearchFicha({ entidades = [], loading, onClose }) {
  const dispatch = useDispatch();
  const [entidade, setEntidade] = useState(null);

  const onSearch = () => dispatch(getFromIntranet('fichaInformativa', { entidade, onClose }));

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Ficha da entidade</DialogTitle>
      <DialogContent>
        <Autocomplete
          fullWidth
          disableClearable
          options={entidades}
          value={entidade || null}
          sx={{ minWidth: 150, pt: 3 }}
          onChange={(event, newValue) => setEntidade(newValue)}
          renderInput={(params) => <TextField {...params} label="Entidade" />}
        />
      </DialogContent>
      <DialogActionsBasic
        label="Procurar"
        loading={loading}
        onClose={onClose}
        handleOk={onSearch}
        disabled={!entidade}
      />
    </Dialog>
  );
}
