// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Rating from '@mui/material/Rating';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { getColorRating } from '../../utils';
import { noDados } from '@/components/Panel';
import { toHourLabel } from '@/utils/formatTime';
import { fNumber, fPercent } from '@/utils/formatNumber';
//
import { TableSearchNotFound } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export function Asuntos({ dados, total }) {
  const resolvedTotal = total ?? dados.reduce((acc, row) => acc + row.count, 0);

  return (
    <TableDashboard
      title="Tickets por assunto"
      headLabel={[
        { id: 'subject', label: 'Assunto' },
        { id: 'count', label: 'Abertos', align: 'center' },
        { id: 'resolved', label: 'Resolvidos', align: 'center' },
        { id: 'avg_response_time', label: 'Tempo resposta', align: 'center' },
        { id: 'rating', label: 'Avaliação', align: 'center' },
      ]}
      body={dados.map((row) => (
        <TableRow key={row.subject} hover>
          <TableCell>{row.subject}</TableCell>
          <TableCell align="center">
            <Typography variant="body2">
              {row.count}{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                ({resolvedTotal > 0 ? fPercent((row.count / resolvedTotal) * 100, 2) : '—'})
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2">
              {row.resolved}{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                ({row.count > 0 ? fPercent((row.resolved / row.count) * 100, 2) : '—'})
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align="center">{toHourLabel(row.avg_response_time)}</TableCell>
          <Avaliacao rating={row.rating} />
        </TableRow>
      ))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableDashboard({ title, headLabel, body }) {
  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={title} />
      <Box sx={{ p: 1, mt: 1 }}>
        <TableContainer>
          <Table>
            <TableHeadCustom headLabel={headLabel} />
            {!body || body?.length === 0 ? (
              <TableSearchNotFound height={99} message="Nenhum registro encontrado..." />
            ) : (
              <TableBody>{body}</TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

export function TableHeadCustom({ headLabel }) {
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((row) => (
          <TableCell key={row.id} align={row.align}>
            {row.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export function Avaliacao({ rating, hideLabel = false, extra = null }) {
  return (
    <TableCell align={hideLabel ? 'left' : 'center'}>
      {rating ? (
        <Stack direction="row" spacing={1} justifyContent={hideLabel ? 'left' : 'center'} alignItems="center">
          <Rating readOnly size="small" precision={0.1} value={rating} sx={{ color: 'success.main' }} />
          {!hideLabel && (
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: getColorRating(rating) }}>
              ({fNumber(rating, 1)})
            </Typography>
          )}
        </Stack>
      ) : (
        noDados('(Sem avaliação)')
      )}
      {extra && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {extra}
        </Typography>
      )}
    </TableCell>
  );
}
