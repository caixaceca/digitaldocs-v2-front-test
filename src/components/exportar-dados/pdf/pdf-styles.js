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
  pageFicha: { padding: '15mm 15mm 15mm 15mm', fontFamily: 'Neo Sans Std', fontSize: 10 },

  /// HEADER
  noheader: { height: '55mm' },
  headerAlt: { color: '#5aaa28' },
  headerTitle: { fontSize: 15, paddingTop: '12mm' },
  headerCaption: { fontSize: 8, paddingTop: '-2mm' },
  bodyHeader: { fontSize: 7, paddingTop: '10mm', paddingLeft: '30mm' },
  headerFicha: { fontSize: 7, padding: '2mm', paddingBottom: '0px', textAlign: 'center' },
  headerLogo: { width: '51mm', height: '45mm', paddingTop: '30mm', backgroundColor: '#5aaa28' },
  bodyHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, paddingTop: '3mm' },
  header: { color: '#fff', height: '40mm', marginBottom: '10px', padding: '0 12mm 0 24mm', backgroundColor: '#5aaa28' },

  /// BODY
  bodyFicha: { flex: 1, paddingBottom: '5mm' },
  body: { padding: '3mm 12mm 3mm 24mm', color: '#5aaa28', fontSize: 8 },
  bodyAlt: { padding: '0mm 24mm 0mm 30mm', textAlign: 'justify', color: '#333' },
  subFicha: { padding: 4, fontSize: 9, paddingTop: 6, lineHeight: 1.2, paddingBottom: 1 },
  viewSubFicha: { height: '100%', textAlign: 'right', display: 'flex', justifyContent: 'center' },

  /// GRID
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },

  /// TABLE
  table: { display: 'flex', width: 'auto' },
  tableBody: { textAlign: 'left', color: '#444' },
  tableBodyRow: { borderBottom: '1px solid #eee' },
  tableHeader: { textAlign: 'center', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingTop: 10, alignItems: 'center' },
  tableRowFicha: { color: '#fff', flexDirection: 'row', alignItems: 'center', borderBottom: '0px solid transparent' },

  /// TABLE CELL
  tCell_4: { width: '4%', paddingRight: 5, paddingLeft: 5 },
  tCell_5: { width: '5%', paddingRight: 5, paddingLeft: 5 },
  tCell_6: { width: '6%', paddingLeft: 5 },
  tCell_8: { width: '8%', paddingRight: 5, paddingLeft: 5 },
  tCell_10: { width: '10%', paddingRight: 5, paddingLeft: 5 },
  tCell_12: { width: '12%', paddingRight: 5, paddingLeft: 5 },
  tCell_13: { width: '13%', paddingRight: 5, paddingLeft: 5 },
  tCell_15: { width: '15%', paddingRight: 5, paddingLeft: 5 },
  tCell_18: { width: '18%', paddingRight: 5, paddingLeft: 5 },
  tCell_20: { width: '20%', paddingRight: 5, paddingLeft: 5 },
  tCell_22: { width: '22%', paddingRight: 5, paddingLeft: 5 },
  tCell_25: { width: '25%', paddingRight: 5, paddingLeft: 5 },
  tCell_30: { width: '30%', paddingRight: 5, paddingLeft: 5 },
  tCell_33: { width: '33,33%', paddingRight: 5, paddingLeft: 5 },
  tCell_35: { width: '35%', paddingRight: 5, paddingLeft: 5 },
  tCell_36: { width: '36%', paddingRight: 5, paddingLeft: 5 },
  tCell_40: { width: '40%', paddingRight: 5, paddingLeft: 5 },
  tCell_45: { width: '45%', paddingRight: 5, paddingLeft: 5 },
  tCell_50: { width: '50%', paddingRight: 5, paddingLeft: 5 },
  tCell_65: { width: '65%', paddingRight: 5, paddingLeft: 5 },
  tCell_75: { width: '75%', paddingRight: 5, paddingLeft: 5 },
  tCell_80: { width: '80%', paddingRight: 5, paddingLeft: 5 },
  tCell_100: { width: '100%', paddingRight: 5, paddingLeft: 5 },

  /// TEXT
  text7: { fontSize: 7 },
  textBold: { fontWeight: 'bold' },
  text4: { fontSize: 9, color: '#888' },
  uppercase: { textTransform: 'uppercase' },
  textCellFicha: { lineHeight: 0, padding: 4, paddingTop: 6, paddingBottom: 1 },

  /// TITLE/SUBTITLE
  title: { textAlign: 'center', fontWeight: 'bold', fontSize: 12 },

  /// COLORS
  textError: { color: '#FF4842' },
  textSuccess: { color: '#5aaa28' },
  bgCinza: { backgroundColor: '#808080' },
  borderCinza: { border: '1px solid #ddd' },
  bgSuccess: { backgroundColor: '#5aaa28' },

  /// ALIGN
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  verticalCenter: { display: 'flex', justifyContent: 'center' },

  /// PADDING
  px0: { paddingRight: 0, paddingLeft: 0 },

  /// PADDING RIGHT
  pr2: { paddingRight: 2 },
  pr10: { paddingRight: 10 },

  /// MARGIN TOP
  mt15: { marginTop: 15 },

  /// FOOTER
  nofooter: { height: '25mm' },
  footer: { left: 0, right: 0, bottom: 0, margin: 'auto', position: 'absolute', flexDirection: 'row' },
  footer1: { fontSize: 8, color: '#fff', padding: '4mm', paddingBottom: '1mm', justifyContent: 'center' },
  footer2: { padding: '8mm', alignItems: 'center', paddingBottom: '9mm', justifyContent: 'space-between' },

  footerItemPadding: { paddingTop: '2mm', paddingBottom: '1mm' },
  footerText: { top: 5, fontSize: 9, width: '129mm', margin: 'auto', lineHeight: 1.2, textAlign: 'right' },
  footerCertificacoes: { width: '43mm', paddingRight: '5mm', alignItems: 'flex-end', alignContent: 'flex-end' },
});

export default styles;
