import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { Packer, Header, Footer, TextRun, Document, ImageRun, Paragraph, PageNumber, AlignmentType } from 'docx';
// @mui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { fDate } from '../../../utils/formatTime';
import { fCurrency } from '../../../utils/formatNumber';
import { getFileThumb } from '../../../utils/getFileFormat';
import { valorPorExtenso } from '../../../utils/numeroPorExtenso';
// redux
import { useSelector } from '../../../redux/store';

// ----------------------------------------------------------------------

export default function ModelosRespostas() {
  const { processo } = useSelector((state) => state.digitaldocs);
  const { origens } = useSelector((state) => state.parametrizacao);
  const origem = origens?.find((row) => row?.id === processo?.origem_id);

  const exportToWord = async (tipo) => {
    const logo = await fetch('/assets/caixa_logo_carta.png').then((r) => r.blob());
    const iso27001 = await fetch('/assets/ISO27001.png').then((r) => r.blob());
    const iso9001 = await fetch('/assets/ISO9001.png').then((r) => r.blob());
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
                    row?.saldo_cve
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
          properties: { page: { margin: { top: '54mm', right: '53mm', bottom: '35mm', left: '25mm' } } },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  style: 'codificacao',
                  indent: { left: '25mm' },
                  spacing: { before: '10mm' },
                  frame: { anchor: { horizontal: 'page', vertical: 'page', wrap: 'tight' } },
                  children: [
                    new TextRun('MKTG.FM.U.001.02 | 2021.04.09 |'),
                    new TextRun({ children: [' ', PageNumber.CURRENT] }),
                    new TextRun({ children: ['/', PageNumber.TOTAL_PAGES] }),
                  ],
                }),
                new Paragraph({
                  indent: { left: '159mm' },
                  frame: { anchor: { horizontal: 'page', vertical: 'page' }, wrap: 'tight' },
                  children: [new ImageRun({ data: logo, transformation: { width: 193, height: 185 } })],
                }),
                new Paragraph({
                  style: 'slogan',
                  spacing: { before: '51mm' },
                  alignment: AlignmentType.RIGHT,
                  text: 'o banco que combina comigo',
                  frame: { height: '51mm', anchor: { horizontal: 'page', vertical: 'page' }, width: '19.94cm' },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  style: 'slogan',
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: 'Caixa Económica de Cabo Verde, S.A.', break: 1 }),
                    new TextRun({
                      text: 'Capital social nominal de 1.392.000.000$00, Conserv. do Reg. Comerc. da Praia nº 336',
                      break: 1,
                    }),
                    new TextRun({
                      text: 'Sede: Av. Cidade de Lisboa, C.P. 199, Praia, Ilha de Santiago, Cabo Verde',
                      break: 1,
                    }),
                    new TextRun({ text: 'Tel. +238 260 36 00, fax +238 261 55 60, e-mail: caixa@caixa.cv', break: 1 }),
                    new TextRun({ text: 'NIF: 200131753, Swift: CXEC CV CV', break: 1 }),
                    new TextRun({ text: 'O único banco em Cabo Verde certificado ISO 9001 e ISO 27001', break: 1 }),
                  ],
                }),
                new Paragraph({
                  frame: { position: { x: '168mm' }, anchor: { horizontal: 'page', vertical: 'text' } },
                  children: [new ImageRun({ data: iso27001, transformation: { width: 105, height: 45 } })],
                }),
                new Paragraph({
                  spacing: { before: '1mm', after: '11mm' },
                  frame: { position: { x: '168mm' }, anchor: { horizontal: 'page', vertical: 'text' } },
                  children: [new ImageRun({ data: iso9001, transformation: { width: 105, height: 45 } })],
                }),
              ],
            }),
          },
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
                new TextRun({ text: `Praia, ${fDate(new Date())}`, break: 1 }),
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
    <Grid item xs={12}>
      <Divider sx={{ mt: 1.5 }}>
        <Typography variant="subtitle1">Modelos de resposta</Typography>
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
    </Grid>
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
