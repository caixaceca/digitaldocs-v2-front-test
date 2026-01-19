// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { fData } from '../../utils/formatNumber';
import { getFileThumb } from '../../utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

export default function FileDescription({ file, size = false, sx }) {
  const isNotFormatFile = typeof file === 'string';

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{ px: 1.5, py: 0.75, borderRadius: 0.75, border: (theme) => `solid 1px ${theme.palette.divider}`, ...sx }}
    >
      <Stack>{getFileThumb(false, null, file.name)}</Stack>

      <Stack>
        <Typography variant="subtitle2">{isNotFormatFile ? file : file.name}</Typography>

        {size && !isNotFormatFile && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fData(file.size)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
