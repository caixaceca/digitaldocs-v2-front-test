// @mui
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel from '@mui/material/StepLabel';
import CheckIcon from '@mui/icons-material/Check';
import StepConnector from '@mui/material/StepConnector';
// redux
import { useDispatch } from '../redux/store';
import { gotoStep } from '../redux/slices/stepper';

// ---------------------------------------------------------------------------------------------------------------------

const Connector = styled(StepConnector)(({ theme }) => ({
  top: 10,
  left: 'calc(-50% + 20px)',
  right: 'calc(50% + 20px)',
  '& .MuiStepConnector-line': { borderTopWidth: 2, borderColor: theme.palette.divider },
  '&.Mui-active, &.Mui-completed': { '& .MuiStepConnector-line': { borderColor: theme.palette.primary.main } },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function Steps({ steps, activeStep, sx, ...other }) {
  const dispatch = useDispatch();

  return (
    <Stepper alternativeLabel activeStep={activeStep} connector={<Connector />} sx={{ mb: 2, pb: 2, ...sx }} {...other}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={StepIcon}
            sx={{
              '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': { typography: 'subtitle2', mt: 0.5 },
              '& .MuiStepLabel-label.Mui-completed': { fontWeight: 'normal' },
              '& MuiStepLabel-label.Mui-active': { fontWeight: 'bold' },
            }}
          >
            {index < activeStep ? (
              <Link
                color="inherit"
                underline="always"
                sx={{ cursor: 'pointer' }}
                onClick={() => dispatch(gotoStep(index))}
              >
                {label}
              </Link>
            ) : (
              label
            )}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function StepIcon({ active, completed }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        p: completed ? 0 : 0.5,
        color: 'text.disabled',
        my: completed ? 0 : 0.25,
        ...(active && { color: 'primary.main' }),
      }}
    >
      {completed ? (
        <CheckIcon sx={{ color: 'primary.main' }} />
      ) : (
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      )}
    </Stack>
  );
}
