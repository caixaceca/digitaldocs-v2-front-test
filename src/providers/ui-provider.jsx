// contexts
import { SettingsProvider } from '../contexts/SettingsContext';
import { CollapseDrawerProvider } from '../contexts/CollapseDrawerContext';
// theme
import ThemeProvider from '../theme';
// components
import ThemeSettings from '../components/settings';
import NotistackProvider from '../components/NotistackProvider';

export default function UIProvider({ children }) {
  return (
    <SettingsProvider>
      <CollapseDrawerProvider>
        <ThemeProvider>
          <ThemeSettings>
            <NotistackProvider>{children}</NotistackProvider>
          </ThemeSettings>
        </ThemeProvider>
      </CollapseDrawerProvider>
    </SettingsProvider>
  );
}
