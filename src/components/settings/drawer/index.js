import { AnimatePresence, m } from 'framer-motion';
import { useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { alpha, styled } from '@mui/material/styles';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
// hooks
import useSettings from '../../../hooks/useSettings';
// utils
import cssStyles from '../../../utils/cssStyles';
import { fData, fPercent } from '../../../utils/formatNumber';
// config
import { NAVBAR, defaultSettings } from '../../../config';
//
import Scrollbar from '../../Scrollbar';
import { varFade } from '../../animate';
//
import ToggleButton from './ToggleButton';
import SettingMode from './SettingMode';
import SettingLayout from './SettingLayout';
import SettingStretch from './SettingStretch';
import SettingContrast from './SettingContrast';
import SettingFullscreen from './SettingFullscreen';

// ----------------------------------------------------------------------

const RootStyle = styled(m.div)(({ theme }) => ({
  ...cssStyles(theme).bgBlur({ color: theme.palette.background.paper, opacity: 0.92 }),
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  position: 'fixed',
  overflow: 'hidden',
  width: NAVBAR.BASE_WIDTH,
  flexDirection: 'column',
  margin: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  zIndex: theme.zIndex.drawer + 3,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  boxShadow: `-24px 12px 32px -4px ${alpha(
    theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
    0.16
  )}`,
}));

// ----------------------------------------------------------------------

export default function SettingsDrawer() {
  const { themeMode, themeLayout, themeStretch, themeContrast, onResetSetting } = useSettings();

  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setUsed(estimate.usage);
        setQuota(estimate.quota);
      });
    }
  }, []);

  const notDefault =
    themeMode !== defaultSettings.themeMode ||
    themeLayout !== defaultSettings.themeLayout ||
    themeStretch !== defaultSettings.themeStretch ||
    themeContrast !== defaultSettings.themeContrast;

  const varSidebar = varFade({ distance: NAVBAR.BASE_WIDTH, durationIn: 0.32, durationOut: 0.32 }).inRight;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{ background: 'transparent', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      />

      {!open && <ToggleButton open={open} notDefault={notDefault} onToggle={handleToggle} />}

      <AnimatePresence>
        {open && (
          <>
            <RootStyle {...varSidebar}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Definições
                </Typography>

                <IconButton onClick={onResetSetting}>
                  <RefreshOutlinedIcon sx={{ width: 20, height: 20 }} />
                </IconButton>

                <IconButton onClick={handleClose}>
                  <CloseIcon sx={{ width: 20, height: 20 }} />
                </IconButton>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Scrollbar sx={{ flexGrow: 1 }}>
                <Stack spacing={3} sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Modo</Typography>
                    <SettingMode />
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Contraste</Typography>
                    <SettingContrast />
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Layout</Typography>
                    <SettingLayout />
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Espaçamento</Typography>
                    <SettingStretch />
                  </Stack>
                  <SettingFullscreen />
                  <Stack sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'center' }}>
                    {`Cache disponível: ${fData(quota)}`}
                    <br />
                    {`Espaço utilizado: ${fData(used)} (${fPercent((used / quota) * 100)})`}
                  </Stack>
                </Stack>
              </Scrollbar>
            </RootStyle>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
