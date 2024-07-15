// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// assets
import {
  Home,
  Portal,
  Arquivo,
  Controle,
  Entidade,
  Contrato,
  Dashboard,
  Processos,
  Parametrizacao,
} from '../../assets';

// ----------------------------------------------------------------------

const navConfig = [
  {
    subheader: 'Menu',
    items: [
      { title: 'Indicadores', path: PATH_DIGITALDOCS.general.indicadores, icon: <Dashboard /> },
      { title: 'Processos', path: PATH_DIGITALDOCS.processos.root, icon: <Processos /> },
      { title: 'Controle', path: PATH_DIGITALDOCS.controle.root, icon: <Controle /> },
      {
        title: 'Arquivo',
        path: PATH_DIGITALDOCS.arquivo.root,
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
        icon: <Arquivo />,
      },
      {
        title: 'Entidades',
        path: PATH_DIGITALDOCS.general.entidade,
        roles: ['entidades-100', 'entidades-110'],
        icon: <Entidade />,
      },
      {
        title: 'Contratos',
        path: PATH_DIGITALDOCS.general.contratos,
        roles: ['contratos-100', 'contratos-110'],
        icon: <Contrato />,
      },
      {
        title: 'Parametrização',
        icon: <Parametrizacao />,
        path: PATH_DIGITALDOCS.parametrizacao.root,
        roles: [
          'Todo-111',
          'Todo-110',
          'fluxo-110',
          'fluxo-111',
          'origem-110',
          'origem-111',
          'estado-110',
          'estado-111',
          'acesso-110',
          'acesso-111',
        ],
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
