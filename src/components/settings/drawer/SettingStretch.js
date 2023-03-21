// @mui
import { styled } from '@mui/material/styles';
import { CardActionArea, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// hooks
import useSettings from '../../../hooks/useSettings';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey[500_12]}`,
  backgroundColor: theme.palette.background.neutral,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingStretch() {
  const { themeStretch, onToggleStretch } = useSettings();
  const ICON_SIZE = { width: themeStretch ? 26 : 22, height: themeStretch ? 26 : 22 };

  return (
    <BoxStyle
      onClick={onToggleStretch}
      sx={{
        ...(themeStretch && {
          color: (theme) => theme.palette.primary.main,
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1,
          mx: 'auto',
          width: 0.5,
          height: 40,
          borderRadius: 1,
          color: 'action.active',
          bgcolor: 'background.default',
          boxShadow: (theme) => theme.customShadows.z12,
          transition: (theme) => theme.transitions.create('width'),
          ...(themeStretch && { width: 1, color: 'primary.main' }),
        }}
      >
        {themeStretch ? <ChevronRightIcon sx={{ ...ICON_SIZE }} /> : <ChevronLeftIcon sx={{ ...ICON_SIZE }} />}
        {themeStretch ? <ChevronLeftIcon sx={{ ...ICON_SIZE }} /> : <ChevronRightIcon sx={{ ...ICON_SIZE }} />}
      </Stack>
    </BoxStyle>
  );
}
