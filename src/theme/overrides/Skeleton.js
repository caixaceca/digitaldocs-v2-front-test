// ---------------------------------------------------------------------------------------------------------------------

export default function Skeleton() {
  return {
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },

      styleOverrides: {
        root: {
          // backgroundColor: theme.palette.background.neutral,
          backgroundColor: 'rgba(90,170,40,.1)',
        },
      },
    },
  };
}
