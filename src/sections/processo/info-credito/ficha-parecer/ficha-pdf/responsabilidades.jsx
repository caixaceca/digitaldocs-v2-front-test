import { View, Text } from '@react-pdf/renderer';
// utils
import { responsabilidadesInfo } from '../calculos';
// components
import { styles } from '@/components/exportar-dados/pdf';
import { EmptyRow, RowDivida, RowFianca } from './pdf-fragments';

// ---------------------------------------------------------------------------------------------------------------------

export default function Responsabilidades({
  fiancas,
  dividas,
  liquidacoes,
  renderSection,
  avalesExternos,
  dividasExternas,
  irregularidades,
  garantiasPrestadas,
  garantiasRecebidas,
}) {
  return (
    <>
      {renderSection(
        '6. Créditos e outras responsabilidades',
        true,
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

      {liquidacoes?.length > 0 && (
        <View style={[styles.tCell_100]}>
          <Text style={[styles.textCellFicha, { fontSize: 8 }]}>
            <Text style={{ color: '#ff9800' }}>*Liquidação anticipada: </Text>
            {liquidacoes.join(', ')}
          </Text>
        </View>
      )}

      {dividasExternas?.length > 0 && (
        <>
          <Cabecalho title="Dívidas externas" />
          {renderTableSection({
            rows: dividasExternas,
            keyPrefix: 'dividas_externas',
            rowRenderer: (row) => <RowDivida row={row} />,
          })}
        </>
      )}

      {dividas?.length > 0 && dividasExternas?.length > 0 && (
        <>
          <Cabecalho title="Dívidas consolidadas" />
          <Consolidada row={responsabilidadesInfo([...dividas, ...dividasExternas])} />
        </>
      )}

      {(garantiasPrestadas?.length || garantiasRecebidas?.length) && <Cabecalho title="Outras responsabilidades" />}

      {renderTableSection({
        rows: garantiasPrestadas,
        keyPrefix: 'garantias_prestadas',
        rowRenderer: (row) => <RowDivida row={row} />,
      })}

      {renderTableSection({
        rows: garantiasRecebidas,
        keyPrefix: 'garantias_recebidas',
        rowRenderer: (row) => <RowDivida row={row} />,
      })}

      {renderTableSection({
        rows: irregularidades,
        keyPrefix: 'irregularidades',
        title: 'HISTÓRICO DE INCIDENTES',
        titleStyle: { color: '#ff9800', fontSize: 7 },
        rowRenderer: (row) => <RowDivida row={row} incidentes />,
      })}

      {renderSection(
        '7. Responsabilidades como Fiador/Avalista',
        true,
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

      {avalesExternos?.length > 0 && (
        <>
          <Cabecalho title="Avales/Fianças externas" />
          {renderTableSection({
            rows: avalesExternos,
            keyPrefix: 'avales_externas',
            rowRenderer: (row) => <RowDivida row={row} />,
          })}
        </>
      )}

      {fiancas?.length > 0 && avalesExternos?.length > 0 && (
        <>
          <Cabecalho title="Avales/Fianças consolidadas" />
          <Consolidada row={responsabilidadesInfo([...fiancas, ...avalesExternos])} />
        </>
      )}
    </>
  );
}

function renderTableSection({ rows, title, titleStyle, rowRenderer, keyPrefix }) {
  if (!rows?.length) return null;

  return (
    <View wrap={false}>
      <EmptyRow />
      {title && (
        <View wrap={false} style={[styles.tCell_100, styles.px0]}>
          <Text style={[styles.textCellFicha, styles.textBold, titleStyle]}>{title}</Text>
        </View>
      )}
      {(rows.length > 1 ? [...rows, responsabilidadesInfo(rows)] : rows).map((row, index) => (
        <View
          key={`${keyPrefix}_${index}`}
          style={[
            styles.borderCinza,
            styles.tableRowFicha,
            row?.totais ? styles?.textBold : {},
            index === rows.length - (rows.length > 1 ? 0 : 1) ? { borderBottom: '1px solid #ddd' } : {},
          ]}
        >
          {rowRenderer(row)}
        </View>
      ))}
    </View>
  );
}

function Consolidada({ row }) {
  return (
    <View style={[styles.borderCinza, styles.tableRowFicha, styles?.textBold, { borderBottom: '1px solid #ddd' }]}>
      <RowDivida row={row} />
    </View>
  );
}

function Cabecalho({ title, color = '#444' }) {
  return (
    <View wrap={false}>
      <EmptyRow />
      <View wrap={false} style={[styles.tCell_100, styles.px0]}>
        <Text style={[styles.textCellFicha, styles.textBold, { color, fontSize: 7 }]}>{title}</Text>
      </View>
    </View>
  );
}
