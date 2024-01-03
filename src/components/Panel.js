import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BusinessIcon from '@mui/icons-material/Business';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
//
import Label from './Label';
// utils
import { getFile } from '../utils/getFile';
// components
import MyAvatar from './MyAvatar';

// ----------------------------------------------------------------------

Panel.propTypes = { sx: PropTypes.object, label: PropTypes.string, children: PropTypes.node };

export default function Panel({ label, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        p: 0.5,
        pl: 1,
        flexGrow: 1,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack component="span" direction="row" alignItems="center" sx={{ mr: 1, color: 'text.primary' }}>
        <Typography noWrap variant="body2">
          {label}
        </Typography>
      </Stack>

      <Label variant="filled" sx={{ textTransform: 'none', py: 1.75 }}>
        {children}
      </Label>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Criado.propTypes = { tipo: PropTypes.string, value: PropTypes.string };

export function Criado({ tipo = '', value }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {(tipo === 'uo' && <BusinessIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'done' && <TaskAltIcon sx={{ width: 15, height: 15, color: 'text.success' }} />) ||
        (tipo === 'note' && <CommentOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'date' && <TodayOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'time' && <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'company' && <BusinessOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />) ||
        (tipo === 'user' && <AccountCircleOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />)}
      <Typography noWrap variant="body2">
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

ColaboradorInfo.propTypes = {
  ef: PropTypes.bool,
  pi: PropTypes.string,
  foto: PropTypes.string,
  nome: PropTypes.string,
  label: PropTypes.string,
};

export function ColaboradorInfo({ nome, label, foto, pi = '', ef = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          sx={{ color: ef ? 'text.secondary' : 'text.disabled' }}
        >
          {label}
        </Typography>
      </Stack>
    </Box>
  );
}
