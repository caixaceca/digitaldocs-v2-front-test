import PropTypes from 'prop-types';
import { View, Text, Image } from '@react-pdf/renderer';
// utils
import { ptDate } from '../../utils/formatTime';
// components
import styles from './ExportStylePdf';

// ----------------------------------------------------------------------

Cabecalho.propTypes = { title: PropTypes.string, codificacao: PropTypes.string };

export function Cabecalho({ title, codificacao = '' }) {
  return (
    <View style={[styles.gridContainer, styles.header]} fixed>
      <View>
        <View style={{ flexDirection: 'row', fontSize: 7, paddingTop: '10mm' }}>
          <Text>{codificacao || ptDate(new Date())}</Text>
          <Text render={({ pageNumber, totalPages }) => ` | ${pageNumber}/${totalPages}`} />
        </View>
        <Text style={[styles.headerTitle]}>{title}</Text>
        <Text style={[styles.headerCaption2]}>Caixa Económica de Cabo Verde</Text>
      </View>
      <View>
        <Image source="/assets/Caixa_Logo_Branco_Transparente.png" style={{ height: 60, paddingTop: '12mm' }} />
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------

CabecalhoAlt.propTypes = { cabecalho: PropTypes.bool, codificacao: PropTypes.string };

export function CabecalhoAlt({ cabecalho = false, codificacao = '' }) {
  return (
    <>
      {cabecalho ? (
        <View style={[styles.headerAlt]} fixed>
          <View style={[styles.gridContainer]}>
            <Text
              style={[styles.bodyHeader]}
              render={({ pageNumber, totalPages }) =>
                `${codificacao ? `${codificacao} | ` : ''} ${pageNumber}/${totalPages}`
              }
            />
            <View style={{ flexDirection: 'row', fontSize: 7, paddingTop: '10mm' }}>
              <Text>{codificacao ? `${codificacao} | ` : ''}</Text>
              <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
            </View>
            <View style={[styles.headerLogo]}>
              <Image
                src="/assets/Caixa_Logo_Branco_Transparente.png"
                style={{ marginBottom: '7mm', marginLeft: '7mm', width: '31mm' }}
              />
            </View>
          </View>
          <View style={[styles.bodyHeaderInfo]}>
            <Text> </Text>
            <Text style={{ width: '51mm' }}>o banco que combina comigo</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.noheader]} fixed>
          <Text>{}</Text>
        </View>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

Validacao.propTypes = { por: PropTypes.string, em: PropTypes.string };

export function Validacao({ por, em }) {
  return (
    <View style={[styles.table]}>
      <View style={[styles.tableHeader_]}>
        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={[styles.tCell_50, styles.alignCenter]}>
            <Text>Validado por</Text>
          </View>
          <View style={[styles.tCell_50, styles.alignCenter]}>
            <Text>Validado em</Text>
          </View>
        </View>
      </View>
      <View style={[styles.tableBody]}>
        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={[styles.tCell_50, styles.alignCenter]}>
            <Text>{por}</Text>
          </View>
          <View style={[styles.tCell_50, styles.alignCenter]}>
            <Text>{em}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------

Rodape.propTypes = { noOrigin: PropTypes.bool };

export function Rodape({ noOrigin = false }) {
  return (
    <View style={[styles.footer, styles.footer1, styles.textSuccess]} fixed>
      {noOrigin ? (
        <Text style={[]}> </Text>
      ) : (
        <Text style={[]}>
          Origem: <Text style={[styles.textBold]}>Intranet</Text>
        </Text>
      )}
    </View>
  );
}

// ----------------------------------------------------------------------

RodapeAlt.propTypes = { rodape: PropTypes.bool };

export function RodapeAlt({ rodape = false }) {
  return (
    <>
      {rodape ? (
        <View style={[styles.footer, styles.footer2]} fixed>
          <View style={[styles.footerQrCode]}>{/* <Image src={qrCode} /> */}</View>
          <View style={[styles.footerText, styles.textSuccess]}>
            <Text>Caixa Económica de Cabo Verde, S.A.</Text>
            <Text>Capital social nominal de 1.392.000.000$00, Conser. do Reg. Comerc. da Praia nº 336</Text>
            <Text>Sede: Av. Cidade de Lisboa, C.P. 199, Praia, Ilha de Santiago, Cabo Verde</Text>
            <Text>Tel. +238 260 36 00, fax +238 361 55 60, e-mail: caixa@caixa.cv</Text>
            <Text>NIF: 200131753, Swift: CXEC CV CV</Text>
            <Text>O único banco em Cabo Verde certificado ISO 9001 e ISO 27001</Text>
          </View>
          <View style={[styles.footerCertificacoes]}>
            <Image src="/assets/iso9001.png" style={{ marginTop: '2mm', width: 82.5, height: 32 }} />
            <Image src="/assets/iso27001.png" style={{ marginTop: '1mm', width: 82.5, height: 32 }} />
          </View>
        </View>
      ) : (
        <View style={[styles.nofooter]} fixed>
          <Text>{}</Text>
        </View>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

RodapeContrato.propTypes = { codificacao: PropTypes.string };

export function RodapeContrato({ codificacao = false }) {
  return (
    <View style={[styles.footer, styles.footer3, styles.caption1]} fixed>
      <Text>{codificacao}</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}
