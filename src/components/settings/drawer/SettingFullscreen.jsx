import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined';
// hooks
import useSettings from '../../../hooks/useSettings';

// ---------------------------------------------------------------------------------------------------------------------

export default function SettingFullscreen() {
  const { onResetSetting } = useSettings();
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <>
      <Button
        fullWidth
        size="large"
        variant="outlined"
        color={fullscreen ? 'primary' : 'inherit'}
        startIcon={fullscreen ? <FullscreenExitOutlinedIcon /> : <FullscreenOutlinedIcon />}
        onClick={toggleFullScreen}
        sx={{
          fontSize: 14,
          ...(fullscreen && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
          }),
        }}
      >
        {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </Button>

      <Button
        fullWidth
        size="large"
        color={'inherit'}
        sx={{ fontSize: 14 }}
        startIcon={<RestartAltOutlinedIcon />}
        onClick={() => {
          onResetSetting();
          clearCacheAndReload();
        }}
      >
        Limpar dados
      </Button>
    </>
  );
}

async function clearCacheAndReload() {
  // Limpar os cookies do navegador
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  });

  // Limpar o cache do navegador
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    } catch (error) {
      console.error('Erro ao limpar o cache:', error);
    }
  } else {
    console.warn('Cache API não suportada neste navegador.');
  }

  // Limpar o localStorage e sessionStorage e recarregar a página
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = `${window.location.origin + window.location.pathname}?cache_buster=${new Date().getTime()}`;
}
