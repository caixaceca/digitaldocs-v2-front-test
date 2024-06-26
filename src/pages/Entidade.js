import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
// utils
import { dataPadraoPt } from '../utils/formatTime';
// hooks
import useSettings from '../hooks/useSettings';
import { getComparator, applySort } from '../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromBanka, changeNumEntidade } from '../redux/slices/banka';
// components
import Page from '../components/Page';
import { SearchAdornment } from '../components/Actions';
import { SkeletonEntidade } from '../components/skeleton';
import { TabsWrapperSimple } from '../components/TabsWrapper';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchNotFound, SearchNotFound404 } from '../components/table';
// sections
import { EntidadeCover } from '../sections/sobre/PerfilCover';

// ----------------------------------------------------------------------

export default function Entidade() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { mail, cc } = useSelector((state) => state.intranet);
  const [currentTab, setCurrentTab] = useState('Dados gerais');
  const { numEntidade, entidade, dadosComValores, isLoading } = useSelector((state) => state.banka);
  const [numero, setNumero] = useState(numEntidade);
  const tabsList = [
    { value: 'Dados gerais' },
    { value: 'Morada/Contactos' },
    { value: 'Documentos' },
    { value: 'Caracterizações' },
  ];
  const documentos = entidade?.listaDocumentos || [];
  const moradasContactos = entidade?.listaInfoMorada || [];
  const caraterizacoes = applySort(
    dadosComValores
      ? entidade?.listaCaracterizacoes?.filter((item) => item.valorDosElementosCaracterizacao) || []
      : entidade?.listaCaracterizacoes || [],
    getComparator('desc', 'valorDosElementosCaracterizacao')
  );

  useEffect(() => {
    if (mail && cc?.perfil_id && numEntidade) {
      dispatch(getFromBanka('entidade', { mail, perfilId: cc?.perfil_id, numEntidade }));
    }
  }, [dispatch, cc?.perfil_id, numEntidade, mail]);

  const changeNumero = () => {
    dispatch(changeNumEntidade(numero));
  };

  return (
    <Page title="Informações de Entidade | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          sx={{ color: 'text.secondary' }}
          heading="Informações de Entidade"
          links={[{ name: '', href: '' }]}
          action={
            <TextField
              value={numero}
              label="Nº de entidade"
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  changeNumero();
                }
              }}
              onChange={(event) => setNumero(event.target.value)}
              InputProps={{ endAdornment: numero && <SearchAdornment handleClick={changeNumero} /> }}
            />
          }
        />
        <Grid container spacing={3} justifyContent="center">
          {isLoading ? (
            <SkeletonEntidade />
          ) : (
            <>
              {entidade ? (
                <>
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'success.main' }}>
                      <EntidadeCover entidade={entidade} numero={numEntidade} />
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <TabsWrapperSimple
                      tabsList={tabsList}
                      currentTab={currentTab}
                      changeTab={(event, newValue) => setCurrentTab(newValue)}
                    />
                  </Grid>
                  {currentTab === 'Dados gerais' && (
                    <>
                      <CardDetail title="Informações pessoais">
                        <CardInfo
                          label="Nome"
                          value={[
                            { label: 'Completo', value: entidade?.nomeDaEntidade },
                            { label: 'Sem título', value: entidade?.nomeSemTitulo },
                            { label: 'Reduzido', value: entidade?.nomeReduzido },
                          ]}
                        />
                        <CardInfo
                          label="Filhação"
                          value={[
                            { label: 'Pai', value: entidade?.nomeDoPai },
                            { label: 'Mãe', value: entidade?.nomeDaMae },
                          ]}
                        />
                        <CardInfo
                          label="Sexo"
                          value={[
                            { label: 'Código', value: entidade?.sexo },
                            { label: 'Descritivo', value: entidade?.descritivoSexo },
                          ]}
                        />
                        <CardInfo
                          label="Estado civil"
                          value={[
                            { label: 'Código', value: entidade?.estadoCivil },
                            { label: 'Descritivo', value: entidade?.descritivoEstadoCivil },
                          ]}
                        />
                        <CardInfo
                          label="Nascimento"
                          value={[
                            { label: 'Data de nascimento', value: entidade?.dataDeNascimento },
                            { label: 'Naturalidade', value: entidade?.naturalidade },
                            { label: 'Nacionalidade', value: entidade?.nacionalidade },
                            { label: 'Descritivo nacionalidade', value: entidade?.descritivoNacionalidade },
                          ]}
                        />
                        <CardInfo
                          label="Agregado familiar"
                          value={[
                            { label: 'Nº de elementos', value: entidade?.numeroDeElementosAgregadoFamiliar },
                            { label: 'Nº de filhos', value: entidade?.numeroDeFilhos },
                            { label: 'Regime casamento', value: entidade?.regimeDeCasamento },
                            { label: 'Descritivo regime', value: entidade?.descritivoRegimeDeCasamento },
                            { label: 'Nome conjuge', value: entidade?.nomeDoConjuge },
                            { label: 'Nº entidade conjuge', value: entidade?.numeroTitularDoConjuge },
                          ]}
                        />
                        <CardInfo
                          label="Identificação"
                          value={[
                            { label: 'Tipo', value: entidade?.tipoDeDocumentoDeIdentificacao },
                            { label: 'Descritivo', value: entidade?.descritivoTipoDeDocumento },
                            { label: 'Número', value: entidade?.numeroDeDocumentoDeIdentificacao },
                            { label: 'Ref. emissão', value: entidade?.referenciaDeEmissao },
                            { label: 'Data emissão', value: entidade?.dataDeEmissao },
                            { label: 'Data validação', value: entidade?.dataDeValidadeDoDocumento },
                            { label: 'Com imagem', value: entidade?.documentoComImagem },
                            { label: 'Check digit', value: entidade?.checkDigitDaIdentificacao },
                          ]}
                        />
                        <CardInfo
                          label="Identificação secundária"
                          value={[
                            { label: 'Tipo', value: entidade?.tipoDeDocumentoDeIdentificacaoSecundario },
                            { label: 'Descritivo', value: entidade?.descritivoTipoDeDocumentoSecundario },
                            { label: 'Número', value: entidade?.numeroDeDocumentoDeIdentificacaoSecundario },
                            { label: 'Ref. emissão', value: entidade?.referenciaDeEmissaoSecundario },
                            { label: 'Data emissão', value: entidade?.dataDeEmissaoSecundario },
                            { label: 'Data validação', value: entidade?.dataDeValidadeDoDocumentoSecundario },
                            { label: 'Com imagem', value: entidade?.documentoComImagemSecundario },
                            { label: 'Check digit', value: entidade?.checkDigitDaIdentificacaoSecundario },
                          ]}
                        />
                        <CardInfo
                          label="Morada"
                          value={[
                            { label: 'Morada', value: entidade?.morada },
                            { label: 'Morada 1', value: entidade?.moradaSegundoLinha },
                            { label: 'Código País', value: entidade?.codigoDePais },
                            { label: 'Descritivo País', value: entidade?.descritivoPais },
                            { label: 'Código postal', value: entidade?.codigoPostal },
                            { label: 'Descritivo código postal', value: entidade?.descritivoCodigoPostal },
                          ]}
                        />
                        <CardInfo
                          label="Contacto"
                          value={[
                            { label: 'Email', value: entidade?.email },
                            { label: 'Recebe email', value: entidade?.recebeEmail },
                            { label: 'Contacto 1', value: entidade?.contactoPrimario },
                            { label: 'Contacto 2', value: entidade?.contactoSecundario },
                            { label: 'Contacto 3', value: entidade?.contactoTres },
                            { label: 'Telefone 1', value: entidade?.telefonePrimario },
                            { label: 'Telefone 2', value: entidade?.telefoneSecundario },
                            { label: 'Telefone 3', value: entidade?.segundoTelefoneSecundario },
                            { label: 'Recebe SMS', value: entidade?.recebeSms },
                            { label: 'Telefone para recessão SMS', value: entidade?.telefoneParaEnvioSms },
                          ]}
                        />
                        <CardInfo
                          label="Habilitações"
                          value={[
                            { label: 'Código', value: entidade?.habilitacoes },
                            { label: 'Descritivo', value: entidade?.descritivoHabilitacoes },
                          ]}
                        />
                      </CardDetail>
                      <CardDetail title="Informações de negócio">
                        <CardInfo value={[{ label: 'Com alertas', value: entidade?.comAlertas }]} />
                        <CardInfo value={[{ label: 'Com bloqueio', value: entidade?.comBloqueios }]} />
                        <CardInfo
                          label="Registo"
                          value={[
                            { label: 'Data abertura', value: entidade?.dataDeAberturaEntidade },
                            { label: 'Data última atualização', value: entidade?.dataDeUltimaAlteracaoEntidade },
                          ]}
                        />
                        <CardInfo
                          label="Tipo de entidade"
                          value={[
                            { label: 'Código', value: entidade?.tipoDeEntidade },
                            { label: 'Descritivo', value: entidade?.descritivoTipoDeEntidade },
                          ]}
                        />
                        <CardInfo
                          label="Setorial"
                          value={[
                            { label: 'Código', value: entidade?.codigoSectorial },
                            { label: 'Descritivo', value: entidade?.descritivoSectorial },
                          ]}
                        />
                        <CardInfo
                          label="Residencia"
                          value={[
                            { label: 'Código', value: entidade?.codigoDeResidencia },
                            { label: 'Descritivo', value: entidade?.descritivoResidencia },
                          ]}
                        />
                        <CardInfo
                          label="Atividade profissional"
                          value={[
                            { label: 'Código', value: entidade?.actividadeProfissional },
                            { label: 'Descritivo', value: entidade?.descritivoActividadeProfissional },
                            { label: 'Profissão', value: entidade?.profissao },
                            { label: 'Descritivo profissão', value: entidade?.descritivoProfissao },
                            { label: 'Categoria fiscal', value: entidade?.categoriaFiscal },
                            { label: 'Descritivo categoria', value: entidade?.descritivoCategoriaFiscal },
                            { label: 'Entidade patronal', value: entidade?.entidadePatronal },
                            { label: 'Cargo/Função', value: entidade?.funcaoOuCargo },
                            { label: 'Rendimento anual', value: entidade?.rendimentoAnual },
                            { label: 'Moeda rend. anual', value: entidade?.moedaRendimentoAnual },
                            { label: 'Obs rend. anual', value: entidade?.textoDeAjudaRendimentoAnual },
                            { label: 'Rendimento mensal', value: entidade?.rendimentoMensalActual },
                            { label: 'Moeda rend. mensal', value: entidade?.moedaRendimentoMensalActual },
                            { label: 'Obs rend. mensal', value: entidade?.textoDeAjudaRendimentoMensal },
                            { label: 'Encargos mensais', value: entidade?.encargosMensais },
                            { label: 'Moeda encargos', value: entidade?.moedaEncargosMensais },
                            { label: 'Obs encargos', value: entidade?.textoDeAjudaEncargosMensais },
                          ]}
                        />
                        <CardInfo
                          label="Atividade empresarial"
                          value={[
                            { label: 'Nº matricula', value: entidade?.numeroDeMatriculaDaConservatoria },
                            { label: 'Nome', value: entidade?.nomeDaConservatoria },
                            { label: 'Nº publicação BO', value: entidade?.numeroDePublicacaoDoDiarioOficial },
                            { label: 'Data admissão', value: entidade?.dataDeAdmissao },
                            { label: 'Tipo do sociedade', value: entidade?.tipoDeSociedade },
                            { label: 'Descritivo do tipo', value: entidade?.descritivoTipoDeSociedade },
                            { label: 'Cód. ativ. económica', value: entidade?.codigoDeActividadeEconomica },
                            { label: 'Descritivo da atividade', value: entidade?.descritivoActividadeEconomica },
                            {
                              label: 'Cód. ativ. económica sec.',
                              value: entidade?.codigoDeActividadeEconomicaSecundario,
                            },
                            {
                              label: 'Descritivo da atividade',
                              value: entidade?.descritivoActividadeEconomicaSecundaria,
                            },
                            { label: 'Data constituição', value: entidade?.dataDeConstituicao },
                            { label: 'Data publicação', value: entidade?.dataDePublicacao },
                            { label: 'Domicílio/Sede', value: entidade?.domicilioOuSede },
                            { label: 'Cóapital social', value: entidade?.capitalSocial },
                            { label: 'Moeda cap. social', value: entidade?.moedaCapitalSocial },
                            { label: 'UN/Milhares cap. social', value: entidade?.unidadesOuMilharesCapitalSocial },
                            { label: 'Vínculo c/ outros', value: entidade?.vinculoComOutras },
                            { label: 'Descritivo do vínculo', value: entidade?.descritivoVinculoComOutras },
                            { label: 'Faturação', value: entidade?.volumeDeFacturacao },
                            { label: 'Moeda da faturação', value: entidade?.moedaVolumeDeFacturacao },
                            { label: 'Ano da faturação', value: entidade?.anoDoVolumeDeFacturacao },
                          ]}
                        />
                      </CardDetail>
                    </>
                  )}

                  {currentTab === 'Morada/Contactos' && (
                    <>
                      {moradasContactos?.length === 0 ? (
                        <NoItems label="Nenhuma morada/contacto" />
                      ) : (
                        moradasContactos?.map((row, index) => (
                          <CardDetail outros key={`${row?.codigoElementosCaracterizacao}_${index}`}>
                            <CardInfo
                              label={row?.descritivo}
                              value={[
                                { label: 'Tipo', value: row?.tipoMorada },
                                { label: 'Morada 1', value: row?.morada1 },
                                { label: 'Morada 2', value: row?.morada2 },
                                { label: 'Situação', value: row?.descritivoSituacao },
                                { label: 'Código situação', value: row?.situacaoMorada },
                                { label: 'Código postal', value: row?.codigoPostalPais },
                                { label: 'Descritivo código postal', value: row?.descritivoCodigoPostal },
                                { label: 'Contacto 1', value: row?.contacto1 },
                                { label: 'Contacto 2', value: row?.contacto2 },
                                { label: 'Contacto 3', value: row?.contacto3 },
                                { label: 'Telefone 1', value: row?.telefone1 },
                                { label: 'Telefone 2', value: row?.telefone2 },
                                { label: 'Telefone 3', value: row?.segundoTelefoneSecundario },
                                { label: 'Situação de registo', value: row?.situacaoRegisto },
                                { label: 'Formato morada', value: row?.formatoMorada },
                              ]}
                            />
                          </CardDetail>
                        ))
                      )}
                    </>
                  )}

                  {currentTab === 'Documentos' && (
                    <>
                      {documentos?.length === 0 ? (
                        <NoItems label="Nenhum documento" />
                      ) : (
                        documentos?.map((row, index) => (
                          <CardDetail outros key={`${row?.tipoDeDocumento}_${index}`}>
                            <CardInfo
                              label={row?.tipoDeDocumento}
                              value={[
                                { label: 'Número', value: row?.numeroDeDocumento },
                                { label: 'Código País', value: row?.codigoDePais },
                                { label: 'Entidade emissora', value: row?.entidadeEmissora },
                                { label: 'Data emissão', value: entidade?.dataDeEmissao },
                                { label: 'Local emissão', value: row?.localDeEmissao },
                                { label: 'Repartição fiscal', value: row?.reparticaoFiscal },
                                { label: 'Nº ordem entrada', value: row?.numeroDeOrdemEntradaDoDocumento },
                                { label: 'Check digit', value: row?.checkDigitDoDocumento },
                              ]}
                            />
                          </CardDetail>
                        ))
                      )}
                    </>
                  )}

                  {currentTab === 'Caracterizações' && (
                    <>
                      {caraterizacoes?.length === 0 ? (
                        <NoItems label="Nenhuma caraterização" />
                      ) : (
                        caraterizacoes?.map((row, index) => (
                          <CardDetail outros key={`${row?.codigoElementosCaracterizacao}_${index}`}>
                            <CardInfo
                              label={row?.descricaoElementos}
                              value={[
                                { label: 'Código', value: row?.codigoElementosCaracterizacao },
                                { label: 'Valor', value: row?.valorDosElementosCaracterizacao },
                                { label: 'Comprimento', value: row?.comprimentoElementosCaracterizacao },
                              ]}
                            />
                          </CardDetail>
                        ))
                      )}
                    </>
                  )}
                </>
              ) : (
                <Grid item xs={12}>
                  {numEntidade ? (
                    <SearchNotFound404 message="Entidade não encontrada..." />
                  ) : (
                    <Card sx={{ p: { xs: 3, lg: 10 } }}>
                      <SearchNotFound message="Introduza o número da entidade para procurar as suas informações..." />
                    </Card>
                  )}
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

CardDetail.propTypes = { title: PropTypes.string, children: PropTypes.node, outros: PropTypes.bool };

function CardDetail({ title, children, outros }) {
  return (
    <Grid item xs={12} md={outros ? 6 : 12} xl={6}>
      <Card sx={{ height: 1 }}>
        {title && (
          <CardHeader
            title={title}
            titleTypographyProps={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, variant: 'h6' }}
          />
        )}
        <CardContent>
          <Box sx={{ gap: 3, display: 'grid', gridTemplateColumns: { md: 'repeat(2, 1fr)', xs: 'repeat(1, 1fr)' } }}>
            {children}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}

// ----------------------------------------------------------------------

CardInfo.propTypes = { label: PropTypes.string, value: PropTypes.array };

function CardInfo({ label, value = [] }) {
  const { dadosComValores } = useSelector((state) => state.banka);
  return (dadosComValores && !!value?.find((row) => row?.value)) || !dadosComValores ? (
    <Stack spacing={0.25}>
      {label && (
        <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
          {label}
        </Typography>
      )}
      {value?.map((row, index) => (
        <>
          {row?.label && ((dadosComValores && row?.value) || !dadosComValores) ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography key={`${row?.label}_${index}`} variant="body2" sx={{ color: 'text.secondary' }}>
                {row?.label}:
              </Typography>
              {row?.value ? (
                <Typography>{row?.label?.includes('Data') ? dataPadraoPt(row?.value) : row?.value}</Typography>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
                  Não definido
                </Typography>
              )}
            </Stack>
          ) : (
            ''
          )}
        </>
      ))}
    </Stack>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

NoItems.propTypes = { label: PropTypes.string };

function NoItems({ label }) {
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <SearchNotFound message={`${label} disponível...`} />
      </Card>
    </Grid>
  );
}
