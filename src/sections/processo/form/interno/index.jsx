// @mui
import Box from '@mui/material/Box';
// redux
import { useSelector } from '../../../../redux/store';
// components
import FormInfoInterno from './form-info-interno';
import FormAnexosInterno from './form-anexos-interno';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoInterno({ dados }) {
  const { activeStep } = useSelector((state) => state.stepper);

  return (
    <Box sx={{ pt: 1 }}>
      {activeStep === 0 && <FormInfoInterno dados={dados} />}
      {activeStep === 1 && <FormAnexosInterno dados={dados} />}
    </Box>
  );
}
