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
        title: 'Arquivo',
        icon: <Arquivo />,
        path: PATH_DIGITALDOCS.arquivo.root,
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
      },
      { title: 'GAJ-i9', icon: <Contrato />, roles: ['gaji9-100'], path: PATH_DIGITALDOCS.gaji9.root },
      {
        roles: ['Todo-111'],
        title: 'Parametrização',
        icon: <Parametrizacao />,
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
