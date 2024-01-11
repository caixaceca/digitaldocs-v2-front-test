import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import NotesIcon from '@mui/icons-material/Notes';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// utils
import { ptDate } from '../utils/formatTime';
import { getFileThumb } from '../utils/getFileFormat';
// hooks
import useToggle from '../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { getFromParametrizacao, openModal, selectItem } from '../redux/slices/parametrizacao';
//
import SvgIconStyle from './SvgIconStyle';
import DialogConfirmar from './DialogConfirmar';

const wh = { width: 38, height: 38 };
const whsmall = { width: 30, height: 30 };

// ----------------------------------------------------------------------

DefaultAction.propTypes = {
  small: PropTypes.bool,
  button: PropTypes.bool,
  icon: PropTypes.string,
  color: PropTypes.string,
  label: PropTypes.string,
  variant: PropTypes.string,
  handleClick: PropTypes.func,
};

export function DefaultAction({
  icon,
  label = '',
  handleClick,
  small = false,
  button = false,
  variant = 'soft',
  color = 'success',
}) {
  return button ? (
    <Stack>
      <Button
        color={color}
        variant={variant}
        onClick={handleClick}
        size={small ? 'small' : 'medium'}
        startIcon={icon === 'aceitar' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />}
      >
        {label}
      </Button>
    </Stack>
  ) : (
    <Stack>
      <Tooltip title={label} arrow>
        <Fab size="small" variant={variant} color={color} onClick={handleClick} sx={{ ...(small ? whsmall : wh) }}>
          {(icon === 'encaminhar' && <SvgIconStyle src="/assets/icons/seguimento.svg" />) ||
            (icon === 'aceitar' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'arquivo' && <ArchiveOutlinedIcon sx={{ width: small ? 18 : 24 }} />) ||
            (icon === 'abandonar' && <LockOpenOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'resgatar' && <SettingsBackupRestoreIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'edit' && <SvgIconStyle src="/assets/icons/editar.svg" sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'add' && <AddCircleIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'confirmar' && <DoneAllIcon />) ||
            (icon === 'cancelar' && <ClearIcon />) ||
            (icon === 'cancel' && <NotesIcon />)}
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

AddItem.propTypes = { small: PropTypes.bool, label: PropTypes.string, handleClick: PropTypes.func };

export function AddItem({ small = false, label = 'Adicionar', handleClick = null }) {
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(openModal('add'));
  };

  return (
    <Stack>
      <Button
        variant="soft"
        startIcon={<AddCircleIcon />}
        size={small ? 'small' : 'medium'}
        onClick={handleClick || handleOpenModal}
      >
        {label}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

UpdateItem.propTypes = {
  id: PropTypes.number,
  item: PropTypes.string,
  dados: PropTypes.object,
  handleClick: PropTypes.func,
};

export function UpdateItem({ item = '', id = 0, dados = null, handleClick = null }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleUpdateByItem = () => {
    dispatch(openModal('update'));
    dispatch(selectItem(dados));
  };

  const handleUpdateById = (id) => {
    dispatch(openModal('update'));
    if (id && cc?.perfil_id && mail) {
      dispatch(getFromParametrizacao(item, { id, mail, from: 'listagem', perfilId: cc?.perfil_id }));
    }
  };

  return (
    <Stack>
      <Tooltip title="Editar" arrow>
        <Fab
          size="small"
          variant="soft"
          color="warning"
          onClick={() => {
            if (handleClick) {
              handleClick();
            } else if (dados) {
              handleUpdateByItem();
            } else {
              handleUpdateById(id);
            }
          }}
          sx={{ ...wh }}
        >
          <SvgIconStyle src="/assets/icons/editar.svg" />
        </Fab>
      </Tooltip>
    </Stack>
  );
}

UpdateItemAlt.propTypes = { handleClick: PropTypes.func };

export function UpdateItemAlt({ handleClick }) {
  return (
    <Stack>
      <Tooltip title="Editar" arrow>
        <Fab size="small" variant="soft" color="warning" onClick={handleClick} sx={{ ...wh }}>
          <SvgIconStyle src="/assets/icons/editar.svg" />
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

ViewItem.propTypes = {
  swap: PropTypes.bool,
  estado: PropTypes.bool,
  label: PropTypes.string,
  handleClick: PropTypes.func,
};

export function ViewItem({ swap = false, estado = false, label = 'DETALHES', handleClick }) {
  return (
    <Stack>
      <Tooltip title={(estado && 'Colaboradores') || (swap && 'Estados & Acessos') || label} arrow>
        <Fab color="success" size="small" variant="soft" onClick={handleClick} sx={{ ...wh }}>
          {(swap && <SwapHorizOutlinedIcon />) || (estado && <GroupOutlinedIcon />) || (
            <SvgIconStyle src="/assets/icons/view.svg" />
          )}
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

CloneItem.propTypes = { item: PropTypes.string, id: PropTypes.number };

export function CloneItem({ item, id }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleClone = () => {
    if (id && cc?.perfil_id && mail) {
      dispatch(openModal('view'));
      dispatch(getFromParametrizacao(item, { id, mail, from: 'listagem', perfilId: cc?.perfil_id }));
    }
  };

  return (
    <Stack>
      <Tooltip title="Clonar fluxo" arrow>
        <Fab color="inherit" size="small" variant="soft" onClick={() => handleClone()} sx={{ ...wh }}>
          <FileCopyOutlinedIcon sx={{ color: 'text.secondary' }} />
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

DeleteItem.propTypes = { small: PropTypes.bool, handleClick: PropTypes.func };

export function DeleteItem({ small = false, handleClick }) {
  return (
    <Stack>
      <Tooltip title="Eliminar" arrow>
        <Fab color="error" size="small" variant="soft" onClick={handleClick} sx={{ ...(small ? whsmall : wh) }}>
          <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: small ? 18 : 22 }} />
        </Fab>
      </Tooltip>
    </Stack>
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
    <Stack>
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
    </Stack>
  );
}

// ----------------------------------------------------------------------

Fechar.propTypes = { button: PropTypes.bool, large: PropTypes.bool, handleClick: PropTypes.func };

export function Fechar({ button = false, large = false, handleClick }) {
  return button ? (
    <Button
      variant="text"
      color="inherit"
      onClick={handleClick}
      startIcon={<CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />}
    >
      Cancelar
    </Button>
  ) : (
    <Stack>
      <Tooltip title="Fechar" arrow>
        <IconButton onClick={handleClick} sx={{ width: large ? 36 : 28, height: large ? 36 : 28 }}>
          <CloseOutlinedIcon sx={{ width: large ? 24 : 20, opacity: large ? 1 : 0.75 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

DialogButons.propTypes = {
  edit: PropTypes.bool,
  desc: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.string,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func,
  handleDelete: PropTypes.func,
};

export function DialogButons({
  isSaving,
  onCancel,
  desc = '',
  label = '',
  edit = false,
  handleDelete,
  color = 'success',
}) {
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
      <LoadingButton type="submit" variant={color === 'error' ? 'soft' : 'contained'} color={color} loading={isSaving}>
        {(label && label) || (edit && 'Guardar') || 'Adicionar'}
      </LoadingButton>
    </DialogActions>
  );
}

// ----------------------------------------------------------------------

AnexosExistente.propTypes = { mt: PropTypes.number, anexos: PropTypes.array, onOpen: PropTypes.func };

export function AnexosExistente({ mt = 4, anexos, onOpen }) {
  return (
    <>
      <Typography variant="body2" sx={{ mt, color: 'text.secondary' }}>
        Anexos existentes
      </Typography>
      <List component="nav" sx={{ mt: 1 }}>
        {anexos.map((row, index) => (
          <ListItemButton
            key={`${row.name}_${index}`}
            sx={{
              mb: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: (theme) => `dotted 1px ${theme.palette.divider}`,
            }}
          >
            <ListItemIcon>{getFileThumb(false, null, row?.path || row.name)}</ListItemIcon>
            <ListItemText
              primary={row.name}
              secondary={row?.data_validade ? `Validade: ${ptDate(row?.data_validade)}` : ''}
            />
            <ListItemSecondaryAction>
              <DeleteItem small handleClick={() => onOpen(row.id)} />
            </ListItemSecondaryAction>
          </ListItemButton>
        ))}
      </List>
    </>
  );
}
