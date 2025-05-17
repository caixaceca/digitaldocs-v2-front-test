import { useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import SettingMode from '../../components/settings/drawer/SettingMode';
import SettingLayout from '../../components/settings/drawer/SettingLayout';
import SettingStretch from '../../components/settings/drawer/SettingStretch';
import SettingContrast from '../../components/settings/drawer/SettingContrast';
import SettingFullscreen from '../../components/settings/drawer/SettingFullscreen';
//
import { IconButtonHeader } from './Items';

// ----------------------------------------------------------------------

export default function Definicoes() {
  const [open, setOpen] = useState(null);
  const { onResetSetting } = useSettings();

  return (
    <>
      <IconButtonHeader title="Definições" open={open} setOpen={setOpen} />

      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        sx={{ width: 260, p: 0, pb: 1, mt: 1.5, ml: 0.75, overflow: 'inherit' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Definições
          </Typography>

          <IconButton onClick={onResetSetting}>
            <RefreshOutlinedIcon sx={{ width: 20, height: 20 }} />
          </IconButton>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ maxHeight: 'calc(100vh - 150px)' }}>
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
          </Stack>
        </Scrollbar>
      </MenuPopover>
    </>
  );
}
