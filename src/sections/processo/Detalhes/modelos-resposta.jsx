import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { Packer, TextRun, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
// utils
import { formatDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import { getFileThumb } from '../../../utils/formatFile';
import { valorPorExtenso } from '../../../utils/formatText';
//
import { useSelector } from '../../../redux/store';
import GridItem from '../../../components/GridItem';
import { CabecalhoWord, RodapeWord } from '../../../components/ExportDados';

export default function ModelosRespostas() {
  const { enqueueSnackbar } = useSnackbar();

  const { processo } = useSelector((state) => state.digitaldocs);
  const { origens } = useSelector((state) => state.parametrizacao);
  const origem = origens?.find(({ id }) => id === processo?.origem_id);

  const exportToWord = async (tipo) => {
    if (!processo || !processo?.titular) {
      enqueueSnackbar('Dados do processo incompletos. Verifique o titular.', { variant: 'error' });
      return;
    }

    try {
      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      const alignSpacing = { spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED };

      const cativosList = () => {
        const cativos =
          tipo !== 'Cliente sem saldo' && processo?.cativos?.length > 0
            ? processo.cativos.map(
                ({ conta, saldo_cve: saldo, tipo: tipoConta = '' }) =>
                  new Paragraph({
                    ...alignSpacing,
                    bullet: { level: 0 },
                    children: [
                      new TextRun({
                        text: `${conta}, com saldo de ${fCurrency(saldo)} (${valorPorExtenso(Number(saldo || 0))}) à ${tipoConta || 'ordem/prazo'};`,
                      }),
                    ],
                  })
              )
            : [
                new Paragraph({
                  ...alignSpacing,
                  bullet: { level: 0 },
                  children: [new TextRun({ text: 'xxxxxxxxxxxx, com saldo de 0 CVE (zero escudos) à ordem/prazo;' })],
                }),
              ];
        return cativos;
      };

      const dadosCliente = [
        new Paragraph({
          ...alignSpacing,
          children: [
            new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
            new TextRun({ text: processo?.titular, bold: true }),
            new TextRun({ text: ', é cliente desta Instituição Financeira, titular da seguinte conta:' }),
          ],
        }),
        ...cativosList(),
      ];

      const modelosConteudo = {
        Cliente: dadosCliente,
        'Entidade não é cliente': [
          new Paragraph({
            ...alignSpacing,
            children: [
              new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
              new TextRun({ text: processo?.titular, bold: true }),
              new TextRun({ text: ', não é cliente desta Instituição Financeira.' }),
            ],
          }),
        ],
        'Cancelamento/Levantamento de Cativo/Penhora': [
          new Paragraph({
            ...alignSpacing,
            children: [
              new TextRun({
                text: 'Em resposta à Vossa Nota acima referenciada, informamos que, procedemos ao levantamento da penhora na conta nº ',
              }),
              new TextRun({ text: processo?.conta || 'xxxxxxxxxxxx', bold: true }),
              new TextRun({ text: ', titulada pela entidade ' }),
              new TextRun({ text: processo?.titular || 'Xxxxxxxx Xxxxx Xxxxxx', bold: true }),
              new TextRun({ text: '.' }),
            ],
          }),
        ],
        'Cliente sem saldo': [
          ...dadosCliente,
          new Paragraph({
            ...alignSpacing,
            children: [
              new TextRun({
                text: 'Por inexistência de saldo, não foi possível proceder a penhora solicitada, na conta titulada pela entidade.',
                break: 1,
              }),
            ],
          }),
          new Paragraph({ ...alignSpacing, children: [new TextRun({ text: 'Segue em anexo o extrato bancário.' })] }),
        ],
        'Cliente sem saldo suficiente': [
          ...dadosCliente,
          new Paragraph({
            ...alignSpacing,
            children: [
              new TextRun({
                text: 'Por insuficiência de saldo, não foi possível proceder a penhora total na conta titulada pela entidade, todavia, foi penhorado o valor do saldo disponível acima.',
                break: 1,
              }),
            ],
          }),
          new Paragraph({ ...alignSpacing, children: [new TextRun({ text: 'Segue em anexo o extrato bancário.' })] }),
        ],
        'Cliente com valor total': [
          ...dadosCliente,
          new Paragraph({
            ...alignSpacing,
            children: [
              new TextRun({
                text: 'Informamos ainda que foi realizada a penhora do valor total solicitada, na conta titulada pela entidade.',
                break: 1,
              }),
            ],
          }),
          new Paragraph({ ...alignSpacing, children: [new TextRun({ text: 'Segue em anexo o extrato bancário.' })] }),
        ],
        'Modelo de nota': [
          new Paragraph({
            ...alignSpacing,
            children: [new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que,... ' })],
          }),
        ],
      };

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        description: 'Modelo de resposta gerado automaticamente na Intranet para Processos Judiciais e Fiscais',
        title: `Modelo de resposta - ${processo?.id}`,
        styles: {
          default: { document: { run: { font: { name: 'Neo Sans Std' }, size: '11pt' } } },
          paragraphStyles: [
            { id: 'slogan', run: { color: '5aaa28', size: '9pt' } },
            { id: 'codificacao', run: { color: '5aaa28', size: '6pt' } },
          ],
        },
        sections: [
          {
            properties: { page: { margin: { top: '54mm', bottom: '35mm', right: '53mm', left: '25mm' } } },
            headers: CabecalhoWord(true, logo, 'MKTG.FM.U.001.02 | 2021.04.09'),
            footers: RodapeWord(true, iso27001, iso9001),
            children: [
              new Paragraph({
                spacing: { line: 360 },
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: origem?.designacao }),
                  new TextRun({ text: origem?.seguimento, break: 1 }),
                  new TextRun({ text: `${origem?.ilha} - ${origem?.cidade}`, break: 1 }),
                  new TextRun({ text: `V/Ref: ${processo?.referencia}`, break: 2 }),
                  new TextRun({ text: `N/Ref: ____ ____ /${format(new Date(), 'yyyy')}`, break: 1 }),
                  new TextRun({ text: 'Assunto: ', break: 2 }),
                  new TextRun({ text: processo?.operacao || 'Assunto da nota', bold: true }),
                ],
              }),
              new Paragraph({
                spacing: { line: 360 },
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `Praia, ${formatDate(new Date(), "dd 'de' MMMM 'de' yyyy")}`, break: 1 }),
                  new TextRun({ text: ' ', break: 1 }),
                ],
              }),
              ...modelosConteudo[tipo],
              new Paragraph({
                spacing: { line: 360 },
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: 'Com os melhores cumprimentos,', break: 2 }),
                  new TextRun({ text: 'Caixa Económica de Cabo Verde', break: 4 }),
                ],
              }),
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `Modelo de resposta - ${processo?.id}.docx`);
      });
    } catch (error) {
      enqueueSnackbar('Erro ao gerar documento', { variant: 'error' });
    }
  };

  return (
    <GridItem>
      <Divider textAlign="left" sx={{ mt: 1.5, mb: 0.25, typography: 'overline' }}>
        Modelos de resposta
      </Divider>
      {(processo?.operacao === 'Pedido de Informação' && (
        <>
          <ButtonModelo modelo="1: Entidade cliente.docx" evento={() => exportToWord('Cliente')} />
          <ButtonModelo modelo="2: Entidade não cliente.docx" evento={() => exportToWord('Entidade não é cliente')} />
        </>
      )) ||
        (processo?.operacao === 'Cancelamento/Levantamento de Cativo/Penhora' && (
          <ButtonModelo
            modelo="1: Cancelamento/Levantamento de Cativo/Penhora.docx"
            evento={() => exportToWord('Cancelamento/Levantamento de Cativo/Penhora')}
          />
        )) ||
        (processo?.operacao === 'Cativo/Penhora' && (
          <>
            <ButtonModelo
              modelo="1: Entidade não é cliente.docx"
              evento={() => exportToWord('Entidade não é cliente')}
            />
            <ButtonModelo modelo="2: Cliente sem saldo.docx" evento={() => exportToWord('Cliente sem saldo')} />
            <ButtonModelo
              modelo="3: Cliente sem saldo suficiente.docx"
              evento={() => exportToWord('Cliente sem saldo suficiente')}
            />
            <ButtonModelo
              modelo="4: Cliente com valor total.docx"
              evento={() => exportToWord('Cliente com valor total')}
            />
          </>
        )) || <ButtonModelo modelo="1: Modelo de nota.docx" evento={() => exportToWord('Modelo de nota')} />}
    </GridItem>
  );
}

function ButtonModelo({ modelo, evento }) {
  return (
    <Button
      fullWidth
      variant="soft"
      color="inherit"
      onClick={evento}
      startIcon={getFileThumb(false, null, 'file.docx')}
      sx={{ justifyContent: 'left', textAlign: 'left', mt: 0.5, boxShadow: 'none' }}
    >
      {`Modelo ${modelo}`}
    </Button>
  );
}
