import { Font, StyleSheet } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

Font.register({
  family: 'Neo Sans Std',
  fonts: [
    { src: '/fonts/neo-sans-std.otf', fontWeight: 'normmal' },
    { src: '/fonts/neo-sans-std-bold.otf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    padding: '0mm',
    lineHeight: 1.8,
    paddingBottom: '5mm',
    backgroundColor: '#fff',
    fontFamily: 'Neo Sans Std',
  },
  pageAlt: { paddingBottom: '24mm' },
  pageClean: { padding: '24mm', textAlign: 'justify' },
  pageDeclaracao: { paddingBottom: '15mm', backgroundColor: 'rgba(90,170,40, .075)' },

  /// HEADER
  header: {
    color: '#fff',
    height: '40mm',
    marginBottom: '10px',
    padding: '0 12mm 0 24mm',
    backgroundColor: 'rgb(90,170,40)',
  },
  noheader: { height: '55mm' },
  headerAlt: { color: 'rgb(90,170,40)' },
  headerTitle: { fontSize: 15, paddingTop: '12mm' },
  headerCaption1: { fontSize: 8, paddingTop: '8mm' },
  headerCaption2: { fontSize: 8, paddingTop: '-2mm' },
  bodyHeader: { fontSize: 7, paddingTop: '10mm', paddingLeft: '30mm' },
  bodyHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, paddingTop: '3mm' },
  headerLogo: { width: '51mm', height: '45mm', paddingTop: '30mm', backgroundColor: 'rgb(90,170,40)' },

  /// BODY
  body: { padding: '3mm 12mm 3mm 24mm', color: 'rgb(90,170,40)', fontSize: 8 },
  bodyAlt: { padding: '0mm 51mm 0mm 30mm', textAlign: 'justify', color: '#333' },
  bodyDeclaracao: {
    fontSize: 9,
    lineHeight: 0,
    paddingLeft: '24mm',
    paddingRight: '12mm',
    textAlign: 'justify',
    color: 'rgb(90,170,40)',
  },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  gridContainerSimple: { flexDirection: 'row' },

  table: { display: 'flex', width: 'auto' },
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  tableBody: { textAlign: 'left', color: '#444' },
  tableBodyRow: { borderBottom: '1px solid #eee' },
  tableBodyRowAlt: { borderBottom: '1px solid #eee', fontSize: 7 },
  tCell_7: { width: '7%', paddingRight: 5, paddingLeft: 5 },
  tCell_10: { width: '10%', paddingRight: 5, paddingLeft: 5 },
  tCell_20: { width: '20%', paddingRight: 5, paddingLeft: 5 },
  tCell_25: { width: '25%', paddingRight: 5, paddingLeft: 5 },
  tCell_30: { width: '30%', paddingRight: 5, paddingLeft: 5 },
  tCell_33: { width: '33,33%', paddingRight: 5, paddingLeft: 5 },
  tCell_34: { width: '34%', paddingRight: 5, paddingLeft: 5 },
  tCell_35: { width: '35%', paddingRight: 5, paddingLeft: 5 },
  tCell_40: { width: '40%', paddingRight: 5, paddingLeft: 5 },
  tCell_50: { width: '50%', paddingRight: 5, paddingLeft: 5 },
  tCell_70: { width: '70%', paddingRight: 5, paddingLeft: 5 },
  tCell_75: { width: '75%', paddingRight: 5, paddingLeft: 5 },
  tCell_80: { width: '80%', paddingRight: 5, paddingLeft: 5 },
  tCell_93: { width: '93%', paddingRight: 5, paddingLeft: 5 },
  tCell_100: { width: '100%', paddingRight: 5, paddingLeft: 5 },
  textCell: { paddingTop: 5, paddingLeft: 5, paddingRight: 5, lineHeight: 1.5, backgroundColor: '#fff' },
  tableHeader: { textAlign: 'center', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingTop: 10, alignItems: 'center' },
  tableRow2: { paddingTop: 2, flexDirection: 'row', alignItems: 'center', borderBottom: '1px solid #eee' },
  tableHeader_: { fontSize: 8, fontWeight: 'bold', backgroundColor: 'rgb(90,170,40)', borderRadius: 2, color: '#fff' },
  noBorder: { borderBottom: '0px solid #fff !important' },

  text7: { fontSize: 7 },
  text8: { fontSize: 8 },
  text9: { fontSize: 9 },
  text10: { fontSize: 10 },
  text11: { fontSize: 11 },
  text4: { fontSize: 9, color: '#888' },
  body1: { fontSize: 11, color: '#000' },
  text1: { fontSize: 10, color: '#444' },
  text3: { fontSize: 8.5, color: '#444' },
  caption: { fontSize: 7, color: '#888' },
  caption1: { fontSize: 8, color: '#000' },
  caption2: { fontSize: 7, color: '#000' },
  captionAlt: { color: '#000', fontWeight: 'bold' },
  textError: { color: '#FF4842' },
  uppercase: { textTransform: 'uppercase' },
  textSuccess: { color: 'rgb(90, 170, 40)' },
  textBold: { fontWeight: 'bold' },
  textSpan: { display: 'inline' },

  title: { textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  title1: { textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  subtitle: { marginBottom: '0.5mm', marginTop: '0.5mm', fontSize: 12 },
  subtitle1: { fontSize: 11, fontWeight: 'bold' },
  subtitle2: { fontSize: 9, fontWeight: 'bold' },

  pr0: { paddingRight: 0 },
  pr10: { paddingRight: 10 },

  pl0: { paddingLeft: 0 },

  pt0: { paddingTop: 0 },

  pb24: { paddingBottom: '24mm' },

  px1: { paddingLeft: 1, paddingRight: 1 },

  mx40: { marginLeft: '20%', marginRight: '20%' },

  ml10: { marginLeft: 10 },

  mt2: { marginTop: 2 },
  mt5: { marginTop: 5 },
  mt10: { marginTop: 10 },
  mt15: { marginTop: 15 },
  mt40: { marginTop: 40 },

  mb10: { marginBottom: 10 },
  mb15: { marginBottom: 15 },
  mb20: { marginBottom: 20 },
  mb25: { marginBottom: 25 },

  divider: {
    height: 2,
    width: '150%',
    lineHeight: 0,
    marginLeft: -75,
    marginTop: '2mm',
    marginBottom: '2mm',
    backgroundColor: '#fff',
  },
  borderBottom: { borderBottom: '1px solid #000' },

  /// FOOTER
  footer: { left: 0, right: 0, bottom: 0, margin: 'auto', position: 'absolute', flexDirection: 'row' },
  footer1: { fontSize: 8, color: '#fff', padding: '4mm', paddingBottom: '1mm', justifyContent: 'center' },
  footer2: { padding: '8mm', alignItems: 'center', paddingBottom: '9mm', justifyContent: 'space-between' },
  footer3: { padding: '6mm 12mm 6mm 24mm', alignItems: 'center', justifyContent: 'space-between' },
  nofooter: { height: '25mm' },
  footerText: { top: 5, fontSize: 9, width: '129mm', margin: 'auto', lineHeight: 1.2, textAlign: 'right' },
  footerQrCode: { width: '22mm', height: '22mm' },
  footerCertificacoes: { width: '43mm', paddingRight: '5mm', alignItems: 'flex-end', alignContent: 'flex-end' },
});

export default styles;
