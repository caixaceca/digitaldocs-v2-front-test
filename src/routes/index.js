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
    if (accessToken && msalProfile) {
      dispatch(authenticateColaborador(accessToken, msalProfile));
    }
  }, [dispatch, accessToken, msalProfile]);

  useEffect(() => {
    if (mail && perfil?.colaborador?.id && accessToken) {
      dispatch(getFromIntranet('cc', { id: perfil?.colaborador?.id, mail }));
      dispatch(getFromIntranet('colaboradores', { mail, accessToken }));
    }
  }, [dispatch, perfil?.colaborador?.id, mail, accessToken]);

  useEffect(() => {
    if (mail && perfil?.id && cc?.id) {
      dispatch(getFromIntranet('uos', { mail }));
      dispatch(getFromIntranet('links', { mail }));
      dispatch(getFromIntranet('frase', { mail }));
      dispatch(getFromIntranet('aplicacoes', { mail }));
      dispatch(getFromIntranet('certificacao', { mail }));
      //
      dispatch(getFromParametrizacao('fluxos'));
      dispatch(getFromParametrizacao('origens'));
      dispatch(getFromParametrizacao('estados'));
      dispatch(getFromParametrizacao('meusacessos'));
      dispatch(getFromParametrizacao('meusambientes'));
      dispatch(getFromParametrizacao('motivosPendencia'));
      dispatch(getFromIntranet('disposicao', { mail, id: cc?.id, data: format(new Date(), 'yyyy-MM-dd') }));
    }
  }, [dispatch, cc?.id, mail, perfil?.id]);

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
        {
          path: 'parametrizacao',
          children: [
            { element: <Navigate to="/parametrizacao/gestao" replace />, index: true },
            { path: 'gestao', element: <Parametrizacao /> },
            { path: 'fluxo/:id', element: <FluxoDetail /> },
            { path: 'estado/:id', element: <EstadoDetail /> },
            { path: 'acesso/:id', element: <PerfilEstadosAcessos /> },
          ],
        },
        {
          path: 'gaji9',
          children: [
            { element: <Navigate to="/gaji9/acessos" replace />, index: true },
            { path: 'acessos', element: <Gaji9 /> },
          ],
        },
      ],
    },

    { path: '404', element: <NotFound /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT PAGES

const NotFound = Loadable(lazy(() => import('../pages/Page404')));

// //////////////////////////////////////////////// PAGES //////////////////////////////////////////////

const Contrato = Loadable(lazy(() => import('../pages/Contrato')));
const Entidade = Loadable(lazy(() => import('../pages/Entidade')));
const Controle = Loadable(lazy(() => import('../pages/Controle')));

// Processo
const Arquivo = Loadable(lazy(() => import('../pages/processo/Arquivo')));
const Procura = Loadable(lazy(() => import('../pages/processo/Procura')));
const Processo = Loadable(lazy(() => import('../pages/processo/Processo')));
const Processos = Loadable(lazy(() => import('../pages/processo/Processos')));
const Indicadores = Loadable(lazy(() => import('../pages/processo/Indicadores')));
const EditarPedidoCC = Loadable(lazy(() => import('../pages/processo/EditarPedidoCC')));
const CreditoColaborador = Loadable(lazy(() => import('../pages/processo/CreditoColaborador')));
const NovoEditarProcesso = Loadable(lazy(() => import('../pages/processo/NovoEditarProcesso')));

// Parametrização
const FluxoDetail = Loadable(lazy(() => import('../pages/parametrizacao/FluxoDetail')));
const EstadoDetail = Loadable(lazy(() => import('../pages/parametrizacao/EstadoDetail')));
const Parametrizacao = Loadable(lazy(() => import('../pages/parametrizacao/Parametrizacao')));
const PerfilEstadosAcessos = Loadable(lazy(() => import('../pages/parametrizacao/PerfilEstadosAcessos')));

// Gaji9
const Gaji9 = Loadable(lazy(() => import('../pages/gaji9/Gaji9')));
