import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RemoveIcon from '@mui/icons-material/Remove';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
// utils
import { getFileThumb } from '../utils/formatFile';
// hooks
import useToggle from '../hooks/useToggle';
// redux
import { useDispatch } from '../redux/store';
import { openModal, setModal } from '../redux/slices/parametrizacao';
// assets
import { Editar, Arquivo, Seguimento, Libertar, Resgatar, Detalhes, Eliminar, Atribuir } from '../assets';
//
import SvgIconStyle from './SvgIconStyle';
import { DialogConfirmar } from './CustomDialog';

const wh = { width: 38, height: 38 };
const whsmall = { width: 30, height: 30 };

// ----------------------------------------------------------------------

ActionButton.propTypes = { options: PropTypes.object };

export function ActionButton({ options = {} }) {
  const dispatch = useDispatch();
  const { item = '', sm = false, fab = false, label = 'ELIMINAR', dados = null } = options;
  const isEdit = label === 'EDITAR' || label === 'Editar';

  return (
    <DefaultAction small={sm} button={!fab} label={label} onClick={() => dispatch(setModal({ item, dados, isEdit }))} />
  );
}

// ----------------------------------------------------------------------

DefaultAction.propTypes = {
  small: PropTypes.bool,
  button: PropTypes.bool,
  icon: PropTypes.string,
  color: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.string,
};

export function DefaultAction({
  icon,
  label = '',
  onClick,
  small = false,
  button = false,
  variant = 'soft',
  color = 'success',
  ...others
}) {
  const colorAlt =
    (label === 'VERSIONAR' && 'info') ||
    ((label === 'EDITAR' || label === 'Composição' || label === 'Editar') && 'warning') ||
    ((label === 'ELIMINAR' || label === 'Eliminar' || label === 'ARQUIVAR' || label === 'REVOGAR') && 'error') ||
    ((label === 'PRÓXIMO' || label === 'ANTERIOR' || label === 'PENDENTE' || label === 'Gerar contrato') &&
      'inherit') ||
    color;

  const iconAlt =
    (label === 'FECHAR' && <CloseIcon />) ||
    (label === 'ANTERIOR' && <ArrowBackIcon />) ||
    (label === 'PRÓXIMO' && <ArrowForwardIcon />) ||
    (label === 'ANULAR CONFIRMAÇÂO' && <ClearIcon />) ||
    (label === 'DESARQUIVAR' && <UnarchiveOutlinedIcon />) ||
    (label === 'DOMICILIAR' && <AddHomeWorkOutlinedIcon />) ||
    (label === 'PUBLICAR' && <PublishOutlinedIcon sx={{ width: 20 }} />) ||
    (label === 'ARQUIVAR' && <Arquivo sx={{ width: 22, height: 22 }} />) ||
    (label === 'LIBERTAR' && <Libertar sx={{ width: 24, height: 24 }} />) ||
    (label === 'ATRIBUIR' && <Atribuir sx={{ width: 22, height: 22 }} />) ||
    (label === 'RESGATAR' && <Resgatar sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'REVOGAR' && <UnpublishedOutlinedIcon sx={{ width: 20 }} />) ||
    (label === 'VERSIONAR' && <DifferenceOutlinedIcon sx={{ width: 20 }} />) ||
    (label === 'FINALIZAR' && <SvgIconStyle src="/assets/icons/stop.svg" />) ||
    (label === 'CONFIRMAR' && <DoneAllIcon sx={{ color: 'common.white' }} />) ||
    (label === 'ACEITAR' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'Esconder detalhes' && <RemoveIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'Mais processos' && <PostAddOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'PENDENTE' && <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />) ||
    ((label === 'Clonar' || label === 'CLONAR') && <FileCopyOutlinedIcon sx={{ width: 18 }} />) ||
    ((label === 'EDITAR' || label === 'Composição') && <Editar sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'ELIMINAR' || label === 'Eliminar') && <Eliminar sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'Procurar' || label === 'PROCURAR') && <SearchIcon sx={{ width: small ? 18 : 24 }} />) ||
    ((label === 'ENCAMINHAR' || label === 'DESPACHO') && <Seguimento sx={{ width: 22, height: 22 }} />) ||
    (label === 'DEVOLVER' && <Seguimento sx={{ width: 22, height: 22, transform: 'rotate(180deg)' }} />) ||
    ((label === 'DETALHES' || label === 'DESTINATÁRIOS') && <Detalhes sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'INFO. DAS CONTAS' || label === 'Nº PROCESSOS') && <InfoOutlinedIcon sx={{ width: 20 }} />) ||
    ((label === 'ADICIONAR' || label === 'Adicionar' || icon === 'adicionar' || label === 'Mostrar detalhes') && (
      <AddCircleIcon sx={{ width: small ? 18 : 22 }} />
    )) ||
    ((label === 'CONTRATO' || label === 'Pré-visualizar') &&
      getFileThumb(true, { width: small ? 18 : 22 }, 'export.pdf')) ||
    ((label === 'Gerir acessos' || label === 'Transições' || label === 'Comparar colaboradores') && (
      <SwapHorizOutlinedIcon />
    ));

  return button ? (
    <Stack>
      <Button
        color={colorAlt}
        variant={variant}
        onClick={onClick}
        startIcon={iconAlt}
        size={small ? 'small' : 'medium'}
        sx={{ color: variant === 'contained' && color === 'success' && 'common.white' }}
        {...others}
      >
        {label}
      </Button>
    </Stack>
  ) : (
    <Stack>
      <Tooltip title={label} arrow>
        <Fab
          size="small"
          color={colorAlt}
          variant={variant}
          onClick={onClick}
          sx={{ ...(small ? whsmall : wh), boxShadow: icon === 'Remover' && 'none' }}
          {...others}
        >
          {iconAlt}
        </Fab>
      </Tooltip>
    </Stack>
  );
}

