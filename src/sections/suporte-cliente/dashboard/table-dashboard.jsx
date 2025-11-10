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
import { noDados } from '../../../components/Panel';
import { LabelStatus, getColorRating } from '../utils';
import { ptDateTime, toHourLabel } from '../../../utils/formatTime';
//
import { TableSearchNotFound } from '../../../components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export function Asuntos({ dados }) {
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
          <TableCell align="center">{row.count}</TableCell>
          <TableCell align="center">{row.resolved}</TableCell>
          <TableCell align="center">{toHourLabel(row.avg_response_time)}</TableCell>
          <Avaliacao rating={row.rating} />
        </TableRow>
      ))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Recentes({ dados }) {
  return (
    <TableDashboard
      title="Tickets recentes"
      headLabel={[
        { id: 'subject_name', label: 'Assunto' },
        { id: 'customer_name', label: 'Requerente' },
        { id: 'created_at', label: 'Data', align: 'center' },
        { id: 'status', label: 'Estado', align: 'center' },
      ]}
      body={dados.map((row) => (
        <TableRow key={row.id} hover>
          <TableCell>{row.subject_name}</TableCell>
          <TableCell>{row.customer_name}</TableCell>
          <TableCell align="center">{ptDateTime(row.created_at)}</TableCell>
          <TableCell align="center">
            <LabelStatus label={row?.status} />
          </TableCell>
        </TableRow>
      ))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Desempenho({ dados }) {
  return (
    <TableDashboard
      title="Desempenho por colaborador"
      headLabel={[
        { id: 'employee', label: 'Colaborador' },
        { id: 'closed', label: 'Fechados', align: 'center' },
        { id: 'resolved', label: 'Resolvidos', align: 'center' },
        { id: 'rating', label: 'Média avaliação', align: 'center' },
      ]}
      body={dados.map((row) => (
        <TableRow key={`employee_${row.employee}`} hover>
          <TableCell>{row.employee}</TableCell>
          <TableCell align="center">{row.closed}</TableCell>
          <TableCell align="center">{row.resolved}</TableCell>
          <Avaliacao rating={row.rating} />
        </TableRow>
      ))}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Avaliacoes({ dados }) {
  return (
    <TableDashboard
      title="Avaliações recentes"
      headLabel={[
        { id: 'subject', label: 'Assunto' },
        { id: 'rating', label: 'Avaliação', align: 'center' },
        { id: 'comment', label: 'Comentário' },
        { id: 'created_at', label: 'Data', align: 'center' },
      ]}
      body={dados.map((row) => (
        <TableRow key={row.id} hover>
          <TableCell>{row.subject}</TableCell>
          <TableCell align="center">
            <Rating size="small" value={row.rating} readOnly sx={{ color: 'success.main' }} />
          </TableCell>
          <TableCell>{row.comment}</TableCell>
          <TableCell align="center">{ptDateTime(row.created_at)}</TableCell>
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

export function Avaliacao({ rating }) {
  return (
    <TableCell align="center">
      {rating ? (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Rating readOnly size="small" precision={0.1} value={rating} sx={{ color: 'success.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: getColorRating(rating) }}>
            {rating}
          </Typography>
        </Stack>
      ) : (
        noDados('(Sem avaliação)')
      )}
    </TableCell>
  );
}
