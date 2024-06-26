// @mui
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import RadioGroup from '@mui/material/RadioGroup';
import CardActionArea from '@mui/material/CardActionArea';
// hooks
import useSettings from '../../../hooks/useSettings';
//
import BoxMask from './BoxMask';
import { Contraste, ContrasteAlt } from '../../../assets';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey[500_12]}`,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingContrast() {
  const { themeContrast, onChangeContrast } = useSettings();

  return (
    <RadioGroup name="themeContrast" value={themeContrast} onChange={onChangeContrast}>
      <Grid dir="ltr" container spacing={2.5}>
        {['default', 'bold'].map((contrast, index) => {
          const isSelected = themeContrast === contrast;

          return (
            <Grid key={contrast} item xs={6}>
              <BoxStyle
                sx={{ ...(isSelected && { color: 'primary.main', boxShadow: (theme) => theme.customShadows.z20 }) }}
              >
                {index === 0 ? <ContrasteAlt sx={{ width: 28 }} /> : <Contraste sx={{ width: 30 }} />}
                <BoxMask value={contrast} />
              </BoxStyle>
            </Grid>
          );
        })}
      </Grid>
    </RadioGroup>
  );
}
