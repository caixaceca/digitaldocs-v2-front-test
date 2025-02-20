import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BusinessIcon from '@mui/icons-material/Business';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// config
// import { ambiente } from '../config';
// utils
import { getFile } from '../utils/getFile';
import { baralharString } from '../utils/formatText';
// components
import Label from './Label';
import { DefaultAction } from './Actions';
import MyAvatar, { AvatarBedge } from './MyAvatar';

// ----------------------------------------------------------------------

Panel.propTypes = { sx: PropTypes.object, label: PropTypes.string, value: PropTypes.string };

export default function Panel({ label, value, sx }) {
  return value ? (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        p: 0.25,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        border: (theme) => `dotted 1px ${theme.palette.divider}`,
        ...sx,
      }}
    >
      {label && (
        <Stack component="span" direction="row" alignItems="center" sx={{ mx: 1, color: 'text.secondary' }}>
          <Typography noWrap variant="body2">
            {label}
          </Typography>
        </Stack>
      )}

      <Label variant="ghost" sx={{ textTransform: 'none', pt: 1.75, pb: 2, width: 1, color: 'text.secondary' }}>
        <Typography noWrap sx={{ color: 'text.primary' }}>
          {value}
        </Typography>
      </Label>
    </Stack>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

Criado.propTypes = {
  sx: PropTypes.object,
  tipo: PropTypes.string,
  value: PropTypes.string,
  caption: PropTypes.bool,
  value1: PropTypes.string,
  baralhar: PropTypes.bool,
};

export function Criado({ tipo = '', value, value1 = '', caption = false, baralhar = false, sx }) {
  const styles = { width: caption ? 13 : 15, height: caption ? 13 : 15, color: sx?.color || 'text.secondary' };
  return value ? (
    <Stack direction="row" spacing={caption ? 0.25 : 0.5} alignItems="center" {...sx}>
      {(tipo === 'uo' && <BusinessIcon sx={{ ...styles }} />) ||
        (tipo === 'data' && <TodayOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'warning' && <WarningAmberIcon sx={{ ...styles }} />) ||
        (tipo === 'note' && <CommentOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'time' && <AccessTimeOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'company' && <BusinessOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'user' && <AccountCircleOutlinedIcon sx={{ ...styles }} />) ||
        (tipo === 'done' && <TaskAltIcon sx={{ width: 15, height: 15, color: 'text.success' }} />)}
      <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ pr: 0.1 }}>
        {baralhar ? baralharString(value) : value}
      </Typography>
      {value1 && (
        <Typography noWrap variant={caption ? 'caption' : 'body2'} sx={{ pr: 0.1 }}>
          ({baralhar ? baralharString(value1) : value1})
        </Typography>
      )}
    </Stack>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

ColaboradorInfo.propTypes = {
  id: PropTypes.number,
  sx: PropTypes.object,
  other: PropTypes.node,
  foto: PropTypes.string,
  nome: PropTypes.string,
  caption: PropTypes.bool,
  label: PropTypes.string,
  labelAlt: PropTypes.string,
  labelAltCaption: PropTypes.bool,
};

export function ColaboradorInfo({
  nome,
  foto,
  id = 0,
  sx = null,
  label = '',
  other = null,
  labelAlt = '',
  caption = false,
  labelAltCaption = false,
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <AvatarBedge id={id}>
        <MyAvatar name={baralharString(nome)} src={getFile('colaborador', baralharString(foto, true))} />
      </AvatarBedge>
      <Stack sx={{ ml: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography noWrap variant="subtitle2">
            {baralharString(nome)}
          </Typography>
          {!!labelAlt && (
            <Typography variant={labelAltCaption ? 'caption' : 'body2'} sx={{ color: 'text.secondary' }}>
              ({labelAlt})
            </Typography>
          )}
        </Stack>
        {!!label && (
          <Typography
            noWrap={!caption}
            variant={caption ? 'caption' : 'body2'}
            sx={{ color: caption ? 'text.disabled' : 'text.secondary' }}
          >
            {label}
          </Typography>
        )}
        {other}
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
      {info?.proxima_pagina > 0 && <DefaultAction small label="Mais processos" handleClick={handleClick} />}
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

CellChecked.propTypes = { check: PropTypes.bool };

export function CellChecked({ check }) {
  return (
    <TableCell align="center">
      <Checked check={check} />
    </TableCell>
  );
}

// ----------------------------------------------------------------------

BoxMask.propTypes = { sx: PropTypes.object };

export function BoxMask({ sx = null }) {
  return (
    <Box
      sx={{
        zIndex: -1,
        opacity: 0.2,
        width: '100%',
        height: '100%',
        maskSize: 'cover',
        position: 'absolute',
        display: 'inline-flex',
        maskPositionX: 'center',
        maskPositionY: 'center',
        backgroundColor: 'currentcolor',
        maskImage: 'url(/assets/shape-square.svg)',
        ...sx,
      }}
    />
  );
}
