import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import uoReducer from './slices/uo';
import fraseReducer from './slices/frase';
import ajudaReducer from './slices/ajuda';
import denunciaReducer from './slices/denuncia';
import aplicacaoReducer from './slices/aplicacao';
import colaboradorReducer from './slices/colaborador';
import disposicaoReducer from './slices/disposicao';
import certificacaoReducer from './slices/certificacao';
//
import digitaldocsReducer from './slices/digitaldocs';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const rootReducer = combineReducers({
  uo: uoReducer,
  frase: fraseReducer,
  ajuda: ajudaReducer,
  denuncia: denunciaReducer,
  aplicacao: aplicacaoReducer,
  // SOBRE
  certificacao: certificacaoReducer,
  disposicao: disposicaoReducer,
  // COLABORADOR
  colaborador: colaboradorReducer,
  //
  digitaldocs: digitaldocsReducer,
});

export { rootPersistConfig, rootReducer };
