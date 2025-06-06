import PropTypes from 'prop-types';
// @mui
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
// config
import { defaultLang } from '../../config';

// ----------------------------------------------------------------------

ThemeLocalization.propTypes = { children: PropTypes.node.isRequired };

export default function ThemeLocalization({ children }) {
  const defaultTheme = useTheme();

  const theme = createTheme(defaultTheme, defaultLang?.systemValue);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
