import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, Document, Paragraph } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { useSelector } from '../../../../redux/store';
import { mapearPayloadParaFINCC } from './dados-mapper';
import { CabecalhoWord, RodapeWord, createStyles } from '../../../../components/exportar-dados/word';
// components
import { custos } from './custos';
import { assinaturas } from './assinaturas';
import { identificacao } from './identificacao';
import { principaisCaracteristicas } from './caracteristicas';
import DownloadModeloDoc from '../../../../components/Actions';
import { planoFinanceiro, informacaoGeral } from './informacao-geral';

// ---------------------------------------------------------------------------------------------------------------------

export default function Fincc() {
  const { enqueueSnackbar } = useSnackbar();
  const processo = useSelector((state) => state.digitaldocs.processo);

  const dadosMapeados = mapearPayloadParaFINCC(processo);

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      const { mutuario, agencia, fiadores, gerente_nome: nomeGerente } = dadosMapeados;

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `FINCC - Simulação - ${mutuario}`,
        styles: createStyles('10pt'),
        sections: [
          {
            properties: { page: { margin: { top: '58mm', right: '18mm', left: '18mm' } } },
            headers: CabecalhoWord({
              logo,
              enabled: true,
              codificacao: 'JRDC.FM.C.023.00',
              titulo: 'Ficha de Informação Normalizada de Crédito Consumo - Simulação',
            }),
            footers: RodapeWord({ enabled: true, certificacoes: [iso27001, iso9001] }),
            children: [
              identificacao(dadosMapeados),
              principaisCaracteristicas(dadosMapeados),
              custos(dadosMapeados),

              new Paragraph({ text: '', break: 1 }),
              planoFinanceiro(dadosMapeados),

              new Paragraph({ text: '', break: 1 }),
              informacaoGeral(dadosMapeados),

              ...assinaturas(agencia, nomeGerente, mutuario, fiadores),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `FINCC - Simulação - ${mutuario || 'Proponente'}.docx`);
      });
    } catch {
      enqueueSnackbar('Erro ao gerar FINCC', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ mt: 2 }}>
      <DownloadModeloDoc modelo="FINCC - Simulação.docx" onClick={exportToWord} />
    </Stack>
  );
}
