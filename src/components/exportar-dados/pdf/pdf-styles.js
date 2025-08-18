import { Font, StyleSheet } from '@react-pdf/renderer';

// ---------------------------------------------------------------------------------------------------------------------

Font.register({
  family: 'Neo Sans Std',
  fonts: [{ src: '/fonts/neo-sans-std.otf' }, { src: '/fonts/neo-sans-std-bold.otf', fontWeight: 700 }],
});

const styles = StyleSheet.create({
  page: {
    padding: '0',
    fontSize: 11,
    lineHeight: 1.5,
    paddingBottom: '5mm',
    backgroundColor: '#fff',
    fontFamily: 'Neo Sans Std',
  },

  /// HEADER
  noheader: { height: '55mm' },
  headerAlt: { color: '#5aaa28' },
  headerTitle: { fontSize: 15, paddingTop: '12mm' },
  headerCaption: { fontSize: 8, paddingTop: '-2mm' },
  bodyHeader: { fontSize: 7, paddingTop: '10mm', paddingLeft: '30mm' },
  headerLogo: { width: '51mm', height: '45mm', paddingTop: '30mm', backgroundColor: '#5aaa28' },
  bodyHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, paddingTop: '3mm' },
  header: { color: '#fff', height: '40mm', marginBottom: '10px', padding: '0 12mm 0 24mm', backgroundColor: '#5aaa28' },

  /// BODY
  body: { padding: '3mm 12mm 3mm 24mm', color: '#5aaa28', fontSize: 8 },
  bodyAlt: { padding: '0mm 24mm 0mm 30mm', textAlign: 'justify', color: '#333' },

  /// GRID
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },

  /// TABLE
  table: { display: 'flex', width: 'auto' },
  tableBody: { textAlign: 'left', color: '#444' },
  tableBodyRow: { borderBottom: '1px solid #eee' },
  tableHeader: { textAlign: 'center', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingTop: 10, alignItems: 'center' },

  /// TABLE CELL
  tCell_10: { width: '10%', paddingRight: 5, paddingLeft: 5 },
  textCell: { paddingTop: 5, paddingLeft: 5, paddingRight: 5, lineHeight: 1.5, backgroundColor: '#fff' },

  /// TEXT
  textBold: { fontWeight: 'bold' },
  text4: { fontSize: 9, color: '#888' },

  /// TEXT COLOR
  textError: { color: '#FF4842' },
  textSuccess: { color: '#5aaa28' },

  /// TITLE/SUBTITLE
  title: { textAlign: 'center', fontWeight: 'bold', fontSize: 12 },

  /// PADDING RIGHT
  pr2: { paddingRight: 2 },
  pr10: { paddingRight: 10 },

  /// MARGIN TOP
  mt15: { marginTop: 15 },

  /// FOOTER
  footer: { left: 0, right: 0, bottom: 0, margin: 'auto', position: 'absolute', flexDirection: 'row' },
  footer1: { fontSize: 8, color: '#fff', padding: '4mm', paddingBottom: '1mm', justifyContent: 'center' },
  footer2: { padding: '8mm', alignItems: 'center', paddingBottom: '9mm', justifyContent: 'space-between' },
  nofooter: { height: '25mm' },
  footerText: { top: 5, fontSize: 9, width: '129mm', margin: 'auto', lineHeight: 1.2, textAlign: 'right' },
  footerQrCode: { width: '22mm', height: '22mm' },
  footerCertificacoes: { width: '43mm', paddingRight: '5mm', alignItems: 'flex-end', alignContent: 'flex-end' },
});

export default styles;
