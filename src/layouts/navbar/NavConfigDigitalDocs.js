// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  in: getIcon('in'),
  flow: getIcon('flow'),
  home: getIcon('home'),
  state: getIcon('state'),
  origin: getIcon('origin'),
  process: getIcon('process'),
  transition: getIcon('transition'),
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
        title: 'Fluxos',
        roles: ['fluxo-110', 'fluxo-111', 'Todo-110', 'Todo-111'],
        path: PATH_DIGITALDOCS.fluxos.root,
        icon: ICONS.flow,
      },
      {
        title: 'Estados',
        roles: ['estado-110', 'estado-111', 'Todo-110', 'Todo-111'],
        path: PATH_DIGITALDOCS.estados.root,
        icon: ICONS.state,
      },
      {
        title: 'Acessos',
        roles: ['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111'],
        path: PATH_DIGITALDOCS.estadosAcessos.root,
        icon: <SvgIconStyle src="/assets/icons/group-add.svg" sx={{ width: 1, height: 1 }} />,
      },
      {
        title: 'Origens',
        roles: ['origem-110', 'origem-111', 'Todo-110', 'Todo-111'],
        path: PATH_DIGITALDOCS.general.origens,
        icon: ICONS.origin,
      },
      {
        title: 'Motivos',
        roles: ['Todo-110', 'Todo-111'],
        path: PATH_DIGITALDOCS.general.motivos,
        icon: ICONS.transition,
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
