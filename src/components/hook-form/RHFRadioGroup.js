import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

RHFRadioGroup.propTypes = {
  name: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.string),
  getOptionLabel: PropTypes.arrayOf(PropTypes.string),
};

export default function RHFRadioGroup({ name, options, required, getOptionLabel, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <RadioGroup {...field} row {...other}>
            {options.map((option, index) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio required={required} />}
                label={getOptionLabel?.length ? getOptionLabel[index] : option}
              />
            ))}
          </RadioGroup>

          {!!error && (
            <FormHelperText error sx={{ px: 2 }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}
