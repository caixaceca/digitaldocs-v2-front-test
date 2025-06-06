import { StarIcon } from './CustomIcons';

// ----------------------------------------------------------------------

const ICON_SMALL = { width: 18, height: 18 };
const ICON_LARGE = { width: 28, height: 28 };

export default function Rating(theme) {
  return {
    MuiRating: {
      defaultProps: { emptyIcon: <StarIcon />, icon: <StarIcon /> },

      styleOverrides: {
        root: { '&.Mui-disabled': { opacity: 0.48 } },
        iconEmpty: { color: theme.palette.grey['500_16'] },
        sizeSmall: { '& svg': { ...ICON_SMALL } },
        sizeLarge: { '& svg': { ...ICON_LARGE } },
      },
    },
  };
}
