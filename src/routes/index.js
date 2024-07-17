import { useMsal } from '@azure/msal-react';
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// utils
import { format } from 'date-fns';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
import { getFromIntranet, acquireToken, authenticateColaborador } from '../redux/slices/intranet';
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
  const { cc, perfil, mail, msalProfile, accessToken } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (instance && accounts?.[0]) {
      dispatch(acquireToken(instance, accounts[0]));
    }
  }, [accounts, dispatch, instance]);

  useEffect(() => {
    if (accessToken && msalProfile?.mail) {
      dispatch(authenticateColaborador(accessToken, msalProfile));
    }
  }, [dispatch, accessToken, msalProfile]);

  useEffect(() => {
    if (mail && perfil?.colaborador?.id) {
      dispatch(getFromIntranet('cc', { id: perfil?.colaborador?.id, mail: perfil?.mail }));
    }
  }, [dispatch, perfil?.colaborador?.id, mail, perfil?.mail]);

  useEffect(() => {
    if (perfil?.mail && perfil?.id && cc?.id) {
      dispatch(getFromIntranet('uos', { mail: perfil?.mail }));
      dispatch(getFromIntranet('links', { mail: perfil?.mail }));
      dispatch(getFromIntranet('frase', { mail: perfil?.mail }));
      dispatch(getFromIntranet('aplicacoes', { mail: perfil?.mail }));
      dispatch(getFromIntranet('certificacao', { mail: perfil?.mail }));
      dispatch(getFromIntranet('colaboradores', { mail: perfil?.mail }));
      dispatch(getFromParametrizacao('fluxos', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(getFromParametrizacao('origens', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(getFromParametrizacao('motivos', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(getFromParametrizacao('estados', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(getFromParametrizacao('ambientes', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(getFromParametrizacao('meusacessos', { mail: perfil?.mail, perfilId: perfil?.id }));
      dispatch(
        getFromIntranet('disposicao', { mail: perfil?.mail, id: cc?.id, data: format(new Date(), 'yyyy-MM-dd') })
      );
    }
  }, [dispatch, cc?.id, perfil?.mail, perfil?.id]);

  return useRoutes([
    {
      path: '/',
      element: <IntranetLayout />,
      children: [
        // { element: <Navigate to="indicadores" replace />, index: true },
        { element: <Navigate to="processos" replace />, index: true },
        { path: 'indicadores', element: <Indicadores /> },
        { path: 'entidade', element: <Entidade /> },
        { path: 'contratos', element: <Contrato /> },
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
            { path: 'cc/:id', element: <CreditoColaborador /> },
            { path: ':id/editar', element: <NovoEditarProcesso /> },
            { path: 'cc/:id/editar', element: <EditarPedidoCC /> },
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
const Contrato = Loadable(lazy(() => import('../pages/Contrato')));
const Entidade = Loadable(lazy(() => import('../pages/Entidade')));
const Controle = Loadable(lazy(() => import('../pages/Controle')));
const Processo = Loadable(lazy(() => import('../pages/Processo')));
const Processos = Loadable(lazy(() => import('../pages/Processos')));
const Indicadores = Loadable(lazy(() => import('../pages/Indicadores')));
const PerfisEstado = Loadable(lazy(() => import('../pages/PerfisEstado')));
const Parametrizacao = Loadable(lazy(() => import('../pages/Parametrizacao')));
const EditarPedidoCC = Loadable(lazy(() => import('../pages/EditarPedidoCC')));
const CreditoColaborador = Loadable(lazy(() => import('../pages/CreditoColaborador')));
const NovoEditarProcesso = Loadable(lazy(() => import('../pages/NovoEditarProcesso')));
const PerfilEstadosAcessos = Loadable(lazy(() => import('../pages/PerfilEstadosAcessos')));
