import { combineReducers } from 'redux';
// slices
import gaji9Reducer from './slices/gaji9';
import stepperReducer from './slices/stepper';
import intranetReducer from './slices/intranet';
import suporteReducer from './slices/suporte-cliente';
import digitaldocsReducer from './slices/digitaldocs';
import indicadorestReducer from './slices/indicadores';
import parametrizacaoReducer from './slices/parametrizacao';

// ---------------------------------------------------------------------------------------------------------------------

const rootReducer = combineReducers({
  gaji9: gaji9Reducer,
  suporte: suporteReducer,
  stepper: stepperReducer,
  intranet: intranetReducer,
  digitaldocs: digitaldocsReducer,
  indicadores: indicadorestReducer,
  parametrizacao: parametrizacaoReducer,
});

export { rootReducer };
