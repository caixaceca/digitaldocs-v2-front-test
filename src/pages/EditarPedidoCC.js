/* eslint-disable no-constant-condition */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// utils
import { fYear } from '../utils/formatTime';
// redux
import { getFromCC } from '../redux/slices/cc';
import { useDispatch, useSelector } from '../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { SearchNotFound404 } from '../components/table';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import PedidoForm from '../sections/credito-colaborador/Form/PedidoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function EditarPedidoCC() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isLoading, pedidoCC } = useSelector((state) => state.cc);

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getFromCC('pedido cc', { id, perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, id, cc?.perfil_id, mail]);

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getFromCC('despesas', { mail }));
      dispatch(getFromCC('anexos ativos', { mail }));
      dispatch(getFromCC('linhas', { perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    if (mail && pedidoCC?.fluxo_id) {
      dispatch(getFromCC('anexos processo', { mail, fluxoId: pedidoCC?.fluxo_id }));
    }
  }, [dispatch, pedidoCC?.fluxo_id, mail]);

  return (
    <Page title="Editar pedido">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Editar pedido"
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            {
              name: pedidoCC
                ? `${pedidoCC?.n_entrada}${pedidoCC?.uo_id ? `/${pedidoCC?.uo_id}` : ''}${
                    pedidoCC?.criado_em ? `/${fYear(pedidoCC?.criado_em)}` : ''
                  }`
                : id,
              href: `${PATH_DIGITALDOCS.processos.root}/cc/${id}`,
            },
            { name: 'Editar' },
          ]}
          action=""
        />
        {isLoading ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton sx={{ height: 150, transform: 'scale(1)', mb: 3 }} />
              <Skeleton sx={{ height: 170, transform: 'scale(1)', mb: 3 }} />
              <Skeleton sx={{ height: 200, transform: 'scale(1)' }} />
            </CardContent>
          </Card>
        ) : (
          <>
            {pedidoCC ? (
              <>
                {/* {pedidoCC?.preso && pedidoCC?.perfil_id === cc?.perfil_id ? ( */}
                {2 / 2 === 1 ? (
                  <PedidoForm dados={pedidoCC} />
                ) : (
                  <RoleBasedGuard
                    hasContent
                    roles={['XXXXX']}
                    children={
                      <Typography sx={{ color: 'text.secondary' }}>
                        O processo não te pertence ou tens de o aceitar primeiro...
                      </Typography>
                    }
                  />
                )}
              </>
            ) : (
              <SearchNotFound404 message="Pedido de crédito não encontrada..." />
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
