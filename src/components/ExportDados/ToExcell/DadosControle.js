import ExcelJS from 'exceljs';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
// utils
import { fNumber } from '../../../utils/formatNumber';
import { ptDateTime, ptDate } from '../../../utils/formatTime';
//
import { ExportToExcell, fileInfo, sheetProperty, ajustarLargura, estiloCabecalho } from './CommonProperties';
// _mock
import { dis } from '../../../_mock';

// --------------------------------------------------------------------------------------------------------------------------------------------

ExportarDados.propTypes = { dados: PropTypes.array, tabela: PropTypes.string, titulo: PropTypes.string };

export function ExportarDados({ titulo, dados, tabela }) {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    fileInfo(workbook);

    const workSheet = workbook.addWorksheet(tabela, sheetProperty('5AAA28', 1, true));

    workSheet.columns = [
      ...(tabela !== 'PJF' && tabela !== 'CON'
        ? [
            { header: 'Nº entrada', key: 'num_entrada' },
            { header: 'Titular', key: 'titular' },
            { header: 'Conta/Cliente/Entidade(s)', key: 'conta_cli_ent' },
            { header: 'Assunto', key: 'assunto' },
          ]
        : []),
      ...((tabela === 'Entradas' && [
        { header: 'Estado atual', key: 'estado_atual' },
        { header: 'Criado por', key: 'criado_por' },
        { header: 'Criado em', key: 'criado_em' },
      ]) ||
        (tabela === 'Por concluir' && [
          { header: 'Estado atual', key: 'estado_atual' },
          { header: 'Data envio', key: 'data_envio' },
          { header: 'Motivo pendência', key: 'motivo_pendencia' },
          { header: 'Criado por', key: 'criado_por' },
          { header: 'Unidade orgânica', key: 'uo' },
        ]) ||
        (tabela === 'Devoluções' && [
          { header: 'Criado por', key: 'criado_por' },
          { header: 'Origem', key: 'origem' },
          { header: 'Destino', key: 'destino' },
          { header: 'Devolvido por', key: 'devolvido_por' },
          { header: 'Devolvido em', key: 'devolvido_em' },
          { header: 'Motivo', key: 'motivo' },
          { header: 'Observação', key: 'observacao' },
          { header: 'Imputável', key: 'imputavel' },
        ]) ||
        (tabela === 'PJF' && [
          { header: 'Referência', key: 'referencia' },
          { header: 'Titular', key: 'titular' },
          { header: 'Origem', key: 'origem' },
          { header: 'Operação', key: 'operacao' },
          { header: 'Valor', key: 'valor' },
          { header: 'Documento 1', key: 'doc_1' },
          { header: 'Documento 2', key: 'doc_2' },
          { header: 'Estado atual', key: 'estado_atual' },
          { header: 'Data entrada', key: 'data_entrada' },
          { header: 'Criado em', key: 'criado_em' },
        ]) ||
        (tabela === 'CON' && [
          { header: 'Cliente', key: 'nome_cliente' },
          { header: 'Entidade(s)', key: 'entidades' },
          { header: 'Cliente', key: 'cliente_processo' },
          { header: 'Conta', key: 'conta_processo' },
          { header: 'Segmento', key: 'segmento_cliente' },
          { header: 'Documento 1', key: 'doc_idp' },
          { header: 'Tipo doc. 1', key: 'tipo_doc_idp' },
          { header: 'Documento 2', key: 'doc_ids' },
          { header: 'Tipo doc. 2', key: 'tipo_doc_ids' },
          { header: '', key: '' },
          { header: 'Valor', key: 'valor' },
          { header: 'Cód operção', key: 'cdg_operacao' },
          { header: 'Origem do fundo', key: 'origem_fundo' },
          { header: 'Finalidade do fundo', key: 'finalidade_fundo' },
          { header: 'Data entrada', key: 'data_entrada' },
          { header: 'Criado em', key: 'criado_em' },
          { header: '', key: '' },
          { header: 'Titular ordenador', key: 'titular_ordenador' },
          { header: 'Ordenador', key: 'ordenador' },
          { header: 'NIF', key: 'nif' },
          { header: 'Doc. Identificação', key: 'docid' },
          { header: 'Tipo DI', key: 'tipo_docid' },
          { header: 'Estado civil', key: 'estado_civil' },
          { header: 'Data nasc.', key: 'data_nascimento' },
          { header: 'Pai', key: 'pai' },
          { header: 'Mãe', key: 'mae' },
          { header: 'Nacionalidade', key: 'nacionalidade' },
          { header: 'Local/País nasc.', key: 'local_pais_nascimento' },
          { header: 'Residente', key: 'residente' },
          { header: 'Morada', key: 'morada' },
          { header: 'Profissão', key: 'profissao' },
          { header: 'Local trabalho', key: 'local_trabalho' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'Telemóvel', key: 'telemovel' },
          { header: 'Email', key: 'email' },
        ]) ||
        []),
    ];

    dados?.forEach((row) => {
      workSheet.addRow([
        ...(tabela !== 'PJF' && tabela !== 'CON'
          ? [
              row?.nentrada || row?.entrada || '',
              row?.titular || '',
              row?.conta || row?.cliente || row?.entidades || '',
              row?.assunto || '',
            ]
          : []),
        ...((tabela === 'Entradas' && [
          row?.nome || '',
          row?.colaborador || '',
          row?.criado_em ? ptDateTime(row?.criado_em) : '',
        ]) ||
          (tabela === 'Por concluir' && [
            row?.nome || '',
            row?.trabalhado_em ? ptDateTime(row?.trabalhado_em) : '',
            row?.motivo || '',
            row?.colaborador || '',
            row?.uoLabel || '',
          ]) ||
          (tabela === 'Devoluções' && [
            row?.dono || '',
            row?.estado_inicial || '',
            row?.estado_final || '',
            row?.colaborador || '',
            row?.data_transicao ? ptDateTime(row?.data_transicao) : '',
            row?.motivo || '',
            row?.observacao || '',
            (row?.imputavel === true && 'Sim') || (row?.imputavel === false && 'Não') || '',
          ]) ||
          (tabela === 'PJF' && [
            row?.referencia || '',
            row?.titular || '',
            row?.origem || '',
            row?.operacao || '',
            row?.valor ? fNumber(row?.valor) : '',
            row?.doc_1 || '',
            row?.doc_2 || '',
            row?.estado || '',
            row?.data_entrada ? ptDate(row?.data_entrada) : '',
            row?.criado_em ? ptDateTime(row?.criado_em) : '',
          ]) ||
          (tabela === 'CON' && [
            row?.nome_cliente || '',
            row?.entidades || '',
            row?.cliente_processo || '',
            row?.conta_processo || '',
            row?.segmento_cliente || '',
            row?.doc_idp || '',
            dis?.find((di) => di?.id === row?.tipo_doc_idp)?.label || row?.tipo_doc_idp || '',
            row?.doc_ids || '',
            dis?.find((di) => di?.id === row?.tipo_doc_ids)?.label || row?.tipo_doc_ids || '',
            '',
            row?.valor ? fNumber(row?.valor) : '',
            row?.cdg_operacao || '',
            row?.origem_fundo || '',
            row?.finalidade_fundo || '',
            row?.data_entrada ? ptDate(row?.data_entrada) : '',
            row?.criado_em ? ptDateTime(row?.criado_em) : '',
            '',
            row?.titular_ordenador ? 'Sim' : 'Não',
            row?.ordenador || '',
            row?.nif || '',
            row?.docid || '',
            dis?.find((di) => di?.id === row?.tipo_docid)?.label || row?.tipo_docid || '',
            row?.estado_civil || '',
            row?.data_nascimento ? ptDate(row?.data_nascimento) : '',
            row?.pai || '',
            row?.mae || '',
            row?.nacionalidade || '',
            row?.local_pais_nascimento || '',
            row?.residente ? 'Sim' : 'Não',
            row?.morada || '',
            row?.profissao || '',
            row?.local_trabalho || '',
            row?.telefone || '',
            row?.telemovel || '',
            row?.email || '',
          ]) ||
          []),
      ]);
    });

    estiloCabecalho(
      workSheet,
      1,
      (tabela === 'PJF' && 10) ||
        (tabela === 'CON' && 35) ||
        (tabela === 'Entradas' && 7) ||
        (tabela === 'Devoluções' && 12) ||
        (tabela === 'Por concluir' && 9)
    );
    ajustarLargura(workSheet);

    // GERAR E BAIXAR O FICHEIRO
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `${titulo}.xlsx`);
  };

  return <ExportToExcell handleExport={exportToExcel} small />;
}
