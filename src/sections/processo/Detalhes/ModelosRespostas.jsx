import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { Packer, TextRun, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
// utils
import { formatDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import { getFileThumb } from '../../../utils/formatFile';
import { valorPorExtenso } from '../../../utils/formatText';
// redux
import { useSelector } from '../../../redux/store';
//
import GridItem from '../../../components/GridItem';
import { CabecalhoWord, RodapeWord } from '../../../components/ExportDados';

// ----------------------------------------------------------------------

export default function ModelosRespostas() {
  const { processo } = useSelector((state) => state.digitaldocs);
  const { origens } = useSelector((state) => state.parametrizacao);
  const origem = origens?.find(({ id }) => id === processo?.origem_id);

  const exportToWord = async (tipo) => {
    const logo = await fetch('/assets/caixa_logo_carta.png').then((r1) => r1.arrayBuffer());
    const iso27001 = await fetch('/assets/iso27001.png').then((r2) => r2.arrayBuffer());
    const iso9001 = await fetch('/assets/iso9001.png').then((r3) => r3.arrayBuffer());
    const alignSpacing = { spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED };

    const cativosList = () => {
      const cativos = [];
      if (processo?.cativos?.length > 0) {
        processo?.cativos?.forEach((row) => {
          cativos?.push(
            new Paragraph({
              ...alignSpacing,
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: `${row?.conta}, com saldo de ${fCurrency(row?.saldo_cve)} (${valorPorExtenso(
                    Number(row?.saldo_cve || 0)
                  )}) à ${row?.tipo || 'ordem/prazo'};`,
                }),
              ],
            })
          );
        });
      } else {
        cativos?.push(
          new Paragraph({
            ...alignSpacing,
            bullet: { level: 0 },
            children: [new TextRun({ text: 'xxxxxxxxxxxx, com saldo de 0 CVE (zero escudos) à ordem/prazo;' })],
          })
        );
      }
      return cativos;
    };

    const dadosCliente = [
      new Paragraph({
        ...alignSpacing,
        children: [
          new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
          new TextRun({ text: processo?.titular || 'Xxxxxxxx Xxxxx Xxxxxxx', bold: true }),
          new TextRun({ text: ', é cliente desta Instituição Financeira, titular da seguinte conta:' }),
        ],
      }),
      ...cativosList(),
    ];

    const anexos = [
      new Paragraph({ ...alignSpacing, children: [new TextRun({ text: 'Segue em anexo o extrato bancário.' })] }),
    ];

    const cliente = tipo === 'Cliente' ? [...dadosCliente] : [];

    const naoCliente =
      tipo === 'Não cliente'
        ? [
            new Paragraph({
              ...alignSpacing,
              children: [
                new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que a entidade, ' }),
                new TextRun({ text: processo?.titular, bold: true }),
                new TextRun({ text: ', não é cliente desta Instituição Financeira.' }),
              ],
            }),
          ]
        : [];

    const levantamentoPenhora =
      tipo === 'Levantamento Penhora'
        ? [
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
          ]
        : [];

    const clienteSemSaldo =
      tipo === 'cliente sem saldo'
        ? [
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
            ...anexos,
          ]
        : [];

    const clienteSemSaldoSuficiente =
      tipo === 'sem saldo suficiente'
        ? [
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
            ...anexos,
          ]
        : [];

    const valorTotal =
      tipo === 'com saldo total'
        ? [
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
            ...anexos,
          ]
        : [];

    const outro =
      tipo === 'outro'
        ? [
            new Paragraph({
              ...alignSpacing,
              children: [new TextRun({ text: 'Em resposta à Vossa Nota acima referenciada, informamos que,... ' })],
            }),
          ]
        : [];

    const doc = new Document({
      creator: 'Intranet - Caixa Económica de Cabo Verde',
      description:
        'Modelo de resposta gerados automaticamente na Intranet da Caixa Económica de Cabo Verde para Processos Judiciais e Fiscais',
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
            ...cliente,
            ...naoCliente,
            ...levantamentoPenhora,
            ...clienteSemSaldo,
            ...clienteSemSaldoSuficiente,
            ...valorTotal,
            ...outro,
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
  };

  return (
    <GridItem>
      <Divider textAlign="left" sx={{ mt: 1.5, mb: 0.25, typography: 'overline' }}>
        Modelos de resposta
      </Divider>
      {(processo?.operacao === 'Pedido de Informação' && (
        <>
          <ButtonModelo modelo="1: Entidade cliente.docx" evento={() => exportToWord('Cliente')} />
          <ButtonModelo modelo="2: Entidade não cliente.docx" evento={() => exportToWord('Não cliente')} />
        </>
      )) ||
        (processo?.operacao === 'Cancelamento/Levantamento de Cativo/Penhora' && (
          <ButtonModelo
            modelo="1: Cancelamento/Levantamento de Cativo/Penhora.docx"
            evento={() => exportToWord('Levantamento Penhora')}
          />
        )) ||
        (processo?.operacao === 'Cativo/Penhora' && (
          <>
            <ButtonModelo modelo="1: Entidade não é cliente.docx" evento={() => exportToWord('Não cliente')} />
            <ButtonModelo modelo="2: Cliente sem saldo.docx" evento={() => exportToWord('cliente sem saldo')} />
            <ButtonModelo
              modelo="3: Cliente sem saldo suficiente.docx"
              evento={() => exportToWord('sem saldo suficiente')}
            />
            <ButtonModelo modelo="4: Cliente com valor total.docx" evento={() => exportToWord('com saldo total')} />
          </>
        )) || <ButtonModelo modelo="1: Modelo de nota.docx" evento={() => exportToWord('outro')} />}
    </GridItem>
  );
}

// ----------------------------------------------------------------------

ButtonModelo.propTypes = { evento: PropTypes.func, modelo: PropTypes.string };

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
