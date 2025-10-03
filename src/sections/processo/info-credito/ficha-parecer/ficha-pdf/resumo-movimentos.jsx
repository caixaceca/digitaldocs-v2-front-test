import { useMemo } from 'react';
import { View, Text } from '@react-pdf/renderer';
// utils
import { movimentosConta } from '../calculos';
import { fNumber, fCurrency } from '../../../../../utils/formatNumber';
// components
import { styles } from '../../../../../components/exportar-dados/pdf';
import { TotaisConta, RowMovimento, ItemValue, MoedaColumn, EmptyRow } from './pdf-fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoMovimentos({ saldos, titulos, totalSaldoPorMoeda, movimentos, renderSection }) {
  const { movimentosDebito, movimentosCredito, totaisDebConta, totaisCredConta } = useMemo(
    () => movimentosConta(movimentos),
    [movimentos]
  );

  return (
    <>
      {renderSection(
        '3. Saldos e aplicações',
        true,
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
            false,
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
        true,
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
    </>
  );
}
