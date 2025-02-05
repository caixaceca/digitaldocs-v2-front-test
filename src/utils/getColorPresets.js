// theme
import palette from '../theme/palette';

// ----------------------------------------------------------------------

export const colorPresets = [
  // DEFAULT
  { name: 'default', ...palette.light.primary },
  // BLUE
  {
    name: 'blue',
    lighter: '#D1E9FC',
    light: '#76B0F1',
    main: '#2065D1',
    dark: '#103996',
    darker: '#061B64',
    contrastText: '#fff',
  },
  // ORANGE
  {
    name: 'orange',
    lighter: '#FEF4D4',
    light: '#FED680',
    main: '#fda92d',
    dark: '#B66816',
    darker: '#793908',
    contrastText: palette.light.grey[800],
  },
  // RED
  {
    name: 'red',
    lighter: '#FFE3D5',
    light: '#FFC1AC',
    main: '#FF3030',
    dark: '#B71833',
    darker: '#7A0930',
    contrastText: '#fff',
  },
];

export const defaultPreset = colorPresets[0];
export const bluePreset = colorPresets[1];
export const orangePreset = colorPresets[2];
export const redPreset = colorPresets[3];

export default function getColorPresets(presetsKey) {
  return { blue: bluePreset, orange: orangePreset, red: redPreset, default: defaultPreset }[presetsKey];
}

// ----------------------------------------------------------------------

export function colorLabel(value, padrao = 'primary') {
  return (
    ((value === 'Preso' || value === 'Aprovado' || value === 'Favorável' || value === 'CREATE') && 'success') ||
    ((value === 'Retidos' || value === 'Pendente' || value === 'Favorável parcial' || value === 'UPDATE') &&
      'warning') ||
    (value === 'Pendentes' && 'focus') ||
    ((value === 'Atribuídos' || value === 'Afeto' || value === 'READ') && 'info') ||
    ((value === 'Em análise' || value === 'Entrada' || value === 'Sem parecer') && 'default') ||
    ((value === 'Indeferido' || value === 'Desistido' || value === 'Não favorável' || value === 'DELETE') && 'error') ||
    padrao
  );
}
