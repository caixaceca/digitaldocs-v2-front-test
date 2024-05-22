import PropTypes from 'prop-types';
import ReactHTMLTableToExcel from 'react-html-table-to-excel-3';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ClearIcon from '@mui/icons-material/Clear';
import NotesIcon from '@mui/icons-material/Notes';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/Remove';
import HistoryIcon from '@mui/icons-material/History';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DialogActions from '@mui/material/DialogActions';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SpellcheckOutlinedIcon from '@mui/icons-material/SpellcheckOutlined';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
// utils
import { getFileThumb } from '../utils/getFileFormat';
import { ptDate, ptDateTime } from '../utils/formatTime';
import { findColaborador } from '../utils/normalizeText';
// hooks
import useToggle from '../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { getFromParametrizacao, openModal, selectItem } from '../redux/slices/parametrizacao';
//
import { Criado } from './Panel';
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
        startIcon={
          (icon === 'aceitar' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
          (label === 'Esconder detalhes' && <RemoveIcon sx={{ width: small ? 18 : 22 }} />) ||
          (label === 'Comparar colaboradores' && <SwapHorizOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
          ((label === 'Mostrar detalhes' || label === 'Adicionar') && <AddCircleIcon sx={{ width: small ? 18 : 22 }} />)
        }
      >
        {label}
      </Button>
    </Stack>
  ) : (
    <Stack>
      <Tooltip title={label} arrow>
        <Fab
          size="small"
          color={color}
          variant={variant}
          onClick={handleClick}
          sx={{ ...(small ? whsmall : wh), boxShadow: label === 'Remover' && 'none' }}
        >
          {(icon === 'parecer' && <NotesIcon />) ||
            (icon === 'back' && <ArrowBackIcon />) ||
            (icon === 'cancelar' && <ClearIcon />) ||
            (icon === 'history' && <HistoryIcon />) ||
            (icon === 'confirmar' && <DoneAllIcon />) ||
            (icon === 'forward' && <ArrowForwardIcon />) ||
            (label === 'PARECER' && <ChatOutlinedIcon />) ||
            (icon === 'views' && <PreviewOutlinedIcon />) ||
            (icon === 'acesso' && <TaskAltOutlinedIcon />) ||
            (label === 'VALIDAR' && <SpellcheckOutlinedIcon />) ||
            (label === 'Colaboradores' && <GroupOutlinedIcon />) ||
            (label === 'DESARQUIVAR' && <UnarchiveOutlinedIcon />) ||
            (label === 'INFO. DAS CONTAS' && <InfoOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'ACEITAR' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'ADICIONAR' && <AddCircleIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'arquivo' && <ArchiveOutlinedIcon sx={{ width: small ? 18 : 24 }} />) ||
            ((label === 'Gerir acessos' || label === 'Transições') && <SwapHorizOutlinedIcon />) ||
            (icon === 'resgatar' && <SettingsBackupRestoreIcon sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'Clonar fluxo' && <FileCopyOutlinedIcon sx={{ color: 'text.secondary' }} />) ||
            (label === 'Mostrar mais processos' && <TableRowsIcon sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'PENDENTE' && <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />) ||
            (icon === 'abandonar' && <SvgIconStyle src="/assets/icons/abandonar.svg" sx={{ width: 22 }} />) ||
            (icon === 'encaminhar' && <SvgIconStyle src="/assets/icons/seguimento.svg" sx={{ width: 22 }} />) ||
            (label === 'EDITAR' && <SvgIconStyle src="/assets/icons/editar.svg" sx={{ width: small ? 18 : 22 }} />) ||
            ((label === 'DETALHES' || label === 'DESTINATÁRIOS') && <SvgIconStyle src="/assets/icons/view.svg" />) ||
            (icon === 'devolver' && <SvgIconStyle src="/assets/icons/resgatar.svg" />) ||
            (label === 'ARQUIVAR' && <SvgIconStyle src="/assets/icons/archive.svg" />) ||
            ((label === 'ELIMINAR' || label === 'Remover') && (
              <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: small ? 18 : 22 }} />
            )) ||
            (icon === 'finalizar' && <SvgIconStyle src="/assets/icons/stop.svg" />)}
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
  color = 'primary',
}) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
      {desc && (
        <>
          <DefaultAction color="error" label="ELIMINAR" handleClick={onOpen} />
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

export function AnexosExistente({ mt = 3, anexos, onOpen }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <>
      <Divider sx={{ mt }}>Anexos existentes</Divider>
      <List>
        {anexos.map((row) => (
          <ListItem key={row?.name} sx={{ py: 0.5, px: 1, mt: 0.75, borderRadius: 1, bgcolor: 'background.neutral' }}>
            <ListItemIcon>{getFileThumb(false, null, row?.path || row.name)}</ListItemIcon>
            <ListItemText
              primary={
                <>
                  {row.name}
                  {row?.data_validade && (
                    <Typography variant="spam" sx={{ typography: 'body2', color: 'text.secondary' }}>
                      &nbsp;(Validade: {ptDate(row?.data_validade)})
                    </Typography>
                  )}
                </>
              }
              primaryTypographyProps={{ variant: 'subtitle2', pb: 0.25 }}
              secondary={
                (row?.criado_em || row?.criador) && (
                  <Stack direction={{ sx: 'column', sm: 'row' }} spacing={1}>
                    {row?.criador && (
                      <Criado caption tipo="user" value={findColaborador(row?.criador, colaboradores)} shuffle />
                    )}
                    {row?.criado_em && <Criado caption tipo="date" value={ptDateTime(row?.criado_em)} />}
                  </Stack>
                )
              }
            />
            <ListItemSecondaryAction>
              <DefaultAction color="error" label="ELIMINAR" small handleClick={() => onOpen(row.id)} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </>
  );
}

// ----------------------------------------------------------------------

ExportExcel.propTypes = {
  icon: PropTypes.bool,
  sheet: PropTypes.string,
  table: PropTypes.string,
  filename: PropTypes.string,
};

export function ExportExcel({ filename, sheet = '', table, icon = false }) {
  return (
    <ReactHTMLTableToExcel
      table={table}
      filename={filename}
      sheet={sheet || filename}
      id="react-html-table-to-excel-button"
      className="MuiButtonBase-root-MuiButton-root"
      children={
        icon ? (
          <Tooltip title="EXPORTAR" arrow>
            <Fab color="inherit" size="small" variant="soft" sx={{ ...wh }}>
              {getFileThumb(false, null, 'file.xlsx')}
            </Fab>
          </Tooltip>
        ) : (
          <Button variant="contained" startIcon={getFileThumb(false, null, 'file.xlsx')}>
            Exportar
          </Button>
        )
      }
    />
  );
}
