import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  done: '',
  error: false,
  isOpenDenuncia: false,
};

const slice = createSlice({
  name: 'denuncia',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetError(state) {
      state.isLoading = false;
      state.error = false;
    },

    done(state, action) {
      state.isLoading = false;
      state.done = action.payload;
    },

    resetDone(state) {
      state.isLoading = false;
      state.done = '';
    },

    openDenuncia(state) {
      state.isOpenDenuncia = true;
    },

    closeDenuncia(state) {
      state.isOpenDenuncia = false;
      state.selectedDenunciaId = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { openDenuncia, closeDenuncia } = slice.actions;

// ----------------------------------------------------------------------

export function createDenuncia(denuncia, mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = {
        headers: {
          'content-type': 'multipart/form-data',
          'Current-Colaborador': mail,
        },
      };
      await axios.post(`${BASEURL}/denuncia`, denuncia, options);
      dispatch(slice.actions.done('enviada'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(slice.actions.resetDone());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}
