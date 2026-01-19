import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { useSelector } from '../../../../redux/store';
import { ptDate } from '../../../../utils/formatTime';
import { CabecalhoWord, RodapeWord, createStyles } from '../../../../components/exportar-dados/word';
//
import { assinaturas } from '../fin/assinaturas';
import { mapDadosPoposta } from './dados-mapper';
import DownloadModeloDoc from '../../../../components/Actions';
import { condicoesGerais, encargos, obrigacoes } from './sections';

// ---------------------------------------------------------------------------------------------------------------------

export default function ModeloCartaProposta() {
  const { enqueueSnackbar } = useSnackbar();
  const processo = useSelector((state) => state.digitaldocs.processo);

  const dados = mapDadosPoposta(processo);
  const nomeProponente = dados.condicoes?.nome_proponente || 'Nome do Proponente';

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

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
            properties: { page: { margin: { top: '58mm', right: '18mm', left: '18mm' } } },
            headers: CabecalhoWord({ enabled: true, logo, codificacao: 'JRDC.FM.C.023.00', titulo: '' }),
            footers: RodapeWord({ enabled: true, certificacoes: [iso27001, iso9001] }),
            children: [
              new Paragraph({
                spacing: { after: 300 },
                style: 'titulo',
                alignment: AlignmentType.CENTER,
                text: 'Carta Proposta',
              }),
              new Paragraph({ spacing: { after: 150 }, text: `Exmo. Sr(a). ${nomeProponente}` }),
              new Paragraph({
                spacing: { after: 300 },
                text: `Comunicamos que o crédito solicitado em ${
                  ptDate(dados.condicoes?.data_entrada) || 'DD/MM/YYYY'
                } foi aprovado nas seguintes condições:`,
              }),

              condicoesGerais(dados.condicoes),
              new Paragraph({ spacing: { after: 100 } }),
              encargos(dados.encargos),
              new Paragraph({ spacing: { after: 100 } }),
              obrigacoes(dados.obrigacoes),
              ...assinaturas(dados.condicoes?.agencia, 'Nome do Gerente', nomeProponente, dados.condicoes?.fiadores),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `Carta Proposta - ${nomeProponente || 'Proponente'}.docx`);
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao gerar Carta Proposta', { variant: 'error' });
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
