import { useEffect } from 'react';
import PropTypes from 'prop-types';
// redux
import { useDispatch, useSelector } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import FormInfoCredito from './form-info-credito';
import FormAnexosCredito from './form-anexos-credito';
import FormGarantiasCredito from './form-garantias-credito';

// ---------------------------------------------------------------------------------------------------------------------

ProcessoCredito.propTypes = { onCancel: PropTypes.func, dados: PropTypes.object };

export default function ProcessoCredito({ onCancel, dados }) {
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
      {activeStep === 0 && <FormInfoCredito onCancel={onCancel} dados={dados} />}
      {activeStep === 1 && <FormGarantiasCredito />}
      {activeStep === 2 && <FormAnexosCredito dados={dados} />}
    </>
  );
}
