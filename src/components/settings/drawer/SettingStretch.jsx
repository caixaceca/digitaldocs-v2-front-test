// @mui
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import CardActionArea from '@mui/material/CardActionArea';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
// hooks
import useSettings from '../../../hooks/useSettings';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.disabled,
  backgroundColor: theme.palette.background.neutral,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingStretch() {
  const { themeStretch, onToggleStretch } = useSettings();

  return (
    <BoxStyle onClick={onToggleStretch} sx={{ ...(themeStretch && { color: (theme) => theme.palette.primary.main }) }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mx: 'auto',
          width: 0.5,
          borderRadius: 1,
          color: 'action.active',
          transition: (theme) => theme.transitions.create('width'),
          ...(themeStretch && { width: 1, color: 'primary.main' }),
        }}
      >
        {themeStretch ? (
          <ArrowForwardIosOutlinedIcon sx={{ width: 18, height: 18 }} />
        ) : (
          <ArrowBackIosNewOutlinedIcon sx={{ width: 18, height: 18 }} />
        )}
        {themeStretch ? (
          <ArrowBackIosNewOutlinedIcon sx={{ width: 18, height: 18 }} />
        ) : (
          <ArrowForwardIosOutlinedIcon sx={{ width: 18, height: 18 }} />
        )}
      </Stack>
    </BoxStyle>
  );
}
