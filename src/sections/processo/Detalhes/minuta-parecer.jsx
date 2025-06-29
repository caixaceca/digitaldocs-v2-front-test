import { add } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { PDFDownloadLink, Page, View, Text, Document } from '@react-pdf/renderer';
// @mui
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
// utils
import { pdfInfo } from '../../../utils/formatText';
import { ptDateTime } from '../../../utils/formatTime';
import { getFileThumb, downloadDoc } from '../../../utils/formatFile';
// components
import { styles, RodapeAlt, CabecalhoAlt } from '../../../components/ExportDados';

// ---------------------------------------------------------------------------------------------------------------------

export function DownloadPdf({ documento, ficheiro }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [baixar, setBaixar] = useState(false);

  useEffect(() => {
    if (pdfUrl) {
      setBaixar(false);
      downloadDoc(pdfUrl, ficheiro);
    }
  }, [setPdfUrl, pdfUrl, ficheiro]);

  return (
    <>
      {baixar ? (
        <PDFDownloadLink style={{ textDecoration: 'none' }} fileName={ficheiro} document={documento}>
          {({ loading, url }) => {
            if (!loading && url) setPdfUrl(url);
            return (
              <Tooltip title="Baixar minuta do parecer" arrow>
                <IconButton sx={{ p: 0.15 }} color="success" loading={loading}>
                  <FileDownloadIcon sx={{ width: 18, height: 18 }} />
                </IconButton>
              </Tooltip>
            );
          }}
        </PDFDownloadLink>
      ) : (
        <Tooltip title="Gerar PDF da minuta do parecer" arrow>
          <IconButton sx={{ p: 0.15 }} onClick={() => setBaixar(true)}>
            {getFileThumb(true, { width: 18, height: 18 }, 'minuta.pdf')}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export default function ParecerExport({ dados }) {
  const anexos = useMemo(() => dados?.anexos?.filter(({ ativo }) => ativo), [dados?.anexos]);

  return (
    <Document {...pdfInfo} title="Minuta parecer">
      <Page size="A4" style={styles.page}>
        <CabecalhoAlt cabecalho />
        <View style={[styles.bodyAlt]}>
          <Text style={[styles.title]}>Minuta do parecer</Text>
          <InfoItem label="Nome" value={dados?.perfil} />
          <InfoItem
            label="Parecer"
            value={dados?.parecer || (dados?.parecer_favoravel && 'Favorável') || 'Não favorável'}
          />
          <InfoItem label="Unidade orgânica" value={dados?.nome || dados?.estado_id} />
          <InfoItem
            label="Data parecer"
            value1={
              <Text style={[styles.textBold]}>
                {ptDateTime(dados?.data_parecer)}{' '}
                {dados?.data_limite &&
                  add(new Date(dados?.data_limite), { days: 1 }) < new Date(dados?.data_parecer) && (
                    <Text style={[styles.text4, styles.textError]}>
                      (Atrasado: data limite {ptDateTime(dados?.data_limite)})
                    </Text>
                  )}
              </Text>
            }
          />
          <View style={[styles.mt15]}>
            <InfoItem label="Assunto" value={dados?.assunto} />
          </View>
          <View style={[styles.mt15]}>
            {(dados?.observacao || dados?.descritivo || dados?.parecer_obs)?.split('\r\n')?.map((row, index) => (
              <Text key={`desc_${index}`}>{row}</Text>
            ))}
          </View>
          {anexos?.length > 0 && (
            <View style={[styles.mt15]}>
              <Text style={[styles.textBold]}>Anexos:</Text>
              {anexos.map(({ nome }) => (
                <Text key={nome}> - {nome}</Text>
              ))}
            </View>
          )}
        </View>
        <RodapeAlt rodape />
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function InfoItem({ label, value = '', value1 = null }) {
  const assunto = label === 'Assunto';

  return (
    <View style={[{ flexDirection: 'row' }]}>
      <Text style={[assunto ? styles.pr10 : styles.pr2]}>{label}:</Text>
      {!!value && (
        <Text style={[assunto ? { paddingRight: 50 } : {}, styles.textBold, { lineHeight: assunto ? 1.2 : '' }]}>
          {value}
        </Text>
      )}
      {value1}
    </View>
  );
}
