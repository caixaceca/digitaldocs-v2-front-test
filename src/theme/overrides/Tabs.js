// ---------------------------------------------------------------------------------------------------------------------

export default function Tabs(theme) {
  return {
    MuiTabs: {
      defaultProps: { scrollButtons: 'auto', variant: 'scrollable' },
      styleOverrides: {
        root: { minHeight: 34, paddingRight: 5, paddingLeft: 5, alignItems: 'center' },
        scrollButtons: { width: 30, height: 30, marginTop: 5, borderRadius: '50%', '&.Mui-disabled': { opacity: 0.3 } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          minWidth: 40,
          minHeight: 34,
          textTransform: 'none',
          fontWeight: theme.typography.fontWeightMedium,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
          '&.Mui-selected': { color: theme.palette.text.primary },
          '&:not(:last-of-type)': { marginRight: theme.spacing(3) },
        },
        labelIcon: {
          minHeight: 34,
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
