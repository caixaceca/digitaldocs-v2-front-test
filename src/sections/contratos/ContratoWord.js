import { saveAs } from 'file-saver';
import { Packer, TextRun, Document, Paragraph, AlignmentType, BorderStyle } from 'docx';
// utils
import { converterParaOrdinal, substituirTexto } from '../../utils/formatText';
// redux
import { useSelector } from '../../redux/store';
// components
import { ButtonDocx } from '../../components/Actions';
import { CabecalhoWord, RodapeWordAlt, numberingFormat, stylesWord } from '../../components/ExportDados';

const numero = require('numero-por-extenso');

// ----------------------------------------------------------------------

export default function ContratoWord() {
  const { cc } = useSelector((state) => state.intranet);
  const { contrato, infoContrato } = useSelector((state) => state.banka);

  const exportToWord = async () => {
    const logo = await fetch('/assets/caixa_logo_carta.png').then((r) => r.blob());

    const clausulasList = () => {
      const clausulas = [];
      if (contrato?.clausulas?.length > 0) {
        contrato?.clausulas?.forEach((clausula, index) => {
          clausulas?.push(
            new Paragraph({
              style: 'titulo',
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: converterParaOrdinal(clausula?.ordem, false).toUpperCase() })],
            })
          );
          clausulas?.push(
            new Paragraph({
              style: 'titulo',
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `(${clausula?.clausula})` })],
            })
          );
          if (clausula?.descricao) {
            clausulas?.push(
              new Paragraph({
                children: [
                  new TextRun({ text: substituirTexto(clausula?.descricao, clausula?.parametros, infoContrato) }),
                ],
              })
            );
          }

          if (clausula?.incisos?.length > 0) {
            clausula?.incisos?.forEach((inciso, index1) => {
              clausulas?.push(
                new Paragraph({
                  numbering: { reference: `numeracao_${index}`, level: 0 },
                  children: [
                    new TextRun({
                      text: substituirTexto(
                        clausula?.clausula === 'Taxa de juros' && infoContrato?.taxa_desconto
                          ? `${inciso?.descricao} À taxa de juro anual, é aplicado um desconto contratual de «taxa_desconto»p.p. («taxa_desconto_por_extenso» pontos percentuais), pelo que nesta data, a taxa de juro a aplicar ao crédito é de «taxa_com_desconto»%. Da aplicação do desconto não pode resultar uma taxa de juro inferior a «taxa_com_desconto»%.\nO incumprimento do pagamento de qualquer encargo ou prestação de reembolso por prazo superior a 60 (sessenta) dias, determina a perda automática do desconto, aplicando-se, de imediato, a taxa de juro anual definida na presente cláusula ou a fixada no preçário da CAIXA, à data da perda do desconto, se esta for superior à taxa anual acima referida.`
                          : inciso?.descricao,
                        inciso?.parametros,
                        clausula?.clausula === 'Comunicações' ? infoContrato?.dadosCliente : infoContrato
                      ),
                    }),
                  ],
                })
              );

              if (clausula?.clausula === 'Taxa de Juros' && inciso?.inciso === 1 && infoContrato?.taxa_desconto) {
                clausulas?.push(
                  new Paragraph({
                    indent: { left: 720 },
                    children: [
                      new TextRun({
                        text: `À taxa de juro anual, é aplicado um desconto contratual de ${infoContrato?.taxa_desconto}p.p. (${infoContrato?.taxa_desconto_por_extenso} pontos percentuais), pelo que nesta data, a taxa de juro a aplicar ao crédito é de ${infoContrato?.taxa_com_desconto}%. Da aplicação do desconto não pode resultar uma taxa de juro inferior a ${infoContrato?.taxa_com_desconto}%.`,
                      }),
                      new TextRun({
                        text: 'O incumprimento do pagamento de qualquer encargo ou prestação de reembolso por prazo superior a 60 (sessenta) dias, determina a perda automática do desconto, aplicando-se, de imediato, a taxa de juro anual definida na presente cláusula ou a fixada no preçário da CAIXA, à data da perda do desconto, se esta for superior à taxa anual acima referida.',
                        break: 1,
                      }),
                    ],
                  })
                );
              }

              if (inciso?.descricao?.includes('o TERCEIRO OUTORGANTE indica os seguintes endereços:')) {
                infoContrato?.fiadores?.forEach((info) => {
                  clausulas?.push(
                    new Paragraph({
                      indent: { left: 720 },
                      children: [
                        new TextRun({ text: info?.nome, bold: true }),
                        new TextRun({ text: ` - endereço electrónico ${info?.email}` }),
                        new TextRun({ text: ` e endereço postal ${info?.morada};` }),
                      ],
                    })
                  );
                });
              }

              if (inciso?.alineas?.length > 0) {
                inciso?.alineas?.forEach((alinea) => {
                  clausulas?.push(
                    new Paragraph({
                      numbering: { reference: `letra_${index}_${index1}`, level: 0 },
                      children: [
                        new TextRun({ text: substituirTexto(alinea?.descricao, alinea?.parametros, infoContrato) }),
                      ],
                    })
                  );
                });
              }

              if (clausula?.clausula === 'Incumprimento' && inciso?.inciso === 1 && infoContrato?.taxa_desconto) {
                clausulas?.push(
                  new Paragraph({
                    numbering: { reference: `letra_${index}_${index1}`, level: 0 },
                    children: [
                      new TextRun({ text: 'A perda do desconto referido na cláusula relativa à taxa de juros.' }),
                    ],
                  })
                );
              }
            });
          }
          clausulas?.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
        });
      }
      return clausulas;
    };

    const interveniente = (dados) => {
      const itens = [];
      itens?.push(new TextRun({ text: dados?.nome, bold: true }));
      itens?.push(new TextRun({ text: `, ${dados?.estadocivil}` }));
      if (dados?.regimecasamento) {
        itens?.push(new TextRun({ text: `, em regime de ${dados?.regimecasamento}` }));
      }
      if (dados?.conjuge) {
        itens?.push(new TextRun({ text: `, com ` }));
      }
      if (dados?.conjuge) {
        itens?.push(new TextRun({ text: `${dados?.conjuge}`, bold: true }));
      }
      itens?.push(new TextRun({ text: `, natural de ${dados?.freguesia}` }));
      itens?.push(new TextRun({ text: `, titular do ${dados?.tipoidentificacao}` }));
      itens?.push(new TextRun({ text: `, nº ${dados?.docidentificao}` }));
      itens?.push(
        new TextRun({
          text: `, emitido pelo Arquivo de Identificação Civil e Criminal de ${dados?.localemissaodocident}`,
        })
      );
      itens?.push(new TextRun({ text: `, NIF ${dados?.nif}` }));
      itens?.push(new TextRun({ text: `, residente em ${dados?.morada}` }));
      return itens;
    };

    const fiadores = (dados) => {
      let itens = [];
      dados?.forEach((row) => {
        itens = [...itens, ...interveniente(row), new TextRun({ text: `, ` })];
      });
      return itens;
    };

    const assinaturas = (parte, nomes) => {
      const assinatura = [];
      assinatura?.push(
        new Paragraph({
          style: 'titulo',
          spacing: { before: '24pt' },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: parte })],
        })
      );
      nomes?.forEach((row) => {
        assinatura?.push(new Paragraph({ text: ' ' }));
        assinatura?.push(
          new Paragraph({
            spacing: { before: '48pt' },
            alignment: AlignmentType.CENTER,
            indent: { left: 1500, right: 1500 },
            border: { top: { color: 'auto', space: 5, style: BorderStyle.SINGLE, size: 6 } },
            text: row,
          })
        );
      });
      return assinatura;
    };

    const doc = new Document({
      creator: 'Intranet - Caixa Económica de Cabo Verde',
      description: 'Minutas de contratos gerados automaticamente na Intranet da Caixa Económica de Cabo Verde',
      title: `${contrato?.tipo} - ${contrato?.modelo}`,
      styles: stylesWord,
      numbering: numberingFormat(),
      sections: [
        {
          properties: { page: { margin: { top: '60mm', right: '24mm', bottom: '24mm', left: '24mm' } } },
          headers: CabecalhoWord(true, logo, 'JRDC.FM.C.001.01 | 2013/11/15'),
          children: [
            new Paragraph({
              style: 'titulo',
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: contrato?.tipo?.toUpperCase() }),
                new TextRun({ text: contrato?.modelo?.toUpperCase(), break: 1 }),
              ],
            }),
            new Paragraph({
              spacing: { before: '24pt' },
              children: [
                new TextRun({ text: 'OUTORGANTES:', bold: true }),
                new TextRun({ text: 'PRIMEIRO: CAIXA ECONÓMICA DE CABO VERDE S.A', bold: true, break: 1 }),
                new TextRun({
                  text: '., com sede na Av. Cidade de Lisboa, Praia, capital social de 1.392.000.000$00, matriculada na Conservatória do Registo Comercial da Praia sob o n.º 336, NIF 200131753, adiante designada abreviadamente por CAIXA, neste acto representada pelo(a) Dr.(ª) ',
                }),
                ...interveniente(infoContrato?.dadosGerente),
                new TextRun({ text: `, na qualidade de Gerente da Agência ${cc?.uo?.label};` }),
              ],
            }),
            new Paragraph({
              spacing: { before: '24pt' },
              children: [
                new TextRun({ text: 'SEGUNDO: ', bold: true }),
                ...interveniente(infoContrato?.dadosCliente),
                new TextRun({ text: ', adiante designado(A) MUTUARIO(A);' }),
              ],
            }),
            new Paragraph({
              spacing: { before: '24pt' },
              children: [
                new TextRun({ text: 'TERCEIRO: ', bold: true }),
                ...fiadores(infoContrato?.fiadores),
                new TextRun({ text: 'adiante designado TERCEIRO OUTORGANTE.' }),
              ],
            }),
          ],
        },
        {
          properties: { page: { margin: { top: '24mm', right: '24mm', bottom: '24mm', left: '24mm' } } },
          headers: CabecalhoWord(false, null, ''),
          footers: RodapeWordAlt(true, 'JRDC.FM.C.001.01'),
          children: [...clausulasList()],
        },
        {
          properties: { page: { margin: { top: '24mm', right: '24mm', bottom: '24mm', left: '24mm' } } },
          headers: CabecalhoWord(false, null, ''),
          footers: RodapeWordAlt(true, 'JRDC.FM.C.001.01'),
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Praia, aos ${infoContrato?.data_emissao_documento} em três ${numero.porExtenso(
                    infoContrato?.fiadores?.length + 2,
                    numero.estilo.normal
                  )} de originais, uma para cada PARTE:`,
                }),
              ],
            }),
            ...assinaturas('Pela CAIXA', [infoContrato?.dadosGerente?.nome]),
            ...assinaturas('O(S) MUTUÁRIO(S)', [infoContrato?.dadosCliente?.nome]),
            ...assinaturas(
              'O(S) TERCEIRO(S) OUTORGANTE(S)',
              infoContrato?.fiadores?.map((row) => row?.nome)
            ),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${contrato?.tipo} - ${contrato?.modelo}.docx`);
    });
  };

  return <ButtonDocx label="Exportar contrato.docx" handleClick={() => exportToWord()} />;
}
