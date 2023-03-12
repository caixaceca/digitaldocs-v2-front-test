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
    origens: path(ROOTS_DIGITALDOCS, '/origens'),
    motivos: path(ROOTS_DIGITALDOCS, '/motivos'),
  },
  estados: {
    root: path(ROOTS_DIGITALDOCS, '/estados'),
    lista: path(ROOTS_DIGITALDOCS, '/estados/lista'),
    estado: path(ROOTS_DIGITALDOCS, '/estados/:id'),
  },
  fluxos: {
    root: path(ROOTS_DIGITALDOCS, '/fluxos'),
    lista: path(ROOTS_DIGITALDOCS, '/fluxos/lista'),
    fluxo: path(ROOTS_DIGITALDOCS, '/fluxos/:id'),
  },
  estadosAcessos: {
    root: path(ROOTS_DIGITALDOCS, '/acessos'),
    perfis: path(ROOTS_DIGITALDOCS, '/acessos/lista'),
    estadosAcesso: path(ROOTS_DIGITALDOCS, '/acessos/:id'),
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
