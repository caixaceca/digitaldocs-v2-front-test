import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CardContent from '@mui/material/CardContent';
// utils
import { fYear } from '../utils/formatTime';
// redux
import { getItem } from '../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { SearchNotFound } from '../components/table';
import { Notificacao } from '../components/NotistackProvider';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import { Ambiente } from '../sections/AmbienteFluxo';
import { ProcessoInterno, ProcessoExterno, ProcessoCredito } from '../sections/processo/form';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function NovoEditarProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { themeStretch } = useSettings();
  const isEdit = pathname.includes('edit');
  const [fluxo, setFluxo] = useState(null);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { linhas } = useSelector((state) => state.parametrizacao);
  const { processo, isLoadingP, done, error } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, meusFluxos, meuAmbiente } = useSelector((state) => state.parametrizacao);
  const perfilId = cc?.perfil_id;

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getItem('processo', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (mail && perfilId && linhas?.length === 0 && fluxo?.is_credito) {
      dispatch(getFromParametrizacao('linhas', { mail, perfilId }));
    }
  }, [dispatch, linhas, fluxo, processo, perfilId, mail]);

  useEffect(() => {
    setFluxo(meusFluxos?.find((row) => row?.id === processo?.fluxo_id) || null);
  }, [meuAmbiente?.id, meusFluxos, processo?.fluxo_id]);

  const navigateToProcess = () => {
    if (done === 'Processo adicionado' || done === 'Processo atualizado') {
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processo?.id}`);
    }
  };

  return (
    <Page title={!isEdit ? 'Novo processo | DigitalDocs' : 'Editar processo | DigitalDocs'}>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={navigateToProcess} />
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          action={meusAmbientes?.length > 1 && <Ambiente />}
          heading={!isEdit ? 'Novo processo' : 'Editar processo'}
          links={
            isEdit
              ? [
                  { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
                  { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
                  {
                    name: processo
                      ? `${processo?.numero_entrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
                          processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                        }`
                      : id,
                    href: `${PATH_DIGITALDOCS.processos.root}/${id}`,
                  },
                  { name: 'Editar' },
                ]
              : [
                  { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
                  { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
                  { name: 'Novo processo' },
                ]
          }
        />
        {(!isEdit && meuAmbiente?.is_inicial && meuAmbiente?.id !== -1) ||
        (processo?.preso && processo?.perfil_id === cc?.perfil_id && processo?.estado_atual_id === meuAmbiente?.id) ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="center">
                  <Autocomplete
                    value={fluxo}
                    disableClearable
                    getOptionLabel={(option) => option?.assunto}
                    onChange={(event, newValue) => setFluxo(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    options={meusFluxos.filter((option) => option?.id > 0 && option?.assunto !== 'Crédito Colaborador')}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label="Assunto" sx={{ minWidth: { md: 500 } }} />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>
            {isEdit && isLoadingP ? (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Skeleton sx={{ height: 150, transform: 'scale(1)', mb: 3 }} />
                  <Skeleton sx={{ height: 170, transform: 'scale(1)', mb: 3 }} />
                  <Skeleton sx={{ height: 200, transform: 'scale(1)' }} />
                </CardContent>
              </Card>
            ) : (
              <>
                {!fluxo ? (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <SearchNotFound message="Seleciona o fluxo para o processo pretendido..." />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {fluxo?.is_credito ? (
                      <ProcessoCredito isEdit={isEdit} selectedProcesso={isEdit ? processo : null} fluxo={fluxo} />
                    ) : (
                      <>
                        {fluxo?.is_interno ? (
                          <ProcessoInterno isEdit={isEdit} selectedProcesso={isEdit ? processo : null} fluxo={fluxo} />
                        ) : (
                          <ProcessoExterno isEdit={isEdit} selectedProcesso={isEdit ? processo : null} fluxo={fluxo} />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <RoleBasedGuard
            apChild
            hasContent
            roles={['XXXXX']}
            children={
              isEdit ? (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Este ambiente não permite editar este processo...
                </Typography>
              ) : (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Este ambiente não permite a criação de processos, selecione outro ambiente...
                </Typography>
              )
            }
          />
        )}
      </Container>
    </Page>
  );
}
