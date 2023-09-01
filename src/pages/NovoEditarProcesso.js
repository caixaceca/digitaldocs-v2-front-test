import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Card, Stack, Container, TextField, Skeleton, Typography, Autocomplete, CardContent } from '@mui/material';
// utils
import { fYear } from '../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, getAll } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
import { getComparator, applySort } from '../hooks/useTable';
// components
import Page from '../components/Page';
import { SearchNotFound } from '../components/table';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import { Ambiente } from '../sections/AmbienteFluxo';
import { ProcessoInterno, ProcessoExterno, ProcessoCredito } from '../sections/processo/form';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function NovoEditarProcesso() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { themeStretch } = useSettings();
  const isEdit = pathname.includes('edit');
  const [fluxo, setFluxo] = useState(null);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { processo, origens, linhas, meusAmbientes, meusFluxos, meuAmbiente, isLoadingP } = useSelector(
    (state) => state.digitaldocs
  );
  const perfilId = cc?.perfil_id;

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getItem('processo', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (mail && perfilId && origens?.length === 0 && fluxo && !fluxo?.is_interno) {
      dispatch(getAll('origens', { mail, perfilId }));
    }
  }, [dispatch, origens, fluxo, processo, perfilId, mail]);

  useEffect(() => {
    if (mail && perfilId && linhas?.length === 0 && fluxo?.is_credito) {
      dispatch(getAll('linhas', { mail, perfilId }));
    }
  }, [dispatch, linhas, fluxo, processo, perfilId, mail]);

  useEffect(() => {
    setFluxo(meusFluxos?.find((row) => row?.id === processo?.fluxo_id) || null);
  }, [meuAmbiente?.id, meusFluxos, processo?.fluxo_id]);

  return (
    <Page title={!isEdit ? 'Novo processo | DigitalDocs' : 'Editar processo | DigitalDocs'}>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Novo processo' : 'Editar processo'}
          links={
            isEdit
              ? [
                  { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
                  { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
                  {
                    name: processo
                      ? `${processo?.nentrada}${processo?.uo_origem_id ? `/${processo?.uo_origem_id}` : ''}${
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
          action={
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
              {meusAmbientes?.length > 1 && <Ambiente />}
            </Stack>
          }
          sx={{ color: 'text.secondary' }}
        />
        {(!isEdit && meuAmbiente?.is_inicial && meuAmbiente?.id !== -1) ||
        (processo?.is_lock &&
          processo?.perfil_id === cc?.perfil_id &&
          processo?.estado_atual_id === meuAmbiente?.id) ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="center">
                  <Autocomplete
                    value={fluxo}
                    getOptionLabel={(option) => option?.assunto}
                    onChange={(event, newValue) => setFluxo(newValue)}
                    options={applySort(
                      meusFluxos.filter((option) => option?.id > 0),
                      getComparator('asc', 'assunto')
                    )}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label="Assunto" sx={{ minWidth: { md: 500 } }} />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>
            {isLoadingP ? (
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
                      <SearchNotFound message="Seleciona um fluxo válido para inciar um processo..." />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {fluxo?.is_credito ? (
                      <ProcessoCredito isEdit={isEdit} selectedProcesso={processo} fluxo={fluxo} />
                    ) : (
                      <>
                        {fluxo?.is_interno ? (
                          <ProcessoInterno isEdit={isEdit} selectedProcesso={processo} fluxo={fluxo} />
                        ) : (
                          <ProcessoExterno isEdit={isEdit} selectedProcesso={processo} fluxo={fluxo} />
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
            hasContent
            roles={['XXXXX']}
            children={
              isEdit ? (
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                  Este ambiente não permite a edição deste processo...
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
