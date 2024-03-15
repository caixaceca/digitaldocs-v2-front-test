import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { useSnackbar, SnackbarProvider, MaterialDesignContent } from 'notistack';
// @mui
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import InfoIcon from '@mui/icons-material/Info';
import { alpha, styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
// hooks
import useSettings from '../hooks/useSettings';
//
import { IconButtonAnimate } from './animate';

// ----------------------------------------------------------------------

const StyledMaterialDesignContent = styled(MaterialDesignContent)(({ theme }) => ({
  width: '100%',
  fontWeight: 700,
  boxShadow: theme.customShadows.z8,
  padding: theme.spacing(0, 2, 0, 1),
  borderRadius: theme.shape.borderRadius,
  '&.notistack-MuiContent-success, &.notistack-MuiContent-error, &.notistack-MuiContent-warning, &.notistack-MuiContent-info':
    { color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper },
}));

// ----------------------------------------------------------------------

NotistackProvider.propTypes = { children: PropTypes.node };

export default function NotistackProvider({ children }) {
  const { themeDirection } = useSettings();
  const isRTL = themeDirection === 'rtl';
  const notistackRef = useRef(null);

  const onClose = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <>
      <SnackbarProvider
        ref={notistackRef}
        maxSnack={5}
        preventDuplicate
        autoHideDuration={5000}
        TransitionComponent={isRTL ? Collapse : undefined}
        variant="success" // Set default variant
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        iconVariant={{
          info: <SnackbarIcon icon={<InfoIcon />} color="info" />,
          success: <SnackbarIcon icon={<CheckCircleIcon />} color="success" />,
          warning: <SnackbarIcon icon={<WarningOutlinedIcon />} color="warning" />,
          error: <SnackbarIcon icon={<ErrorOutlinedIcon />} color="error" />,
        }}
        // With close as default
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
    </>
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
        width: 40,
        height: 40,
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

export function Notificacao({ done = '', error = '', afterSuccess = null }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      afterSuccess();
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
