import { Font, StyleSheet } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

Font.register({
  family: 'NeoSansStd',
  fonts: [
    { src: '/fonts/neo-sans-std.otf' },
    { src: '/fonts/neo-sans-std-bold.otf' },
    { src: '/fonts/neo-sans-std-medium.otf' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: '0',
    paddingBottom: '25mm',
    fontSize: 10,
    lineHeight: 1.7,
    fontFamily: 'NeoSansStd',
    backgroundColor: '#fff',
  },

  /// HEADER
  header: { color: 'rgb(90,170,40)' },
  noheader: { height: '55mm' },
  bodyHeader: { fontSize: 10, paddingTop: '15mm', paddingLeft: '30mm' },
  bodyHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, paddingTop: '3mm' },
  headerLogo: {
    backgroundColor: 'rgb(90,170,40)',
    width: '51mm',
    height: '45mm',
    color: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  /// BODY
  body: { padding: '0mm 51mm 0mm 30mm', textAlign: 'justify', color: '#333' },
  title: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: '5mm',
    textAlign: 'center',
    marginBottom: '5mm',
    textTransform: 'uppercase',
  },
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  caption: { color: '#000', fontWeight: 600 },
  captionError: { fontSize: 9, color: '#FF4842', fontWeight: 300 },
  captionSecondary: { fontSize: 9, color: '#637381', fontWeight: 300 },

  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },

  /// MARGENS
  mb2: { marginBottom: 2 },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mt8: { marginTop: 8 },
  mb10: { marginBottom: 10 },
  mt10: { marginTop: 10 },
  mb15: { marginBottom: 15 },
  mt15: { marginTop: 15 },
  mb20: { marginBottom: 20 },
  mt20: { marginTop: 20 },
  mb25: { marginBottom: 25 },
  mt25: { marginTop: 25 },

  /// FOOTER
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8mm',
    paddingBottom: '6mm',
    marginTop: '60mm',
  },

  footerText: {
    fontSize: 9,
    width: '129mm',
    margin: 'auto',
    top: 5,
    lineHeight: 1.2,
    textAlign: 'right',
    color: 'rgb(90,170,40)',
  },
  footerCertificacoes: { width: '43mm', alignItems: 'flex-end', alignContent: 'flex-end' },
  footerQrCode: { width: '22mm', height: '22mm' },
});

export default styles;
