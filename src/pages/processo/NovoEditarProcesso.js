import { useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
// utils
import { fYear } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getProcesso, selectAnexo, updateItem, resetItem } from '../../redux/slices/digitaldocs';
import { getFromParametrizacao, changeMeuAmbiente, getSuccess } from '../../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { SearchNotFound } from '../../components/table';
import { DialogConfirmar } from '../../components/CustomDialog';
import { Notificacao } from '../../components/NotistackProvider';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProcessoInterno, ProcessoExterno, ProcessoCredito } from '../../sections/processo/form';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

export default function NovoEditarProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { themeStretch } = useSettings();
  const isEdit = pathname.includes('edit');
  const { linhas } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);
  const { meusAmbientes, meusFluxos, meuAmbiente, meuFluxo } = useSelector((state) => state.parametrizacao);
  const { processo, isLoadingP, selectedAnexoId, isSaving, done, error } = useSelector((state) => state.digitaldocs);
  const uoOrigem = useMemo(() => uos?.find((row) => row?.id === processo?.uo_origem_id), [processo?.uo_origem_id, uos]);

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getProcesso('processo', { id, mail, perfilId, historico: false }));
    }
  }, [dispatch, perfilId, mail, id]);

  useEffect(() => {
    if (linhas?.length === 0 && meuFluxo?.iscredito) {
      dispatch(getFromParametrizacao('linhas'));
    }
  }, [dispatch, linhas, meuFluxo]);

  useEffect(() => {
    dispatch(
      getSuccess({ item: 'meuFluxo', dados: meusFluxos?.find((row) => row?.id === processo?.fluxo_id) || null })
    );
  }, [dispatch, meusFluxos, processo?.fluxo_id]);

  useEffect(() => {
    dispatch(
      changeMeuAmbiente(
        meusAmbientes?.find((row) => row?.id === processo?.estado_processo?.estado_id) ||
          meusAmbientes?.find((row) => row?.id === meuAmbiente?.id) ||
          null
      )
    );
  }, [dispatch, meuAmbiente?.id, meusAmbientes, processo?.estado_processo?.estado_id]);

  const navigateToProcess = () => {
    if (done === 'Processo adicionado' || done === 'Processo atualizado') {
      dispatch(resetItem({ item: 'processo' }));
      navigate(`${PATH_DIGITALDOCS.processos.root}/${processo?.id}`);
    }
  };

  const eliminarAnexo = () => {
    dispatch(
      updateItem('anexo', null, {
        mail,
        perfilId,
        processo: true,
        processoId: id,
        individual: 'false',
        anexo: selectedAnexoId,
        msg: 'Anexo eliminado',
      })
    );
  };

  return (
    <Page title={!isEdit ? 'Novo processo | DigitalDocs' : 'Editar processo | DigitalDocs'}>
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Notificacao done={done} error={error} afterSuccess={navigateToProcess} />
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading={!isEdit ? 'Novo processo' : 'Editar processo'}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            ...(isEdit
              ? [
                  {
                    name: processo
                      ? `${processo?.numero_entrada}${uoOrigem?.balcao ? `/${uoOrigem?.balcao}` : ''}${
                          processo?.criado_em ? `/${fYear(processo?.criado_em)}` : ''
                        }`
                      : id,
                    href: `${PATH_DIGITALDOCS.processos.root}/${id}`,
                  },
                  { name: 'Editar' },
                ]
              : [{ name: 'Novo processo' }]),
          ]}
        />
        <Card sx={{ mb: 3, p: 3 }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Autocomplete
                fullWidth
                disableClearable
                readOnly={isEdit}
                value={meuAmbiente}
                getOptionLabel={(option) => option?.nome}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => <TextField {...params} label="Estado" />}
                options={isEdit ? meusAmbientes : meusAmbientes?.filter((row) => row?.isinicial && !row?.observador)}
                onChange={(event, newValue) => {
                  dispatch(changeMeuAmbiente(newValue));
                  localStorage.setItem('meuAmbiente', newValue?.id);
                }}
              />
            </Grid>
            {(isEdit || (!isEdit && meuAmbiente?.isinicial)) && (
              <Grid item xs={12} sm={6} lg={4}>
                <Autocomplete
                  value={meuFluxo}
                  disableClearable
                  getOptionLabel={(option) => option?.assunto}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  renderInput={(params) => <TextField {...params} fullWidth label="Assunto" />}
                  options={meusFluxos?.filter((option) => option?.ativo && !option?.credito_funcionario)}
                  onChange={(event, newValue) => dispatch(getSuccess({ item: 'meuFluxo', dadaos: newValue }))}
                />
              </Grid>
            )}
          </Grid>
        </Card>
        {(!isEdit && meuAmbiente?.isinicial) ||
        (isEdit &&
          processo?.estado_processo?._lock &&
          processo?.estado_processo?.perfil_id === perfilId &&
          processo?.estado_processo?.estado_id === meuAmbiente?.id) ? (
          <>
            {isEdit && isLoadingP ? (
              <Card sx={{ p: 3 }}>
                <Skeleton sx={{ height: 150, transform: 'scale(1)', mb: 3 }} />
                <Skeleton sx={{ height: 170, transform: 'scale(1)', mb: 3 }} />
                <Skeleton sx={{ height: 200, transform: 'scale(1)' }} />
              </Card>
            ) : (
              <>
                {!meuFluxo ? (
                  <Card sx={{ p: 3 }}>
                    <SearchNotFound message="Seleciona o assunto do processo que pretendes adicionar..." />
                  </Card>
                ) : (
                  <>
                    {meuFluxo?.iscredito ? (
                      <ProcessoCredito isEdit={isEdit} processo={isEdit ? processo : null} fluxo={meuFluxo} />
                    ) : (
                      <>
                        {meuFluxo?.isinterno ? (
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

            {!!selectedAnexoId && (
              <DialogConfirmar
                isSaving={isSaving}
                handleOk={eliminarAnexo}
                desc="eliminar este anexo"
                onClose={() => dispatch(selectAnexo(null))}
              />
            )}
          </>
        ) : (
          <RoleBasedGuard
            hasContent
            showChildren
            roles={['XXXXX']}
            children={
              isEdit ? (
                <Typography sx={{ mb: 3 }}>Este estado não permite editar este processo...</Typography>
              ) : (
                <Typography sx={{ mb: 3 }}>
                  {meuAmbiente
                    ? 'Seleciona um assunto para adicionar um novo processo...'
                    : 'Seleciona um estado para adicionar um novo processo...'}
                </Typography>
              )
            }
          />
        )}
      </Container>
    </Page>
  );
}
