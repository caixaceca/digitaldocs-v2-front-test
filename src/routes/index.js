import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// authentication modules
import { useMsal } from '@azure/msal-react';
// utils
import { format } from 'date-fns';
// redux
import { getAll } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
import { getFromIntranet, AzureIntranetHandShake, AuthenticateColaborador } from '../redux/slices/intranet';
// layouts
import IntranetLayout from '../layouts';
// components
import LoadingScreen from '../components/LoadingScreen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

export default function Router() {
  const dispatch = useDispatch();
  const { instance, accounts } = useMsal();
  const { perfil, msalProfile, accessToken } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (!msalProfile?.mail) {
      dispatch(AzureIntranetHandShake(instance, accounts));
    }
  }, [dispatch, instance, accounts, msalProfile]);

  useEffect(() => {
    if (accessToken && msalProfile?.mail) {
      dispatch(AuthenticateColaborador(accessToken, msalProfile));
    }
  }, [dispatch, accessToken, msalProfile]);

  useEffect(() => {
    if (perfil?.mail) {
      dispatch(getFromIntranet('uos', { mail: perfil?.mail }));
      dispatch(getFromIntranet('links', { mail: perfil?.mail }));
      dispatch(getFromIntranet('frase', { mail: perfil?.mail }));
      dispatch(getFromIntranet('aplicacoes', { mail: perfil?.mail }));
      dispatch(getFromIntranet('certificacao', { mail: perfil?.mail }));
      dispatch(getFromIntranet('colaboradores', { mail: perfil?.mail }));
      if (perfil?.id) {
        dispatch(getAll('fluxos', { mail: perfil?.mail, perfilId: perfil?.id }));
        dispatch(getAll('motivos', { mail: perfil?.mail, perfilId: perfil?.id }));
        dispatch(getAll('estados', { mail: perfil?.mail, perfilId: perfil?.id }));
        dispatch(getAll('ambientes', { mail: perfil?.mail, perfilId: perfil?.id }));
        dispatch(getAll('meusacessos', { mail: perfil?.mail, perfilId: perfil?.id }));
      }
      if (perfil?.colaborador?.id) {
        dispatch(getFromIntranet('colaborador', { id: perfil?.colaborador?.id, mail: perfil?.mail }));
        dispatch(
          getFromIntranet('disposicao', {
            mail: perfil?.mail,
            idColaborador: perfil?.colaborador?.id,
            data: format(new Date(), 'yyyy-MM-dd'),
          })
        );
      }
    }
  }, [dispatch, perfil]);

  return useRoutes([
    {
      path: '/',
      element: <IntranetLayout />,
      children: [
        // { element: <Navigate to="indicadores" replace />, index: true },
        { element: <Navigate to="processos" replace />, index: true },
        { path: 'indicadores', element: <Indicadores /> },
        {
          path: 'parametrizacao',
          children: [
            { element: <Navigate to="/parametrizacao/tabs" replace />, index: true },
            { path: 'tabs', element: <Parametrizacao /> },
            { path: 'fluxo/:id', element: <Fluxo /> },
            { path: 'estado/:id', element: <PerfisEstado /> },
            { path: 'acesso/:id', element: <PerfilEstadosAcessos /> },
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
const Arquivo = Loadable(lazy(() => import('../pages/Arquivo')));
const Procura = Loadable(lazy(() => import('../pages/Procura')));
const Controle = Loadable(lazy(() => import('../pages/Controle')));
const Processo = Loadable(lazy(() => import('../pages/Processo')));
const Processos = Loadable(lazy(() => import('../pages/Processos')));
const Indicadores = Loadable(lazy(() => import('../pages/Indicadores')));
const PerfisEstado = Loadable(lazy(() => import('../pages/PerfisEstado')));
const Parametrizacao = Loadable(lazy(() => import('../pages/Parametrizacao')));
const NovoEditarProcesso = Loadable(lazy(() => import('../pages/NovoEditarProcesso')));
const PerfilEstadosAcessos = Loadable(lazy(() => import('../pages/PerfilEstadosAcessos')));
