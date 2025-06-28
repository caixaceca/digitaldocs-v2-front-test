import { useState } from 'react';
import PropTypes from 'prop-types';
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
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { ptDate } from '../../utils/formatTime';
import { useSelector } from '../../redux/store';
import { useNotificacao } from '../../hooks/useNotificacao';
// components
import Image from '../../components/Image';
import { Fechar } from '../../components/Actions';
import GridItem from '../../components/GridItem';
import { Loading } from '../../components/LoadingScreen';
import { ConsultarDocForm } from '../../sections/home/HomeForm';

Documento.propTypes = { onClose: PropTypes.func };

export default function Documento({ onClose }) {
  const { documentoPdex, error, isLoading } = useSelector((state) => state.intranet);
  useNotificacao({ error });

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            Consultar documento
            <Fechar onClick={onClose} />
          </Stack>
          <ConsultarDocForm />
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: 400, mt: 3 }}>
              <Loading />
            </Stack>
          ) : (
            documentoPdex && (
              <Stack spacing={4} sx={{ pt: 1 }}>
                {documentoPdex?.tipoSearch === 'CNI/BI' && (
                  <>
                    <ImagemSecao documentoPdex={documentoPdex} />
                    <Stack>
                      <Grid container spacing={2}>
                        <GridItem md={6}>
                          <Secao titulo="Identificação">
                            <TextItem label="Nome" value={documentoPdex?.nome_proprio} />
                            <TextItem label="Apelido" value={documentoPdex?.nome_apelido} />
                            <TextItem label="Nome completo" value={documentoPdex?.nome_completo} />
                            <TextItem label="Nacionalidade" value={documentoPdex?.nacionalidade} />
                            <TextItem label="Naturalidade" value={documentoPdex?.naturalidade} />
                            <TextItem label="Data nascimento" value={ptDate(documentoPdex?.data_nascimento)} />
                            <TextItem label="Sexo" value={documentoPdex?.sexo} />
                            <TextItem label="Estado civil" value={documentoPdex?.estado_civil} />
                            <TextItem label="Profissão" value={documentoPdex?.profissao} />
                            <TextItem label="Altura" value={documentoPdex?.altura} />
                          </Secao>
                        </GridItem>

                        <GridItem md={6}>
                          <Secao titulo="Documento">
                            <TextItem label="NIF" value={documentoPdex?.nif} />
                            <TextItem label="Tipo" value={documentoPdex?.tipo_documento_id} />
                            <TextItem label="Nº" value={documentoPdex?.numero_documento} />
                            <TextItem label="Emissor" value={documentoPdex?.emissor_documento} />
                            <TextItem label="Descrição" value={documentoPdex?.descricao_emissor} />
                            <TextItem label="Data emissão" value={ptDate(documentoPdex?.data_emissao)} />
                            <TextItem label="Data validade" value={ptDate(documentoPdex?.data_validade)} />
                            <TextItem label="Data recebido" value={ptDate(documentoPdex?.data_recebido)} />
                            <TextItem label="Data entrega" value={ptDate(documentoPdex?.data_entrega)} />
                            <TextItem label="Nº processo" value={documentoPdex?.nr_processo} />
                          </Secao>
                        </GridItem>

                        <GridItem md={6}>
                          <Secao titulo="Morada">
                            <TextItem label="Morada" value={documentoPdex?.morada} />
                            <TextItem label="Tipo" value={documentoPdex?.tipo_morada} />
                            <TextItem label="Freguesia" value={documentoPdex?.freguesia} />
                            <TextItem label="Localidade" value={documentoPdex?.localidade} />
                            <TextItem label="Bairro" value={documentoPdex?.bairro} />
                            <TextItem label="Rua" value={documentoPdex?.rua} />
                            <TextItem label="Andar" value={documentoPdex?.andar} />
                            <TextItem label="Porta" value={documentoPdex?.porta} />
                            <TextItem label="Código postal" value={documentoPdex?.codigo_postal} />
                          </Secao>
                        </GridItem>

                        <GridItem md={6}>
                          <Secao titulo="Filiação">
                            <TextItem label="Pai" value={documentoPdex?.nome_pai_proprio} />
                            <TextItem label="Apelido do pai" value={documentoPdex?.nome_pai_apelido} />
                            <TextItem label="Mãe" value={documentoPdex?.nome_mae_proprio} />
                            <TextItem label="Apelido da mãe" value={documentoPdex?.nome_mae_apelido} />
                          </Secao>
                        </GridItem>

                        <GridItem md={6}>
                          <Secao titulo="Contactos">
                            <TextItem label="Telemóvel" value={documentoPdex?.telemovel} />
                            <TextItem label="Telefone" value={documentoPdex?.telefone} />
                            <TextItem label="Email" value={documentoPdex?.email} />
                          </Secao>
                        </GridItem>
                      </Grid>
                    </Stack>
                  </>
                )}
                {documentoPdex?.tipoSearch === 'NIF' && (
                  <Secao titulo="Identificação">
                    <TextItem label="Nº" value={documentoPdex?.numero_nif} />
                    <TextItem label="Data de emissão" value={documentoPdex?.data_emissao} />
                    <TextItem label="Emissor" value={documentoPdex?.emissor} />
                    <TextItem label="Nome" value={documentoPdex?.nome} />
                    <TextItem label="Nome do pai" value={documentoPdex?.nome_pai} />
                    <TextItem label="Nome da mãe" value={documentoPdex?.nome_mae} />
                    <TextItem label="Data de nascimento" value={documentoPdex?.data_nascimento} />
                    <TextItem label="Estado civil" value={documentoPdex?.estado_civil} />
                    <TextItem label="Morada" value={documentoPdex?.morada} />
                  </Secao>
                )}
                {documentoPdex?.tipoSearch === 'REGISTO COMERCIAL' && (
                  <Stack>
                    <Grid container spacing={2}>
                      <GridItem md={6}>
                        <Secao titulo="Identificação">
                          <TextItem label="Nif" value={documentoPdex?.nif} />
                          <TextItem label="Nome" value={documentoPdex?.nome_firma} />
                          <TextItem label="Matricula" value={documentoPdex?.matricula} />
                          <TextItem label="Data ínicio de negócio" value={documentoPdex?.data_inicio_negocio} />
                          <TextItem label="Administração" value={documentoPdex?.administracao} />
                          <TextItem label="Natureza jurídica" value={documentoPdex?.natureza_juridica} />
                          <TextItem label="Forma de obrigar" value={documentoPdex?.forma_obrigar} />
                          <TextItem label="Montante realizado" value={documentoPdex?.montante_realizado} />
                          <TextItem label="Descrição da capital" value={documentoPdex?.descricao_capital} />
                          <TextItem label="Outros" value={documentoPdex?.outros} />
                          {documentoPdex?.link_certidao && (
                            <Button
                              rel="noopener"
                              target="_blank"
                              color="inherit"
                              startIcon={<LinkIcon />}
                              href={documentoPdex?.link_certidao}
                              sx={{ my: 0.5, justifyContent: 'left' }}
                            >
                              Link da certidão
                            </Button>
                          )}
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Localização">
                          <TextItem label="Zona" value={documentoPdex?.zona} />
                          <TextItem label="Localidade" value={documentoPdex?.localidade} />
                          <TextItem label="Concelho" value={documentoPdex?.concelho} />
                          <TextItem label="Freguesia" value={documentoPdex?.freguesia} />
                          <TextItem label="Código postal" value={documentoPdex?.codigo_postal} />
                          <TextItem label="Rua" value={documentoPdex?.rua} />
                          <TextItem label="Andar" value={documentoPdex?.andar} />
                          <TextItem label="Porta" value={documentoPdex?.numero_porta} />
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Objeto social">
                          <TextItem label="Actividade" value={documentoPdex?.objeto_social?.actividade} />
                          <TextItem
                            label="Descrição atividade"
                            value={documentoPdex?.objeto_social?.descricao_atividade}
                          />
                          <TextItem label="Código CAE" value={documentoPdex?.objeto_social?.codigo_cae} />
                          <TextItem label="Descrição" value={documentoPdex?.objeto_social?.descricao} />
                        </Secao>
                      </GridItem>
                      <GridItem md={6}>
                        <Secao titulo="Sócios">
                          {documentoPdex?.socios && documentoPdex?.socios?.length > 0 ? (
                            documentoPdex?.socios?.map((socio, index) => (
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

ImagemSecao.propTypes = { documentoPdex: PropTypes.object };

function ImagemSecao({ documentoPdex }) {
  const [image, setImage] = useState('');
  const { foto, foto_sem_cor: semCor, dedao_esquerdo: esquerdo, dedao_direito: direito, assinatura } = documentoPdex;
  const imagensDoc = [
    foto && { src: foto, doc: 'foto' },
    semCor && { src: semCor, doc: 'foto' },
    esquerdo && { src: esquerdo },
    direito && { src: direito },
  ].filter(Boolean);

  return (
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
  );
}

Imagem.propTypes = { image: PropTypes.string, setImage: PropTypes.func, doc: PropTypes.bool };

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

Secao.propTypes = { titulo: PropTypes.string, children: PropTypes.node };

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

TextItem.propTypes = { label: PropTypes.string, value: PropTypes.string };

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
