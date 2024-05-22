import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel from '@mui/material/StepLabel';
import CheckIcon from '@mui/icons-material/Check';
import LoadingButton from '@mui/lab/LoadingButton';
import StepConnector from '@mui/material/StepConnector';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// redux
import { backStep } from '../../../redux/slices/cc';
import { useSelector, useDispatch } from '../../../redux/store';

// ----------------------------------------------------------------------

const Connector = styled(StepConnector)(({ theme }) => ({
  top: 10,
  left: 'calc(-50% + 20px)',
  right: 'calc(50% + 20px)',
  '& .MuiStepConnector-line': { borderTopWidth: 2, borderColor: theme.palette.divider },
  '&.Mui-active, &.Mui-completed': { '& .MuiStepConnector-line': { borderColor: theme.palette.primary.main } },
}));

// ----------------------------------------------------------------------

PedidoSteps.propTypes = {
  sx: PropTypes.object,
  activeStep: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.string),
};

export default function PedidoSteps({ steps, activeStep, sx, ...other }) {
  return (
    <Stepper alternativeLabel activeStep={activeStep} connector={<Connector />} sx={{ mb: 5, ...sx }} {...other}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel StepIconComponent={StepIcon} sx={{ '& .MuiStepLabel-label': { typography: 'subtitle2' } }}>
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
      sx={{ width: 24, height: 24, color: 'text.disabled', ...(active && { color: 'primary.main' }) }}
    >
      {completed ? (
        <CheckIcon sx={{ color: 'primary.main' }} />
      ) : (
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

NextPrev.propTypes = { back: PropTypes.bool };

export function NextPrev({ back = false }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.cc);

  const handleBack = () => {
    dispatch(backStep());
  };

  return (
    <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
      {back ? (
        <Button
          variant="soft"
          color="inherit"
          onClick={handleBack}
          startIcon={<ArrowBackIosIcon sx={{ width: 15, height: 15 }} />}
        >
          Voltar
        </Button>
      ) : (
        <Stack> </Stack>
      )}
      <LoadingButton
        type="submit"
        loading={isSaving}
        variant="contained"
        endIcon={<ArrowForwardIosIcon sx={{ width: 15, height: 15 }} />}
      >
        Seguinte
      </LoadingButton>
    </Stack>
  );
}
