// @mui
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  in: getIcon('in'),
  home: getIcon('home'),
  process: getIcon('process'),
  meu_perfil: getIcon('meu_perfil'),
  indicadores: getIcon('indicadores'),
};

const navConfig = [
  {
    subheader: 'Menu',
    items: [
      {
        title: 'Indicadores',
        path: PATH_DIGITALDOCS.general.indicadores,
        icon: ICONS.indicadores,
      },
      {
        title: 'Processos',
        path: PATH_DIGITALDOCS.processos.root,
        icon: ICONS.process,
      },
      {
        title: 'Controle',
        path: PATH_DIGITALDOCS.controle.root,
        icon: ICONS.in,
      },
      {
        title: 'Arquivo',
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
        path: PATH_DIGITALDOCS.arquivo.root,
        icon: <SvgIconStyle src={`/assets/icons/archive.svg`} sx={{ width: 1, height: 1 }} />,
      },
      {
        title: 'Parametrização',
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
          'perfilestado-110',
          'perfilestado-111',
        ],
        path: PATH_DIGITALDOCS.parametrizacao.root,
        icon: <SettingsOutlinedIcon />,
      },
    ],
  },
  {
    subheader: 'Módulos',
    items: [
      { title: 'Intranet', path: 'https://intranet.caixa.cv', icon: ICONS.home },
      { title: 'Portal do colaborador', path: 'https://intranet.caixa.cv/portal/perfil', icon: ICONS.meu_perfil },
    ],
  },
];

export default navConfig;
