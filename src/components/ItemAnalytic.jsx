// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fNumber, fPercent } from '../utils/formatNumber';
// components
import { Todos } from '../assets';

// ---------------------------------------------------------------------------------------------------------------------

export default function ItemAnalytic({ title, total, color = 'focus.main', percent = 100 }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: 1, minWidth: 200 }}>
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        {title?.includes('Total') ? (
          <Box sx={{ color, width: 24, height: 24, position: 'absolute', '& svg': { width: '100%', height: '100%' } }}>
            <Todos />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ position: 'absolute' }}>
            {fPercent(percent)}
          </Typography>
        )}

        <CircularProgress variant="determinate" value={percent} size={70} thickness={4.5} sx={{ color }} />

        <CircularProgress
          size={70}
          value={100}
          thickness={4.55}
          variant="determinate"
          sx={{ color: 'grey.500_16', position: 'absolute', top: 0, left: 0 }}
        />
      </Stack>

      <Stack spacing={0.5} sx={{ ml: 2 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          {fNumber(total)}
        </Typography>
      </Stack>
    </Stack>
  );
}
