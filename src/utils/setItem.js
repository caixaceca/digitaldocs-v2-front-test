export function setDefaultBalcao(balcao, ccUo, balcoes, setBalcao, ls) {
  if (balcao || balcoes.length === 0) return;

  const balCli = localStorage.getItem(ls);
  const balcaoId = (balCli && Number(balCli)) || (ccUo?.tipo === 'Agências' && Number(ccUo.balcao)) || null;

  if (balcaoId) {
    const selectedBalcao = balcoes.find(({ id }) => id === balcaoId);
    if (selectedBalcao) setBalcao(selectedBalcao);
  }
}
