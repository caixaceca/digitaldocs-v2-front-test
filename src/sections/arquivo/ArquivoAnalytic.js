import PropTypes from 'prop-types';
// @mui
import { Stack, Typography, CircularProgress } from '@mui/material';
// utils
import { fNumber, fPercent } from '../../utils/formatNumber';
// components
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

ArquivoAnalytic.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  percent: PropTypes.number,
  total: PropTypes.number,
};

export default function ArquivoAnalytic({ title, total, icon = '', color = 'focus.main', percent = 100 }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: 1, minWidth: 200 }}>
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        {title?.includes('Total') ? (
          <SvgIconStyle src={icon} sx={{ color, width: 25, height: 25, position: 'absolute' }} />
        ) : (
          <Typography variant="caption" sx={{ position: 'absolute' }}>
            {fPercent(percent)}
          </Typography>
        )}

        <CircularProgress variant="determinate" value={percent} size={70} thickness={4.5} sx={{ color }} />

        <CircularProgress
          variant="determinate"
          value={100}
          size={70}
          thickness={4.55}
          sx={{ color: 'grey.50016', position: 'absolute', top: 0, left: 0 }}
        />
      </Stack>

      <Stack spacing={0.5} sx={{ ml: 2 }}>
        <Typography variant="h6">{title}</Typography>

        <Typography variant="subtitle2">{fNumber(total)}</Typography>
      </Stack>
    </Stack>
  );
}
