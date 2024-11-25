import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// utils
import { fYear } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao } from '../../redux/slices/parametrizacao';
import { getFromCC, updateItemCC, closeModalAnexo } from '../../redux/slices/cc';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { SearchNotFound404 } from '../../components/table';
import { DialogConfirmar } from '../../components/CustomDialog';
import { Notificacao } from '../../components/NotistackProvider';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import {
  PedidoSteps,
  DadosGerais,
  PedidoCompleto,
  AnexosProcesso,
  GarantiasCredito,
  Responsabilidades,
  DespesasProponente,
  EntidadesRelacionadas,
} from '../../sections/credito-colaborador/Form';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const STEPS = ['Dados Gerais', 'Anexos', 'Despesas', 'Responsabilidades', 'Garantias', 'Entidades'];

// ----------------------------------------------------------------------

export default function EditarPedidoCC() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { isLoading, pedidoCC, activeStep, tipoItem, garantiaId, entidadeId, itemId, isSaving, done, error } =
    useSelector((state) => state.cc);
  const completed = activeStep === STEPS.length;

  useEffect(() => {
    dispatch(getFromCC('pedido cc', { id }));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getFromCC('despesas'));
    dispatch(getFromCC('anexos ativos'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFromParametrizacao('linhas'));
  }, [dispatch]);

  useEffect(() => {
    if (pedidoCC?.fluxo_id) {
      dispatch(getFromCC('anexos processo', { fluxoId: pedidoCC?.fluxo_id }));
    }
  }, [dispatch, pedidoCC?.fluxo_id]);

  const handleConfirmeDelete = async () => {
    try {
      dispatch(
        updateItemCC(tipoItem, null, {
          itemId,
          entidadeId,
          garantiaId,
          processoId: pedidoCC?.id,
          msg: `${tipoItem?.includes('anexo') ? 'Anexo' : 'Item'} eliminado`,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  const handleCancel = () => {
    dispatch(closeModalAnexo());
  };

  const goToDetail = () => {
    navigate(`${PATH_DIGITALDOCS.filaTrabalho.root}/cc/${id}`);
  };

  return (
    <Page title="Editar pedido">
      <Notificacao
        done={done}
        error={error}
        afterSuccess={() => {
          if (done === 'Pedido atualizado') {
            goToDetail();
          }
        }}
      />
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Editar pedido"
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.profilaTrabalhocessos.root },
            {
              name: pedidoCC
                ? `${pedidoCC?.n_entrada}${pedidoCC?.criado_em ? `/${fYear(pedidoCC?.criado_em)}` : ''}`
                : id,
              href: `${PATH_DIGITALDOCS.filaTrabalho.root}/cc/${id}`,
            },
            { name: 'Editar' },
          ]}
          action=""
        />
        <PedidoSteps activeStep={activeStep} steps={STEPS} />
        {isLoading ? (
          <Card sx={{ mb: 3 }}>
            <Skeleton variant="text" sx={{ height: perfilId ? 550 : 350, transform: 'none' }} />
          </Card>
        ) : (
          <>
            {pedidoCC ? (
              <>
                {pedidoCC?.preso && pedidoCC?.perfil_id === perfilId ? (
                  <>
                    {completed ? (
                      <PedidoCompleto isEdit />
                    ) : (
                      <>
                        {activeStep === 0 && <DadosGerais dados={pedidoCC} />}
                        {activeStep === 1 && <AnexosProcesso anexos={pedidoCC?.anexos} />}
                        {activeStep === 2 && <DespesasProponente despesasReg={pedidoCC?.despesas} />}
                        {activeStep === 3 && <Responsabilidades responsabilidades={pedidoCC?.outros_creditos} />}
                        {activeStep === 4 && <GarantiasCredito garantias={pedidoCC?.garantias} />}
                        {activeStep === 5 && <EntidadesRelacionadas entidades={pedidoCC?.entidades} />}
                      </>
                    )}
                  </>
                ) : (
                  <RoleBasedGuard
                    hasContent
                    showChildren
                    roles={['XXXXX']}
                    children={
                      <Typography sx={{ color: 'text.secondary' }}>
                        Este processo não pertence a nenhum dos teus estados, ou tens de o aceitar primeiro...
                      </Typography>
                    }
                  />
                )}
              </>
            ) : (
              <SearchNotFound404 message="Pedido de crédito não encontrada..." />
            )}
            {!!itemId && (
              <DialogConfirmar
                isSaving={isSaving}
                onClose={handleCancel}
                handleOk={() => handleConfirmeDelete()}
                title={`Eliminar ${tipoItem?.includes('anexo') ? 'anexo' : tipoItem}`}
                desc={`eliminar ${tipoItem?.includes('anexo') ? 'este anexo' : `esta ${tipoItem}`}`}
              />
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
