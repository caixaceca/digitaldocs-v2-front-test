import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import ccReducer from './slices/cc';
import bankaReducer from './slices/banka';
import intranetReducer from './slices/intranet';
import digitaldocsReducer from './slices/digitaldocs';
import indicadorestReducer from './slices/indicadores';
import parametrizacaoReducer from './slices/parametrizacao';

// ----------------------------------------------------------------------

const rootPersistConfig = { key: 'root', storage, keyPrefix: 'redux-', whitelist: [] };

const rootReducer = combineReducers({
  cc: ccReducer,
  banka: bankaReducer,
  intranet: intranetReducer,
  digitaldocs: digitaldocsReducer,
  indicadores: indicadorestReducer,
  parametrizacao: parametrizacaoReducer,
});

export { rootPersistConfig, rootReducer };
