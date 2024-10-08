import { add } from 'date-fns';
import PropTypes from 'prop-types';
import { Page, View, Text, Document } from '@react-pdf/renderer';
// utils
import { ptDateTime } from '../../../utils/formatTime';
// components
import { styles, RodapeAlt, CabecalhoAlt } from '../../../components/ExportDados';

// ----------------------------------------------------------------------

ParecerExport.propTypes = { dados: PropTypes.object };

export default function ParecerExport({ dados }) {
  const data = dados?.parecer?.validado ? dados?.parecer?.data_parecer : new Date();
  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          <CabecalhoAlt cabecalho />

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
              Unidade orgânica: <Text style={[styles.caption]}>{dados?.parecer?.nome}</Text>
            </Text>
            <Text>
              Data parecer:{' '}
              <Text style={[styles.caption]}>
                {ptDateTime(data)}{' '}
                {add(new Date(dados?.parecer?.data_limite), { days: 1 }) < new Date(data) && (
                  <Text style={[styles.captionError]}>
                    (Atrasado: data limite {ptDateTime(dados?.parecer?.data_limite)})
                  </Text>
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
            {dados?.parecer?.anexos?.filter((item) => item?.ativo)?.length > 0 && (
              <View style={[styles.mt15]}>
                <Text style={[styles.caption]}>Anexos:</Text>
                {dados?.parecer?.anexos
                  ?.filter((item) => item?.ativo)
                  .map((row) => (
                    <Text key={row?.nome}> - {row?.nome}</Text>
                  ))}
              </View>
            )}
          </View>
          <RodapeAlt rodape />
        </Page>
      </Document>
    </>
  );
}
