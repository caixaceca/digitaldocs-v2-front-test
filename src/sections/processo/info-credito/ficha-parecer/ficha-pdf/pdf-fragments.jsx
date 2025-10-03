import { View, Text } from '@react-pdf/renderer';
//
import { ptDate } from '../../../../../utils/formatTime';
import { fNumber, fPercent } from '../../../../../utils/formatNumber';
// components
import { styles } from '../../../../../components/exportar-dados/pdf';

// ---------------------------------------------------------------------------------------------------------------------

export function TitleFicha({ sub = false, title = '', declaracao = '', options = null }) {
  return (
    <View
      wrap={false}
      style={[styles.borderCinza, styles.tableRowFicha, options?.final ? { borderBottom: '1px solid #ddd' } : {}]}
    >
      <View wrap={false} style={[styles.tCell_100, options?.success ? styles.bgSuccess : styles?.bgCinza]}>
        <Text style={[styles.textCellFicha]}>
          <Text style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: sub ? 9 : 10 }}>{title}</Text>
          {declaracao ? <Text> *{declaracao} declaração</Text> : null}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowFicha({ title = '', value = '', options = null, valueAlt = null, small = false }) {
  return value ? (
    <View
      wrap={false}
      style={[styles.borderCinza, styles.tableRowFicha, options?.final ? { borderBottom: '1px solid #ddd' } : {}]}
    >
      {title && (
        <View
          style={[
            styles.viewSubFicha,
            options?.success ? styles.bgSuccess : styles?.bgCinza,
            small || options?.ficha ? styles.tCell_25 : styles.tCell_35,
          ]}
        >
          <Text style={[styles.subFicha, styles.uppercase, styles.textBold, styles.px0]}>{title}</Text>
        </View>
      )}
      <View
        style={[
          styles.px0,
          styles.alignLeft,
          styles.verticalCenter,
          (!title && styles.tCell_100) || ((small || options?.ficha) && styles.tCell_75) || styles.tCell_65,
        ]}
      >
        <Text style={[styles.textCellFicha, { color: '#444' }]}>
          <Text
            style={
              value === 'Não definido...'
                ? [{ color: '#666', fontSize: 8 }]
                : [{ fontWeight: options?.bold ? 'bold' : 'normal', color: options?.color || '#444' }]
            }
          >
            {value}
          </Text>
          {options?.subText ? <Text>{options?.subText}</Text> : null}
          {valueAlt}
        </Text>
      </View>
    </View>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowCR({ dados, options = null }) {
  const { titulo, valor, data, mora } = dados;

  return (
    <View
      wrap={false}
      style={[styles.borderCinza, styles.tableRowFicha, options?.final ? { borderBottom: '1px solid #ddd' } : {}]}
    >
      <View style={[styles.tCell_25, styles.viewSubFicha, options?.cp ? styles.bgSuccess : styles?.bgCinza]}>
        <Text style={[styles.subFicha, styles.uppercase, styles.textBold, styles.px0]}>{titulo}</Text>
      </View>
      <View style={[styles.tCell_75, styles.px0, styles.alignLeft, styles.verticalCenter]}>
        <Text style={[styles.textCellFicha, { color: '#444' }]}>
          <Text style={[options?.cp ? null : styles.textBold, { color: options?.color || '#444' }]}>{valor}</Text>
          {data ? <Text>{data}</Text> : null}
          {mora ? <Text style={[styles.textBold, styles.textError]}> *{mora}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowMovimento({ row, contas = false }) {
  const { tipo, conta, moeda, valor, totais, inicio, termino } = row;
  return (
    <>
      <ItemValue value={tipo} options={[styles.tCell_35]} />
      <ItemValue value={conta} options={[styles.tCell_18, styles.alignCenter]} />
      <MoedaColumn dados={{ moeda, valor, tamanho: styles.tCell_22, fs: 9 }} />
      <ItemValue
        notShow={totais}
        options={[styles.tCell_25, styles.alignRight]}
        value={contas ? '' : `${ptDate(inicio)} - ${ptDate(termino)}`}
      />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowDivida({ row, incidentes = false }) {
  const { tipo, classe, conta, moeda, valor, saldo_divida: sd, valor_prestacao: vp, taxa_juros: tj, situacao } = row;
  return (
    <>
      <ItemValue fs={7} value={tipo || classe || ' '} options={[styles.tCell_18]} />
      <ItemValue fs={7} value={conta || ' '} options={[styles.tCell_13]} />
      <MoedaColumn dados={{ moeda, valor, tamanho: styles.tCell_18 }} />
      <MoedaColumn dados={{ moeda, valor: sd, tamanho: styles.tCell_18 }} />
      <MoedaColumn dados={{ moeda, valor: vp, tamanho: styles.tCell_15 }} />
      <ItemValue fs={7} options={[styles.tCell_8, styles.alignRight]} value={tj ? fPercent(tj, 2) : ' '} />
      <ItemValue
        fs={7}
        options={[styles.tCell_10, styles.alignCenter]}
        value={row?.data_vencimento ? ptDate(row?.data_vencimento) : ''}
        value1={
          row?.data_abertura_credito && row?.data_abertura_credito !== row?.data_vencimento
            ? ptDate(row?.data_abertura_credito)
            : ''
        }
      />
      <ItemValue
        fs={7}
        options={[styles.tCell_12, styles.alignCenter]}
        value={(incidentes && row?.maior_irregularidade) || situacao || ' '}
        color={(incidentes && '#ff9800') || (situacao !== 'Normal' && '#FF4842') || ''}
      />
    </>
  );
}

export function TotaisConta({ totais }) {
  return (
    <View>
      <EmptyRow />
      <View wrap={false} style={[styles.tCell_100, styles.px0]}>
        <Text style={[styles.textCellFicha, styles.textBold, { fontSize: 7 }]}>TOTAL POR CONTA</Text>
      </View>
      {totais.map((row, index) => (
        <View
          key={`total_cred_conta_${index}`}
          style={[
            styles.borderCinza,
            styles.tableRowFicha,
            index === totais?.length - 1 ? { borderBottom: '1px solid #ddd' } : {},
          ]}
        >
          <RowMovimento row={{ ...row, totais: true }} contas />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowFianca({ row }) {
  const { tipo_credito: tc, cliente, tipo_interveniente: ti, moeda, valor, situacao } = row;
  return (
    <>
      <ItemValue fs={7} value={tc} options={[styles.tCell_25]} />
      <ItemValue fs={7} value={cliente} options={[styles.tCell_10]} />
      <ItemValue fs={7} value={ti} options={[styles.tCell_8, styles.alignCenter]} />
      <MoedaColumn dados={{ moeda, valor, tamanho: styles.tCell_18 }} />
      <MoedaColumn dados={{ moeda, valor: row?.saldo_divida, tamanho: styles.tCell_15 }} />
      <MoedaColumn dados={{ moeda, valor: row?.valor_prestacao, tamanho: styles.tCell_13 }} />
      <ItemValue
        fs={7}
        value={situacao}
        color={situacao !== 'Normal' ? '#FF4842' : ''}
        options={[styles.tCell_12, styles.alignCenter]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MoedaColumn({ dados }) {
  const { valor, moeda = 'CVE', tamanho, fs = 7, notShow = false } = dados;
  return (
    <ItemValue
      fs={fs}
      moeda={moeda}
      notShow={notShow}
      value={fNumber(Math.abs(valor), 2)}
      options={[tamanho, styles.alignRight]}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ItemValue({ value = ' ', value1 = '', moeda = '', color = '', fs = 9, options, notShow = false }) {
  return (
    <View style={[...options, styles.px0]}>
      {value1 ? <Text style={[styles.textCellFicha, { color: color || '#444', fontSize: fs }]}>{value1}</Text> : ''}
      <Text style={[styles.textCellFicha, { color: color || '#444', fontSize: fs, paddingTop: value1 ? 0 : 6 }]}>
        {notShow ? ' ' : `${value} ${moeda}`}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EmptyRow() {
  return (
    <View wrap={false} style={[styles.tCell_100, { height: '1mm' }]}>
      <Text> </Text>
    </View>
  );
}
// ---------------------------------------------------------------------------------------------------------------------

export function Alerta({ alerta }) {
  return <Text style={[{ paddingTop: 2, color: '#FF4842', fontWeight: 'bold', fontSize: 8 }]}>{` *${alerta}`}</Text>;
}

// ---------------------------------------------------------------------------------------------------------------------

export function NadaConsta({ message = 'Nada consta...', noLimits }) {
  return (
    <View
      wrap={false}
      style={[styles.borderCinza, styles.tableRowFicha, noLimits ? {} : { borderBottom: '1px solid #ddd' }]}
    >
      <View style={[styles.tCell_100]}>
        <Text style={[styles.textCellFicha, { color: '#666', fontSize: 8 }]}>{message}</Text>
      </View>
    </View>
  );
}
