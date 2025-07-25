import { useMemo } from 'react';
// @mui
import { alpha, ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
// utils
import { defaultPreset } from '../../utils/getColorPresets';
//
import componentsOverride from '../../theme/overrides';

// ---------------------------------------------------------------------------------------------------------------------

export default function ThemeColorPresets({ children }) {
  const defaultTheme = useTheme();

  const themeOptions = useMemo(
    () => ({
      ...defaultTheme,
      palette: { ...defaultTheme.palette },
      customShadows: { ...defaultTheme.customShadows, primary: `0 8px 16px 0 ${alpha(defaultPreset.main, 0.24)}` },
    }),
    [defaultTheme]
  );

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
