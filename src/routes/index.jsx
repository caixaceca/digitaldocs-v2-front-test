import { useSnackbar } from 'notistack';
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// config
import { localVersion } from '../config';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { geParamsUtil } from '../redux/slices/parametrizacao';
import { authenticateColaborador, getFromIntranet, getInfoIntranet } from '../redux/slices/intranet';
// layouts
import IntranetLayout from '../layouts';
// components
import LoadingScreen from '../components/LoadingScreen';

// ---------------------------------------------------------------------------------------------------------------------

const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

export default function Router() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { cc, perfil, perfilId } = useSelector((state) => state.intranet);

  useEffect(() => {
    fetch('/meta.json', { cache: 'no-store' })
      .then((res) => res.json())
      .then((meta) => {
        if (meta.version && meta.version !== localVersion) {
          enqueueSnackbar('Aplicação atualizada', { variant: 'success' });
          window.location.reload();
        }
      })
      .catch((err) => console.warn('Erro ao verificar versão da aplicação:', err));
  }, [enqueueSnackbar]);

  useEffect(() => {
    dispatch(authenticateColaborador());
  }, [dispatch]);

  useEffect(() => {
    if (perfil?.colaborador_id) dispatch(getFromIntranet('cc', { id: perfil?.colaborador_id }));
  }, [dispatch, perfil?.colaborador_id]);

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
        { path: 'indicadores', element: <Indicadores /> },
        {
          path: 'fila-trabalho',
          children: [
            { element: <Navigate to="/fila-trabalho/lista" replace />, index: true },
            { path: ':id', element: <Processo /> },
            { path: 'lista', element: <FilaTrabalho /> },
            { path: 'procurar', element: <Procura /> },
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
            { path: 'fluxo/:id', element: <DetalhesFluxo /> },
            { path: 'estado/:id', element: <DetalhesEstado /> },
            { path: 'acesso/:id', element: <AcessosPerfil /> },
          ],
        },
        {
          path: 'gaji9',
          children: [
            { element: <Navigate to="/gaji9/gestao" replace />, index: true },
            { path: 'gestao', element: <Gaji9Gestao /> },
            { path: 'minuta/:id', element: <MinutaDetalhes /> },
            { path: 'credito/:id', element: <CreditoDetalhes /> },
          ],
        },
      ],
    },

    { path: '404', element: <NotFound /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// ------------------------------------------------------- PAGES -------------------------------------------------------

const Controle = Loadable(lazy(() => import('../pages/page-controle')));
const NotFound = Loadable(lazy(() => import('../pages/page-not-found')));

// ------------------------------------------------------ PROCESSO -----------------------------------------------------

const Arquivo = Loadable(lazy(() => import('../pages/processo/page-arquivo')));
const Procura = Loadable(lazy(() => import('../pages/processo/page-procura')));
const Indicadores = Loadable(lazy(() => import('../pages/processo/page-indicadores')));
const FilaTrabalho = Loadable(lazy(() => import('../pages/processo/page-fila-trabalho')));
const Processo = Loadable(lazy(() => import('../pages/processo/page-detalhes-processo')));

// --------------------------------------------------- PARAMETRIZAÇÃO --------------------------------------------------

const AcessosPerfil = Loadable(lazy(() => import('../pages/parametrizacao/page-perfil-acessos')));
const DetalhesFluxo = Loadable(lazy(() => import('../pages/parametrizacao/page-detalhes-fluxo')));
const Parametrizacao = Loadable(lazy(() => import('../pages/parametrizacao/page-parametrizacao')));
const DetalhesEstado = Loadable(lazy(() => import('../pages/parametrizacao/page-detalhes-estado')));

// ------------------------------------------------------- GAJ-i9 ------------------------------------------------------

const Gaji9Gestao = Loadable(lazy(() => import('../pages/gaji9/page-gaji9-gestao')));
const MinutaDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-minuta-detalhes')));
const CreditoDetalhes = Loadable(lazy(() => import('../pages/gaji9/page-credito-detalhes')));
