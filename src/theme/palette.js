import { alpha } from '@mui/material/styles';

// ---------------------------------------------------------------------------------------------------------------------

function createGradient(color1, color2) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
  '500_8': alpha('#919EAB', 0.08),
  '500_12': alpha('#919EAB', 0.12),
  '500_16': alpha('#919EAB', 0.16),
  '500_24': alpha('#919EAB', 0.24),
  '500_32': alpha('#919EAB', 0.32),
  '500_48': alpha('#919EAB', 0.48),
  '500_56': alpha('#919EAB', 0.56),
  '500_80': alpha('#919EAB', 0.8),
};

// SETUP COLORS
const PRIMARY = {
  lighter: '#E6F4DB',
  light: '#A3D98A',
  main: '#5AAA28',
  dark: '#3E7A1B',
  darker: '#275110',
  contrastText: '#fff',
};

const SECONDARY = {
  lighter: '#DDE5FF',
  light: '#809FFF',
  main: '#3366FF',
  dark: '#1A4FCC',
  darker: '#103399',
  contrastText: '#fff',
};

const INFO = {
  lighter: '#D2F4FA',
  light: '#66D9EB',
  main: '#00B8D9',
  dark: '#0089A0',
  darker: '#005B6B',
  contrastText: '#fff',
};

const SUCCESS = {
  lighter: '#E6F4DB',
  light: '#A3D98A',
  main: '#5AAA28',
  dark: '#3E7A1B',
  darker: '#275110',
  contrastText: '#fff',
};

const WARNING = {
  lighter: '#FFF3CC',
  light: '#FFD966',
  main: '#FF9800',
  dark: '#CC7700',
  darker: '#994F00',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFDADA',
  light: '#FF8A85',
  main: '#FF4842',
  dark: '#CC3833',
  darker: '#992926',
  contrastText: '#fff',
};

const FOCUS = {
  lighter: '#F0F0F0',
  light: '#D6D6D6',
  main: '#AAAAAA',
  dark: '#7A7A7A',
  darker: '#4D4D4D',
  contrastText: '#fff',
};

const GRADIENTS = {
  primary: createGradient(PRIMARY.light, PRIMARY.main),
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),
  focus: createGradient(FOCUS.light, FOCUS.main),
};

const CHART_COLORS = {
  violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
  blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
  green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
  yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
  red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFF2D4'],
};

const COMMON = {
  common: { black: '#000', white: '#fff' },
  primary: { ...PRIMARY, contrastText: '#fff' },
  secondary: { ...SECONDARY, contrastText: '#fff' },
  info: { ...INFO, contrastText: '#fff' },
  success: { ...SUCCESS, contrastText: GREY[800] },
  warning: { ...WARNING, contrastText: GREY[800] },
  error: { ...ERROR, contrastText: '#fff' },
  focus: { ...FOCUS, contrastText: '#fff' },
  grey: GREY,
  gradients: GRADIENTS,
  chart: CHART_COLORS,
  divider: GREY['500_24'],
  action: {
    hover: GREY['500_8'],
    selected: GREY['500_16'],
    disabled: GREY['500_80'],
    disabledBackground: GREY['500_24'],
    focus: GREY['500_24'],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

const palette = {
  light: {
    ...COMMON,
    mode: 'light',
    text: {
      success: SUCCESS.main,
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
      warning: WARNING.main,
      error: ERROR.main,
    },
    background: { paper: '#fff', default: '#fff', neutral: GREY[200], disabled: GREY[100] },
    action: { active: GREY[600], ...COMMON.action },
  },
  dark: {
    ...COMMON,
    mode: 'dark',
    text: {
      success: SUCCESS.main,
      primary: '#fff',
      secondary: GREY[500],
      disabled: GREY[600],
      warning: WARNING.main,
      error: ERROR.main,
    },
    background: { paper: GREY[800], default: GREY[900], neutral: GREY['500_16'], disabled: GREY['500_8'] },
    action: { active: GREY[500], ...COMMON.action },
  },
};

export default palette;
