import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { rootReducer } from './rootReducer';

// ---------------------------------------------------------------------------------------------------------------------

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

const useDispatch = () => useReduxDispatch();
const useSelector = useReduxSelector;
const { dispatch } = store;

export { store, dispatch, useDispatch, useSelector };
