import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined';
// hooks
import useSettings from '../../../hooks/useSettings';

// ----------------------------------------------------------------------

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
        startIcon={<RestartAltOutlinedIcon />}
        onClick={() => {
          onResetSetting();
          localStorage.clear();
          window.location.reload();
        }}
        sx={{ fontSize: 14 }}
      >
        Limpar dados
      </Button>
    </>
  );
}
