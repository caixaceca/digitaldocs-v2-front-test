import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel from '@mui/material/StepLabel';
import CheckIcon from '@mui/icons-material/Check';
import StepConnector from '@mui/material/StepConnector';

// ----------------------------------------------------------------------

const Connector = styled(StepConnector)(({ theme }) => ({
  top: 10,
  left: 'calc(-50% + 20px)',
  right: 'calc(50% + 20px)',
  '& .MuiStepConnector-line': { borderTopWidth: 2, borderColor: theme.palette.divider },
  '&.Mui-active, &.Mui-completed': { '& .MuiStepConnector-line': { borderColor: theme.palette.primary.main } },
}));

// ----------------------------------------------------------------------

Steps.propTypes = { sx: PropTypes.object, activeStep: PropTypes.number, steps: PropTypes.arrayOf(PropTypes.string) };

export default function Steps({ steps, activeStep, sx, ...other }) {
  return (
    <Stepper alternativeLabel activeStep={activeStep} connector={<Connector />} sx={{ mb: 4, ...sx }} {...other}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel StepIconComponent={StepIcon} sx={{ '& .MuiStepLabel-label': { typography: 'subtitle2', mt: 1 } }}>
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

// ----------------------------------------------------------------------

StepIcon.propTypes = { active: PropTypes.bool, completed: PropTypes.bool };

function StepIcon({ active, completed }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ mt: completed ? 0 : 0.5, color: 'text.disabled', ...(active && { color: 'primary.main' }) }}
    >
      {completed ? (
        <CheckIcon sx={{ color: 'primary.main' }} />
      ) : (
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      )}
    </Stack>
  );
}
