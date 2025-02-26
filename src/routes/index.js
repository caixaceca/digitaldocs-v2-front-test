import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { geParamsUtil } from '../redux/slices/parametrizacao';
import { authenticateColaborador, getFromIntranet, getInfoIntranet } from '../redux/slices/intranet';
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
  const { cc, perfil, perfilId } = useSelector((state) => state.intranet);

  useEffect(() => {
    dispatch(authenticateColaborador());
  }, [dispatch]);

  useEffect(() => {
    if (perfil?.colaborador?.id) dispatch(getFromIntranet('cc', { id: perfil?.colaborador?.id }));
  }, [dispatch, perfil?.colaborador?.id]);

  useEffect(() => {
    if (cc?.id) dispatch(getInfoIntranet(cc?.id));
  }, [dispatch, cc?.id]);

  useEffect(() => {
    if (perfilId) dispatch(geParamsUtil());
  }, [dispatch, perfilId]);

  return useRoutes([
    {
      path: '/',
      element: <IntranetLayout />,
      children: [
        { element: <Navigate to="fila-trabalho" replace />, index: true },
        { path: 'indicadores', element: <PageIndicadores /> },
        {
          path: 'fila-trabalho',
          children: [
            { element: <Navigate to="/fila-trabalho/lista" replace />, index: true },
            { path: ':id', element: <PageProcesso /> },
            { path: 'lista', element: <PageFilaTrabalho /> },
            { path: 'procurar', element: <PageProcura /> },
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

const Controle = Loadable(lazy(() => import('../pages/page-controle')));
const PageNotFound = Loadable(lazy(() => import('../pages/page-not-found')));

// ------------------------------------------------------ PROCESSO -----------------------------------------------------

const PageArquivo = Loadable(lazy(() => import('../pages/processo/page-arquivo')));
const PageProcura = Loadable(lazy(() => import('../pages/processo/page-procura')));
const PageIndicadores = Loadable(lazy(() => import('../pages/processo/page-indicadores')));
const PageFilaTrabalho = Loadable(lazy(() => import('../pages/processo/page-fila-trabalho')));
const PageProcesso = Loadable(lazy(() => import('../pages/processo/page-detalhes-processo')));

// --------------------------------------------------- PARAMETRIZAÇÃO --------------------------------------------------

const PageAcessosPerfil = Loadable(lazy(() => import('../pages/parametrizacao/page-perfil-acessos')));
const PageDetalhesFluxo = Loadable(lazy(() => import('../pages/parametrizacao/page-detalhes-fluxo')));
const PageParametrizacao = Loadable(lazy(() => import('../pages/parametrizacao/page-parametrizacao')));
const PageDetalhesEstado = Loadable(lazy(() => import('../pages/parametrizacao/page-detalhes-estado')));

// ------------------------------------------------------- GAJ-i9 ------------------------------------------------------

const PageGaji9Gestao = Loadable(lazy(() => import('../pages/gaji9/page-gaji9-gestao')));
const PageMinutaDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-minuta-detalhes')));
const PageCreditoDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-credito-detalhes')));
