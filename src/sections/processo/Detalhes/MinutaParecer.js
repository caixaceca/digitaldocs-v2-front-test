import { add } from 'date-fns';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { PDFDownloadLink, Page, View, Text, Document } from '@react-pdf/renderer';
// @mui
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { getFileThumb } from '../../../utils/formatFile';
// hooks
import useToggle from '../../../hooks/useToggle';
// components
import { styles, RodapeAlt, CabecalhoAlt } from '../../../components/ExportDados';

// ----------------------------------------------------------------------

MinutaParecer.propTypes = { dados: PropTypes.object };

export default function MinutaParecer({ dados }) {
  const { toggle: open, onOpen } = useToggle();

  return open ? (
    <PDFLink dados={dados} />
  ) : (
    <Tooltip title="Gerar PDF da minuta do parecer" arrow>
      <IconButton sx={{ p: 0.15 }} onClick={() => onOpen()}>
        {getFileThumb(true, { width: 18, height: 18 }, 'minuta.pdf')}
      </IconButton>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

PDFLink.propTypes = { dados: PropTypes.object };

function PDFLink({ dados }) {
  const anexos = useMemo(() => dados?.anexos?.filter((item) => item?.ativo), [dados?.anexos]);

  const pdfDocument = useMemo(
    () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <CabecalhoAlt cabecalho />
          <View style={[styles.bodyAlt]}>
            <Text style={[styles.title]}>Minuta do parecer</Text>
            <InfoItem label="Nome" value={dados?.perfil?.displayName} />
            <InfoItem label="Parecer" value={dados?.parecer_favoravel ? 'Favorável' : 'Não favorável'} />
            <InfoItem label="Unidade orgânica" value={dados?.estado || dados?.estado_inicial} />
            <InfoItem
              label="Data parecer"
              value1={
                <Text style={[styles.textBold]}>
                  {dados?.parecer_em ? ptDateTime(dados?.parecer_em) : ''}{' '}
                  {dados?.parecer_data_limite &&
                    add(new Date(dados?.parecer_data_limite), { days: 1 }) < new Date(dados?.parecer_em) && (
                      <Text style={[styles.text4, styles.textError]}>
                        (Atrasado: data limite {ptDateTime(dados?.parecer_data_limite)})
                      </Text>
                    )}
                </Text>
              }
            />
            <View style={[styles.mt15]}>
              <InfoItem label="Assunto" value={dados?.assunto} />
            </View>
            <View style={[styles.mt15]}>
              {(dados?.observacao || dados?.descritivo)?.split('\r\n')?.map((row, index) => (
                <Text key={`desc_${index}`}>{row}</Text>
              ))}
            </View>
            {anexos?.length > 0 && (
              <View style={[styles.mt15]}>
                <Text style={[styles.textBold]}>Anexos:</Text>
                {anexos.map((row) => (
                  <Text key={row?.nome}> - {row?.nome}</Text>
                ))}
              </View>
            )}
          </View>
          <RodapeAlt rodape />
        </Page>
      </Document>
    ),
    [dados, anexos]
  );

  return (
    <PDFDownloadLink
      fileName={`Minuta do parecer - ${dados?.estado || dados?.estado_inicial}.pdf`}
      document={pdfDocument}
    >
      {({ loading }) =>
        loading ? (
          <CircularProgress size={18} thickness={6} />
        ) : (
          <Tooltip title="Baixar minuta do parecer" arrow>
            <IconButton sx={{ p: 0.15 }} color="success">
              <FileDownloadIcon sx={{ width: 18, height: 18 }} />
            </IconButton>
          </Tooltip>
        )
      }
    </PDFDownloadLink>
  );
}

// ----------------------------------------------------------------------

InfoItem.propTypes = { label: PropTypes.string, value: PropTypes.string, value1: PropTypes.node };

function InfoItem({ label, value = '', value1 = null }) {
  return (
    <View style={[{ flexDirection: 'row' }]}>
      <Text style={[styles.pr2]}>{label}:</Text>
      {!!value && <Text style={[styles.textBold]}>{value}</Text>}
      {value1}
    </View>
  );
}
