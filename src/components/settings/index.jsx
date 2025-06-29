//
import ThemeContrast from './ThemeContrast';
import ThemeColorPresets from './ThemeColorPresets';
import ThemeLocalization from './ThemeLocalization';

// ---------------------------------------------------------------------------------------------------------------------

export default function ThemeSettings({ children }) {
  return (
    <ThemeColorPresets>
      <ThemeContrast>
        <ThemeLocalization>{children}</ThemeLocalization>
      </ThemeContrast>
    </ThemeColorPresets>
  );
}
