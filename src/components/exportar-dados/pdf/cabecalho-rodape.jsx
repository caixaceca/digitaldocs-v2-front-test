import { View, Text, Image } from '@react-pdf/renderer';
// utils
import { formatDate, ptDate } from '@/utils/formatTime';
//
import styles from './pdf-styles';

// ---------------------------------------------------------------------------------------------------------------------

export function CabecalhoPdf({ title, codificacao = '' }) {
  return (
    <View style={[styles.gridContainer, styles.header]} fixed>
      <View>
        <View style={{ flexDirection: 'row', fontSize: 7, paddingTop: '10mm' }}>
          <Text>{codificacao || ptDate(new Date())}</Text>
          <Text render={({ pageNumber, totalPages }) => ` | ${pageNumber}/${totalPages}`} />
        </View>
        <Text style={[styles.headerTitle]}>{title}</Text>
        <Text style={[styles.headerCaption]}>Caixa Económica de Cabo Verde</Text>
      </View>
      <View>
        <Image source="/assets/logo_sem_fundo_branco.png" style={{ height: 60, paddingTop: '12mm' }} />
      </View>
    </View>
  );
}

export function CabecalhoPdfAlt({ cabecalho = false, codificacao = '' }) {
  return (
    <>
      {cabecalho ? (
        <View style={[styles.headerAlt]} fixed>
          <View style={[styles.gridContainer]}>
            <Text
              style={[styles.bodyHeader]}
              render={({ pageNumber, totalPages }) =>
                `${codificacao ?? formatDate(new Date())} | ${pageNumber}/${totalPages}`
              }
            />
            <View style={[styles.headerLogo]}>
              <Image
                src="/assets/logo_sem_fundo_branco.png"
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

export function CabecalhoFicha({ title, codificacao }) {
  return (
    <View style={[styles.gridContainer, styles.borderCinza, { fontWeight: 'bold', marginBottom: '5mm' }]} fixed>
      <View style={[styles.verticalCenter, { height: '100%' }]}>
        <Text style={{ padding: '5mm', paddingTop: '8mm', fontSize: 15, textTransform: 'uppercase', lineHeight: 0 }}>
          {title}
        </Text>
      </View>
      <View style={{ borderLeft: '1px solid #ddd', width: '50mm' }}>
        <Image source="/assets/logo_sem_fundo.png" style={{ paddingLeft: '7mm', paddingRight: '7mm' }} />
        <Text style={[styles.bgSuccess, styles.headerFicha, { color: '#fff' }]}>CODIFICAÇÃO</Text>
        <Text style={[styles.headerFicha, { fontWeight: 'normal' }]}>{codificacao}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RodapePdf({ noOrigin = false }) {
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

// ---------------------------------------------------------------------------------------------------------------------

export function RodapePdfAlt({ rodape = false }) {
  return (
    <>
      {rodape ? (
        <View style={[styles.footer, styles.footer2]} fixed>
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

// ---------------------------------------------------------------------------------------------------------------------

export function RodapeFicha({ title1 = 'Elaborado:', title2 = 'Aprovado:', elaborado = '', aprovado = '' }) {
  return (
    <View fixed style={[styles.text7, { marginTop: '5mm', lineHeight: 0 }]}>
      <View style={[styles.gridContainer, styles.bgSuccess, styles.footerItemPadding, { color: '#fff' }]}>
        <View style={[styles.tCell_33]}>
          <Text>{title1}</Text>
        </View>
        <View style={[styles.tCell_33, styles.alignCenter]}>
          <Text>{title2}</Text>
        </View>
        <View style={[styles.tCell_33, styles.alignRight]}>
          <Text>Pág:</Text>
        </View>
      </View>
      <View style={[styles.gridContainer, styles.footerItemPadding]}>
        <View style={[styles.tCell_33]}>
          <Text>{elaborado}</Text>
        </View>
        <View style={[styles.tCell_33, styles.alignCenter]}>
          <Text>{aprovado}</Text>
        </View>
        <View
          style={[styles.tCell_33, styles.alignRight]}
          render={({ pageNumber, totalPages }) => <Text>{`${pageNumber}/${totalPages}`}</Text>}
        />
      </View>
    </View>
  );
}
