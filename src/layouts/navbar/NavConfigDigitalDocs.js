// @mui
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
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
      { title: 'Indicadores', path: PATH_DIGITALDOCS.general.indicadores, icon: ICONS.indicadores },
      { title: 'Processos', path: PATH_DIGITALDOCS.processos.root, icon: ICONS.process },
      { title: 'Controle', path: PATH_DIGITALDOCS.controle.root, icon: ICONS.in },
      {
        title: 'Arquivo',
        path: PATH_DIGITALDOCS.arquivo.root,
        roles: ['arquivo-100', 'arquivo-110', 'arquivo-111'],
        icon: <SvgIconStyle src={`/assets/icons/archive.svg`} sx={{ width: 1, height: 1 }} />,
      },
      {
        title: 'Entidades',
        path: PATH_DIGITALDOCS.general.entidade,
        roles: ['entidades-100', 'entidades-110'],
        icon: <ContactsOutlinedIcon />,
      },
      {
        title: 'Parametrização',
        icon: <SettingsOutlinedIcon />,
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
      { title: 'Intranet - Teste', path: 'https://intraneteste.caixa.cv', icon: ICONS.home },
      {
        icon: ICONS.meu_perfil,
        title: 'Portal do colaborador - Teste',
        path: 'https://intraneteste.caixa.cv/portal/perfil',
      },
    ],
  },
];

export default navConfig;
