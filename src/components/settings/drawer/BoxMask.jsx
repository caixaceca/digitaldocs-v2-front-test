// @mui
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

export default function BoxMask({ value }) {
  return (
    <FormControlLabel
      label=""
      value={value}
      control={<Radio sx={{ display: 'none' }} />}
      sx={{ m: 0, top: 0, right: 0, bottom: 0, left: 0, position: 'absolute' }}
    />
  );
}
