import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// ----------------------------------------------------------------------

export default function Accordion(theme) {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&::before': { display: 'none' },
          '&.Mui-disabled': { backgroundColor: 'transparent' },
          '&.Mui-expanded': { boxShadow: theme.customShadows.z8, borderRadius: theme.shape.borderRadius },
        },
      },
      defaultProps: { slotProps: { transition: { unmountOnExit: true } } },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          flexDirection: 'row-reverse',
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          borderRadius: theme.spacing(1),
          backgroundColor: theme.palette.background.neutral,
          '&.Mui-disabled': {
            opacity: 1,
            color: theme.palette.action.disabled,
            '& .MuiTypography-root': { color: 'inherit' },
          },
          '&.Mui-expanded': {
            minHeight: '34px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            '& .MuiAccordionSummary-content': { margin: '12px 0' },
          },
        },
        expandIconWrapper: { color: 'inherit', marginRight: 5, '&.Mui-expanded': { transform: 'rotate(90deg)' } },
      },
      defaultProps: { expandIcon: <KeyboardArrowRightIcon /> },
    },
  };
}
