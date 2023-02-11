import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// authentication modules
import { useMsal } from '@azure/msal-react';
// utils
import { format } from 'date-fns';
// layouts
import IntranetLayout from '../layouts';
// config
// import { PATH_AFTER_LOGIN } from '../config';
// components
import LoadingScreen from '../components/LoadingScreen';
// redux
import { useDispatch, useSelector } from '../redux/store';
import {
  getColaboradores,
  getCurrentColaborador,
  AzureIntranetHandShake,
  AuthenticateColaborador,
} from '../redux/slices/colaborador';
import { getUos } from '../redux/slices/uo';
import { getAll } from '../redux/slices/digitaldocs';
import { getFraseAtiva } from '../redux/slices/frase';
import { getDisposicao } from '../redux/slices/disposicao';
import { getMyAplicacoes } from '../redux/slices/aplicacao';
import { getCertificacoes } from '../redux/slices/certificacao';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

export default function Router() {
  const dispatch = useDispatch();
  const { instance, accounts } = useMsal();
  const { perfil, msalProfile, accessToken } = useSelector((state) => state.colaborador);

  useEffect(() => {
    if (!msalProfile?.mail) {
      dispatch(AzureIntranetHandShake(instance, accounts));
    }
  }, [dispatch, instance, accounts, msalProfile]);

  useEffect(() => {
    if (accessToken && msalProfile) {
      dispatch(AuthenticateColaborador(accessToken, msalProfile));
    }
  }, [dispatch, accessToken, msalProfile]);

  useEffect(() => {
    if (perfil?.mail) {
      dispatch(getUos(perfil?.mail));
      dispatch(getFraseAtiva(perfil?.mail));
      dispatch(getMyAplicacoes(perfil?.mail));
      dispatch(getCertificacoes(perfil?.mail));
      dispatch(getColaboradores(perfil?.mail));
      if (perfil?.id) {
        dispatch(getAll('ambientes', { mail: perfil?.mail, perfilId: perfil?.id }));
        dispatch(getAll('meusacessos', { mail: perfil?.mail, perfilId: perfil?.id }));
      }
      if (perfil?.colaborador?.id) {
        dispatch(getCurrentColaborador(perfil?.colaborador?.id, perfil?.mail));
        dispatch(getDisposicao(perfil?.colaborador?.id, format(new Date(), 'yyyy-MM-dd'), perfil?.mail));
      }
    }
  }, [dispatch, perfil]);

  return useRoutes([
    {
      path: '/',
      element: <IntranetLayout />,
      children: [
        { element: <Navigate to="indicadores" replace />, index: true },
        { path: 'indicadores', element: <Indicadores /> },
        {
          path: 'estados',
          children: [
            { element: <Navigate to="/estados/lista" replace />, index: true },
            { path: 'lista', element: <Estados /> },
            { path: ':id', element: <PerfisEstado /> },
          ],
        },
        { path: 'origens', element: <Origens /> },
        {
          path: 'fluxos',
          children: [
            { element: <Navigate to="/fluxos/lista" replace />, index: true },
            { path: 'lista', element: <Fluxos /> },
            { path: ':id', element: <Fluxo /> },
          ],
        },
        {
          path: 'processos',
          children: [
            { element: <Navigate to="/processos/lista" replace />, index: true },
            { path: ':id', element: <Processo /> },
            { path: 'lista', element: <Processos /> },
            { path: 'procurar', element: <Procura /> },
            { path: 'novo', element: <NovoEditarProcesso /> },
            { path: ':id/editar', element: <NovoEditarProcesso /> },
          ],
        },
        {
          path: 'controle',
          children: [
            { element: <Navigate to="/controle/lista" replace />, index: true },
            { path: 'lista', element: <Controle /> },
            { path: ':id', element: <Processo /> },
          ],
        },
        {
          path: 'arquivo',
          children: [
            { element: <Navigate to="/arquivo/lista" replace />, index: true },
            { path: 'lista', element: <Arquivo /> },
            { path: ':id', element: <Processo /> },
          ],
        },
        {
          path: 'acessos',
          children: [
            { element: <Navigate to="/acessos/perfis" replace />, index: true },
            { path: 'perfis', element: <Perfis /> },
            { path: ':id', element: <PerfilEstadosAcessos /> },
          ],
        },
      ],
    },

    { path: '404', element: <NotFound /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT PAGES

const NotFound = Loadable(lazy(() => import('../pages/excecoes/Page404')));

// //////////////////////////////////////////////// DIGITALDOCS //////////////////////////////////////////////

const Fluxo = Loadable(lazy(() => import('../pages/Fluxo')));
const Perfis = Loadable(lazy(() => import('../pages/Perfis')));
const Fluxos = Loadable(lazy(() => import('../pages/Fluxos')));
const Arquivo = Loadable(lazy(() => import('../pages/Arquivo')));
const Origens = Loadable(lazy(() => import('../pages/Origens')));
const Estados = Loadable(lazy(() => import('../pages/Estados')));
const Procura = Loadable(lazy(() => import('../pages/Procura')));
const Controle = Loadable(lazy(() => import('../pages/Controle')));
const Processo = Loadable(lazy(() => import('../pages/Processo')));
const Processos = Loadable(lazy(() => import('../pages/Processos')));
const Indicadores = Loadable(lazy(() => import('../pages/Indicadores')));
const PerfisEstado = Loadable(lazy(() => import('../pages/PerfisEstado')));
const NovoEditarProcesso = Loadable(lazy(() => import('../pages/NovoEditarProcesso')));
const PerfilEstadosAcessos = Loadable(lazy(() => import('../pages/PerfilEstadosAcessos')));
