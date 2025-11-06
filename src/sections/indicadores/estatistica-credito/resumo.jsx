import sumBy from 'lodash/sumBy';
// @mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
// utils
import { useSelector } from '../../../redux/store';
import { bgGradient } from '../../../utils/cssStyles';
import { fCurrency, fConto, fNumber } from '../../../utils/formatNumber';
// components
import { BoxMask } from '../../../components/Panel';
import GridItem from '../../../components/GridItem';
import { BarChart } from '../../../components/skeleton';

// ---------------------------------------------------------------------------------------------------------------------

export default function ResumoEstatisticaCredito() {
  const { isLoading, resumoEstCredito, moeda } = useSelector((state) => state.indicadores);
  const { qtdEnt, qtdAp, qtdCont, qtdId, valEnt, valorAp, valCont, valId } = dadosResumo(resumoEstCredito, '', '');

  return (
    <Grid container spacing={3}>
      {isLoading ? (
        <GridItem>
          <Card>
            <BarChart />
          </Card>
        </GridItem>
      ) : (
        <>
          <CardResumo moeda={moeda} label="Entrada" qtd={qtdEnt} total={valEnt} />
          <CardResumo moeda={moeda} label="Aprovado" qtd={qtdAp} total={valorAp} />
          <CardResumo moeda={moeda} label="Contratado" qtd={qtdCont} total={valCont} />
          <CardResumo moeda={moeda} label="Indeferido/Desistido" qtd={qtdId} total={valId} />
          <GridItem>
            <Card sx={{ p: 1 }}>
              <TableContainer>
                <Table size="small" id="tabel-estatistica-credito">
                  <TableHead>
                    <TableRow>
                      <TableCell rowSpan={2}>Segmento</TableCell>
                      <TableCell rowSpan={2}>Linha de crédito</TableCell>
                      <TableCell colSpan={2} align="center">
                        Entradas
                      </TableCell>
                      <TableCell colSpan={2} align="center">
                        Aprovados
                      </TableCell>
                      <TableCell colSpan={2} align="center">
                        Contratados
                      </TableCell>
                      <TableCell colSpan={2} align="center" sx={{ borderBottomRightRadius: '0px !important' }}>
                        Indeferidos/Desistidos
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="right" sx={{ borderRadius: '0px !important' }}>
                        Qtd
                      </TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right" sx={{ borderTopRightRadius: '0px !important' }}>
                        Valor
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <EmptyRow />
                    <TotaisLinha first segmento="Empresa" linha="Construção" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" linha="Investimento" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Empresa" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Particular" linha="Habitação" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" linha="CrediCaixa" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" linha="Outros" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Particular" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Produtor Individual" linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Investimento" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" linha="Micro-Crédito" dados={resumoEstCredito} />
                    <TotaisLinha segmento="Produtor Individual" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first segmento="Entidade Pública" dados={resumoEstCredito} />
                    <EmptyRow />
                    <TotaisLinha first linha="Garantia Bancária" dados={resumoEstCredito} />
                    <EmptyRow />
                  </TableBody>
                  <TableBody>
                    <EmptyRow segmento />
                    <TotaisLinha linha="Tesouraria" dados={resumoEstCredito} />
                    <TotaisLinha linha="Investimento" dados={resumoEstCredito} />
                    <EmptyRow />
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </GridItem>
        </>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function CardResumo({ total, label, qtd, moeda }) {
  const theme = useTheme();
  const color =
    (label === 'Entrada' && 'focus') ||
    (label === 'Aprovado' && 'success') ||
    (label === 'Contratado' && 'primary') ||
    'error';
  return (
    <GridItem sm={6} lg={3}>
      <Card
        sx={{
          p: 2.5,
          height: 1,
          display: 'flex',
          boxShadow: 'none',
          justifyContent: 'space-between',
          color: theme.palette[color].darker,
          bgcolor: theme.palette[color].lighter,
        }}
      >
        <BoxMask sx={{ maskSize: 'revert', maskRepeat: 'no-repeat', maskPositionX: 'right' }} />
        <Stack>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" sx={{ color: theme.palette[color].main, py: 0.5 }}>
            <b>{fNumber(qtd)}</b> processo{qtd > 1 ? 's' : ''}
          </Typography>
          <Typography variant="h6">{moeda === 'Escudo' ? fCurrency(total) : fConto(total, true)}</Typography>
        </Stack>
        <Stack
          sx={{
            top: 10,
            right: 10,
            width: 45,
            height: 45,
            opacity: 0.64,
            borderRadius: '50%',
            alignItems: 'center',
            position: 'absolute',
            justifyContent: 'center',
            color: theme.palette[color].dark,
            ...bgGradient({
              direction: '135deg',
              startColor: `${alpha(theme.palette[color].dark, 0.05)} 0%`,
              endColor: `${alpha(theme.palette[color].darker, 0.32)} 100%`,
            }),
          }}
        >
          {(label === 'Entrada' && <AssignmentReturnedOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
            (label === 'Aprovado' && <TaskAltOutlinedIcon sx={{ width: 30, height: 30 }} />) ||
            (label === 'Contratado' && <HandshakeOutlinedIcon sx={{ width: 30, height: 30 }} />) || (
              <DoDisturbIcon sx={{ width: 30, height: 30 }} />
            )}
        </Stack>
      </Card>
    </GridItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TotaisLinha({ first = false, segmento = '', linha = '', dados }) {
  const color =
    (segmento === 'Empresa' && 'grey.500_16') ||
    (segmento === 'Particular' && 'grey.500_24') ||
    (segmento === 'Produtor Individual' && 'grey.500_32') ||
    'grey.500_48';
  const subTotal =
    !linha && (segmento === 'Empresa' || segmento === 'Particular' || segmento === 'Produtor Individual');
  return (
    <TableRow hover sx={{ bgcolor: subTotal && color, '& .MuiTableCell-root': { fontWeight: subTotal && 900 } }}>
      {first && (
        <TableCell rowSpan={linha && segmento ? 4 : 1} sx={{ bgcolor: color, fontWeight: 900 }}>
          {segmento || linha}
        </TableCell>
      )}
      {!segmento && (linha === 'Tesouraria' || linha === 'Investimento') && (
        <TableCell sx={{ border: 'none' }}> </TableCell>
      )}
      <TableCell
        sx={{ fontWeight: 900, pl: '12px !important', bgcolor: first && !linha && !segmento && 'grey.500_48' }}
      >
        {(segmento && linha) || (!segmento && (linha === 'Tesouraria' || linha === 'Investimento')) ? linha : ''}
      </TableCell>
      <TableRowTotais dados={dadosResumo(dados, segmento, linha)} />
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function TableRowTotais({ dados }) {
  const { moeda } = useSelector((state) => state.indicadores);
  return ['qtdEnt', 'valEnt', 'qtdAp', 'valorAp', 'qtdCont', 'valCont', 'qtdId', 'valId']?.map((row) => (
    <TableCell key={row} align="right">
      {moeda === 'Escudo' ? fNumber(dados[row]) : fConto(dados[row])}
    </TableCell>
  ));
}

// ---------------------------------------------------------------------------------------------------------------------

export function EmptyRow({ segmento }) {
  return (
    <TableRow>
      <TableCell sx={{ p: segmento ? 3 : 0.25, border: segmento && 'none' }}> </TableCell>
      <TableCell colSpan={20} sx={{ p: segmento ? 3 : 0.25 }}>
        {' '}
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function dadosResumo(dados, segmento, linha) {
  const entradas = dadosPorItem(dados?.entrada, segmento, linha);
  const aprovados = dadosPorItem(dados?.aprovado, segmento, linha);
  const contratados = dadosPorItem(dados?.contratado, segmento, linha);
  const indeferidos = dadosPorItem(dados?.indeferido, segmento, linha);
  const desistidos = dadosPorItem(dados?.desistido, segmento, linha);

  return {
    qtdEnt: sumBy(entradas, 'total'),
    valEnt: sumBy(entradas, 'montantes'),
    qtdAp: sumBy(aprovados, 'total'),
    valorAp: sumBy(aprovados, 'montante_aprovado'),
    qtdCont: sumBy(contratados, 'total'),
    valCont: sumBy(contratados, 'montante_contratado'),
    qtdId: sumBy(indeferidos, 'total') + sumBy(desistidos, 'total'),
    valId: sumBy(indeferidos, 'montantes') + sumBy(desistidos, 'montantes'),
  };
}

function dadosPorItem(dados, segmento, linha) {
  return (
    (segmento && linha && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin === linha)) ||
    (segmento && dados?.filter(({ segmento: seg, linha: lin }) => seg === segmento && lin !== 'Garantia Bancária')) ||
    (linha && dados?.filter(({ segmento: seg, linha: lin }) => linha === lin && seg !== 'Entidade Pública')) ||
    dados
  );
}
