export const PATH_DIGITALDOCS = {
  root: '/indicadores',
  general: {
    noPath: '/',
    entidade: '/entidade',
    contratos: '/contratos',
    indicadores: '/indicadores',
  },
  filaTrabalho: {
    root: '/fila-trabalho',
    cc: '/fila-trabalho/cc/:id',
    lista: '/fila-trabalho/lista',
    processo: '/fila-trabalho/:id',
    novoProcesso: '/fila-trabalho/novo',
    procurar: '/fila-trabalho/procurar',
  },
  controle: {
    root: '/controle',
    lista: '/controle/lista',
    entrada: '/controle/:id',
    processo: '/processo/:id',
  },
  arquivo: {
    root: '/arquivo',
    lista: '/arquivo/lista',
    arquivo: '/arquivo/:id',
  },
  parametrizacao: {
    root: '/parametrizacao',
    tabs: '/parametrizacao/gestao',
    fluxo: '/parametrizacao/fluxo/:id',
    estado: '/parametrizacao/estado/:id',
    acesso: '/parametrizacao/acesso/:id',
  },
  gaji9: {
    root: '/gaji9',
    gestao: '/gaji9/gestao',
    minuta: '/gaji9/minuta/:id',
    credito: '/gaji9/credito/:id',
  },
};
