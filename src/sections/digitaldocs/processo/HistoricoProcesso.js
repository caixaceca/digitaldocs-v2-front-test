import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
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
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { BASEURL } from '../../../utils/axios';
import { ptDate, ptTime } from '../../../utils/formatTime';
import { newLineText } from '../../../utils/normalizeText';
// redux
import { getAll } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

HistoricoProcesso.propTypes = { fluxoId: PropTypes.number, historico: PropTypes.array };

export default function HistoricoProcesso({ fluxoId, historico }) {
  const dispatch = useDispatch();
  const [openHistorico, setOpenHistorico] = useState(false);
  const { historicoFluxo } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.colaborador);

  const handleHistorico = () => {
    setOpenHistorico(!openHistorico);
  };

  useEffect(() => {
    if (mail && fluxoId && currentColaborador?.perfil_id && historicoFluxo.length === 0) {
      dispatch(getAll('historico fluxo', { mail, fluxoId, perfilId: currentColaborador?.perfil_id }));
    }
  }, [dispatch, mail, historicoFluxo, fluxoId, currentColaborador?.perfil_id]);

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
        <ListItemIcon>
          <SvgIconStyle src={`/assets/icons/${openHistorico ? 'arrow-ios-upward' : 'arrow-ios-downward'}.svg`} />
        </ListItemIcon>
        <ListItemText primary="Histórico de intervenções" />
      </ListItemButton>
      <Collapse in={openHistorico}>
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, p: 2, pb: 1 }}>
          <Scrollbar sx={{ overflowY: 'hidden' }}>
            <Timeline position="right" sx={{ p: 0, mt: -0.5 }}>
              {historico.map((row, index) => {
                const key = row.data_transicao;
                const _criador = colaboradores?.find((_row) => _row?.perfil?.id === row?.perfil_id);
                const estadoInicial = historicoFluxo?.find(
                  (_row) => Number(_row?.id) === Number(row?.estado_inicial_id)
                )?.nome;
                const estadoFinal = historicoFluxo?.find(
                  (_row) => Number(_row?.id) === Number(row?.estado_final_id)
                )?.nome;
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
                        <SvgIconStyle
                          src="/assets/icons/arrow-ios-upward.svg"
                          sx={{ width: 18, height: 18, color: 'common.white' }}
                        />
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
                          <Typography variant="caption">{row?.is_resgate ? estadoFinal : estadoInicial}</Typography>
                          <SvgIconStyle src="/assets/icons/arrow-right.svg" sx={{ width: 20 }} />
                          <Typography variant="caption">{row?.is_resgate ? estadoInicial : estadoFinal}</Typography>
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
