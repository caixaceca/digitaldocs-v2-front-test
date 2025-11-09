const borderCinza = { style: 'thin', color: { argb: 'AAAAAA' } };

// ---------------------------------------------------------------------------------------------------------------------

export function cabecalho(sheet, tab) {
  sheet.columns = [
    { header: tab.toUpperCase(), key: 'segmento' },
    { header: '', key: 'linha_credito' },
    { header: '', key: 'numero' },
    { header: '', key: 'proponente' },
    { header: '', key: 'data' },
    { header: '', key: 'setor_atividade' },
    ...(tab === 'Entradas' || tab === 'Indeferidos' || tab === 'Desistidos' ? [{ header: '', key: 'finalidade' }] : []),
    ...(tab === 'Entradas' || tab === 'Aprovados' ? [{ header: '', key: 'situacao' }] : []),
    ...(tab === 'Entradas' ? [{ header: '', key: 'numero_proposta' }] : []),
    ...(tab === 'Contratados'
      ? [
          { header: '', key: 'finalidade' },
          { header: '', key: 'prazo_amortizacao' },
          { header: '', key: 'taxa_juros' },
          { header: '', key: 'garantia' },
          { header: '', key: 'escalao_decisao' },
          { header: '', key: 'numero_cliente' },
        ]
      : []),
    ...(tab === 'Indeferidos' ? [{ header: '', key: 'data_indeferimento' }] : []),
    ...(tab === 'Desistidos' ? [{ header: '', key: 'data_desistencia' }] : []),
    ...(tab !== 'Contratados' ? [{ header: '', key: 'montante_solicitado' }] : []),
    ...(tab === 'Aprovados' || tab === 'Contratados' ? [{ header: '', key: 'montante_aprovado' }] : []),
    ...(tab === 'Contratados' ? [{ header: '', key: 'montante_contratado' }] : []),
  ];

  sheet.getRow(2).values = [
    'Segmento',
    'Linha de crédito',
    'Nº',
    'Proponente',
    (tab === 'Aprovados' && 'Data aprovação') || (tab === 'Contratados' && 'Data contratação') || 'Data entrada',
    'Setor atividade',
    ...(tab === 'Entradas' || tab === 'Indeferidos' || tab === 'Desistidos' ? ['Finalidade'] : []),
    ...(tab === 'Entradas' || tab === 'Aprovados' ? ['Situação'] : []),
    ...(tab === 'Entradas' ? ['Nº proposta'] : []),
    ...(tab === 'Contratados'
      ? ['Finalidade', 'Prazo amortização', 'Taxa juros', 'Garantia', 'Escalao decisão', 'Nº cliente']
      : []),
    ...(tab === 'Indeferidos' ? ['Data indeferimento'] : []),
    ...(tab === 'Desistidos' ? ['Data desistência'] : []),
    ...(tab !== 'Contratados' ? ['Montante solicitado'] : []),
    ...(tab === 'Aprovados' || tab === 'Contratados' ? ['Montante aprovado'] : []),
    ...(tab === 'Contratados' ? ['Montante contratado'] : []),
  ];
}

// ---------------------------------------------------------------------------------------------------------------------

export function colunasSI(sheet) {
  sheet.getColumn(1).alignment = { vertical: 'middle' };
  sheet.getColumn(2).alignment = { vertical: 'middle' };
  sheet.getColumn(1).font = { bold: true };
  sheet.getColumn(2).font = { bold: true };
}

