// @mui
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import RadioGroup from '@mui/material/RadioGroup';
import CardActionArea from '@mui/material/CardActionArea';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
// hooks
import useSettings from '@/hooks/useSettings';
//
import BoxMask from './BoxMask';
import GridItem from '../../GridItem';

// ---------------------------------------------------------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey['500_12']}`,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function SettingMode() {
  const { themeMode, onChangeMode } = useSettings();

  return (
    <RadioGroup name="themeMode" value={themeMode} onChange={onChangeMode}>
      <Grid container dir="ltr" spacing={2.5}>
        {['light', 'dark'].map((mode, index) => {
          const isSelected = themeMode === mode;

          return (
            <GridItem key={mode} xs={6}>
              <BoxStyle
                sx={{
                  bgcolor: mode === 'light' ? 'common.white' : 'grey.800',
                  ...(isSelected && { color: 'primary.main', boxShadow: (theme) => theme.customShadows.z20 }),
                }}
              >
                {index === 0 ? (
                  <LightModeOutlinedIcon sx={{ width: 28, height: 28 }} />
                ) : (
                  <DarkModeOutlinedIcon sx={{ width: 28, height: 28 }} />
                )}
                <BoxMask value={mode} />
              </BoxStyle>
            </GridItem>
          );
        })}
      </Grid>
    </RadioGroup>
  );
}
