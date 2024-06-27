import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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
import { getFromParametrizacao, changeMeuAmbiente, changeMeuFluxo } from '../redux/slices/parametrizacao';
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { linhas } = useSelector((state) => state.parametrizacao);
  const { processo, isLoadingP, done, error } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes, meusFluxos, meuAmbiente, meuFluxo } = useSelector((state) => state.parametrizacao);
  const perfilId = cc?.perfil_id;

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getItem('processo', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (mail && perfilId && linhas?.length === 0 && meuFluxo?.is_credito) {
      dispatch(getFromParametrizacao('linhas', { mail, perfilId }));
    }
  }, [dispatch, linhas, meuFluxo, perfilId, mail]);

  useEffect(() => {
    dispatch(changeMeuFluxo(meusFluxos?.find((row) => row?.id === processo?.fluxo_id) || null));
  }, [dispatch, meusFluxos, processo?.fluxo_id]);

  useEffect(() => {
    dispatch(
      changeMeuAmbiente(
        meusAmbientes?.find((row) => row?.id === processo?.estados?.[0]?.estado_id) ||
          meusAmbientes?.find((row) => row?.id === meuAmbiente?.id) ||
          null
      )
    );
  }, [dispatch, meuAmbiente?.id, meusAmbientes, processo?.estados]);

  const navigateToProcess = () => {
    if (done === 'Processo adicionado' || done === 'Processo atualizado') {
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processo?.id}`);
    }
  };

  const changeAmbiente = (newValue) => {
    dispatch(changeMeuAmbiente(newValue));
    localStorage.setItem('meuAmbiente', newValue?.id);
  };

  const changeFluxo = (newValue) => {
    dispatch(changeMeuFluxo(newValue));
  };

  return (
    <Page title={!isEdit ? 'Novo processo | DigitalDocs' : 'Editar processo | DigitalDocs'}>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={navigateToProcess} />
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} lg={4}>
                <Autocomplete
                  fullWidth
                  disableClearable
                  readOnly={isEdit}
                  value={meuAmbiente}
                  getOptionLabel={(option) => option?.nome}
                  onChange={(event, newValue) => changeAmbiente(newValue)}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  renderInput={(params) => <TextField {...params} label="Estado" />}
                  options={isEdit ? meusAmbientes : meusAmbientes?.filter((row) => row?.is_inicial)}
                />
              </Grid>
              {(isEdit || (!isEdit && meuAmbiente?.is_inicial)) && (
                <Grid item xs={12} sm={6} lg={4}>
                  <Autocomplete
                    value={meuFluxo}
                    disableClearable
                    getOptionLabel={(option) => option?.assunto}
                    onChange={(event, newValue) => changeFluxo(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => <TextField {...params} fullWidth label="Assunto" />}
                    options={meusFluxos?.filter((option) => option?.assunto !== 'Crédito Colaborador')}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
        {(!isEdit && meuAmbiente?.is_inicial) ||
        (processo?.preso &&
          processo?.perfil_id === cc?.perfil_id &&
          processo?.estados?.[0]?.estado_id === meuAmbiente?.id) ? (
          <>
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
                {!meuFluxo ? (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <SearchNotFound message="Seleciona o assunto do processo que pretendes criar..." />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {meuFluxo?.is_credito ? (
                      <ProcessoCredito isEdit={isEdit} processo={isEdit ? processo : null} fluxo={meuFluxo} />
                    ) : (
                      <>
                        {meuFluxo?.is_interno ? (
                          <ProcessoInterno isEdit={isEdit} processo={isEdit ? processo : null} fluxo={meuFluxo} />
                        ) : (
                          <ProcessoExterno isEdit={isEdit} processo={isEdit ? processo : null} fluxo={meuFluxo} />
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
                  Este estado não permite editar este processo...
                </Typography>
              ) : (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Seleciona um estado válido para criar um processo...
                </Typography>
              )
            }
          />
        )}
      </Container>
    </Page>
  );
}
