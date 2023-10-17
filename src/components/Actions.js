import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
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

AddItem.propTypes = { handleAdd: PropTypes.func };

export function AddItem({ handleAdd = null }) {
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(openModal());
  };

  return (
    <Stack>
      <Button variant="soft" startIcon={<AddCircleIcon />} onClick={handleAdd || handleOpenModal}>
        Adicionar
      </Button>
    </Stack>
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

ViewItem.propTypes = { swap: PropTypes.bool, estado: PropTypes.bool, handleClick: PropTypes.func };

export function ViewItem({ swap = false, estado = false, handleClick }) {
  return (
    <Tooltip title={(estado && 'Colaboradores') || (swap && 'Estados & Acessos') || 'DETALHES'} arrow>
      <Fab color="success" size="small" variant="soft" onClick={handleClick} sx={{ ...wh }}>
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

Checked.propTypes = { check: PropTypes.bool, color: PropTypes.string };

export function Checked({ check, color = '' }) {
  return check ? (
    <CheckCircleOutlineOutlinedIcon sx={{ color: color || 'success.main', width: 20 }} />
  ) : (
    <CloseOutlinedIcon sx={{ color: color || 'focus.main', width: 20 }} />
  );
}

// ----------------------------------------------------------------------

Pendente.propTypes = { detail: PropTypes.bool, handleClick: PropTypes.func };

export function Pendente({ detail = false, handleClick }) {
  return (
    <Tooltip title="PENDENTE" arrow>
      <Fab
        color="inherit"
        size="small"
        variant="soft"
        onClick={handleClick}
        sx={{ width: detail ? 40 : 36, height: detail ? 40 : 36 }}
      >
        <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />
      </Fab>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

Fechar.propTypes = { handleClick: PropTypes.func };

export function Fechar({ handleClick }) {
  return (
    <Stack>
      <Tooltip title="Fechar" arrow>
        <IconButton onClick={handleClick} sx={{ width: 28, height: 28 }}>
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

// ----------------------------------------------------------------------

CriadoEmPor.propTypes = { tipo: PropTypes.string, value: PropTypes.string };

export function CriadoEmPor({ tipo = '', value = '' }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {(tipo === 'note' && <CommentOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'date' && <CalendarTodayIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'time' && <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'company' && <BusinessOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'user' && <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />)}
      <Typography noWrap variant="body2">
        {value}
      </Typography>
    </Stack>
  );
}
