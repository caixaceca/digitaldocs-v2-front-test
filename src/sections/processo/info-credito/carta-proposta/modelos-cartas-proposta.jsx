import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { useSelector } from '@/redux/store';
import { ptDate } from '@/utils/formatTime';
import { CabecalhoWord, RodapeWord, createStyles } from '@/components/exportar-dados/word';
// componentes locais
import { assinaturas } from '../fin/assinaturas';
import { mapDadosPoposta } from './dados-mapper';
import DownloadModeloDoc from '@/components/Actions';
import { condicoesGerais, encargos, obrigacoes } from './sections';

// ---------------------------------------------------------------------------------------------------------------------

export default function ModeloCartaProposta() {
  const { enqueueSnackbar } = useSnackbar();

  const processo = useSelector((state) => state.digitaldocs.processo);

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

      const dados = mapDadosPoposta(processo);
      const nomeProponente = dados.condicoes?.nome_proponente || 'Proponente';

      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `Carta Proposta - ${nomeProponente}`,
        styles: createStyles('10pt'),
        sections: [
          {
            properties: { page: { margin: { top: '58mm', right: '18mm', left: '18mm', bottom: '20mm' } } },
            headers: CabecalhoWord({ enabled: true, logo, codificacao: 'JRDC.FM.C.023.00', titulo: '' }),
            footers: RodapeWord({ enabled: true, certificacoes: [iso27001, iso9001] }),
            children: [
              new Paragraph({
                style: 'titulo',
                spacing: { after: 300 },
                alignment: AlignmentType.CENTER,
                text: 'CARTA PROPOSTA',
              }),

              new Paragraph({ spacing: { after: 150 }, text: `Exmo(a). Sr(a). ${nomeProponente.toUpperCase()}` }),

              new Paragraph({
                spacing: { after: 300 },
                text: `Comunicamos que o crédito solicitado em ${ptDate(dados.condicoes?.data_entrada) || 'DD/MM/YYYY'} foi aprovado nas seguintes condições:`,
              }),

              condicoesGerais(dados.condicoes),
              new Paragraph({ spacing: { before: 200 } }),

              encargos(dados.encargos),
              new Paragraph({ spacing: { before: 200 } }),

              obrigacoes(dados.obrigacoes),
              new Paragraph({ spacing: { before: 400 } }),

              ...assinaturas(dados.condicoes?.agencia, 'A Gerência', nomeProponente, dados.condicoes?.fiadores),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Carta Proposta - ${nomeProponente}.docx`);

      enqueueSnackbar('Documento gerado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      enqueueSnackbar('Erro ao gerar Carta Proposta. Verifique os dados do processo.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ mt: 2 }}>
      <DownloadModeloDoc modelo="Modelo de Carta Proposta - CrediCaixa.docx" onClick={exportToWord} />
    </Stack>
  );
}
