import { useMemo } from 'react';
import Html from 'react-pdf-html';
import { Document, Page, View, Text } from '@react-pdf/renderer';
// utils
import { ptDate } from '@/utils/formatTime';
import { pdfInfo } from '@/utils/formatText';
import { extractClientes } from '../calculos';
import { situacaoProfissionalRows } from '../utils';
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { processHtmlForPdf } from '@/components/editor/normalizeEditorText';
import { styles, CabecalhoFicha, RodapeFicha } from '@/components/exportar-dados/pdf';
//
import Identificacao from './identificacao';
import Financiamento from './financiamento';
import ResumoMovimentos from './resumo-movimentos';
import Responsabilidades from './responsabilidades';
import { RowFicha, RowCR, ItemValue, TitleFicha, NadaConsta } from './pdf-fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function FichaPdf({ dados }) {
  const {
    saldos,
    titulos,
    dividas,
    clientes,
    restruturacoes,
    irregularidades,
    totalSaldoPorMoeda,
    garantiasPrestadas,
    garantiasRecebidas,
  } = useMemo(() => extractClientes(dados?.clientes || []), [dados?.clientes]);
  const { dividas_externas: dividasExternas = [], avales_externas: avalesExternos = [] } = dados || {};
  const { rendimento = null, parecer = '', credito = null, proposta = null, valorPrestacao = 0 } = dados || {};
  const { numero, analista, uo, fiancas, entidade, mensagens, central_risco: cr, movimentos = [] } = dados || {};

  const parecerInline = useMemo(() => {
    try {
      return processHtmlForPdf(parecer);
    } catch {
      return parecer;
    }
  }, [parecer]);

  const renderSection = (title, wrap, success, items, columns, renderItem) => {
    const temRegistos = items && Array.isArray(items) && items?.length > 0;
    return (
      <View style={{ marginTop: title ? '5mm' : '0mm' }} wrap={wrap}>
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
      subject="Ficha de Análise e Parecer de Crédito"
      author={`${analista}${uo ? ` (${uo})` : ''}`}
      title={`Ficha de Análise e Parecer de Crédito - ${entidade?.nome}`}
    >
      <Page size="A4" style={[styles.page, styles.pageFicha, { color: '#444' }]}>
        <CabecalhoFicha title="Ficha de Análise e Parecer de Crédito" codificacao="CCRD.FM.U.060.00 | 11-08-2025" />
        <View style={[styles.bodyFicha]}>
          <Identificacao numero={numero} entidade={entidade} clientes={clientes} renderSection={renderSection} />

          <ResumoMovimentos
            saldos={saldos}
            titulos={titulos}
            movimentos={movimentos}
            renderSection={renderSection}
            totalSaldoPorMoeda={totalSaldoPorMoeda}
          />

          <Responsabilidades
            dividas={dividas}
            fiancas={fiancas}
            renderSection={renderSection}
            avalesExternos={avalesExternos}
            dividasExternas={dividasExternas}
            irregularidades={irregularidades}
            garantiasPrestadas={garantiasPrestadas}
            garantiasRecebidas={garantiasRecebidas}
          />

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
            false,
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

          {renderSection(
            '11. Situação profissional e Rendimento do agregado familiar (mensal)',
            false,
            true,
            situacaoProfissionalRows(rendimento),
            [
              { title: '', options: [styles.tCell_15, styles.bgSuccess] },
              { title: 'Situação laboral', options: [styles.tCell_45, styles.bgSuccess] },
              { title: 'Rendimento bruto', align: 'right', options: [styles.tCell_20, styles.bgSuccess] },
              { title: 'Rendimento líquido', align: 'right', options: [styles.tCell_20, styles.bgSuccess] },
            ],
            ({ item = '', tipo, bruto, liquido }) => (
              <>
                <ItemValue value={item} options={[styles.tCell_15]} />
                <ItemValue value={tipo} options={[styles.tCell_45]} />
                <ItemValue value={fCurrency(bruto)} options={[styles.tCell_20, styles.alignRight]} />
                <ItemValue value={fCurrency(liquido)} options={[styles.tCell_20, styles.alignRight]} />
              </>
            )
          )}

          <Financiamento dados={dados} />

          <View style={{ marginTop: '4mm' }}>
            <TitleFicha title="17. Parecer do Analista" options={{ success: true }} />
            {parecer ? (
              <View style={[styles.borderCinza, styles.tCell_100, { paddingTop: 5, borderBottom: '1px solid #ddd' }]}>
                <Html>{parecerInline}</Html>
              </View>
            ) : (
              <NadaConsta message="Sem parecer..." />
            )}
          </View>

          <View style={{ marginTop: '4mm' }} wrap={false}>
            <TitleFicha title="18. Proposta de Financiamento" />
            {proposta ? (
              <>
                <RowFicha small title="Tipo de crédito" value={credito?.componente} />
                <RowFicha small title="Finalidade" value={credito?.finalidade} />
                <RowFicha small title="Montante" value={fCurrency(proposta?.montante)} />
                <RowFicha small title="Taxa de juro" value={fPercent(proposta?.taxa_juro)} />
                <RowFicha small title="Prazo de amortização" value={`${proposta?.prazo_amortizacao} meses`} />
                {proposta?.prazo_utilizacao && (
                  <RowFicha small title="Prazo de utilização" value={`${proposta?.prazo_utilizacao} meses`} />
                )}
                <RowFicha small title="Valor da prestação" value={fCurrency(valorPrestacao)} />
                <RowFicha small title="Comissões" value={proposta?.comissoes} />
                <RowFicha small title="Garantias" value={credito?.garantia} options={{ final: true }} />
              </>
            ) : (
              <NadaConsta />
            )}
          </View>
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
