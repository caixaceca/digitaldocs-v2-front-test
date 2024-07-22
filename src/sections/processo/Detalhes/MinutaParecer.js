import { add } from 'date-fns';
import PropTypes from 'prop-types';
import { Page, View, Text, Document } from '@react-pdf/renderer';
// utils
import { ptDate, ptDateTime } from '../../../utils/formatTime';
// components
import { styles, RodapeAlt, CabecalhoAlt } from '../../../components/ExportDados';

// ----------------------------------------------------------------------

MinutaParecer.propTypes = { dados: PropTypes.object };

export default function MinutaParecer({ dados }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <CabecalhoAlt cabecalho />
        <View style={[styles.bodyAlt]}>
          <Text style={[styles.title]}>Minuta do parecer</Text>
          <InfoItem label="Nome" value={dados?.nome} />
          <InfoItem label="Parecer" value={dados?.parecer_favoravel ? 'Favorável' : 'Não favorável'} />
          <InfoItem label="Unidade orgânica" value={dados?.estado} />
          <InfoItem
            label="Data parecer"
            value1={
              <Text style={[styles.textBold]}>
                {dados?.parecer_em ? ptDateTime(dados?.parecer_em) : ''}{' '}
                {add(new Date(dados?.parecer_data_limite), { days: 1 }) < new Date(dados?.parecer_em) && (
                  <Text style={[styles.text4, styles.textError]}>
                    (Atrasado: data limite {ptDate(dados?.parecer_data_limite)})
                  </Text>
                )}
              </Text>
            }
          />
          <View style={[styles.mt15]}>
            <InfoItem label="Assunto" value={dados?.assunto} />
          </View>
          <View style={[styles.mt15]}>
            {dados?.observacao?.split('\r\n')?.map((row, index) => (
              <Text key={`desc_${index}`}>{row}</Text>
            ))}
          </View>
          {dados?.anexos?.filter((item) => item?.ativo)?.length > 0 && (
            <View style={[styles.mt15]}>
              <Text style={[styles.textBold]}>Anexos:</Text>
              {dados?.anexos
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
  );
}

// ----------------------------------------------------------------------

InfoItem.propTypes = { label: PropTypes.string, value: PropTypes.string, value1: PropTypes.node };

function InfoItem({ label, value = '', value1 = null }) {
  return (
    <View style={[{ flexDirection: 'row' }]}>
      <Text>{label}: </Text>
      {!!value && <Text style={[styles.textBold]}>{value}</Text>}
      {value1}
    </View>
  );
}
