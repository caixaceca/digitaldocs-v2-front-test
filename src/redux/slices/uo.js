import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// utils
import { format, add } from 'date-fns';
import { BASEURL } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  uos: [],
};

const slice = createSlice({
  name: 'uo',
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

    getUosSuccess(state, action) {
      state.isLoading = false;
      state.uos = action.payload;
      state.niverUos = action?.payload?.filter(
        (_agencia) =>
          format(add(new Date(_agencia.aniversario), { hours: 1 }), 'MM') ===
          format(add(new Date(), { hours: 2 }), 'MM')
      );
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getUos(mail) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const options = { headers: { 'Current-Colaborador': mail } };
      const response = await axios.get(`${BASEURL}/unidade_organica`, options);
      dispatch(slice.actions.getUosSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.response?.data?.detail || 'Ocorreu um erro...'));
      await new Promise((resolve) => setTimeout(resolve, 5000));
      dispatch(slice.actions.resetError());
    }
  };
}
