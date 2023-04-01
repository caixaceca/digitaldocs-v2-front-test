import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Box,
  Card,
  Stack,
  Paper,
  Avatar,
  Collapse,
  Typography,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { BASEURL } from '../../utils/axios';
import { ptDate, ptTime } from '../../utils/formatTime';
import { newLineText } from '../../utils/normalizeText';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';

// ----------------------------------------------------------------------

HistoricoProcesso.propTypes = { historico: PropTypes.array };

export default function HistoricoProcesso({ historico }) {
  const [openHistorico, setOpenHistorico] = useState(false);
  const { colaboradores } = useSelector((state) => state.colaborador);

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
        <ListItemText primary="Histórico de intervenções" />
      </ListItemButton>
      <Collapse in={openHistorico}>
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, p: 2, pb: 1 }}>
          <Scrollbar sx={{ overflowY: 'hidden' }}>
            <Timeline position="right" sx={{ p: 0, mt: -0.5 }}>
              {historico.map((row, index) => {
                const key = row.data_transicao;
                const _criador = colaboradores?.find((_row) => _row?.perfil?.id === row?.perfil_id);
                return (
                  <TimelineItem key={key} sx={{ '&:before': { display: 'none' }, mb: 0.5 }}>
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{ p: 0 }}
                        color={
                          (row?.is_resgate && 'warning') ||
                          (row?.modo === 'Seguimento' && 'info') ||
                          ((row?.modo === 'Devolução' || row?.modo === 'desarquivamento') && 'error') ||
                          'success'
                        }
                      >
                        <KeyboardArrowUpIcon sx={{ width: 18, height: 18, color: 'common.white' }} />
                      </TimelineDot>
                      {index !== historico?.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent sx={{ pr: 0 }}>
                      <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', typography: 'body2' }}>
                            {ptDate(row.data_transicao)} - {ptTime(row.data_transicao)}
                          </Typography>
                          <Label
                            variant="ghost"
                            color={
                              (row?.is_resgate && 'warning') ||
                              (row?.modo === 'Seguimento' && 'info') ||
                              ((row?.modo === 'Devolução' || row?.modo === 'desarquivamento') && 'error') ||
                              'success'
                            }
                          >
                            {row?.is_resgate ? 'Resgate' : row?.modo}
                          </Label>
                        </Stack>
                        <Stack direction="row" justifyContent="left" alignItems="center" spacing={0.5}>
                          <Typography variant="caption">{row?.is_resgate ? row?.nomef : row?.nome}</Typography>
                          <ArrowRightAltIcon sx={{ width: 20 }} />
                          <Typography variant="caption">{row?.is_resgate ? row?.nome : row?.nomef}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="left" alignItems="center" spacing={1.5} sx={{ pt: 2 }}>
                          <Avatar
                            alt={_criador?.perfil?.displayName || _criador?.perfil?.displayName}
                            src={`${BASEURL}/colaborador/file/colaborador/${_criador?.foto_disk}`}
                          />
                          <Box>
                            <Typography variant="body2" noWrap>
                              {_criador?.perfil?.displayName} ({_criador?.uo?.label})
                            </Typography>
                            <Typography noWrap variant="body2" sx={{ color: (theme) => theme.palette.text.disabled }}>
                              {_criador?.perfil?.mail}
                            </Typography>
                          </Box>
                        </Stack>
                        {row?.observacao && <Typography sx={{ pt: 2 }}>{newLineText(row.observacao)}</Typography>}
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </Scrollbar>
        </Card>
      </Collapse>
    </>
  );
}
