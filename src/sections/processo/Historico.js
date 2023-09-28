/* eslint-disable camelcase */
import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Card,
  Stack,
  Paper,
  Table,
  Button,
  Drawer,
  Divider,
  Collapse,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  TableContainer,
  ListItemButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { getFile } from '../../utils/getFile';
import { newLineText } from '../../utils/normalizeText';
import { ptDateTime, fDistance, fToNow } from '../../utils/formatTime';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import MyAvatar from '../../components/MyAvatar';
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

HistoricoPrisoes.propTypes = { historico: PropTypes.array };

export function HistoricoPrisoes({ historico }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <Button
        size="large"
        variant="soft"
        color="inherit"
        onClick={onOpen}
        startIcon={<LockPersonIcon sx={{ width: 20 }} />}
      >
        Histórico de retenções
      </Button>

      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Histórico de retenções</Typography>

          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />
        <Scrollbar sx={{ p: 1 }}>
          <Retencao historico={historico} />
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

HistoricoPrisoesAnt.propTypes = { historico: PropTypes.object };

export function HistoricoPrisoesAnt({ historico }) {
  const [openHistoricoPrisoes, setOpenHistoricoPrisoes] = useState(false);

  const handleHistoricoPrisoes = () => {
    setOpenHistoricoPrisoes(!openHistoricoPrisoes);
  };

  return (
    <>
      <ListItemButton
        onClick={handleHistoricoPrisoes}
        sx={{
          py: 3,
          borderRadius: 1.5,
          boxShadow: (theme) => theme.customShadows.card,
          borderBottomLeftRadius: openHistoricoPrisoes && 0,
          borderBottomRightRadius: openHistoricoPrisoes && 0,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <ListItemIcon>{openHistoricoPrisoes ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</ListItemIcon>
        <ListItemText primary="Histórico de retenções" />
      </ListItemButton>
      <Collapse in={openHistoricoPrisoes}>
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, p: 2 }}>
          <Scrollbar>
            <Retencao historico={historico} />
          </Scrollbar>
        </Card>
      </Collapse>
    </>
  );
}

// ----------------------------------------------------------------------

HistoricoTransicao.propTypes = { historico: PropTypes.array };

export function HistoricoTransicao({ historico }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  const historicoGrouped = groupBy(historico, 'data_transicao');

  return (
    <>
      <Button
        size="large"
        variant="soft"
        color="inherit"
        onClick={onOpen}
        sx={{ justifyContent: 'left' }}
        startIcon={
          <SvgIconStyle
            src={`/assets/icons/navbar/transition.svg`}
            sx={{ width: 20, height: 20, transform: 'rotate(180deg)' }}
          />
        }
      >
        Histórico de transições
      </Button>

      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Histórico de transições</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Timeline position="right">
            {historicoGrouped
              .sort((a, b) => {
                const datetimeA = new Date(a.data);
                const datetimeB = new Date(b.data);
                return datetimeB - datetimeA;
              })
              .map((row, index) => (
                <Transicao key={row.data} row={row} addConector={index !== historicoGrouped?.length - 1} />
              ))}
          </Timeline>
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

HistoricoTransicaoAnt.propTypes = { historico: PropTypes.array };

export function HistoricoTransicaoAnt({ historico }) {
  const [openHistorico, setOpenHistorico] = useState(false);
  const historicoGrouped = groupBy(historico, 'data_transicao');

  const handleHistorico = () => {
    setOpenHistorico(!openHistorico);
  };

  return (
    <>
      <ListItemButton
        onClick={handleHistorico}
        sx={{
          py: 3,
          borderRadius: 1.5,
          borderBottomLeftRadius: openHistorico && 0,
          borderBottomRightRadius: openHistorico && 0,
          boxShadow: (theme) => theme.customShadows.card,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <ListItemIcon>{openHistorico ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</ListItemIcon>
        <ListItemText primary="Histórico de transições" />
      </ListItemButton>
      <Collapse in={openHistorico}>
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, pb: 1 }}>
          <Timeline position="right">
            {historicoGrouped.map((row, index) => (
              <Transicao key={row.data_transicao} row={row} addConector={index !== historicoGrouped?.length - 1} />
            ))}
          </Timeline>
        </Card>
      </Collapse>
    </>
  );
}

// ----------------------------------------------------------------------

Transicao.propTypes = { row: PropTypes.object, addConector: PropTypes.bool };

function Transicao({ row, addConector }) {
  const transicao = row?.transicoes?.[0];
  const { colaboradores } = useSelector((state) => state.intranet);
  const criador = colaboradores?.find((colab) => colab?.perfil?.id === transicao?.perfil_id);
  const estadoDestino = () => {
    let destinos = '';
    row?.transicoes?.forEach((item, index) => {
      destinos +=
        row?.transicoes?.length - 1 === index
          ? item?.nomef?.replace(' - P/S/P', '')
          : `${item?.nomef?.replace(' - P/S/P', '')} / `;
      return destinos;
    });
    return destinos;
  };

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' }, mt: 0.5 }}>
      <TimelineSeparator>
        <TimelineDot
          sx={{ p: 0 }}
          color={
            (transicao?.is_resgate && 'warning') ||
            ((transicao?.modo === 'Devolução' || transicao?.modo === 'desarquivamento') && 'error') ||
            'success'
          }
        >
          <KeyboardArrowUpIcon sx={{ width: 18, height: 18, color: 'common.white' }} />
        </TimelineDot>
        {addConector && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0 }}>
        <Paper sx={{ bgcolor: 'background.neutral' }}>
          <Paper
            sx={{
              p: 2,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'background.neutral',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
              <Label
                variant="ghost"
                color={
                  (transicao?.is_resgate && 'warning') ||
                  ((transicao?.modo === 'Devolução' || transicao?.modo === 'desarquivamento') && 'error') ||
                  'success'
                }
              >
                {(transicao?.is_resgate && 'Resgate') ||
                  (transicao?.modo === 'Paralelo' && 'Seguimento em paralelo') ||
                  transicao?.modo}
              </Label>
              <Stack direction="row" justifyContent="left" alignItems="center" spacing={0.5}>
                <Typography variant="body2">{transicao?.is_resgate ? estadoDestino() : transicao?.nome}</Typography>
                <ArrowRightAltIcon />
                <Typography variant="body2">{transicao?.is_resgate ? transicao?.nome : estadoDestino()}</Typography>
              </Stack>
            </Stack>
          </Paper>
          <Stack sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="left" alignItems="center" spacing={1.5}>
              <MyAvatar alt={criador?.perfil?.displayName} src={getFile('colaborador', criador?.foto_disk)} />
              <Box>
                <Typography variant="body2" noWrap>
                  {criador?.perfil?.displayName} ({criador?.uo?.label})
                </Typography>
                {transicao?.data_transicao && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', typography: 'body2' }}>
                    {ptDateTime(transicao.data_transicao)}
                  </Typography>
                )}
              </Box>
            </Stack>
            {transicao?.observacao && <Typography sx={{ pt: 2 }}>{newLineText(transicao.observacao)}</Typography>}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

// ----------------------------------------------------------------------

Retencao.propTypes = { historico: PropTypes.array };

function Retencao({ historico }) {
  let soltoPeloSistema = 0;
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <TableContainer sx={{ minWidth: 650, position: 'relative', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Colaborador</TableCell>
            <TableCell align="center">Retido em</TableCell>
            <TableCell align="center">Solto em</TableCell>
            <TableCell align="right">Duração</TableCell>
            <TableCell align="right"> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historico?.map((item) => {
            const colaborador = colaboradores?.find((row) => Number(row?.perfil_id) === Number(item?.perfil_id));
            if (colaborador?.perfil?.mail?.toLowerCase() !== item.por?.toLowerCase()) {
              soltoPeloSistema += 1;
            }
            return (
              <TableRow key={item?.preso_em} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <MyAvatar
                      alt={colaborador?.perfil?.displayName}
                      src={getFile('colaborador', colaborador?.foto_disk)}
                    />
                    <Box>
                      <Typography variant="subtitle2" noWrap>
                        {colaborador?.perfil?.displayName}
                      </Typography>
                      <Typography noWrap variant="body2" sx={{ color: 'text.secondary' }}>
                        {colaborador?.uo?.label}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="center">{item?.preso_em ? ptDateTime(item?.preso_em) : '--'}</TableCell>
                <TableCell align="center">{item?.solto_em ? ptDateTime(item?.solto_em) : '--'}</TableCell>
                <TableCell align="right">
                  {(item?.preso_em && item?.solto_em && fDistance(item?.preso_em, item?.solto_em)) ||
                    (item?.preso_em && !item?.solto_em && fToNow(item?.preso_em)) ||
                    '--'}
                </TableCell>
                <TableCell align="right">
                  {colaborador?.perfil?.mail?.toLowerCase() !== item.por?.toLowerCase() && (
                    <CircleIcon color="error" sx={{ width: 15, mt: 1.5 }} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {soltoPeloSistema > 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Stack direction="row" justifyContent="right" alignItems="center" spacing={0.5}>
                  <CircleIcon color="error" sx={{ width: 15, mt: 0.25 }} />
                  <Typography variant="caption">Solto pelo sistema</Typography>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ----------------------------------------------------------------------

function groupBy(dados, item) {
  const _dados = [];
  dados.reduce((res, value) => {
    if (!res[value[item]]) {
      res[value[item]] = { data: value[item], transicoes: [] };
      _dados.push(res[value[item]]);
    }
    res[value[item]].transicoes.push(value);
    return res;
  }, {});

  return _dados;
}
