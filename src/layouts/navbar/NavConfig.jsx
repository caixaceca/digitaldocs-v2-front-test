// config
import { ambiente } from '../../config';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// assets
import { Home, Portal, Arquivo, Controle, Contrato, Dashboard, FilaTrabalho, Parametrizacao } from '../../assets';

// ---------------------------------------------------------------------------------------------------------------------

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
      {
        icon: <Home />,
        title: `Intranet${ambiente === 'teste' ? ' - Teste' : ''}`,
        path: `https://${ambiente === 'teste' ? 'intraneteste' : 'intranet'}.caixa.cv`,
      },
      {
        icon: <Portal />,
        title: `Portal do colaborador${ambiente === 'teste' ? ' - Teste' : ''}`,
        path: `https://${ambiente === 'teste' ? 'intraneteste' : 'intranet'}.caixa.cv/portal/perfil`,
      },
    ],
  },
];

export default navConfig;
