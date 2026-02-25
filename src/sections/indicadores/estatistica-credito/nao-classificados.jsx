// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDate } from '@/utils/formatTime';
import { fConto, fNumber } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export default function NaoClassificados({ naoClassificados, from, moeda }) {
  return (
    <Stack sx={{ mt: 2 }}>
      <Typography variant="caption" sx={{ color: 'warning.main' }}>
        *Não foi possíveil classificar alguns registos. Verifique os dados de <b>segmento</b> e <b>linha</b>
      </Typography>
      <TableContainer
        sx={{
          mt: 1,
          '& .MuiTableCell-root': { typography: 'caption' },
          '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 'bold' },
        }}
      >
        <Table size="small" id="tabel-estatistica-credito-nao-classificados">
          <TableHead>
            <TableRow>
              <TableCell>Segmento</TableCell>
              <TableCell>Linha</TableCell>
              <TableCell>{from === 'resumo' ? 'Fase' : 'Proponente'}</TableCell>
              {from !== 'resumo' && <TableCell align="center">Data</TableCell>}
              <TableCell align="right">Montante</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {naoClassificados.map((row) => (
              <TableRow hover key={row?.id}>
                <TableCell>{row?.segmento}</TableCell>
                <TableCell>{row?.linha}</TableCell>
                <TableCell>{row?.titular || row?.fase}</TableCell>
                {from !== 'resumo' && <TableCell align="center">{ptDate(dataNC(from, row))}</TableCell>}
                <TableCell align="right">{(moeda === 'Escudo' ? fNumber : fConto)(montateNC(from, row))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
// ---------------------------------------------------------------------------------------------------------------------

export const montateNC = (from, row) =>
  ((from === 'contratado' || row?.fase === 'Contratado') && row?.montante_contratado) ||
  ((from === 'aprovado' || row?.fase === 'Aprovado') && row?.montante_aprovado) ||
  row?.montantes ||
  0;

export const dataNC = (from, row) =>
  (from === 'aprovado' && row?.data_aprovacao) ||
  (from === 'desistido' && row?.data_desistido) ||
  (from === 'indeferido' && row?.data_indeferido) ||
  (from === 'contratado' && row?.data_contratacao) ||
  row?.data_entrada ||
  '';
