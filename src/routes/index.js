import { useMsal } from '@azure/msal-react';
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// utils
import { format } from 'date-fns';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
import { getFromIntranet, acquireTokenAuthenticate } from '../redux/slices/intranet';
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
  const { cc, perfil, mail, perfilId, accessToken } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (instance && accounts?.[0]) {
      dispatch(acquireTokenAuthenticate(instance, accounts[0]));
    }
  }, [accounts, dispatch, instance]);

  useEffect(() => {
    if (perfil?.colaborador?.id && accessToken) {
      dispatch(getFromIntranet('cc', { id: perfil?.colaborador?.id }));
      dispatch(getFromIntranet('colaboradores', { accessToken }));
    }
  }, [dispatch, perfil?.colaborador?.id, accessToken]);

  useEffect(() => {
    if (cc?.id) {
      dispatch(getFromIntranet('frase'));
      dispatch(getFromIntranet('certificacoes'));
      dispatch(getFromIntranet('uos', { label: 'label' }));
      dispatch(getFromIntranet('links', { label: 'nome' }));
      dispatch(getFromIntranet('minhasAplicacoes', { label: 'nome' }));
      dispatch(getFromIntranet('disposicao', { id: cc?.id, data: format(new Date(), 'yyyy-MM-dd') }));
    }
  }, [dispatch, cc?.id]);

  useEffect(() => {
    if (mail && perfilId) {
      dispatch(getFromParametrizacao('fluxos'));
      dispatch(getFromParametrizacao('origens'));
      dispatch(getFromParametrizacao('estados'));
      dispatch(getFromParametrizacao('meusacessos'));
      dispatch(getFromParametrizacao('meusambientes'));
      dispatch(getFromParametrizacao('motivosPendencia'));
    }
  }, [dispatch, mail, perfilId]);

  return useRoutes([
    {
      path: '/',
      element: <IntranetLayout />,
      children: [
        { element: <Navigate to="fila-trabalho" replace />, index: true },
        { path: 'indicadores', element: <PageIndicadores /> },
        { path: 'entidade', element: <Entidade /> },
        { path: 'contratos', element: <Contrato /> },
        {
          path: 'fila-trabalho',
          children: [
            { element: <Navigate to="/fila-trabalho/lista" replace />, index: true },
            { path: ':id', element: <PageProcesso /> },
            { path: 'lista', element: <PageFilaTrabalho /> },
            { path: 'procurar', element: <PageProcura /> },
            { path: 'novo', element: <PageNovoEditarProcesso /> },
            { path: 'cc/:id', element: <PageCreditoColaborador /> },
            { path: ':id/editar', element: <PageNovoEditarProcesso /> },
            { path: 'cc/:id/editar', element: <PageEditarPedidoCC /> },
          ],
        },
        {
          path: 'controle',
          children: [
            { element: <Navigate to="/controle/lista" replace />, index: true },
            { path: 'lista', element: <Controle /> },
            { path: ':id', element: <PageProcesso /> },
          ],
        },
        {
          path: 'arquivo',
          children: [
            { element: <Navigate to="/arquivo/lista" replace />, index: true },
            { path: 'lista', element: <PageArquivo /> },
            { path: ':id', element: <PageProcesso /> },
          ],
        },
        {
          path: 'parametrizacao',
          children: [
            { element: <Navigate to="/parametrizacao/gestao" replace />, index: true },
            { path: 'gestao', element: <PageParametrizacao /> },
            { path: 'fluxo/:id', element: <PageDetalhesFluxo /> },
            { path: 'estado/:id', element: <PageDetalhesEstado /> },
            { path: 'acesso/:id', element: <PageAcessosPerfil /> },
          ],
        },
        {
          path: 'gaji9',
          children: [
            { element: <Navigate to="/gaji9/gestao" replace />, index: true },
            { path: 'gestao', element: <PageGaji9Gestao /> },
            { path: 'minuta/:id', element: <PageMinutaDetalhes /> },
            { path: 'credito/:id', element: <PageCreditoDetalhes /> },
          ],
        },
      ],
    },

    { path: '404', element: <PageNotFound /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// ------------------------------------------------------- PAGES -------------------------------------------------------

const PageNotFound = Loadable(lazy(() => import('../pages/PageNotFound')));

const Contrato = Loadable(lazy(() => import('../pages/Contrato')));
const Entidade = Loadable(lazy(() => import('../pages/Entidade')));
const Controle = Loadable(lazy(() => import('../pages/Controle')));

// ------------------------------------------------------ PROCESSO -----------------------------------------------------
const PageArquivo = Loadable(lazy(() => import('../pages/processo/PageArquivo')));
const PageProcura = Loadable(lazy(() => import('../pages/processo/PageProcura')));
const PageProcesso = Loadable(lazy(() => import('../pages/processo/PageProcesso')));
const PageIndicadores = Loadable(lazy(() => import('../pages/processo/PageIndicadores')));
const PageFilaTrabalho = Loadable(lazy(() => import('../pages/processo/PageFilaTrabalho')));
const PageEditarPedidoCC = Loadable(lazy(() => import('../pages/processo/PageEditarPedidoCC')));
const PageCreditoColaborador = Loadable(lazy(() => import('../pages/processo/PageCreditoColaborador')));
const PageNovoEditarProcesso = Loadable(lazy(() => import('../pages/processo/PageNovoEditarProcesso')));

// --------------------------------------------------- PARAMETRIZAÇÃO --------------------------------------------------

const PageAcessosPerfil = Loadable(lazy(() => import('../pages/parametrizacao/PageAcessosPerfil')));
const PageDetalhesFluxo = Loadable(lazy(() => import('../pages/parametrizacao/PageDetalhesFluxo')));
const PageDetalhesEstado = Loadable(lazy(() => import('../pages/parametrizacao/PageDetalhesEstado')));
const PageParametrizacao = Loadable(lazy(() => import('../pages/parametrizacao/PageParametrizacao')));

// ------------------------------------------------------- GAJ-i9 ------------------------------------------------------

const PageGaji9Gestao = Loadable(lazy(() => import('../pages/gaji9/page-gaji9-gestao')));
const PageMinutaDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-minuta-detalhes')));
const PageCreditoDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-credito-detalhes')));
