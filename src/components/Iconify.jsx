// icons
import { Icon } from '@iconify/react';
// @mui
import Box from '@mui/material/Box';

// ---------------------------------------------------------------------------------------------------------------------

export default function Iconify({ icon, sx, ...other }) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}
