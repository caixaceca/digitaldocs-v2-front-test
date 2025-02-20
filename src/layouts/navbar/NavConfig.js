// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// assets
import { Home, Portal, Arquivo, Controle, Contrato, Dashboard, FilaTrabalho, Parametrizacao } from '../../assets';

// ----------------------------------------------------------------------

const navConfig = [
  {
    subheader: 'Menu',
    items: [
      { title: 'Indicadores', path: PATH_DIGITALDOCS.general.indicadores, icon: <Dashboard /> },
      { title: 'Fila de trabalho', path: PATH_DIGITALDOCS.filaTrabalho.root, icon: <FilaTrabalho /> },
      { title: 'Controle', path: PATH_DIGITALDOCS.controle.root, icon: <Controle /> },
      {
        icon: <Arquivo />,
        title: 'Arquivo',
        path: PATH_DIGITALDOCS.arquivo.root,
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
      },
      { title: 'GAJ-i9', icon: <Contrato />, path: PATH_DIGITALDOCS.gaji9.root },
      {
        title: 'Parametrização',
        icon: <Parametrizacao />,
        roles: ['Todo-111', 'Todo-110'],
        path: PATH_DIGITALDOCS.parametrizacao.root,
      },
    ],
  },
  {
    subheader: 'Módulos',
    items: [
      { title: 'Intranet - Teste', path: 'https://intraneteste.caixa.cv', icon: <Home /> },
      {
        icon: <Portal />,
        title: 'Portal do colaborador - Teste',
        path: 'https://intraneteste.caixa.cv/portal/perfil',
      },
    ],
  },
];

export default navConfig;
