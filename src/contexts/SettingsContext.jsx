import { createContext } from 'react';
// hooks
import useLocalStorage from '../hooks/useLocalStorage';
// config
import { defaultSettings } from '../config';

// ---------------------------------------------------------------------------------------------------------------------

const initialState = {
  ...defaultSettings,
  // Mode
  onToggleMode: () => {},
  onChangeMode: () => {},

  // Layout
  onToggleLayout: () => {},
  onChangeLayout: () => {},

  // Contrast
  onToggleContrast: () => {},
  onChangeContrast: () => {},

  // Stretch
  onToggleStretch: () => {},

  // Reset
  onResetSetting: () => {},
};

const SettingsContext = createContext(initialState);

// ---------------------------------------------------------------------------------------------------------------------

function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('settings', {
    themeMode: initialState.themeMode,
    themeLayout: initialState.themeLayout,
    themeStretch: initialState.themeStretch,
    themeContrast: initialState.themeContrast,
  });

  // Mode

  const onToggleMode = () => {
    setSettings({ ...settings, themeMode: settings.themeMode === 'light' ? 'dark' : 'light' });
  };

  const onChangeMode = (event) => {
    setSettings({ ...settings, themeMode: event.target.value });
  };

  // Layout

  const onToggleLayout = () => {
    setSettings({ ...settings, themeLayout: settings.themeLayout === 'vertical' ? 'horizontal' : 'vertical' });
  };

  const onChangeLayout = (event) => {
    setSettings({ ...settings, themeLayout: event.target.value });
  };

  // Contrast

  const onToggleContrast = () => {
    setSettings({ ...settings, themeContrast: settings.themeContrast === 'default' ? 'bold' : 'default' });
  };

  const onChangeContrast = (event) => {
    setSettings({ ...settings, themeContrast: event.target.value });
  };

  // Stretch

  const onToggleStretch = () => {
    setSettings({ ...settings, themeStretch: !settings.themeStretch });
  };

  // Reset

  const onResetSetting = () => {
    setSettings({
      themeMode: initialState.themeMode,
      themeLayout: initialState.themeLayout,
      themeStretch: initialState.themeStretch,
      themeContrast: initialState.themeContrast,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        onToggleMode,
        onChangeMode,
        onToggleLayout,
        onChangeLayout,
        onChangeContrast,
        onToggleContrast,
        onToggleStretch,
        onResetSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsProvider, SettingsContext };
