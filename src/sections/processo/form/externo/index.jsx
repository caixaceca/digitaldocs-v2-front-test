// @mui
import Box from '@mui/material/Box';
// redux
import { useSelector } from '../../../../redux/store';
// components
import FormOperacao from './form-info-externo';
import FormAnexosExterno from './form-anexos-externo';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoExterno({ dados }) {
  const { activeStep } = useSelector((state) => state.stepper);

  return (
    <Box sx={{ pt: 1 }}>
      {activeStep === 0 && <FormOperacao dados={dados} />}
      {activeStep === 1 && <FormAnexosExterno dados={dados} />}
    </Box>
  );
}
