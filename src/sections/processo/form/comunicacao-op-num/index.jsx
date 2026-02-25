// @mui
import Box from '@mui/material/Box';
// redux
import { useSelector } from '@/redux/store';
// components
import FormOperacao from './form-operacao';
import FormAnexosCON from './form-anexos-con';
import FormDepositante from './form-depositante';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoCON({ dados }) {
  const { activeStep } = useSelector((state) => state.stepper);

  return (
    <Box sx={{ pt: 1 }}>
      {activeStep === 0 && <FormOperacao dados={dados} />}
      {activeStep === 1 && <FormDepositante dados={dados} />}
      {activeStep === 2 && <FormAnexosCON dados={dados} />}
    </Box>
  );
}
