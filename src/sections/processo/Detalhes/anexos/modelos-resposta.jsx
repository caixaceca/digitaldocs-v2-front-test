import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { Packer, TextRun, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import { Stack } from '@mui/material';
import Divider from '@mui/material/Divider';
// utils
import { formatDate } from '../../../../utils/formatTime';
import { fCurrency } from '../../../../utils/formatNumber';
import { valorPorExtenso } from '../../../../utils/formatText';
//
import DownloadModelo from './download-modelo';
import { useSelector } from '../../../../redux/store';
import { CabecalhoWord, RodapeWord, stylesWord } from '../../../../components/exportar-dados/word';

// ---------------------------------------------------------------------------------------------------------------------

const DEFAULT_LINE_SPACING = 360;

const createParagraph = (childrenOrText, options = {}) => {
  const children =
    typeof childrenOrText === 'string'
      ? [new TextRun({ text: childrenOrText, break: options.break })]
      : childrenOrText.map((c) => (typeof c === 'string' ? new TextRun({ text: c, break: options.break }) : c));

  return new Paragraph({
    children,
    spacing: { line: options.spacing || DEFAULT_LINE_SPACING, after: options.after || 0 },
    alignment: options.alignment || AlignmentType.JUSTIFIED,
  });
};

const createBullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text })],
    spacing: { line: DEFAULT_LINE_SPACING, after: 0 },
    alignment: AlignmentType.JUSTIFIED,
  });

// ---------------------------------------------------------------------------------------------------------------------

