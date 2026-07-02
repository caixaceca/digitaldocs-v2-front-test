import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// utils
import { fNumber } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export function Cabecalho({ item, headLabel }) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((row, index) => (
          <TableCell align={row?.align || 'left'} key={`${row?.label}_${item}_${index}`} sx={{ color: row?.color }}>
            {row?.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function AccordionItem({ open = false, title, action = null, normal = false, children }) {
  const [expanded, setExpanded] = useState(open);

  return (
    <Accordion expanded={expanded} onChange={(event, isExpanded) => setExpanded(isExpanded)}>
      <AccordionSummary sx={{ typography: 'subtitle1', py: title === '17. Parecer' ? 0 : 0.25 }}>
        <Stack
          useFlexGap
          spacing={2}
          flexWrap="wrap"
          direction="row"
          alignItems="center"
          sx={{ flexGrow: 1 }}
          justifyContent="space-between"
        >
          {title}
          {action && (
            <Box component="div" sx={{ pr: 1 }} onClick={(e) => e.stopPropagation()}>
              {action}
            </Box>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        {normal ? (
          children
        ) : (
          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
              {children}
            </Table>
          </TableContainer>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const rowInfo = (title, value, total, extra = null) => {
  const isTitle = value === '*title*';
  const notSet = value === '(Não definido...)';
  return value ? (
    <TableRow hover={!isTitle} sx={{ whiteSpace: 'nowrap' }}>
      <TableCell
        colSpan={1}
        align="right"
        sx={{ color: (total && 'success.main') || (!isTitle && 'text.secondary'), fontWeight: 'bold' }}
      >
        {title}:
      </TableCell>
      {!isTitle ? (
        <TableCell sx={{ width: '100%' }}>
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontWeight: total ? 'bold' : 'normal',
              ...((notSet && { typography: 'caption', fontStyle: 'italic', color: 'text.secondary' }) || {}),
            }}
          >
            {value}
          </Typography>
          {extra}
        </TableCell>
      ) : (
        <TableCell sx={{ width: '100%' }}> </TableCell>
      )}
    </TableRow>
  ) : null;
};

// ---------------------------------------------------------------------------------------------------------------------

export function CellValor({ valor = 0, moeda = 'CVE', total = false }) {
  return (
    <TableCell align="right">
      <Typography noWrap variant="body2" sx={{ fontWeight: total ? 'bold' : 'normal' }}>{`${fNumber(
        Math.abs(valor),
        2
      )} ${moeda}`}</Typography>
    </TableCell>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EmptyRow({ cells = 4, message = ' ', variant = '', empty = false, war = false, body = false }) {
  const rowInfo = () => (
    <TableRow>
      <TableCell
        colSpan={cells}
        variant={variant}
        sx={{
          border: 'none',
          color: (war && 'warning.main') || (variant && 'success.main'),
          ...(empty && { fontStyle: 'italic', color: 'text.secondary' }),
        }}
      >
        {message}
      </TableCell>
    </TableRow>
  );

  return body ? <TableBody>{rowInfo()}</TableBody> : rowInfo();
}

// ---------------------------------------------------------------------------------------------------------------------

export function Field({ label, value, extra = '', alertLabel = null, destaque = false, alert = false, badge = false }) {
  return value ? (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: badge ? 0 : 0.5, fontWeight: 600 }}
        noWrap
      >
        {label}
      </Typography>
      {badge ? (
        <Chip
          size="small"
          label={value}
          color={alert ? 'warning' : 'default'}
          sx={{ typography: 'caption', fontWeight: 600, height: 20 }}
        />
      ) : (
        <Typography
          variant={destaque ? 'subtitle2' : 'body2'}
          color={alertLabel ? 'error.main' : 'text.primary'}
          noWrap
        >
          {value} {alertLabel}
        </Typography>
      )}
      {extra && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }} noWrap>
          {extra}
        </Typography>
      )}
    </Box>
  ) : null;
}

// ---------------------------------------------------------------------------------------------------------------------

export function AlertaInfo({ alerta }) {
  return (
    <Typography component="span" variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
      {` *${alerta}`}
    </Typography>
  );
}
