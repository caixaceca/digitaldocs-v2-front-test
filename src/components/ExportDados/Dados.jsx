import { View, Text } from '@react-pdf/renderer';
// components
import styles from './ExportStylePdf';

// ---------------------------------------------------------------------------------------------------------------------

export function Title({ label, mt = false }) {
  return (
    <View style={[styles.textSuccess, styles.text9, mt ? styles.mt10 : null]}>
      <Text>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Subtitle({ label }) {
  return (
    <Row>
      <View style={[styles.textSuccess]}>
        <Text style={[styles.text8, styles.textSuccess]}>{label}</Text>
      </View>
    </Row>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Label({ label, props = [] }) {
  return (
    <View style={[styles.pr0, styles.alignRight, ...props]}>
      <Text style={[styles.text7, styles.textSuccess]}>{label}</Text>
    </View>
  );
}

export function Value({ value, props = [] }) {
  return (
    <View style={[styles.pr0, styles.alignLeft, ...props]}>
      <Text style={[styles.textCell]}>{value || '--'}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Item({ label, value = '', lprops = [], vprops = [] }) {
  return (
    <>
      <Label label={label} props={lprops} />
      <Value value={value} props={vprops} />
    </>
  );
}

export function ItemAlt({ label, value = ' ', style }) {
  return (
    <View style={[...style, styles.pl0]}>
      {label ? <Text style={[styles.text7, styles.textSuccess, styles.px1, styles.mb1]}>{label}</Text> : ''}
      <Text style={[styles.textCell]}>{value || ' '}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Row({ children, mt = false }) {
  return (
    <View style={[styles.tableRow2, styles.noBorder, mt ? styles.mt2 : null]} wrap={false}>
      {children}
    </View>
  );
}

export function RowItemAlt({ label, value = ' ', style }) {
  return (
    <Row mt>
      <ItemAlt style={style} label={label} value={value} />
    </Row>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RowAlt({ label, value, tree = false }) {
  return (
    <Row>
      <Item
        label={label}
        value={value}
        lprops={(tree && [styles.tCell_30]) || [styles.tCell_20]}
        vprops={(tree && [styles.tCell_70]) || [styles.tCell_80]}
      />
    </Row>
  );
} // ---------------------------------------------------------------------------------------------------------------------

export function NadaConsta() {
  return (
    <Row>
      <View style={[styles.tCell_100, styles.pl0]}>
        <Text style={[styles.textCell]}>Nada consta</Text>
      </View>
    </Row>
  );
}