export default function ModelosRespostas() {
  const { enqueueSnackbar } = useSnackbar();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { origens } = useSelector((state) => state.parametrizacao);

  const origem = origens?.find(({ id }) => id === processo?.origem_id);
  const { id, titular = '', conta = '', cliente = '', referencia = '', operacao = '', cativos = [] } = processo || {};

  const exportToWord = async (setLoading, tipo) => {
    if (!processo || !processo?.titular) {
      enqueueSnackbar('Dados do processo incompletos. Verifique o titular.', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);

      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      // Conteúdo de cliente
      const cativosList =
        tipo !== 'Cliente sem saldo' && cativos?.length > 0
          ? processo.cativos.map(({ conta, saldo_cve: saldo, tipo: tipoConta = '' }) =>
              createBullet(
                `${conta}, com saldo de ${fCurrency(saldo)} (${valorPorExtenso(Number(saldo))}) à ${tipoConta || 'ordem/prazo'};`
              )
            )
          : [createBullet(`${conta || cliente || 'xxxxxxxxxxxx'}, com saldo de 0 CVE (zero escudos);`)];

      const dadosCliente = [
        createParagraph([
          new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
          new TextRun({ text: titular, bold: true }),
          new TextRun({ text: ', é cliente desta Instituição Financeira, titular da seguinte conta:' }),
        ]),
        ...cativosList,
      ];

      const modelosConteudo = {
        Cliente: dadosCliente,
        'Entidade não é cliente': [
          createParagraph([
            new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
            new TextRun({ text: titular, bold: true }),
            new TextRun({ text: ', não é cliente desta Instituição Financeira.' }),
          ]),
        ],
        'Cancelamento/Levantamento de Cativo/Penhora': [
          createParagraph([
            new TextRun({
              text: 'Em resposta à Vossa Nota acima referenciada, informamos que, procedemos ao levantamento da penhora na conta nº ',
            }),
            new TextRun({ text: conta || 'xxxxxxxxxxxx', bold: true }),
            new TextRun({ text: ', titulada pela entidade ' }),
            new TextRun({ text: titular || 'XXXXX XXXXX', bold: true }),
            new TextRun({ text: '.' }),
          ]),
        ],
        'Cliente sem saldo': [
          ...dadosCliente,
          createParagraph(
            'Por inexistência de saldo, não foi possível proceder a penhora solicitada, na conta titulada pela entidade.',
            { break: 1 }
          ),
          createParagraph('Segue em anexo o extrato bancário.'),
        ],
        'Cliente sem saldo suficiente': [
          ...dadosCliente,
          createParagraph(
            'Por insuficiência de saldo, não foi possível proceder a penhora total na conta titulada pela entidade, todavia, foi penhorado o valor do saldo disponível acima.',
            { break: 1 }
          ),
          createParagraph('Segue em anexo o extrato bancário.'),
        ],
        'Cliente com valor total': [
          ...dadosCliente,
          createParagraph(
            'Informamos ainda que foi realizada a penhora do valor total solicitada, na conta titulada pela entidade.',
            { break: 1 }
          ),
          createParagraph('Segue em anexo o extrato bancário.'),
        ],
        'Modelo de nota': [createParagraph('Em resposta à Vossa Nota acima referenciada, informamos que,... ')],
      };

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        description: 'Modelo de resposta gerado automaticamente na Intranet para Processos Judiciais e Fiscais',
        title: `Modelo de resposta - ${id}`,
        styles: stylesWord,
        sections: [
          {
            properties: { page: { margin: { top: '60mm', bottom: '40mm', right: '25mm', left: '25mm' } } },
            headers: CabecalhoWord(true, logo, 'MKTG.FM.U.001.02 | 2021.04.09'),
            footers: RodapeWord(true, iso27001, iso9001),
            children: [
              createParagraph(
                [
                  new TextRun({ text: origem?.designacao }),
                  new TextRun({ text: origem?.seguimento, break: 1 }),
                  new TextRun({ text: `${origem?.ilha} - ${origem?.cidade}`, break: 1 }),
                  new TextRun({ text: `V/Ref: ${referencia}`, break: 2 }),
                  new TextRun({ text: `N/Ref: ____ ____ /${format(new Date(), 'yyyy')}`, break: 1 }),
                  new TextRun({ text: 'Assunto: ', break: 2 }),
                  new TextRun({ text: operacao || 'Assunto da nota', bold: true }),
                ],
                { alignment: AlignmentType.LEFT }
              ),
              createParagraph(`Praia, ${formatDate(new Date(), "dd 'de' MMMM 'de' yyyy")}`, {
                alignment: AlignmentType.RIGHT,
              }),
              ...modelosConteudo[tipo],
              createParagraph(
                [
                  new TextRun({ text: 'Com os melhores cumprimentos,', break: 2 }),
                  new TextRun({ text: 'Caixa Económica de Cabo Verde', break: 4 }),
                ],
                { alignment: AlignmentType.LEFT }
              ),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Modelo de resposta - ${id}.docx`);
    } catch (error) {
      enqueueSnackbar('Erro ao gerar documento', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Divider textAlign="left" sx={{ mt: 1.5, mb: 0.25, typography: 'overline' }}>
        Modelos de resposta
      </Divider>

      <Stack spacing={1}>
        {(operacao === 'Pedido de Informação' && (
          <>
            <DownloadModelo modelo="1: Entidade cliente.docx" onClick={exportToWord} tipo="Cliente" />
            <DownloadModelo
              tipo="Entidade não é cliente"
              modelo="2: Entidade não cliente.docx"
              onClick={exportToWord}
            />
          </>
        )) ||
          (operacao === 'Cancelamento/Levantamento de Cativo/Penhora' && (
            <DownloadModelo
              onClick={exportToWord}
              tipo="Cancelamento/Levantamento de Cativo/Penhora"
              modelo="1: Cancelamento/Levantamento de Cativo/Penhora.docx"
            />
          )) ||
          (operacao === 'Cativo/Penhora' && (
            <>
              <DownloadModelo
                onClick={exportToWord}
                tipo="Entidade não é cliente"
                modelo="1: Entidade não é cliente.docx"
              />
              <DownloadModelo modelo="2: Cliente sem saldo.docx" tipo="Cliente sem saldo" onClick={exportToWord} />
              <DownloadModelo
                onClick={exportToWord}
                tipo="Cliente sem saldo suficiente"
                modelo="3: Cliente sem saldo suficiente.docx"
              />
              <DownloadModelo
                onClick={exportToWord}
                tipo="Cliente com valor total"
                modelo="4: Cliente com valor total.docx"
              />
            </>
          )) || <DownloadModelo modelo="1: Modelo de nota.docx" tipo="Modelo de nota" onClick={exportToWord} />}
      </Stack>
    </Stack>
  );
}
