import PropTypes from 'prop-types';
import { Page, View, Text, Image, Document } from '@react-pdf/renderer';
// utils
import { add } from 'date-fns';
import { ptDate } from '../../utils/formatTime';
//
import styles from '../Style';

// ----------------------------------------------------------------------

ParecerExport.propTypes = { dados: PropTypes.object };

export default function ParecerExport({ dados }) {
  const data = dados?.parecer?.validado ? dados?.parecer?.data_parecer : new Date();
  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Cabeçalho */}
          <View style={[styles.header]} fixed>
            <View style={[styles.gridContainer]}>
              <View style={[styles.bodyHeader]}>{}</View>
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

          {/* Body */}
          <View style={[styles.body]}>
            <Text style={[styles.title]}>Minuta do parecer</Text>
            <Text>
              Nome: <Text style={[styles.caption]}>{dados?.nome}</Text>
            </Text>
            <Text>
              Parecer: <Text style={[styles.caption]}>{dados?.parecer?.parecer}</Text>
            </Text>
            <Text>
              Unidade orgânica: <Text style={[styles.caption]}>{dados?.parecer?.nome?.replace(' - P/S/P', '')}</Text>
            </Text>
            <Text>
              Data parecer:{' '}
              <Text style={[styles.caption]}>
                {ptDate(data)}{' '}
                {add(new Date(dados?.parecer?.data_limite), { days: 1 }) < new Date(data) && (
                  <>
                    (<Text style={[styles.captionError]}>Atrasado</Text>
                    <Text style={[styles.captionSecondary]}>
                      {' '}
                      - Data limite {dados?.parecer?.data_limite && ptDate(dados?.parecer?.data_limite)}
                    </Text>
                    )
                  </>
                )}
              </Text>
            </Text>
            <Text style={[styles.mt15]}>
              Assunto: <Text style={[styles.caption]}>{dados?.assunto}</Text>
            </Text>
            <View style={[styles.mt15]}>
              {dados?.parecer?.parecer_obs?.split('\r\n')?.map((row, index) => (
                <Text key={`desc_${index}`}>{row}</Text>
              ))}
            </View>
            {dados?.parecer?.anexos?.filter((item) => item?.is_ativo)?.length > 0 && (
              <View style={[styles.mt15]}>
                <Text style={[styles.caption]}>Anexos:</Text>
                {dados?.parecer?.anexos
                  ?.filter((item) => item?.is_ativo)
                  .map((row) => (
                    <Text key={row?.nome}> - {row?.nome?.replace(' - P/S/P', '')}</Text>
                  ))}
              </View>
            )}
          </View>

          {/* Rodapé */}
          <View style={[styles.footer]} fixed>
            <View style={[styles.footerQrCode]}> </View>
            <View style={[styles.footerText]}>
              <Text>Caixa Económica de Cabo Verde, S.A.</Text>
              <Text>Capital social nominal de 1.392.000.000$00, Conser. do Reg. Comerc. da Praia nº 336</Text>
              <Text>Sede: Av. Cidade de Lisboa, C.P. 199, Praia, Ilha de Santiago, Cabo Verde</Text>
              <Text>Tel. +238 260 36 00, fax +238 361 55 60, e-mail: caixa@caixa.cv</Text>
              <Text>NIF: 200131753, Swift: CXEC CV CV</Text>
              <Text>O único banco em Cabo Verde certificado ISO 9001 e ISO 27001</Text>
            </View>
            <View style={[styles.footerCertificacoes]}>
              <Image
                src="https://intranet.caixa.cv:5000/sobre/file/sobre_caixa/f04888bab00447b38549d9bf54431af3.png"
                style={{ marginBottom: '3mm', width: '20mm' }}
              />
              <Image
                src="https://intranet.caixa.cv:5000/sobre/file/sobre_caixa/43ac8cad72994f8681a2cd0a210f5a31.png"
                style={{ width: '20mm' }}
              />
            </View>
          </View>
        </Page>
      </Document>
    </>
  );
}
