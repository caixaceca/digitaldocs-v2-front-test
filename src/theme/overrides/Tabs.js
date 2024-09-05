// ----------------------------------------------------------------------

export default function Tabs(theme) {
  return {
    MuiTabs: {
      styleOverrides: {
        root: { paddingRight: 10, paddingLeft: 10, alignItems: 'center' },
        scrollButtons: { width: 30, height: 30, borderRadius: '50%', '&.Mui-disabled': { opacity: 0.3 } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          minWidth: 40,
          textTransform: 'none',
          fontWeight: theme.typography.fontWeightMedium,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
          '&.Mui-selected': { color: theme.palette.text.primary, bglolor: 'red' },
          '&:not(:last-of-type)': { marginRight: theme.spacing(2) },
        },
        labelIcon: {
          minHeight: 40,
          flexDirection: 'row',
          '& > *:first-of-type': { marginBottom: 0, marginRight: theme.spacing(1) },
        },
        wrapped: { flexDirection: 'row', whiteSpace: 'nowrap' },
        textColorInherit: { opacity: 1, color: theme.palette.text.secondary },
      },
    },
    MuiTabPanel: { styleOverrides: { root: { padding: 0 } } },
  };
}