// ----------------------------------------------------------------------

AddItem.propTypes = { dados: PropTypes.object, onClick: PropTypes.func };

export function AddItem({ dados = {}, onClick = null }) {
  const { small = false, label = 'Adicionar' } = dados;
  const dispatch = useDispatch();

  return (
    <Stack>
      <Button
        variant="soft"
        startIcon={<AddCircleIcon />}
        size={small ? 'small' : 'medium'}
        onClick={() => {
          if (onClick) onClick();
          else dispatch(openModal('add'));
        }}
      >
        {label}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Fechar.propTypes = { button: PropTypes.bool, large: PropTypes.bool, onClick: PropTypes.func };

export function Fechar({ button = false, large = false, onClick }) {
  return button ? (
    <Button
      variant="text"
      color="inherit"
      onClick={onClick}
      startIcon={<CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />}
    >
      Cancelar
    </Button>
  ) : (
    <Stack>
      <Tooltip title="Fechar" arrow>
        <IconButton onClick={onClick} sx={{ width: large ? 36 : 28, height: large ? 36 : 28 }}>
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
          <DefaultAction label="ELIMINAR" onClick={onOpen} />
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
        <Button
          type="submit"
          color={color}
          loading={isSaving}
          variant={color === 'error' || color === 'warning' ? 'soft' : 'contained'}
        >
          {(label && label) || (edit && 'Guardar') || 'Adicionar'}
        </Button>
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
    <Stack direction="row" justifyContent="right" spacing={1} sx={{ mt: 3, pt: 1, width: 1 }}>
      <Button variant="outlined" color="inherit" onClick={() => onCancel()}>
        {labelCancel}
      </Button>
      {hideSubmit ? (
        <></>
      ) : (
        <>
          {handleSubmit ? (
            <Button loading={isSaving} variant="contained" onClick={() => handleSubmit()}>
              {(label && label) || 'Seguinte'}
            </Button>
          ) : (
            <Button type="submit" loading={isSaving} variant="contained">
              {(label && label) || 'Seguinte'}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

MaisProcessos.propTypes = { verMais: PropTypes.func };

export function MaisProcessos({ verMais }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'right', mt: 3 }}>
      <DefaultAction button label="Mais processos" onClick={() => verMais()} variant="contained" />
    </Box>
  );
}
