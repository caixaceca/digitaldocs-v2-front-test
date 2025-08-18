import { useNavigate } from 'react-router-dom';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
// utils
import { getFileThumb } from '../utils/formatFile';
// hooks
import useToggle from '../hooks/useToggle';
import useResponsive from '../hooks/useResponsive';
// redux
import { useDispatch } from '../redux/store';
import { openModal, setModal } from '../redux/slices/parametrizacao';
//
import {
  Editar,
  AddIcon,
  Arquivo,
  AddAnexo,
  Libertar,
  Resgatar,
  Detalhes,
  Eliminar,
  Atribuir,
  Seguimento,
} from '../assets';
import SvgIconStyle from './SvgIconStyle';
import { DialogConfirmar } from './CustomDialog';

const wh = { width: 38, height: 38 };
const whsmall = { width: 30, height: 30 };

// ---------------------------------------------------------------------------------------------------------------------

export function ActionButton({ options = {} }) {
  const dispatch = useDispatch();
  const { item = '', sm = false, fab = false, label = 'ELIMINAR', dados = null } = options;
  const isEdit = label === 'EDITAR' || label === 'Editar';

  return (
    <DefaultAction small={sm} button={!fab} label={label} onClick={() => dispatch(setModal({ item, dados, isEdit }))} />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DefaultAction({
  icon,
  onClick,
  label = '',
  small = false,
  button = false,
  variant = 'soft',
  color = 'success',
  ...others
}) {
  const colorAlt =
    ((label === 'EDITAR' ||
      label === 'Editar' ||
      label === 'REATIVAR' ||
      label === 'RESGATAR' ||
      label === 'LIBERTAR' ||
      label === 'DOMICILIAR' ||
      label === 'FOCAL POINT') &&
      'warning') ||
    ((label === 'CLONAR' ||
      label === 'Próximo' ||
      label === 'Anterior' ||
      label === 'PENDENTE' ||
      label === 'Gerar contrato') &&
      'inherit') ||
    (label === 'ATRIBUIR' && 'info') ||
    ((label === 'ELIMINAR' || label === 'Eliminar' || label === 'ARQUIVAR' || label === 'DESARQUIVAR') && 'error') ||
    color;

  const iconAlt =
    (label === 'FECHAR' && <CloseIcon />) ||
    (label === 'ANULAR CONFIRMAÇÂO' && <ClearIcon />) ||
    (label === 'DESARQUIVAR' && <UnarchiveOutlinedIcon />) ||
    (label === 'DOMICILIAR' && <AddHomeWorkOutlinedIcon />) ||
    (label === 'ARQUIVAR' && <Arquivo sx={{ width: 22, height: 22 }} />) ||
    (label === 'LIBERTAR' && <Libertar sx={{ width: 24, height: 24 }} />) ||
    (label === 'ATRIBUIR' && <Atribuir sx={{ width: 22, height: 22 }} />) ||
    (label === 'FINALIZAR' && <SvgIconStyle src="/assets/icons/stop.svg" />) ||
    (label === 'CONFIRMAR' && <DoneAllIcon sx={{ color: 'common.white' }} />) ||
    (label === 'ACEITAR' && <LockPersonIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'ADICIONAR ANEXO' && <AddAnexo sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'ATAULIZAR DADOS' && <RefreshIcon sx={{ width: 22, height: 22 }} />) ||
    (label === 'Esconder detalhes' && <RemoveIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'Mais processos' && <PostAddOutlinedIcon sx={{ width: small ? 18 : 22 }} />) ||
    (label === 'PENDENTE' && <PendingActionsOutlinedIcon sx={{ color: 'text.secondary' }} />) ||
    ((label === 'Contas' || label === 'Nº PROCESSOS') && <InfoOutlinedIcon sx={{ width: 20 }} />) ||
    ((label === 'RESGATAR' || label === 'REATIVAR') && <Resgatar sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'ELIMINAR' || label === 'Eliminar') && <Eliminar sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'Procurar' || label === 'PROCURAR') && <SearchIcon sx={{ width: small ? 18 : 24 }} />) ||
    ((label === 'Anterior' || label === 'VOLTAR') && <ArrowBackIcon sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'ENCAMINHAR' || label === 'DESPACHO') && <Seguimento sx={{ width: 22, height: 22 }} />) ||
    (label === 'DEVOLVER' && <Seguimento sx={{ width: 22, height: 22, transform: 'rotate(180deg)' }} />) ||
    ((label === 'DETALHES' || label === 'DESTINATÁRIOS') && <Detalhes sx={{ width: small ? 18 : 22 }} />) ||
    ((label === 'CLONAR' || label === 'Clonar') && <ContentCopyOutlinedIcon sx={{ width: small ? 18 : 24 }} />) ||
    ((label === 'Editar' || label === 'EDITAR' || label === 'FOCAL POINT') && (
      <Editar sx={{ width: small ? 18 : 22 }} />
    )) ||
    ((icon === 'adicionar' ||
      label === 'ADICIONAR' ||
      label === 'Adicionar' ||
      label === 'CONDICIONAL' ||
      label === 'Mostrar detalhes' ||
      label === 'Carregar proposta') && <AddIcon sx={{ width: small ? 20 : 22 }} />) ||
    ((label === 'CONTRATO' || label === 'Pré-visualizar' || label === 'Prév. minuta') &&
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
        endIcon={label === 'Próximo' && <ArrowForwardIcon sx={{ width: small ? 18 : 22 }} />}
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

// ---------------------------------------------------------------------------------------------------------------------

export function AddItem({ dados = {}, onClick = null }) {
  const { small = false, label = 'Adicionar' } = dados;
  const dispatch = useDispatch();

  return (
    <Stack>
      <Button
        variant="soft"
        size={small ? 'small' : 'medium'}
        startIcon={<AddIcon sx={{ width: small ? 20 : 22 }} />}
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

// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------

export function DialogButons({
  onClose,
  isSaving,
  desc = '',
  label = '',
  edit = false,
  color = 'primary',
  hideSubmit = false,
  handleDelete = null,
}) {
  const { toggle: open, onOpen, onClose: onClose1 } = useToggle();

  return (
    <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
      {desc && (
        <>
          <DefaultAction label="ELIMINAR" onClick={onOpen} />
          {open && (
            <DialogConfirmar
              desc={desc}
              onClose={onClose1}
              isSaving={isSaving}
              handleOk={() => handleDelete(onClose1)}
            />
          )}
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="outlined" color="inherit" onClick={() => onClose()}>
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

// ---------------------------------------------------------------------------------------------------------------------

export function ButtonsStepper({
  onClose,
  isSaving,
  label = 'Seguinte',
  hideSubmit = false,
  handleSubmit = null,
  labelCancel = 'Voltar',
}) {
  return (
    <Stack direction="row" justifyContent="right" spacing={1} sx={{ mt: 3, pt: 1, width: 1 }}>
      <Button variant="outlined" color="inherit" onClick={() => onClose()}>
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

// ---------------------------------------------------------------------------------------------------------------------

export function MaisProcessos({ verMais }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'right', mt: 3 }}>
      <DefaultAction button label="Mais processos" onClick={() => verMais()} variant="contained" />
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Voltar({ fab }) {
  const navigate = useNavigate();
  const small = useResponsive('down', 'sm');

  return (
    <DefaultAction
      label="VOLTAR"
      color="inherit"
      variant="outlined"
      small={!(small || fab)}
      button={!(small || fab)}
      onClick={() => navigate(-1)}
      sx={{ color: !fab && 'common.white' }}
    />
  );
}
