import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Box, Fab, Button, Stack, Tooltip, IconButton, DialogActions } from '@mui/material';
// hooks
import useToggle from '../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { openModal, selectItem, getItem } from '../redux/slices/digitaldocs';
//
import SvgIconStyle from './SvgIconStyle';
import DialogConfirmar from './DialogConfirmar';

const wh = { width: 36, height: 36 };

// ----------------------------------------------------------------------

export function AddItem() {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(openModal());
  };

  return (
    <Button variant="soft" startIcon={<AddCircleIcon />} onClick={handleAdd}>
      Adicionar
    </Button>
  );
}

// ----------------------------------------------------------------------

UpdateItem.propTypes = { dados: PropTypes.object, id: PropTypes.number, item: PropTypes.string };

export function UpdateItem({ item = '', id = 0, dados = null }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleUpdateByItem = () => {
    dispatch(selectItem(dados));
  };

  const handleUpdateById = (id) => {
    if (id && cc?.perfil_id && mail) {
      dispatch(getItem(item, { id, mail, from: 'listagem', perfilId: cc?.perfil_id }));
    }
  };

  return dados ? (
    <Tooltip title="Editar" arrow>
      <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdateByItem()} sx={{ ...wh }}>
        <SvgIconStyle src="/assets/icons/editar.svg" />
      </Fab>
    </Tooltip>
  ) : (
    <Tooltip title="Editar" arrow>
      <Fab size="small" variant="soft" color="warning" onClick={() => handleUpdateById(id)} sx={{ ...wh }}>
        <SvgIconStyle src="/assets/icons/editar.svg" />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

ViewItem.propTypes = { swap: PropTypes.bool, estado: PropTypes.bool, handleView: PropTypes.func };

export function ViewItem({ swap = false, estado = false, handleView }) {
  return (
    <Tooltip title={(estado && 'Colaboradores') || (swap && 'Estados & Acessos') || 'DETALHES'} arrow>
      <Fab color="success" size="small" variant="soft" onClick={handleView} sx={{ ...wh }}>
        {(swap && <SwapHorizOutlinedIcon />) || (estado && <GroupOutlinedIcon />) || (
          <SvgIconStyle src="/assets/icons/view.svg" />
        )}
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

CloneItem.propTypes = { item: PropTypes.string, id: PropTypes.number };

export function CloneItem({ item, id }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleClone = (id) => {
    if (id && cc?.perfil_id && mail) {
      dispatch(getItem(item, { id, mail, from: 'clonagem', perfilId: cc?.perfil_id }));
    }
  };

  return (
    <Tooltip title="Clonar fluxo" arrow>
      <Fab color="inherit" size="small" variant="soft" onClick={() => handleClone(id)} sx={{ ...wh }}>
        <FileCopyOutlinedIcon sx={{ color: 'text.secondary' }} />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

DeleteItem.propTypes = { handleClick: PropTypes.func };

export function DeleteItem({ handleClick }) {
  return (
    <Tooltip title="Eliminar" arrow>
      <Fab color="error" size="small" variant="soft" onClick={handleClick} sx={{ ...wh }}>
        <SvgIconStyle src="/assets/icons/trash.svg" />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

Checked.propTypes = { check: PropTypes.bool };

export function Checked({ check }) {
  return check ? (
    <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', width: 20 }} />
  ) : (
    <CloseOutlinedIcon sx={{ color: 'focus.main', width: 20 }} />
  );
}

// ----------------------------------------------------------------------

Pendente.propTypes = { detail: PropTypes.bool, handleView: PropTypes.func };

export function Pendente({ detail = false, handleView }) {
  return (
    <Tooltip title="PENDENTE" arrow>
      <Fab
        color="inherit"
        size="small"
        variant="soft"
        onClick={handleView}
        sx={{ width: detail ? 40 : 36, height: detail ? 40 : 36 }}
      >
        <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

Fechar.propTypes = { onCancel: PropTypes.func };

export function Fechar({ onCancel }) {
  return (
    <Stack>
      <Tooltip title="Fechar" arrow>
        <IconButton onClick={onCancel} sx={{ width: 28, height: 28 }}>
          <CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

DialogButons.propTypes = {
  edit: PropTypes.bool,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  desc: PropTypes.string,
  label: PropTypes.string,
};

export function DialogButons({ edit = false, isSaving, desc = '', label = '', onCancel, handleDelete }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
      {desc && (
        <>
          <DeleteItem handleClick={onOpen} />
          <DialogConfirmar desc={desc} open={open} onClose={onClose} isSaving={isSaving} handleOk={handleDelete} />
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="outlined" color="inherit" onClick={onCancel}>
        Cancelar
      </Button>
      <LoadingButton type="submit" variant="contained" loading={isSaving}>
        {(label && label) || (edit && 'Guardar') || 'Adicionar'}
      </LoadingButton>
    </DialogActions>
  );
}
