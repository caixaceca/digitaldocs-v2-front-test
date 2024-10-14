import PropTypes from 'prop-types';
import { useMemo } from 'react';
// @mui
import { ptPT } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider as MUIThemeProvider, StyledEngineProvider } from '@mui/material/styles';
// hooks
import useSettings from '../hooks/useSettings';
//
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = { children: PropTypes.node };

export default function ThemeProvider({ children }) {
  const { themeMode } = useSettings();

  const isLight = themeMode === 'light';

  const themeOptions = useMemo(
    () => ({
      palette: isLight ? palette.light : palette.dark,
      typography,
      breakpoints,
      shape: { borderRadius: 8 },
      shadows: isLight ? shadows.light : shadows.dark,
      customShadows: isLight ? customShadows.light : customShadows.dark,
      components: { MuiInputBase: { defaultProps: { disableInjectingGlobalStyles: true } } },
    }),
    [isLight]
  );

  const theme = createTheme(themeOptions, ptPT);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <GlobalStyles
          styles={{
            '@keyframes mui-auto-fill': { from: { display: 'block' } },
            '@keyframes mui-auto-fill-cancel': { from: { display: 'block' } },
          }}
        />
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
