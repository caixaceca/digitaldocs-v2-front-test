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
        icon: <Arquivo />,
        title: 'Arquivo',
        path: PATH_DIGITALDOCS.arquivo.root,
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
      },
      {
        icon: <Entidade />,
        title: 'Entidades',
        path: PATH_DIGITALDOCS.general.entidade,
        roles: ['entidades-100', 'entidades-110'],
      },
      {
        icon: <Contrato />,
        title: 'Contratos',
        path: PATH_DIGITALDOCS.general.contratos,
        roles: ['contratos-100', 'contratos-110'],
      },
      { title: 'GAJi9', icon: <Contrato />, path: PATH_DIGITALDOCS.gaji9.root, roles: ['gaji9-111'] },
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
