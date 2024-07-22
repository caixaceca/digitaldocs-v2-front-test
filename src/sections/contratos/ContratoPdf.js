import PropTypes from 'prop-types';
import { PDFViewer, Page, View, Text, Document, Font } from '@react-pdf/renderer';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
// utils
// import { fDate, ptDate } from '../../utils/formatTime';
// import { fNumber, fCurrency } from '../../utils/formatNumber';
import { converterParaOrdinal, substituirTexto } from '../../utils/formatText';
// redux
import { useSelector } from '../../redux/store';
// components
import { SearchNotFound } from '../../components/table';
import { styles, CabecalhoAlt, RodapeContrato } from '../../components/ExportDados';

const numero = require('numero-por-extenso');

Font.registerHyphenationCallback((word) => [word]);

// ----------------------------------------------------------------------

export default function ContratoPdf() {
  const { cc } = useSelector((state) => state.intranet);
  const { contrato, infoContrato } = useSelector((state) => state.banka);
  return (
    <>
      {contrato ? (
        <Grid item xs={12}>
          <Card>
            <PDFViewer width="100%" height="100%" style={{ border: 'none', minHeight: '100vh' }}>
              <Document
                pdfVersion="1.7"
                author="Caixa Económica de Cabo Verde"
                creator="Caixa Económica de Cabo Verde"
                subject="Minutas de contratos de crédito"
                title={`${contrato?.tipo} - ${contrato?.modelo}`}
              >
                {/* PRIMEIRA PÁGINA */}
                <Page size="A4" style={[styles.page]}>
                  <CabecalhoAlt codificacao="JRDC.FM.C.001.01 | 2013/11/15" cabecalho />
                  <View style={[styles.pageClean, styles.pt0]}>
                    <View style={[styles.mb15, styles.mt15]}>
                      <Text style={[styles.title, styles.uppercase]}>{contrato?.tipo}</Text>
                      <Text style={[styles.title, styles.uppercase]}>{contrato?.modelo}</Text>
                    </View>
                    <Text style={[styles.textBold]}>OUTORGANTES:</Text>
                    <Text>
                      <Text style={[styles.textBold]}>PRIMEIRO: CAIXA ECONÓMICA DE CABO VERDE S.A.</Text>, com sede na
                      Av. Cidade de Lisboa, Praia, capital social de 1.392.000.000$00, matriculada na Conservatória do
                      Registo Comercial da Praia sob o n.º 336, NIF 200131753, adiante designada abreviadamente por
                      CAIXA, neste acto representada pelo(a) Dr.(ª) <Interveniente dados={infoContrato?.dadosGerente} />
                      , na qualidade de Gerente da Agência
                      {cc?.uo?.label}.
                    </Text>
                    <Text style={[styles.mt10]}>
                      <Text style={[styles.textBold]}>SEGUNDO: </Text>
                      <Interveniente dados={infoContrato?.dadosCliente} />, adiante designado(A) MUTUARIO(A);
                    </Text>
                    <Text style={[styles.mt10]}>
                      <Text style={[styles.textBold]}>TERCEIRO: </Text>
                      {infoContrato?.fiadores?.map((row, index) => (
                        <Interveniente dados={row} key={`fiador_${index}`} />
                      ))}
                      , adiante designado TERCEIRO OUTORGANTE.
                    </Text>
                  </View>
                </Page>
                {/* CORPO */}
                <Page size="A4" style={[styles.page, styles.pageClean, styles.pb24]}>
                  <View>
                    <Text>
                      Entre os outorgantes e nas qualidades em que outorgam, é celebrado o presente contrato de crédito
                      sob a forma de mútuo que se rege pelas cláusulas seguintes:
                    </Text>
                    {/* CLAUSULAS */}
                    {contrato?.clausulas?.map((clausula, index) => (
                      <View key={`clausula_${index}`} style={[styles.mt10]}>
                        <Text style={[styles.textBold, styles.uppercase, styles.alignCenter]} wrap={false}>
                          {converterParaOrdinal(clausula?.ordem, false)}
                        </Text>
                        <Text style={[styles.textBold, styles.alignCenter]} wrap={false}>
                          ({clausula?.clausula})
                        </Text>
                        {clausula?.descricao ? (
                          <Text wrap={false}>
                            {substituirTexto(clausula?.descricao, clausula?.parametros, infoContrato)}
                          </Text>
                        ) : (
                          ''
                        )}

                        {/* INCISOS */}
                        {clausula?.incisos?.map((inciso, index) => (
                          <View key={`inciso_${index}`}>
                            <View style={[styles.gridContainerSimple]}>
                              <View style={[styles.tCell_7, styles.pl0, styles.pr10, styles.alignRight]} wrap={false}>
                                <Text wrap={false}>{inciso?.inciso}.</Text>
                              </View>
                              <View style={[styles.tCell_93, styles.pl0, styles.pr0]}>
                                <Text wrap={false}>
                                  {substituirTexto(
                                    inciso?.descricao,
                                    inciso?.parametros,
                                    clausula?.clausula === 'Comunicações' ? infoContrato?.dadosCliente : infoContrato
                                  )}
                                </Text>
                                {clausula?.clausula === 'Taxa de Juros' &&
                                inciso?.inciso === 1 &&
                                infoContrato?.taxa_desconto ? (
                                  <>
                                    <Text wrap={false}>
                                      À taxa de juro anual, é aplicado um desconto contratual de{' '}
                                      {infoContrato?.taxa_desconto}p.p. ({infoContrato?.taxa_desconto_por_extenso}{' '}
                                      pontos percentuais), pelo que nesta data, a taxa de juro a aplicar ao crédito é de{' '}
                                      {infoContrato?.taxa_com_desconto}%. Da aplicação do desconto não pode resultar uma
                                      taxa de juro inferior a {infoContrato?.taxa_com_desconto}%.
                                    </Text>
                                    <Text wrap={false}>
                                      O incumprimento do pagamento de qualquer encargo ou prestação de reembolso por
                                      prazo superior a 60 (sessenta) dias, determina a perda automática do desconto,
                                      aplicando-se, de imediato, a taxa de juro anual definida na presente cláusula ou a
                                      fixada no preçário da CAIXA, à data da perda do desconto, se esta for superior à
                                      taxa anual acima referida.
                                    </Text>
                                  </>
                                ) : (
                                  ''
                                )}
                                {inciso?.descricao?.includes('o TERCEIRO OUTORGANTE indica os seguintes endereços:')
                                  ? infoContrato?.fiadores?.map((info, index) => (
                                      <View key={`contacto_fiador_${index}`}>
                                        <Text wrap={false}>
                                          <Text style={[styles.textBold]}>{info?.nome}</Text>
                                          <Text> - endereço electrónico {info?.email}</Text>
                                          <Text> e endereço postal {info?.morada};</Text>
                                        </Text>
                                      </View>
                                    ))
                                  : ''}

                                {/* ALINEAS */}
                                {inciso?.alineas?.map((alinea, index) => (
                                  <View key={`alinea_${index}`} wrap={false}>
                                    <View style={[styles.gridContainerSimple]}>
                                      <View style={[styles.tCell_7, styles.pl0, styles.pr10, styles.alignRight]}>
                                        <Text>{alinea?.alinea})</Text>
                                      </View>
                                      <View style={[styles.tCell_93, styles.pl0, styles.pr0]}>
                                        <Text>
                                          {substituirTexto(alinea?.descricao, alinea?.parametros, infoContrato)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                ))}
                                {clausula?.clausula === 'Incumprimento' &&
                                inciso?.inciso === 1 &&
                                infoContrato?.taxa_desconto ? (
                                  <View wrap={false}>
                                    <View style={[styles.gridContainerSimple]}>
                                      <View style={[styles.tCell_7, styles.pl0, styles.pr10, styles.alignRight]}>
                                        <Text>c)</Text>
                                      </View>
                                      <View style={[styles.tCell_93, styles.pl0, styles.pr0]}>
                                        <Text>A perda do desconto referido na cláusula relativa à taxa de juros.</Text>
                                      </View>
                                    </View>
                                  </View>
                                ) : (
                                  ''
                                )}
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                  <RodapeContrato codificacao="JRDC.FM.C.001.01" />
                </Page>
                {/* ASSINATURA */}
                <Page size="A4" style={[styles.page, styles.pageClean, styles.pb24]}>
                  <View>
                    <Text style={[styles.mb15]}>
                      Praia, aos {infoContrato?.data_emissao_documento} em{' '}
                      {numero.porExtenso(infoContrato?.fiadores?.length + 2, numero.estilo.normal)} vias de originais,
                      uma para cada PARTE:
                    </Text>
                    <Assinaturas parte="Pela CAIXA" nomes={[infoContrato?.dadosGerente?.nome]} />
                    <Assinaturas parte="O(S) MUTUÁRIO(S)" nomes={[infoContrato?.dadosCliente?.nome]} />
                    <Assinaturas
                      parte="O(S) TERCEIRO(S) OUTORGANTE(S)"
                      nomes={infoContrato?.fiadores?.map((row) => row?.nome)}
                    />
                  </View>
                  <RodapeContrato codificacao="JRDC.FM.C.001.01" />
                </Page>
              </Document>
            </PDFViewer>
          </Card>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 3, lg: 10 } }}>
            <SearchNotFound message="Modelo de contrato não encontrado..." />
          </Card>
        </Grid>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

Interveniente.propTypes = { dados: PropTypes.bool };

function Interveniente({ dados }) {
  return (
    <Text>
      <Text style={[styles.textBold]}>{dados?.nome}</Text>, {dados?.estadocivil},{' '}
      {dados?.regimecasamento ? `em regime de ${dados?.regimecasamento}, ` : ''}
      {dados?.conjuge ? 'com ' : ''}
      {dados?.conjuge ? <Text style={[styles.textBold]}>{dados?.conjuge}</Text> : ''}
      {dados?.conjuge ? ',' : ''} natural de {dados?.freguesia}, titular do {dados?.tipoidentificacao} nº{' '}
      {dados?.docidentificao}, emitido pelo Arquivo de Identificação Civil e Criminal de {dados?.localemissaodocident},
      em {dados?.dataemissaodocident}, NIF {dados?.nif}, residente em {dados?.morada}
    </Text>
  );
}

// ----------------------------------------------------------------------

Assinaturas.propTypes = { parte: PropTypes.string, nomes: PropTypes.array };

function Assinaturas({ parte, nomes }) {
  return (
    <View style={[styles.mt15, styles.mb10, styles.alignCenter]}>
      <Text style={[styles.textBold]}>{parte}</Text>
      {nomes?.map((row) => (
        <>
          <Text style={[styles.borderBottom, styles.mt40, styles.mx40]}> </Text>
          <Text style={[styles.mt5]}>{row}</Text>
        </>
      ))}
    </View>
  );
}
