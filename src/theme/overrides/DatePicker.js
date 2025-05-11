// DatePicker.js
export default function DatePicker(theme) {
  return {
    MuiIconButton: {
      styleOverrides: {
        root: { width: 30, height: 30, padding: theme.spacing(1), '& svg': { fontSize: 20 } },
      },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiInputBase-root': {} } },
    },
  };
}
