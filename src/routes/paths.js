// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_DIGITALDOCS = '';

// ----------------------------------------------------------------------

export const PATH_DIGITALDOCS = {
  root: path(ROOTS_DIGITALDOCS, '/indicadores'),
  general: {
    noPath: path(ROOTS_DIGITALDOCS, '/'),
    indicadores: path(ROOTS_DIGITALDOCS, '/indicadores'),
  },
  parametrizacao: {
    root: path(ROOTS_DIGITALDOCS, '/parametrizacao'),
    tabs: path(ROOTS_DIGITALDOCS, '/parametrizacao/tabs'),
    fluxo: path(ROOTS_DIGITALDOCS, '/parametrizacao/fluxo/:id'),
    estado: path(ROOTS_DIGITALDOCS, '/parametrizacao/estado/:id'),
    acesso: path(ROOTS_DIGITALDOCS, '/parametrizacao/acesso/:id'),
  },
  processos: {
    root: path(ROOTS_DIGITALDOCS, '/processos'),
    lista: path(ROOTS_DIGITALDOCS, '/processos/lista'),
    processo: path(ROOTS_DIGITALDOCS, '/processos/:id'),
    novoProcesso: path(ROOTS_DIGITALDOCS, '/processos/novo'),
    procurar: path(ROOTS_DIGITALDOCS, '/processos/procurar'),
  },
  controle: {
    root: path(ROOTS_DIGITALDOCS, '/controle'),
    lista: path(ROOTS_DIGITALDOCS, '/controle/lista'),
    entrada: path(ROOTS_DIGITALDOCS, '/controle/:id'),
  },
  arquivo: {
    root: path(ROOTS_DIGITALDOCS, '/arquivo'),
    lista: path(ROOTS_DIGITALDOCS, '/arquivo/lista'),
    arquivo: path(ROOTS_DIGITALDOCS, '/arquivo/:id'),
  },
};
