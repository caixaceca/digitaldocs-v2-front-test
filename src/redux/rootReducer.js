import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import intranetReducer from './slices/intranet';
//
import digitaldocsReducer from './slices/digitaldocs';

// ----------------------------------------------------------------------

const rootPersistConfig = { key: 'root', storage, keyPrefix: 'redux-', whitelist: [] };

const rootReducer = combineReducers({ intranet: intranetReducer, digitaldocs: digitaldocsReducer });

export { rootPersistConfig, rootReducer };
