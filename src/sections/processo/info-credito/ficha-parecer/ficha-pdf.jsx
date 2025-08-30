import { useMemo } from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
// utils
import {
  docInfo,
  colorDoc,
  estadoCivil,
  dataNascimento,
  extractClientes,
  movimentosConta,
  responsabilidadesInfo,
} from './calculos';
import { pdfInfo } from '../../../../utils/formatText';
import { ptDate, getIdade } from '../../../../utils/formatTime';
import { fCurrency, fNumber } from '../../../../utils/formatNumber';
// components
import {
  RowCR,
  EmptyRow,
  RowFicha,
  RowDivida,
  ItemValue,
  RowFianca,
  TitleFicha,
  NadaConsta,
  MoedaColumn,
  TotaisConta,
  RowMovimento,
} from './pdf-fragments';
import { styles, CabecalhoFicha, RodapeFicha } from '../../../../components/exportar-dados/pdf';

// ---------------------------------------------------------------------------------------------------------------------

export default function FichaPdf({ dados }) {
  const { numero, analista, uo, fiancas, entidade, mensagens, central_risco: cr, movimentos = [] } = dados || {};

  const {
    saldos,
    titulos,
    dividas,
    restruturacoes,
    irregularidades,
    totalSaldoPorMoeda,
    garantiasPrestadas,
    garantiasRecebidas,
    clientes: clientesList,
  } = useMemo(() => extractClientes(dados?.clientes || {}), [dados?.clientes]);
  const { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta } = useMemo(
    () => movimentosConta(movimentos),
    [movimentos]
  );

  const renderSection = (title, success, items, columns, renderItem) => {
    const temRegistos = items && Array.isArray(items) && items?.length > 0;
    return (
      <View
        style={{ marginTop: title ? '5mm' : '0mm' }}
        wrap={title !== '7. Informação da Central de Riscos' && title !== '10. Restruturações'}
      >
        <View wrap={false}>
          {title ? <TitleFicha title={title} options={{ success }} /> : null}
          {temRegistos ? (
            <View wrap={false} style={[styles.borderCinza, styles.tableRowFicha]}>
              {columns.map((col, index) => (
                <View key={`column_${index}`} style={[...col?.options, styles.px0, { height: '100%' }]}>
                  <Text
                    style={[
                      styles.textCellFicha,
                      { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
                      (col?.align === 'center' && styles.alignCenter) || (col?.align === 'right' && styles.alignRight),
                    ]}
                  >
                    {col?.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        {temRegistos ? (
          <>
            {items?.map((item, index) => (
              <View
                wrap={false}
                key={`item_row_${index}`}
                style={[
                  styles.borderCinza,
                  styles.tableRowFicha,
                  item?.totais ? styles?.textBold : {},
                  index === items.length - 1 ? { borderBottom: '1px solid #ddd' } : {},
                ]}
              >
                {renderItem(item)}
              </View>
            ))}
          </>
        ) : (
          <NadaConsta />
        )}
      </View>
    );
  };

  return (
    <Document
      {...pdfInfo}
      subject="Ficha Informativa de Entidade"
      author={`${analista}${uo ? ` (${uo})` : ''}`}
      title={`Ficha Informativa de Entidade - ${entidade?.nome}`}
    >
      <Page size="A4" style={[styles.page, styles.pageFicha, { color: '#444' }]}>
        <CabecalhoFicha title="Ficha Informativa de Entidade" codificacao="CCRD.FM.U.058.00 | 21-03-2025" />
        <View style={[styles.bodyFicha]}>
          <View>
            <TitleFicha title="1. Identificação" options={{ success: true }} />
            <RowFicha title="Nº de entidade" value={numero || ' '} options={{ success: true, ficha: true }} />
            <RowFicha title="Nome" value={entidade?.nome} options={{ success: true, ficha: true }} />
            <RowFicha
              title="Doc. identificação"
              options={{ success: true, ficha: true }}
              value={docInfo(entidade?.documento, entidade?.tipo_documento)}
              valueAlt={
                entidade?.data_validade ? (
                  <Text style={[{ paddingTop: 2, color: colorDoc(entidade?.data_validade, true) }]}>
                    {' '}
                    (Validade: {ptDate(entidade?.data_validade)})
                  </Text>
                ) : null
              }
            />
            <RowFicha title="NIF" value={entidade?.nif || ' '} options={{ success: true, ficha: true }} />
            <RowFicha title="Telefone" value={entidade?.telefone} options={{ success: true, ficha: true }} />
            <RowFicha title="Email" value={entidade?.email} options={{ success: true, ficha: true }} />
            <RowFicha title="Sexo" value={entidade?.sexo} options={{ success: true, ficha: true }} />
            <RowFicha
              title="Estado civil"
              options={{ success: true, ficha: true }}
              value={estadoCivil(entidade?.estado_civil, entidade?.regime_casamento)}
            />
            <RowFicha
              title="Data de nascimento"
              options={{ success: true, ficha: true }}
              value={dataNascimento(entidade?.data_nascimento)}
            />
            <RowFicha
              title="Filiação"
              options={{ success: true, ficha: true }}
              value={[entidade?.nome_pai, entidade?.nome_mae].filter(Boolean).join(' e ') || ''}
            />
            <RowFicha title="Morada" value={entidade?.morada} options={{ success: true, ficha: true }} />
            <RowFicha
              title="Código de risco"
              options={{ success: true, ficha: true }}
              value={entidade?.codigo_risco || 'Não definido...'}
            />
            <RowFicha
              title="Nível de risco"
              options={{ success: true, ficha: true, final: true }}
              value={entidade?.nivel_risco || 'Não definido...'}
            />
          </View>
          <EmptyRow />

          {renderSection(
            '2. Clientes associados',
            false,
            clientesList,
            [
              { title: 'Nº do cliente', align: 'center', options: [styles.tCell_13, styles.bgCinza] },
              { title: 'Balcão', align: 'center', options: [styles.tCell_8, styles.bgCinza] },
              { title: 'Titularidade', align: 'center', options: [styles.tCell_13, styles.bgCinza] },
              { title: 'Relação', align: 'center', options: [styles.tCell_10, styles.bgCinza] },
              { title: 'Data Abertura', align: 'center', options: [styles.tCell_20, styles.bgCinza] },
              { title: 'Nome do 1º Titular', options: [styles.tCell_36, styles.bgCinza] },
            ],
            ({ cliente, balcao, titularidade, relacao, data_abertura: da, titular }) => (
              <>
                <ItemValue value={cliente} options={[styles.tCell_13, styles.alignCenter]} />
                <ItemValue value={balcao || '--'} options={[styles.tCell_8, styles.alignCenter]} />
                <ItemValue
                  value={titularidade || '--'}
                  options={[styles.tCell_13, styles.alignCenter]}
                  color={titularidade !== 'Individual' ? '#ff9800' : ''}
                />
                <ItemValue value={relacao || '--'} options={[styles.tCell_10, styles.alignCenter]} />
                <ItemValue
                  options={[styles.tCell_20, styles.alignCenter]}
                  value={da ? `${ptDate(da)} - ${getIdade(da, new Date())}` : ' '}
                />
                <ItemValue value={titular} options={[styles.tCell_36]} />
              </>
            )
          )}

          {renderSection(
            '3. Saldos e aplicações',
            true,
            saldos?.length > 1 ? [...saldos, { classe: 'Total', totais: true, saldo: totalSaldoPorMoeda }] : saldos,
            [
              { title: 'Classe', options: [styles.tCell_30, styles.bgSuccess] },
              { title: 'Conta', align: 'center', options: [styles.tCell_20, styles.bgSuccess] },
              { title: 'Saldo', align: 'right', options: [styles.tCell_25, styles.bgSuccess] },
              { title: 'Saldo médio', align: 'right', options: [styles.tCell_25, styles.bgSuccess] },
            ],
            ({ classe, conta, moeda, saldo, totais, saldo_medio: sm }) => (
              <>
                <ItemValue value={classe} options={[styles.tCell_30]} />
                <ItemValue value={conta} options={[styles.tCell_20, styles.alignCenter]} />
                {totais ? (
                  <View style={[styles.tCell_25, styles.alignRight, styles.px0]}>
                    {saldo?.map(({ saldo, moeda }) => (
                      <Text key={moeda} style={[{ color: '#444', fontSize: 9 }]}>
                        {fNumber(saldo, 2)} {moeda}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <MoedaColumn dados={{ moeda, valor: saldo, tamanho: styles.tCell_25, fs: 9 }} />
                )}
                <MoedaColumn dados={{ moeda, valor: sm, tamanho: styles.tCell_25, fs: 9, notShow: totais }} />
              </>
            )
          )}

          {titulos?.length > 0 ? (
            <View wrap={false}>
              <EmptyRow />
              <View style={[styles.tCell_100, styles.px0]}>
                <Text style={[styles.textCellFicha, styles.textBold, { color: '#444', fontSize: 7 }]}>TÍTULOS</Text>
              </View>
              {renderSection(
                '',
                true,
                titulos,
                [
                  { title: 'Qtd', align: 'right', options: [styles.tCell_8, styles.bgSuccess] },
                  { title: 'Ativo', options: [styles.tCell_25, styles.bgSuccess] },
                  { title: 'Cliente', align: 'center', options: [styles.tCell_10, styles.bgSuccess] },
                  { title: 'Valor compra', align: 'right', options: [styles.tCell_15, styles.bgSuccess] },
                  { title: 'Valor cotado', align: 'right', options: [styles.tCell_18, styles.bgSuccess] },
                  { title: 'Valor cativo', align: 'right', options: [styles.tCell_15, styles.bgSuccess] },
                  { title: 'Data cot.', align: 'center', options: [styles.tCell_10, styles.bgSuccess] },
                ],
                ({ total, ativo, cliente, data_cotado: dc, valor_compra: v, valor_cotado: c, valor_cativo: a }) => (
                  <>
                    <ItemValue fs={7} value={fNumber(total)} options={[styles.tCell_8, styles.alignRight]} />
                    <ItemValue fs={7} value={ativo} options={[styles.tCell_25]} />
                    <ItemValue fs={7} value={cliente} options={[styles.tCell_10, styles.alignCenter]} />
                    <ItemValue fs={7} value={fCurrency(v)} options={[styles.tCell_15, styles.alignRight]} />
                    <ItemValue fs={7} value={fCurrency(c)} options={[styles.tCell_18, styles.alignRight]} />
                    <ItemValue fs={7} value={fCurrency(a)} options={[styles.tCell_15, styles.alignRight]} />
                    <ItemValue fs={7} value={dc || ' '} options={[styles.tCell_10, styles.alignCenter]} />
                  </>
                )
              )}
            </View>
          ) : null}

          {renderSection(
            '4. Resumo de Movimentos a Crédito',
            false,
            movimentosCredito?.length > 1
              ? [
                  ...movimentosCredito,
                  {
                    tipo: 'Total',
                    totais: true,
                    valor: movimentosCredito.reduce((soma, row) => soma + row.valor, 0),
                  },
                ]
              : movimentosCredito,
            [
              { title: 'Descrição', options: [styles.tCell_35, styles.bgCinza] },
              { title: 'Conta', align: 'center', options: [styles.tCell_18, styles.bgCinza] },
              { title: 'Valor', align: 'right', options: [styles.tCell_22, styles.bgCinza] },
              { title: 'Data referência', align: 'right', options: [styles.tCell_25, styles.bgCinza] },
            ],
            (row) => (
              <RowMovimento row={row} />
            )
          )}
          {totaisCredConta?.length > 1 ? <TotaisConta totais={totaisCredConta} /> : null}

          {renderSection(
            '5. Resumo de Movimentos a Débito',
            true,
            movimentosDebito?.length > 1
              ? [
                  ...movimentosDebito,
                  {
                    totais: true,
                    tipo: 'Total',
                    valor: movimentosDebito.reduce((soma, { valor }) => soma + valor, 0),
                  },
                ]
              : movimentosDebito,
            [
              { title: 'Descrição', options: [styles.tCell_35, styles.bgSuccess] },
              { title: 'Conta', align: 'center', options: [styles.tCell_18, styles.bgSuccess] },
              { title: 'Valor', align: 'right', options: [styles.tCell_22, styles.bgSuccess] },
              { title: 'Data referência', align: 'right', options: [styles.tCell_25, styles.bgSuccess] },
            ],
            (row) => (
              <RowMovimento row={row} />
            )
          )}
          {totaisDebConta?.length > 1 ? <TotaisConta totais={totaisDebConta} /> : null}

          {renderSection(
            '6. Créditos e outras responsabilidades',
            false,
            dividas?.length > 1 ? [...dividas, responsabilidadesInfo(dividas)] : dividas,
            [
              { title: 'Produto', options: [styles.tCell_18, styles.bgCinza] },
              { title: 'Conta', options: [styles.tCell_13, styles.bgCinza] },
              { title: 'Capital inicial', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
              { title: 'Saldo em dívida', align: 'right', options: [styles.tCell_18, styles.bgCinza] },
              { title: 'Prestação', align: 'right', options: [styles.tCell_13, styles.bgCinza] },
              { title: 'Taxa', align: 'right', options: [styles.tCell_8, styles.bgCinza] },
              { title: 'Data', align: 'center', options: [styles.tCell_10, styles.bgCinza] },
              { title: 'Situação', align: 'center', options: [styles.tCell_12, styles.bgCinza] },
            ],
            (row) => (
              <RowDivida row={row} />
            )
          )}
          {garantiasRecebidas?.length > 0 || garantiasPrestadas?.length > 0 ? (
            <View wrap={false}>
              <EmptyRow />
              <View wrap={false} style={[styles.tCell_100, styles.px0]}>
                <Text style={[styles.textCellFicha, styles.textBold, { color: '#444', fontSize: 7 }]}>OUTRAS</Text>
              </View>
            </View>
          ) : null}
          {garantiasPrestadas?.length > 0 ? (
            <View>
              <EmptyRow />
              {(garantiasPrestadas?.length > 1
                ? [...garantiasPrestadas, responsabilidadesInfo(garantiasPrestadas)]
                : garantiasPrestadas
              )?.map((row, index) => (
                <View
                  key={`garantias_prestadas_${index}`}
                  style={[
                    styles.borderCinza,
                    styles.tableRowFicha,
                    row?.totais ? styles?.textBold : {},
                    index === garantiasPrestadas?.length - (garantiasPrestadas?.length > 1 ? 0 : 1)
                      ? { borderBottom: '1px solid #ddd' }
                      : {},
                  ]}
                >
                  <RowDivida row={row} />
                </View>
              ))}
            </View>
          ) : null}
          {garantiasRecebidas?.length > 0 ? (
            <View>
              <EmptyRow />
              {(garantiasRecebidas?.length > 1
                ? [...garantiasRecebidas, responsabilidadesInfo(garantiasRecebidas)]
                : garantiasRecebidas
              )?.map((row, index) => (
                <View
                  key={`garantias_recebidas_${index}`}
                  style={[
                    styles.borderCinza,
                    styles.tableRowFicha,
                    row?.totais ? styles?.textBold : {},
                    index === garantiasRecebidas?.length - (garantiasRecebidas?.length > 1 ? 0 : 1)
                      ? { borderBottom: '1px solid #ddd' }
                      : {},
                  ]}
                >
                  <RowDivida row={row} />
                </View>
              ))}
            </View>
          ) : null}
          {irregularidades?.length > 0 ? (
            <View wrap={false}>
              <EmptyRow />
              <View wrap={false} style={[styles.tCell_100, styles.px0]}>
                <Text style={[styles.textCellFicha, styles.textBold, { color: '#ff9800', fontSize: 7 }]}>
                  HISTÓRICO DE INCIDENTES
                </Text>
              </View>
              {irregularidades?.map((row, index) => (
                <View
                  key={`outras_dividas_${index}`}
                  style={[
                    styles.borderCinza,
                    styles.tableRowFicha,
                    index === irregularidades?.length - 1 ? { borderBottom: '1px solid #ddd' } : {},
                  ]}
                >
                  <RowDivida row={row} incidentes />
                </View>
              ))}
            </View>
          ) : null}

          {renderSection(
            '7. Responsabilidades como Fiador/Avalista',
            true,
            fiancas?.length > 1 ? [...fiancas, responsabilidadesInfo(fiancas)] : fiancas,
            [
              { title: 'Produto', options: [styles.tCell_25, styles.bgSuccess] },
              { title: 'Nº cliente', options: [styles.tCell_10, styles.bgSuccess] },
              { title: 'Resp.', align: 'center', options: [styles.tCell_8, styles.bgSuccess] },
              { title: 'Capital inicial', align: 'right', options: [styles.tCell_18, styles.bgSuccess] },
              { title: 'Saldo em dívida', align: 'right', options: [styles.tCell_15, styles.bgSuccess] },
              { title: 'Prestação', align: 'right', options: [styles.tCell_13, styles.bgSuccess] },
              { title: 'Situação', align: 'center', options: [styles.tCell_12, styles.bgSuccess] },
            ],
            (row) => (
              <RowFianca row={row} />
            )
          )}

          <View style={{ marginTop: '4mm' }} wrap={false}>
            <TitleFicha title="8. Informação da Central de Riscos" />
            {cr ? (
              <>
                <RowCR
                  dados={{
                    titulo: 'Saldo comunicado',
                    valor: fCurrency(cr?.saldo_comunicado),
                    data: ` em ${ptDate(cr?.comunicado_em)}`,
                    mora: cr?.comunicado_com_mora ? 'COM MORA' : '',
                  }}
                />
                <RowCR
                  dados={{
                    titulo: 'Saldo centralizado',
                    valor: fCurrency(cr?.saldo_centralizado),
                    data: ` em ${ptDate(cr?.centralizado_em)}`,
                    mora: cr?.centralizado_com_mora ? 'COM MORA' : '',
                  }}
                  options={{
                    final: true,
                    color: cr?.saldo_centralizado - cr?.saldo_comunicado > 1000 ? '#ff9800' : '',
                  }}
                />
              </>
            ) : (
              <NadaConsta />
            )}
          </View>

          {renderSection(
            '9. Mensagens Pendentes',
            true,
            mensagens,
            [
              { title: 'Sigla', options: [styles.tCell_10, styles.bgSuccess] },
              { title: 'Cliente', align: 'center', options: [styles.tCell_10, styles.bgSuccess] },
              { title: 'Mensagem', options: [styles.tCell_80, styles.bgSuccess] },
            ],
            ({ sigla, cliente, mensagem }) => (
              <>
                <ItemValue value={sigla} options={[styles.tCell_10]} />
                <ItemValue value={cliente} options={[styles.tCell_10, styles.alignCenter]} />
                <ItemValue value={mensagem} options={[styles.tCell_80]} />
              </>
            )
          )}

          {renderSection(
            '10. Restruturações',
            false,
            restruturacoes,
            [
              { title: 'Cliente', align: 'center', options: [styles.tCell_25, styles.bgCinza] },
              { title: 'Data última restruturação', options: [styles.tCell_75, styles.bgCinza] },
            ],
            ({ cliente, data }) => (
              <>
                <ItemValue value={cliente} options={[styles.tCell_25, styles.alignCenter]} />
                <ItemValue value={ptDate(data)} options={[styles.tCell_75]} />
              </>
            )
          )}
        </View>
        <RodapeFicha
          title2="Data:"
          title1="Gerado por:"
          aprovado={ptDate(new Date())}
          elaborado={`${analista}${uo ? ` (${uo})` : ''}`}
        />
      </Page>
    </Document>
  );
}
