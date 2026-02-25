// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import useToggle from '@/hooks/useToggle';
import { setModal } from '@/redux/slices/digitaldocs';
import { useSelector, useDispatch } from '@/redux/store';
// components
import PareceresCredito from './pareceres';
import { DefaultAction } from '@/components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function PareceresComites({ estado }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction button label="Pareceres" onClick={() => onOpen()} />
      {open && <DialogPareceres estado={estado} onClose={onClose} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DialogPareceres({ estado, onClose }) {
  const dispatch = useDispatch();
  const { perfilId } = useSelector((state) => state.intranet);
  const openModal = (modal) => dispatch(setModal({ modal: modal ?? '', dados: null }));

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="end">
          Pareceres: {estado?.estado}
          {!estado?.pareceres_cr?.find(({ perfil_id: pid }) => perfilId === pid) && (
            <DefaultAction small button label="Adicionar" variant="contained" onClick={() => openModal('parecer-cr')} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <PareceresCredito />
      </DialogContent>
    </Dialog>
  );
}
