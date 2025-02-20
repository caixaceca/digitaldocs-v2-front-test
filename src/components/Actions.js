import PropTypes from 'prop-types';
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
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import NotesIcon from '@mui/icons-material/Notes';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import RemoveIcon from '@mui/icons-material/Remove';
import RestoreIcon from '@mui/icons-material/Restore';
import HistoryIcon from '@mui/icons-material/History';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InputAdornment from '@mui/material/InputAdornment';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import CircularProgress from '@mui/material/CircularProgress';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SpellcheckOutlinedIcon from '@mui/icons-material/SpellcheckOutlined';
import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
// utils
import { getFileThumb } from '../utils/formatFile';
import { findColaborador } from '../utils/formatObject';
import { ptDate, ptDateTime } from '../utils/formatTime';
// hooks
import useToggle from '../hooks/useToggle';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { getSuccess as gSDD } from '../redux/slices/digitaldocs';
import { getFromParametrizacao, openModal, getSuccess } from '../redux/slices/parametrizacao';
// assets
import { Editar, Arquivo, Seguimento, Libertar, Resgatar, Detalhes, Eliminar, Atribuir } from '../assets';
//
import { Criado } from './Panel';
import SvgIconStyle from './SvgIconStyle';
import { DialogConfirmar } from './CustomDialog';

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
          (label === 'Clonar' && <FileCopyOutlinedIcon sx={{ width: 18 }} />) ||
          (label === 'Procurar' && <SearchIcon sx={{ width: small ? 18 : 24 }} />) ||
          (icon === 'aceitar' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
          (icon === 'pdf' && getFileThumb(true, { width: small ? 18 : 22 }, 'export.pdf')) ||
          (label === 'Esconder detalhes' && <RemoveIcon sx={{ width: small ? 18 : 22 }} />) ||
          (label === 'Mais processos' && <PostAddOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
          (label === 'Comparar colaboradores' && <SwapHorizOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
          ((label === 'Mostrar detalhes' || label === 'Adicionar' || icon === 'adicionar') && (
            <AddCircleIcon sx={{ width: small ? 18 : 22 }} />
          ))
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
          variant={variant}
          onClick={handleClick}
          sx={{ ...(small ? whsmall : wh), boxShadow: label === 'Remover' && 'none' }}
          color={
            (label === 'VERSIONAR' && 'info') ||
            ((label === 'REVOGAR' || label === 'ELIMINAR') && 'error') ||
            ((label === 'EDITAR' || label === 'COMPOSIÇÃO' || label === 'OPÇÕES') && 'warning') ||
            color
          }
        >
          {(label === 'FECHAR' && <CloseIcon />) ||
            (icon === 'parecer' && <NotesIcon />) ||
            (icon === 'cancelar' && <ClearIcon />) ||
            (icon === 'history' && <HistoryIcon />) ||
            (icon === 'ANTERIOR' && <ArrowBackIcon />) ||
            (label === 'RESTAURAR' && <RestoreIcon />) ||
            (icon === 'PRÓXIMO' && <ArrowForwardIcon />) ||
            (label === 'PARECER' && <ChatOutlinedIcon />) ||
            (icon === 'views' && <PreviewOutlinedIcon />) ||
            (icon === 'acesso' && <TaskAltOutlinedIcon />) ||
            (label === 'APROVAR' && <TaskAltOutlinedIcon />) ||
            (label === 'VALIDAR' && <SpellcheckOutlinedIcon />) ||
            (label === 'Colaboradores' && <GroupOutlinedIcon />) ||
            (label === 'DESARQUIVAR' && <UnarchiveOutlinedIcon />) ||
            (label === 'DOMICILIAR' && <AddHomeWorkOutlinedIcon />) ||
            (label === 'OPÇÕES' && <TuneIcon sx={{ width: 20 }} />) ||
            (label === 'ADMIN' && <AdminPanelSettingsOutlinedIcon />) ||
            (label === 'ORDENAR' && <SwapVertOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'PUBLICAR' && <PublishOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'ARQUIVAR' && <Arquivo sx={{ width: 22, height: 22 }} />) ||
            (label === 'DOWNLOAD' && <DownloadOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'LIBERTAR' && <Libertar sx={{ width: 24, height: 24 }} />) ||
            (label === 'ATRIBUIR' && <Atribuir sx={{ width: 22, height: 22 }} />) ||
            (label === 'CLONAR' && <ContentCopyOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'RESGATAR' && <Resgatar sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'REVOGAR' && <UnpublishedOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'PROCURAR' && <SearchIcon sx={{ width: small ? 18 : 24 }} />) ||
            (label === 'VERSIONAR' && <DifferenceOutlinedIcon sx={{ width: 20 }} />) ||
            (label === 'FINALIZAR' && <SvgIconStyle src="/assets/icons/stop.svg" />) ||
            (label === 'BAIXANDO...' && <CircularProgress size={24} thickness={5} />) ||
            (label === 'CONFIRMAR' && <DoneAllIcon sx={{ color: 'common.white' }} />) ||
            (label === 'ACEITAR' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'ADICIONAR' && <AddCircleIcon sx={{ width: small ? 18 : 22 }} />) ||
            (icon === 'arquivo' && <ArchiveOutlinedIcon sx={{ width: small ? 18 : 24 }} />) ||
            (label === 'OBTER DOCUMENTO' && <CloudDownloadOutlinedIcon sx={{ width: 20 }} />) ||
            ((label === 'Gerir acessos' || label === 'Transições') && <SwapHorizOutlinedIcon />) ||
            (label === 'Mais processos' && <PostAddOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
            (label === 'PENDENTE' && <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />) ||
            ((label === 'ELIMINAR' || label === 'Remover') && <Eliminar sx={{ width: small ? 18 : 22 }} />) ||
            ((label === 'ENCAMINHAR' || label === 'DESPACHO') && <Seguimento sx={{ width: 22, height: 22 }} />) ||
            (label === 'DEVOLVER' && <Seguimento sx={{ width: 22, height: 22, transform: 'rotate(180deg)' }} />) ||
            ((label === 'Adicionar' || icon === 'adicionar') && <AddCircleIcon sx={{ width: small ? 18 : 22 }} />) ||
            ((label === 'INFO. DAS CONTAS' || label === 'Nº PROCESSOS') && <InfoOutlinedIcon sx={{ width: 20 }} />) ||
            ((label === 'EDITAR' || label === 'COMPOSIÇÃO' || icon === 'editar') && (
              <Editar sx={{ width: small ? 18 : 22 }} />
            )) ||
            ((label === 'DETALHES' || label === 'DESTINATÁRIOS') && <Detalhes sx={{ width: small ? 18 : 22 }} />)}
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

AddItem.propTypes = { small: PropTypes.bool, label: PropTypes.string, handleClick: PropTypes.func };

export function AddItem({ small = false, label = 'Adicionar', handleClick = null }) {
  const dispatch = useDispatch();

  return (
    <Stack>
      <Button
        variant="soft"
        startIcon={<AddCircleIcon />}
        size={small ? 'small' : 'medium'}
        onClick={() => {
          if (handleClick) {
            handleClick();
          } else {
            dispatch(openModal('add'));
          }
        }}
      >
        {label}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

UpdateItem.propTypes = { dados: PropTypes.object, handleClick: PropTypes.func };

export function UpdateItem({ dados, handleClick = null }) {
  const dispatch = useDispatch();

  const handleUpdate = () => {
    if (handleClick) handleClick();
    else {
      dispatch(openModal('update'));
      if (dados?.dados) dispatch(getSuccess({ item: 'selectedItem', dados: dados?.dados }));
      else dispatch(getFromParametrizacao(dados?.item, { id: dados?.id, item: 'selectedItem' }));
    }
  };

  return (
    <Stack>
      {dados?.button ? (
        <Button color="warning" variant="soft" onClick={() => handleUpdate()} startIcon={<Editar sx={{ width: 18 }} />}>
          Editar
        </Button>
      ) : (
        <Tooltip title="EDITAR" arrow>
          <Fab
            size="small"
            variant="soft"
            color="warning"
            onClick={() => handleUpdate()}
            sx={dados?.small ? whsmall : wh}
          >
            <Editar sx={{ width: dados?.small ? 18 : 22 }} />
          </Fab>
        </Tooltip>
      )}
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

DTFechar.propTypes = { title: PropTypes.string, handleClick: PropTypes.func };

export function DTFechar({ title, handleClick }) {
  return (
    <DialogTitle>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        {title}
        <Fechar handleClick={handleClick} />
      </Stack>
    </DialogTitle>
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
  hideSubmit: PropTypes.bool,
  handleDelete: PropTypes.func,
};

export function DialogButons({
  isSaving,
  onCancel,
  desc = '',
  label = '',
  edit = false,
  color = 'primary',
  hideSubmit = false,
  handleDelete = null,
}) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
      {desc && (
        <>
          <DefaultAction color="error" label="ELIMINAR" handleClick={onOpen} />
          {open && <DialogConfirmar desc={desc} onClose={onClose} isSaving={isSaving} handleOk={handleDelete} />}
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="outlined" color="inherit" onClick={() => onCancel()}>
        Cancelar
      </Button>
      {hideSubmit ? (
        ''
      ) : (
        <LoadingButton
          type="submit"
          color={color}
          loading={isSaving}
          variant={color === 'error' || color === 'warning' ? 'soft' : 'contained'}
        >
          {(label && label) || (edit && 'Guardar') || 'Adicionar'}
        </LoadingButton>
      )}
    </DialogActions>
  );
}

// ----------------------------------------------------------------------

ButtonsStepper.propTypes = {
  label: PropTypes.string,
  isSaving: PropTypes.bool,
  onCancel: PropTypes.func,
  hideSubmit: PropTypes.bool,
  handleSubmit: PropTypes.func,
  labelCancel: PropTypes.string,
};

export function ButtonsStepper({
  isSaving,
  onCancel,
  label = 'Seguinte',
  hideSubmit = false,
  handleSubmit = null,
  labelCancel = 'Voltar',
}) {
  return (
    <Stack direction="row" justifyContent="right" spacing={1} sx={{ mt: 3, pt: 1 }}>
      <Button variant="outlined" color="inherit" onClick={() => onCancel()}>
        {labelCancel}
      </Button>
      {hideSubmit ? (
        <></>
      ) : (
        <>
          {handleSubmit ? (
            <LoadingButton loading={isSaving} variant="contained" onClick={() => handleSubmit()}>
              {(label && label) || 'Seguinte'}
            </LoadingButton>
          ) : (
            <LoadingButton type="submit" loading={isSaving} variant="contained">
              {(label && label) || 'Seguinte'}
            </LoadingButton>
          )}
        </>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

AnexosExistente.propTypes = {
  mt: PropTypes.number,
  anexo: PropTypes.bool,
  onOpen: PropTypes.func,
  anexos: PropTypes.array,
};

export function AnexosExistente({ mt = 3, anexos, onOpen = null, anexo = false }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <>
      <Divider sx={{ mt }}>Anexos existentes</Divider>
      <List>
        {anexos.map((row) => (
          <ListItem key={row?.id} sx={{ py: 0.5, px: 1, mt: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
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
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ mt: 0.15 }} spacing={{ xs: 0.5, sm: 1.5 }}>
                    {row?.criador && (
                      <Criado caption tipo="user" value={findColaborador(row?.criador, colaboradores)} baralhar />
                    )}
                    {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />}
                  </Stack>
                )
              }
            />
            <ListItemSecondaryAction>
              <DefaultAction
                color="error"
                label="ELIMINAR"
                small
                handleClick={() => {
                  if (onOpen) onOpen(row.id);
                  else dispatch(gSDD({ item: 'selectedAnexoId', dados: anexo ? row.anexo : row.id }));
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </>
  );
}

// ----------------------------------------------------------------------

SearchAdornment.propTypes = { handleClick: PropTypes.func, small: PropTypes.bool };

export function SearchAdornment({ handleClick, small = false }) {
  return (
    <InputAdornment position="end">
      <Fab
        size="small"
        variant="soft"
        onClick={() => handleClick()}
        sx={{ ...(small ? whsmall : wh), boxShadow: 'none' }}
      >
        <SearchIcon sx={{ width: small ? 18 : 24 }} />
      </Fab>
    </InputAdornment>
  );
}

// ----------------------------------------------------------------------

ButtonDocx.propTypes = { handleClick: PropTypes.func, label: PropTypes.string };

export function ButtonDocx({ label, handleClick }) {
  return (
    <Button
      variant="soft"
      color="inherit"
      onClick={handleClick}
      startIcon={getFileThumb(false, null, 'file.docx')}
      sx={{ justifyContent: 'left', textAlign: 'left', mt: 0.5, boxShadow: 'none' }}
    >
      {label}
    </Button>
  );
}

// ----------------------------------------------------------------------

DownloadDoc.propTypes = {
  temUrl: PropTypes.bool,
  isLoading: PropTypes.func,
  funcObter: PropTypes.func,
  funcDownload: PropTypes.func,
};

export function DownloadDoc({ temUrl = false, isLoading, funcDownload, funcObter }) {
  return (
    <>
      {temUrl ? (
        <DefaultAction color="inherit" label="DOWNLOAD" handleClick={funcDownload} />
      ) : (
        <>
          {isLoading ? (
            <DefaultAction label="BAIXANDO..." handleClick={() => null} />
          ) : (
            <DefaultAction label="OBTER DOCUMENTO" handleClick={funcObter} />
          )}
        </>
      )}
    </>
  );
}
