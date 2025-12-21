import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, Document, Paragraph } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { CabecalhoWord, RodapeWord, stylesWord } from '../../../../components/exportar-dados/word';
//
import { assinaturas } from './assinaturas';
import DownloadModelo from '../../Detalhes/anexos/download-modelo';
//
import { planoFinanceiroTable, informacaoGeralTable } from './parte_2_3';
import { identificacaoTable, principaisCaracteristicasTable, custosTable } from './parte_1';

// ---------------------------------------------------------------------------------------------------------------------

export default function Fincc({ dados = {} }) {
  const { enqueueSnackbar } = useSnackbar();

  const defaulted = {
    proponente_nome: dados?.titular ?? 'Nome do proponente',
    fiadores: [
      { nome: 'Nome Fiador 1', estadoCivil: 'Solteiro', nif: '124357453', residencia: 'Palmarejo' },
      { nome: 'Nome Fiador 2', estadoCivil: 'Solteira', nif: '223145321', residencia: 'Fazenda' },
    ],
    data_proposta: new Date(),
    data_solicitacao: dados?.data_entrada ?? '2025-01-21',
    montante: 1250000,
    prazo_amortizacao: 60,
    tan: 11,
    taeg: 13.153,
    taxa_mora: 2,
    comissao_abertura: 1.75,
    valor_comissao_abertura: 1250,
    imposto_selo_credito: 0.5,
    valor_imposto_selo_credito: 136,
    valor_imposto_selo_comissao: 250,
    valor_total_encargos_iniciais: 12500,
    conta_pagamento: '3929767210001',
    agencia: 'PLATEAU',
    prazo_entrega_contrato: 15,
    gerente_nome: 'Nome do Gerente',
    agencia_localizacao: 'Plateau',
    ...dados,
  };

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      const { agencia, fiadores, gerente_nome: nomeGerente, proponente_nome: nomeProponente } = defaulted;

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `FINCC - Simulação - ${nomeProponente}`,
        styles: stylesWord,
        sections: [
          {
            properties: { page: { margin: { top: '60mm', bottom: '40mm', right: '18mm', left: '18mm' } } },
            headers: CabecalhoWord({
              enabled: true,
              logo,
              codificacao: 'JRDC.FM.C.023.00',
              titulo: 'Ficha de Informação Normalizada de Crédito Consumo - Simulação',
            }),
            footers: RodapeWord({ enabled: true, certificacoes: [iso27001, iso9001] }),
            children: [
              identificacaoTable(defaulted),
              principaisCaracteristicasTable(defaulted),
              custosTable(defaulted),

              new Paragraph({ text: '', break: 1 }),
              planoFinanceiroTable(defaulted),

              new Paragraph({ text: '', break: 1 }),
              informacaoGeralTable(defaulted),

              ...assinaturas(agencia, nomeGerente, nomeProponente, fiadores),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `FINCC - Simulação - ${nomeProponente || 'Proponente'}.docx`);
      });
    } catch (error) {
      enqueueSnackbar('Erro ao gerar FINCC', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ mt: 2 }}>
      <DownloadModelo modelo="FINCC - Simulação.docx" onClick={exportToWord} />
    </Stack>
  );
}
