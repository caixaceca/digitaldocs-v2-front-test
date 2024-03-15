import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BusinessIcon from '@mui/icons-material/Business';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
//
import Label from './Label';
// utils
import { getFile } from '../utils/getFile';
// components
import MyAvatar from './MyAvatar';
import { DefaultAction } from './Actions';

// ----------------------------------------------------------------------

Panel.propTypes = { sx: PropTypes.object, label: PropTypes.string, children: PropTypes.node };

export default function Panel({ label, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        p: 0.35,
        flexGrow: 1,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack component="span" direction="row" alignItems="center" sx={{ mr: 1, ml: 0.5, color: 'text.secondary' }}>
        <Typography noWrap variant="body2">
          {label}
        </Typography>
      </Stack>

      <Label variant="filled" sx={{ textTransform: 'none', py: 1.75, width: 1 }}>
        {children}
      </Label>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Criado.propTypes = { tipo: PropTypes.string, value: PropTypes.string, caption: PropTypes.bool, sx: PropTypes.object };

export function Criado({ tipo = '', value, caption = false, sx }) {
  const styles = { width: caption ? 12 : 15, height: caption ? 12 : 15, color: sx?.color || 'text.secondary' };
  return (
    <Stack direction="row" spacing={caption ? 0.25 : 0.5} alignItems="center" {...sx}>
      {(tipo === 'uo' && <BusinessIcon sx={{ ...styles }} />) ||
        (tipo === 'date' && <TodayOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'note' && <CommentOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'time' && <AccessTimeOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'company' && <BusinessOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'user' && <AccountCircleOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'done' && <TaskAltIcon sx={{ width: 15, height: 15, color: 'text.success' }} />)}
      <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ pr: 0.1 }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

ColaboradorInfo.propTypes = {
  ef: PropTypes.bool,
  sx: PropTypes.object,
  pi: PropTypes.string,
  foto: PropTypes.string,
  nome: PropTypes.string,
  label: PropTypes.string,
};

export function ColaboradorInfo({ nome, label, foto, pi = '', ef = false, sx = null }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <MyAvatar alt={nome} src={getFile('colaborador', foto)} />
      <Stack sx={{ ml: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {pi && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {pi} -
            </Typography>
          )}
          <Typography noWrap variant="subtitle2">
            {nome}
          </Typography>
        </Stack>
        <Typography
          noWrap={!ef}
          variant={ef ? 'caption' : 'body2'}
          sx={{ color: ef ? 'text.disabled' : 'text.secondary' }}
        >
          {label}
        </Typography>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

Registos.propTypes = { info: PropTypes.object, handleClick: PropTypes.func, total: PropTypes.number };

export function Registos({ info, total, handleClick }) {
  return (
    <Stack spacing={0.5} direction="row" alignItems="center" justifyContent="center" sx={{ color: 'text.secondary' }}>
      <Typography>{info?.proxima_pagina > 0 ? 'Processos' : 'Total de processos'}:</Typography>
      {info?.proxima_pagina > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            {total || 0}
          </Typography>
          <Typography>de</Typography>
        </>
      )}
      <Typography variant="subtitle1" sx={{ color: 'text.primary', pr: 0.5 }}>
        {info?.total_registos || 0}
      </Typography>
      {info?.proxima_pagina > 0 && <DefaultAction small label="Mostrar mais processos" handleClick={handleClick} />}
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
