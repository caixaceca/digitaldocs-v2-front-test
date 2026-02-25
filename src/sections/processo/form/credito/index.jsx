import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { getFromParametrizacao } from '@/redux/slices/parametrizacao';
// components
import FormInfoCredito from './form-info-credito';
import FormAnexosCredito from './form-anexos-credito';

// ---------------------------------------------------------------------------------------------------------------------

export default function ProcessoCredito({ dados }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);

  useEffect(() => {
    dispatch(getFromParametrizacao('linhas'));
    dispatch(getFromParametrizacao('componentes'));
    dispatch(getFromParametrizacao('tiposTitular'));
  }, [dispatch]);

  return (
    <Box sx={{ pt: 1 }}>
      {activeStep === 0 && <FormInfoCredito dados={dados} />}
      {activeStep === 1 && <FormAnexosCredito dados={dados} />}
    </Box>
  );
}
