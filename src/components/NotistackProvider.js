import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { SnackbarProvider, MaterialDesignContent, useSnackbar } from 'notistack';
// @mui
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import { alpha, styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
//
import { IconButtonAnimate } from './animate';

// ----------------------------------------------------------------------

const StyledMaterialDesignContent = styled(MaterialDesignContent)(({ theme }) => ({
  fontWeight: 700,
  '&.notistack-MuiContent-success, &.notistack-MuiContent-error, &.notistack-MuiContent-warning, &.notistack-MuiContent-info':
    {
      borderRadius: theme.spacing(1),
      color: theme.palette.text.primary,
      padding: theme.spacing(0, 2, 0, 1),
      backgroundColor: theme.palette.background.paper,
    },
}));

// ----------------------------------------------------------------------

NotistackProvider.propTypes = { children: PropTypes.node };

export default function NotistackProvider({ children }) {
  const notistackRef = useRef(null);

  const onClose = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={5}
      preventDuplicate
      variant="success"
      autoHideDuration={5000}
      TransitionComponent={undefined}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      iconVariant={{
        info: <SnackbarIcon icon={<InfoIcon />} color="info" />,
        success: <SnackbarIcon icon={<CheckCircleIcon />} color="success" />,
        warning: <SnackbarIcon icon={<WarningOutlinedIcon />} color="warning" />,
        error: <SnackbarIcon icon={<ErrorOutlinedIcon />} color="error" />,
      }}
      action={(key) => (
        <IconButtonAnimate size="small" onClick={onClose(key)} sx={{ p: 0.5 }}>
          <CloseOutlinedIcon sx={{ width: 20 }} />
        </IconButtonAnimate>
      )}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}

// ----------------------------------------------------------------------

SnackbarIcon.propTypes = {
  icon: PropTypes.node,
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error']),
};

function SnackbarIcon({ icon, color }) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 32,
        height: 32,
        display: 'flex',
        borderRadius: 1,
        alignItems: 'center',
        color: `${color}.main`,
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.2),
      }}
    >
      {icon}
    </Box>
  );
}

// ----------------------------------------------------------------------

Notificacao.propTypes = { done: PropTypes.string, error: PropTypes.string, afterSuccess: PropTypes.func };

export function Notificacao({ done, error, afterSuccess = null }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (done === 'Bem-vindo(a) a GAJ-i9') {
      enqueueSnackbar(done, { variant: 'success' });
    } else if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      if (afterSuccess) {
        afterSuccess();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
}
