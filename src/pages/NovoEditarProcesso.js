import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Card, Stack, Container, TextField, Autocomplete, CardContent } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, getAll } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import { SearchNotFound } from '../components/table';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
// sections
import Ambiente from '../sections/digitaldocs/Ambiente';
import ProcessoInterno from '../sections/digitaldocs/processo/form/ProcessoInterno';
import ProcessoExterno from '../sections/digitaldocs/processo/form/ProcessoExterno';
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
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { processo, origens, meusAmbientes, meusFluxos, meuAmbiente } = useSelector((state) => state.digitaldocs);
  const perfilId = currentColaborador?.perfil_id;

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
    if (processo?.fluxo_id) {
      setFluxo({ id: processo?.fluxo_id, assunto: processo?.assunto, is_interno: processo?.is_interno });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo?.fluxo_id]);

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
                  { name: processo?.referencia || id, href: `${PATH_DIGITALDOCS.processos.root}/${id}` },
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
        {(!isEdit && meuAmbiente?.is_inicial) ||
        (processo?.is_lock && processo?.perfil_id === currentColaborador?.perfil_id) ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="center">
                  <Autocomplete
                    value={fluxo}
                    onChange={(event, newValue) => setFluxo(newValue)}
                    options={meusFluxos.map((option) => option?.id > 0 && option)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    getOptionLabel={(option) => option?.assunto}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label="Assunto" sx={{ minWidth: { md: 500 } }} />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>
            {!fluxo ? (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <SearchNotFound message="Seleciona um fluxo válido para inciar um processo..." />
                </CardContent>
              </Card>
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
        ) : (
          <RoleBasedGuard hasContent roles={['XXXXX']} />
        )}
      </Container>
    </Page>
  );
}
