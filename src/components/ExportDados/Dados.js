import PropTypes from 'prop-types';
import { View, Text } from '@react-pdf/renderer';
// components
import styles from './ExportStylePdf';

// ----------------------------------------------------------------------

Title.propTypes = { label: PropTypes.string, mt: PropTypes.bool };

export function Title({ label, mt = false }) {
  return (
    <View style={[styles.textSuccess, styles.text9, mt ? styles.mt10 : null]}>
      <Text>{label}</Text>
    </View>
  );
}

// ----------------------------------------------------------------------

Subtitle.propTypes = { label: PropTypes.string };

export function Subtitle({ label }) {
  return (
    <Row>
      <View style={[styles.textSuccess]}>
        <Text style={[styles.text8, styles.textSuccess]}>{label}</Text>
      </View>
    </Row>
  );
}

// ----------------------------------------------------------------------

Label.propTypes = { label: PropTypes.string, props: PropTypes.array };

export function Label({ label, props = [] }) {
  return (
    <View style={[styles.pr0, styles.alignRight, ...props]}>
      <Text style={[styles.text7, styles.textSuccess]}>{label}</Text>
    </View>
  );
}

Value.propTypes = { value: PropTypes.string, props: PropTypes.array };

export function Value({ value, props = [] }) {
  return (
    <View style={[styles.pr0, styles.alignLeft, ...props]}>
      <Text style={[styles.textCell]}>{value || '--'}</Text>
    </View>
  );
}

// ----------------------------------------------------------------------

Item.propTypes = { label: PropTypes.string, value: PropTypes.string, lprops: PropTypes.array, vprops: PropTypes.array };

export function Item({ label, value = '', lprops = [], vprops = [] }) {
  return (
    <>
      <Label label={label} props={lprops} />
      <Value value={value} props={vprops} />
    </>
  );
}

ItemAlt.propTypes = { label: PropTypes.string, value: PropTypes.string, style: PropTypes.object };

export function ItemAlt({ label, value = ' ', style }) {
  return (
    <View style={[...style, styles.pl0]}>
      {label ? <Text style={[styles.text7, styles.textSuccess, styles.px1, styles.mb1]}>{label}</Text> : ''}
      <Text style={[styles.textCell]}>{value || ' '}</Text>
    </View>
  );
}

// ----------------------------------------------------------------------

Row.propTypes = { children: PropTypes.node, mt: PropTypes.bool };

export function Row({ children, mt = false }) {
  return (
    <View style={[styles.tableRow2, styles.noBorder, mt ? styles.mt2 : null]} wrap={false}>
      {children}
    </View>
  );
}

RowItemAlt.propTypes = { label: PropTypes.string, value: PropTypes.string, style: PropTypes.object };

export function RowItemAlt({ label, value = ' ', style }) {
  return (
    <Row mt>
      <ItemAlt style={style} label={label} value={value} />
    </Row>
  );
}

// ----------------------------------------------------------------------

RowAlt.propTypes = { label: PropTypes.string, value: PropTypes.string, tree: PropTypes.bool };

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
} // ----------------------------------------------------------------------

export function NadaConsta() {
  return (
    <Row>
      <View style={[styles.tCell_100, styles.pl0]}>
        <Text style={[styles.textCell]}>Nada consta</Text>
      </View>
    </Row>
  );
}
