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
    contratos: path(ROOTS_DIGITALDOCS, '/contratos'),
    entidade: path(ROOTS_DIGITALDOCS, '/entidade'),
  },
  filaTrabalho: {
    root: path(ROOTS_DIGITALDOCS, '/fila-trabalho'),
    cc: path(ROOTS_DIGITALDOCS, '/fila-trabalho/cc/:id'),
    lista: path(ROOTS_DIGITALDOCS, '/fila-trabalho/lista'),
    processo: path(ROOTS_DIGITALDOCS, '/fila-trabalho/:id'),
    novoProcesso: path(ROOTS_DIGITALDOCS, '/fila-trabalho/novo'),
    procurar: path(ROOTS_DIGITALDOCS, '/fila-trabalho/procurar'),
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
  parametrizacao: {
    root: path(ROOTS_DIGITALDOCS, '/parametrizacao'),
    tabs: path(ROOTS_DIGITALDOCS, '/parametrizacao/gestao'),
    fluxo: path(ROOTS_DIGITALDOCS, '/parametrizacao/fluxo/:id'),
    estado: path(ROOTS_DIGITALDOCS, '/parametrizacao/estado/:id'),
    acesso: path(ROOTS_DIGITALDOCS, '/parametrizacao/acesso/:id'),
  },
  gaji9: {
    root: path(ROOTS_DIGITALDOCS, '/gaji9'),
    gestao: path(ROOTS_DIGITALDOCS, '/gaji9/gestao'),
    minuta: path(ROOTS_DIGITALDOCS, '/gaji9/minuta/:id'),
  },
};
