import { useEffect } from 'react';
import PropTypes from 'prop-types';
// redux
import { useDispatch, useSelector } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import FormInfoCredito from './form-info-credito';
import FormAnexosCredito from './form-anexos-credito';
import GarantiasProcesso from './form-garantias-credito';

// ---------------------------------------------------------------------------------------------------------------------

ProcessoCredito.propTypes = { dados: PropTypes.object };

export default function ProcessoCredito({ dados }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);

  useEffect(() => {
    dispatch(getFromParametrizacao('linhas'));
    dispatch(getFromParametrizacao('componentes'));
    dispatch(getFromParametrizacao('tiposTitular'));
    dispatch(getFromParametrizacao('tiposGarantia'));
  }, [dispatch]);

  return (
    <>
      {activeStep === 0 && <FormInfoCredito dados={dados} />}
      {activeStep === 1 && <GarantiasProcesso />}
      {activeStep === 2 && <FormAnexosCredito dados={dados} />}
    </>
  );
}
