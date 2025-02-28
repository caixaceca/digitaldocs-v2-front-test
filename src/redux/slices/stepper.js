import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = { activeStep: 0, dadosStepper: null };

const slice = createSlice({
  name: 'stepper',
  initialState,
  reducers: {
    forwardStep(state) {
      state.activeStep += 1;
    },
    gotoStep(state, action) {
      state.activeStep = action.payload;
    },
    backStep(state) {
      state.activeStep -= 1;
    },
    resetStep(state) {
      state.activeStep = 0;
    },
    resetDados(state) {
      state.activeStep = 0;
      state.dadosStepper = null;
    },
    updateDados(state, action) {
      if (action.payload.forward) state.activeStep += 1;
      if (action.payload.backward) state.activeStep -= 1;
      state.dadosStepper = { ...state.dadosStepper, ...action.payload.dados };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { forwardStep, gotoStep, backStep, resetDados, resetStep, updateDados } = slice.actions;
