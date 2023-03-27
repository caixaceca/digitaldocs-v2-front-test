import PropTypes from 'prop-types';
import { useRef } from 'react';
import { SnackbarProvider } from 'notistack';
// @mui
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningIcon from '@mui/icons-material/Warning';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, GlobalStyles, Collapse } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// hooks
import useSettings from '../hooks/useSettings';
//
import { IconButtonAnimate } from './animate';

// ----------------------------------------------------------------------

function SnackbarStyles() {
  const theme = useTheme();

  const isLight = theme.palette.mode === 'light';

  return (
    <GlobalStyles
      styles={{
        '#root': {
          '& .SnackbarContent-root': {
            width: '100%',
            padding: theme.spacing(1),
            margin: theme.spacing(0.25, 0),
            boxShadow: theme.customShadows.z8,
            borderRadius: theme.shape.borderRadius,
            color: theme.palette.grey[isLight ? 0 : 800],
            backgroundColor: theme.palette.grey[isLight ? 900 : 0],
            '&.SnackbarItem-variantSuccess, &.SnackbarItem-variantError, &.SnackbarItem-variantWarning, &.SnackbarItem-variantInfo':
              { color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper },
            [theme.breakpoints.up('md')]: { minWidth: 240 },
          },
          '& .SnackbarItem-message': { padding: '0 !important', fontWeight: theme.typography.fontWeightMedium },
          '& .SnackbarItem-action': {
            marginRight: 0,
            color: theme.palette.action.active,
            '& svg': { width: 20, height: 20 },
          },
        },
      }}
    />
  );
}

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
      <SnackbarStyles />

      <SnackbarProvider
        ref={notistackRef}
        dense
        maxSnack={5}
        preventDuplicate
        autoHideDuration={5000}
        TransitionComponent={isRTL ? Collapse : undefined}
        variant="success" // Set default variant
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        iconVariant={{
          info: <SnackbarIcon icon={<InfoIcon color="info" />} color="info" />,
          success: <SnackbarIcon icon={<TaskAltIcon color="success" />} color="success" />,
          warning: <SnackbarIcon icon={<WarningIcon color="warning" />} color="warning" />,
          error: <SnackbarIcon icon={<ErrorIcon color="error" />} color="error" />,
        }}
        // With close as default
        action={(key) => (
          <IconButtonAnimate size="small" onClick={onClose(key)} sx={{ p: 0.5 }}>
            <CloseOutlinedIcon sx={{ width: 20 }} />
          </IconButtonAnimate>
        )}
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
        borderRadius: 1.5,
        alignItems: 'center',
        color: `${color}.main`,
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      {icon}
    </Box>
  );
}
