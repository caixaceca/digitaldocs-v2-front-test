import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, Document, Paragraph } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { ptDate } from '@/utils/formatTime';
import { useSelector } from '@/redux/store';
import { mapearPayloadParaFINCC } from './dados-mapper';
import { CabecalhoWordAlt, RodapeWordAlt, createStyles, PAGE_FORMULARIO } from '@/components/exportar-dados/word';
// components
import { custos } from './custos';
import { assinaturas } from './assinaturas';
import { identificacao } from './identificacao';
import DownloadModeloDoc from '@/components/Actions';
import { principaisCaracteristicas } from './caracteristicas';
import { planoFinanceiro, informacaoGeral } from './informacao-geral';

const codificacao = import.meta.env?.VITE_CODIFICACAO_FINCC || ptDate(new Date());

// ---------------------------------------------------------------------------------------------------------------------

export default function Fincc() {
  const { enqueueSnackbar } = useSnackbar();
  const processo = useSelector((state) => state.digitaldocs.processo);

  const dadosMapeados = mapearPayloadParaFINCC(processo);

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

      const logo = await fetch('/assets/logo_sem_fundo.png').then((r) => r.arrayBuffer());

      const { mutuario, agencia, fiadores, gerente_nome: nomeGerente } = dadosMapeados;

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `FINCC - Simulação - ${mutuario}`,
        styles: createStyles('10pt'),
        sections: [
          {
            properties: PAGE_FORMULARIO,
            headers: CabecalhoWordAlt({
              logo,
              codificacao,
              enabled: true,
              titulo: 'Ficha de Informação Normalizada de Crédito Consumo - Simulação',
            }),
            footers: RodapeWordAlt({ enabled: true }),
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
    <Stack sx={{ mt: 3 }}>
      <DownloadModeloDoc modelo="FINCC - Simulação.docx" onClick={exportToWord} />
    </Stack>
  );
}