export function celulasConteudo(tab, sheet, rows, rowInicial, columns, columnInicial) {
  const colCont = tab === 'Resumo Linha' ? 2 : 1;
  for (let row = rowInicial; row <= rows; row += 1) {
    sheet.getRow(row).getCell(5).alignment = { horizontal: 'center' };
    if (tab === 'Contratado') {
      sheet.getRow(row).getCell(8).alignment = { horizontal: 'right' };
      sheet.getRow(row).getCell(9).alignment = { horizontal: 'right' };
      sheet.getRow(row).getCell(11).alignment = { horizontal: 'center' };
      sheet.getRow(row).getCell(12).alignment = { horizontal: 'center' };
    }
    if (tab === 'Indeferido' || tab === 'Desistido') {
      sheet.getRow(row).getCell(8).alignment = { horizontal: 'center' };
    }
    for (let col = colCont; col <= columns; col += 1) {
      const cell = sheet.getRow(row).getCell(col);
      cell.font = { size: 10 };
      cell.border = { top: borderCinza, left: borderCinza, bottom: borderCinza, right: borderCinza };
    }
    for (let col = columnInicial; col <= columns; col += 1) {
      sheet.getRow(row).getCell(col).numFmt = '#,##0';
    }
  }
}

export function mesclarSegmentoLinha(sheet, cab, columns, lg) {
  sheet.mergeCells(cab);
  // Empresa
  const lenEmp = lg.ec + lg.et + lg.ei + 3;
  sheet.mergeCells(3, 1, lenEmp, 1);
  sheet.mergeCells(3, 2, lg.ec + 2, 2);
  sheet.mergeCells(3 + lg.ec, 2, lg.ec + lg.et + 2, 2);
  sheet.mergeCells(3 + lg.ec + lg.et, 2, lg.ec + lg.et + lg.ei + 2, 2);
  // Particular
  const lenPart = lenEmp + lg.ph + lg.pc + lg.po;
  sheet.mergeCells(lenEmp + 1, 1, lenPart + 1, 1);
  sheet.mergeCells(lenEmp + 1, 2, lenEmp + lg.ph, 2);
  sheet.mergeCells(lenEmp + lg.ph + 1, 2, lenEmp + lg.ph + lg.pc, 2);
  sheet.mergeCells(lenEmp + lg.ph + lg.pc + 1, 2, lenEmp + lg.ph + lg.pc + lg.po, 2);
  // Produtores individuais
  const lenPI = lenPart + lg.pit + lg.pii + lg.pim;
  sheet.mergeCells(lenPart + 2, 1, lenPI + 2, 1);
  sheet.mergeCells(lenPart + 2, 2, lenPart + lg.pit + 1, 2);
  sheet.mergeCells(lenPart + lg.pit + 2, 2, lenPart + lg.pit + lg.pii + 1, 2);
  sheet.mergeCells(lenPart + lg.pit + lg.pii + 2, 2, lenPart + lg.pit + lg.pii + lg.pim + 1, 2);
  // Entidades públicas
  const lenEp = lenPI + lg.ep;
  sheet.mergeCells(lenPI + 3, 1, lenEp + 2, 1);
  // Garantias bancárias
  sheet.mergeCells(lenEp + 3, 1, lenEp + lg.gb + 2, 1);
  // bold subtotal
  sheet.getRow(lg.ec + 2).font = { bold: true };
  sheet.getRow(lg.ec + lg.et + 2).font = { bold: true };
  sheet.getRow(lg.ec + lg.et + lg.ei + 2).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph + lg.pc).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph + lg.pc + lg.po).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit + lg.pii).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit + lg.pii + lg.pim).font = { bold: true };
  sheet.getRow(lenPI + 2 + lg.ep, columns).font = { bold: true };
  sheet.getRow(lenPI + 2 + lg.ep + lg.gb).font = { bold: true };

  // bgcolor
  [{ l: 3, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenEmp, c: index + 2 }))].forEach((cell) => {
    sheet.getCell(cell.l, cell.c).font = { bold: true };
    sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DFE3E8' } };
  });
  [{ l: lenEmp + 1, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenPart + 1, c: index + 2 }))].forEach(
    (cell) => {
      sheet.getCell(cell.l, cell.c).font = { bold: true };
      sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C4CDD5' } };
    }
  );
  [{ l: lenPart + 2, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenPI + 2, c: index + 2 }))].forEach(
    (cell) => {
      sheet.getCell(cell.l, cell.c).font = { bold: true };
      sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A2AFBC' } };
    }
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const valorMoeda = (value, moeda) => (moeda === 'Escudo' ? value : value / 1000);
