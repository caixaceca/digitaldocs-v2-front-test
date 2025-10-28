import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import gaji9Reducer from './slices/gaji9';
import stepperReducer from './slices/stepper';
import intranetReducer from './slices/intranet';
import suporteReducer from './slices/suporte-cliente';
import digitaldocsReducer from './slices/digitaldocs';
import indicadorestReducer from './slices/indicadores';
import parametrizacaoReducer from './slices/parametrizacao';

// ---------------------------------------------------------------------------------------------------------------------

const rootPersistConfig = { key: 'root', storage, keyPrefix: 'redux-', whitelist: [] };

const rootReducer = combineReducers({
  gaji9: gaji9Reducer,
  suporte: suporteReducer,
  stepper: stepperReducer,
  intranet: intranetReducer,
  digitaldocs: digitaldocsReducer,
  indicadores: indicadorestReducer,
  parametrizacao: parametrizacaoReducer,
});

export { rootPersistConfig, rootReducer };
