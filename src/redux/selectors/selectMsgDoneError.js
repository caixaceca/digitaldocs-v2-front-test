export const selectMsgDoneError = (state) => ({
  done:
    state.gaji9.done ||
    state.intranet.done ||
    state.digitaldocs.done ||
    state.indicadores.done ||
    state.parametrizacao.done,
  error:
    state.gaji9.error ||
    state.intranet.error ||
    state.digitaldocs.error ||
    state.indicadores.error ||
    state.parametrizacao.error,
});
