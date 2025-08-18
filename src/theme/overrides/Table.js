export default function Table(theme) {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-head:first-of-type': {
            borderBottom: `2px solid  ${theme.palette.background.paper}`,
          },
          '&:last-child td, &:last-child th': { border: 0 },
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            borderBottom: `1px solid  ${theme.palette.background.paper}`,
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `dotted 1px ${theme.palette.divider}` },
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
          '&:first-of-type': {
            paddingLeft: theme.spacing(3),
            borderTopLeftRadius: theme.shape.borderRadius,
            borderBottomLeftRadius: theme.shape.borderRadius,
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(3),
            borderTopRightRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
          },
        },
        stickyHeader: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.neutral} 0%, ${theme.palette.background.neutral} 100%)`,
        },
        body: {
          '&:first-of-type': { paddingLeft: theme.spacing(3) },
          '&:last-of-type': { paddingRight: theme.spacing(3) },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectIcon: { width: 20, height: 20, marginTop: -4 },
        root: { borderTop: `solid 1px ${theme.palette.divider}` },
        select: { '&:focus': { borderRadius: theme.shape.borderRadius } },
        toolbar: { minHeight: 30, '@media (min-width: 600px)': { minHeight: '30px !important' } },
      },
    },
  };
}
