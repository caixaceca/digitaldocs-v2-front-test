import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinkIcon from '@mui/icons-material/Link';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { useSelector } from '../../redux/store';
import { ptDate, normalizeData } from '../../utils/formatTime';
// components
import Image from '../../components/Image';
import GridItem from '../../components/GridItem';
import { Loading } from '../../components/LoadingScreen';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { ConsultarDocForm } from '../../sections/home/HomeForm';

// ---------------------------------------------------------

export default function Documento({ onClose }) {
  const { docPdex, isLoading } = useSelector((state) => state.intranet);

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="md">
        <DialogTitleAlt sx={{ pb: 3 }} title="Consultar documento" onClose={onClose} content={<ConsultarDocForm />} />
        <DialogContent>
          {isLoading ? (
            <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: 400, mt: 3 }}>
              <Loading />
            </Stack>
          ) : (
            docPdex && (
              <Stack spacing={4} sx={{ pt: 1 }}>
                {docPdex?.tipoSearch === 'Pesquisar Registo Comercial' ? (
                  <Stack>
                    <Grid container spacing={2}>
                      <GridItem md={6}>
                        <Secao titulo="Identificação">
                          <TextItem label="Nif" value={docPdex?.nif} />
                          <TextItem label="Nome" value={docPdex?.nome_firma} />
                          <TextItem label="Matricula" value={docPdex?.matricula} />
                          <TextItem label="Data ínicio de negócio" value={docPdex?.data_inicio_negocio} />
                          <TextItem label="Administração" value={docPdex?.administracao} />
                          <TextItem label="Natureza jurídica" value={docPdex?.natureza_juridica} />
                          <TextItem label="Forma de obrigar" value={docPdex?.forma_obrigar} />
                          <TextItem label="Montante realizado" value={docPdex?.montante_realizado} />
                          <TextItem label="Descrição da capital" value={docPdex?.descricao_capital} />
                          <TextItem label="Outros" value={docPdex?.outros} />
                          {docPdex?.link_certidao && (
                            <Button
                              rel="noopener"
                              target="_blank"
                              color="inherit"
                              startIcon={<LinkIcon />}
                              href={docPdex?.link_certidao}
                              sx={{ my: 0.5, justifyContent: 'left' }}
                            >
                              Link da certidão
                            </Button>
                          )}
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Localização">
                          <TextItem label="Zona" value={docPdex?.zona} />
                          <TextItem label="Localidade" value={docPdex?.localidade} />
                          <TextItem label="Concelho" value={docPdex?.concelho} />
                          <TextItem label="Freguesia" value={docPdex?.freguesia} />
                          <TextItem label="Código postal" value={docPdex?.codigo_postal} />
                          <TextItem label="Rua" value={docPdex?.rua} />
                          <TextItem label="Andar" value={docPdex?.andar} />
                          <TextItem label="Porta" value={docPdex?.numero_porta} />
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Objeto social">
                          <TextItem label="Actividade" value={docPdex?.objeto_social?.actividade} />
                          <TextItem label="Descrição atividade" value={docPdex?.objeto_social?.descricao_atividade} />
                          <TextItem label="Código CAE" value={docPdex?.objeto_social?.codigo_cae} />
                          <TextItem label="Descrição" value={docPdex?.objeto_social?.descricao} />
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Sócios">
                          {docPdex?.socios && docPdex?.socios?.length > 0 ? (
                            docPdex?.socios?.map((socio, index) => (
                              <TextItem
                                key={`socio_${index}`}
                                value={`${socio?.nome}${socio?.nif ? ` - ${socio?.nif}` : ''}`}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" sx={{ p: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                              Não foi encontrado nenhum sócio...
                            </Typography>
                          )}
                        </Secao>
                      </GridItem>
                    </Grid>
                  </Stack>
                ) : (
                  <>
                    <ImagemSecao docPdex={docPdex} />
                    <Stack>
                      <Grid container spacing={2}>
                        <GridItem md={6}>
                          <Secao titulo="Identificação">
                            <TextItem label="ID civil" value={docPdex?.id_civil} />
                            <TextItem label="Nome" value={docPdex?.nome_proprio || docPdex?.nome} />
                            <TextItem label="Apelido" value={docPdex?.nome_apelido} />
                            <TextItem label="Nome completo" value={docPdex?.nome_completo} />
                            <TextItem label="Nome normalizado" value={docPdex?.nome_normaliz} />
                            <TextItem label="Nacionalidade" value={docPdex?.nacionalidade} />
                            <TextItem label="Naturalidade" value={docPdex?.naturalidade} />
                            <TextItem
                              label="Data nascimento"
                              value={ptDate(normalizeData(docPdex?.data_nascimento || docPdex?.data_nasc))}
                            />
                            <TextItem label="Sexo" value={docPdex?.sexo} />
                            <TextItem label="Estado civil" value={docPdex?.estado_civil} />
                            <TextItem label="Profissão" value={docPdex?.profissao} />
                            <TextItem label="Altura" value={docPdex?.altura} />
                          </Secao>
                        </GridItem>

                        <GridItem md={6}>
                          <Secao titulo="Documento">
                            <TextItem label="Nº" value={docPdex?.numero_documento || docPdex?.num_documento} />
                            <TextItem label="BI" value={docPdex?.bi} />
                            <TextItem label="NIF" value={docPdex?.nif || docPdex?.numero_nif} />
                            <TextItem label="Tipo" value={docPdex?.tipo_documento_id} />
                            <TextItem label="Emissor" value={docPdex?.emissor_documento} />
                            <TextItem label="Descrição" value={docPdex?.descricao_emissor} />
                            <TextItem
                              label="Data emissão"
                              value={ptDate(normalizeData(docPdex?.data_emissao || docPdex?.dt_emissao))}
                            />
                            <TextItem
                              label="Data validade"
                              value={ptDate(normalizeData(docPdex?.data_validade || docPdex?.dt_validade))}
                            />
                            <TextItem label="Data recebido" value={ptDate(normalizeData(docPdex?.data_recebido))} />
                            <TextItem label="Data entrega" value={ptDate(normalizeData(docPdex?.data_entrega))} />
                            <TextItem label="Nº processo" value={docPdex?.nr_processo} />
                          </Secao>
                        </GridItem>
                        {(docPdex?.rua ||
                          docPdex?.andar ||
                          docPdex?.porta ||
                          docPdex?.bairro ||
                          docPdex?.morada ||
                          docPdex?.freguesia ||
                          docPdex?.localidade ||
                          docPdex?.tipo_morada ||
                          docPdex?.codigo_postal) && (
                          <GridItem md={6}>
                            <Secao titulo="Morada">
                              <TextItem label="Morada" value={docPdex?.morada} />
                              <TextItem label="Tipo" value={docPdex?.tipo_morada} />
                              <TextItem label="Freguesia" value={docPdex?.freguesia} />
                              <TextItem label="Localidade" value={docPdex?.localidade} />
                              <TextItem label="Bairro" value={docPdex?.bairro} />
                              <TextItem label="Rua" value={docPdex?.rua} />
                              <TextItem label="Andar" value={docPdex?.andar} />
                              <TextItem label="Porta" value={docPdex?.porta} />
                              <TextItem label="Código postal" value={docPdex?.codigo_postal} />
                            </Secao>
                          </GridItem>
                        )}

                        {(docPdex?.nome_pai ||
                          docPdex?.nome_mae ||
                          docPdex?.nome_pai_proprio ||
                          docPdex?.nome_mae_proprio ||
                          docPdex?.nome_pai_completo ||
                          docPdex?.nome_mae_completo) && (
                          <GridItem md={6}>
                            <Secao titulo="Filiação">
                              <TextItem
                                label="Pai"
                                value={docPdex?.nome_pai_proprio || docPdex?.nome_pai || docPdex?.nome_pai_completo}
                              />
                              <TextItem label="Apelido do pai" value={docPdex?.nome_pai_apelido} />
                              <TextItem
                                label="Mãe"
                                value={docPdex?.nome_mae_proprio || docPdex?.nome_mae || docPdex?.nome_mae_completo}
                              />
                              <TextItem label="Apelido da mãe" value={docPdex?.nome_mae_apelido} />
                            </Secao>
                          </GridItem>
                        )}

                        {(docPdex?.telemovel || docPdex?.telefone || docPdex?.email) && (
                          <GridItem md={6}>
                            <Secao titulo="Contactos">
                              <TextItem label="Telemóvel" value={docPdex?.telemovel} />
                              <TextItem label="Telefone" value={docPdex?.telefone} />
                              <TextItem label="Email" value={docPdex?.email} />
                            </Secao>
                          </GridItem>
                        )}
                      </Grid>
                    </Stack>
                  </>
                )}
              </Stack>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------

function ImagemSecao({ docPdex }) {
  const [image, setImage] = useState('');
  const { foto, foto_sem_cor: semCor, dedao_esquerdo: esquerdo, dedao_direito: direito, assinatura } = docPdex;
  const imagensDoc = [
    foto && { src: foto, doc: 'foto' },
    semCor && { src: semCor, doc: 'foto' },
    esquerdo && { src: esquerdo },
    direito && { src: direito },
  ].filter(Boolean);

  return foto || semCor || esquerdo || direito || assinatura ? (
    <>
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Stack direction="row" spacing={2} justifyContent="center" useFlexGap flexWrap="wrap">
          {imagensDoc.map((img, index) => (
            <Imagem key={index} image={img.src} doc={img.doc ?? ''} setImage={setImage} />
          ))}
        </Stack>
        {assinatura && <Imagem image={assinatura} setImage={setImage} doc="ass" />}
      </Stack>
      <Lightbox index={0} open={!!image} close={() => setImage('')} slides={[{ src: image }]} />
    </>
  ) : null;
}

function Imagem({ image, setImage, doc = '' }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Image
        src={image}
        sx={{
          cursor: 'pointer',
          transition: '0.3s',
          height: doc === 'ass' ? 55 : 145,
          width: (doc === 'ass' && 1) || (doc === 'foto' && 120) || 110,
          '&:hover': { transform: 'scale(1.05)', boxShadow: 3 },
        }}
        onClick={() => setImage(image)}
      />
    </Box>
  );
}

// ---------------------------------------------------------

function Secao({ titulo, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
        {titulo}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={0.75}>{children}</Stack>
    </Paper>
  );
}

// ---------------------------------------------------------

function TextItem({ label = '', value = '' }) {
  return value ? (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}:
        </Typography>
      )}
      <Typography variant="body2">{value}</Typography>
    </Stack>
  ) : null;
}
