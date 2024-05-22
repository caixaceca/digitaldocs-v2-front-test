import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { newLineText } from '../../../utils/normalizeText';
import { ptDateTime, fDistance } from '../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { ColaboradorInfo, Criado } from '../../../components/Panel';

// ----------------------------------------------------------------------

Transicoes.propTypes = { transicoes: PropTypes.array };

export default function Transicoes({ transicoes }) {
  return (
    <Timeline position="right">
      {applySort(transicoes, getComparator('desc', 'data_saida'))?.map((row, index) => (
        <Transicao transicao={row} key={`transicao_${index}`} addConector={index !== transicoes?.length - 1} />
      ))}
    </Timeline>
  );
}

// ----------------------------------------------------------------------

Transicao.propTypes = { transicao: PropTypes.object, addConector: PropTypes.bool };

function Transicao({ transicao, addConector }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const criador = colaboradores?.find((colab) => colab?.perfil?.id === transicao?.perfil_id);
  const color =
    (transicao?.resgate && 'warning') ||
    ((transicao?.modo === 'Devolução' || transicao?.modo === 'desarquivamento') && 'error') ||
    'success';

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' }, mt: 0.5 }}>
      <TimelineSeparator>
        <TimelineDot sx={{ p: 0, mt: 2.25 }} color={color}>
          <KeyboardArrowUpIcon sx={{ width: 18, height: 18, color: 'common.white' }} />
        </TimelineDot>
        {addConector && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0 }}>
        <Paper sx={{ bgcolor: 'background.neutral' }}>
          <Paper
            sx={{
              p: 1.5,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'background.neutral',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack
              alignItems="center"
              spacing={{ xs: 1, md: 3 }}
              justifyContent="space-between"
              direction={{ xs: 'column', md: 'row' }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={0.5}>
                <Label color={color}>
                  {(transicao?.resgate && 'Resgate') ||
                    (transicao?.transicao_paralelo && 'Seguimento em paralelo') ||
                    transicao?.modo}
                </Label>
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={{ xs: -0.5, sm: 0.5 }}
                  direction={{ xs: 'column', sm: 'row' }}
                >
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    {transicao?.resgate ? transicao?.estado_final?.replace(' - P/S/P', '') : transicao?.estado_inicial}
                  </Typography>
                  <ArrowRightAltIcon color={color} />
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    {transicao?.resgate ? transicao?.estado_inicial : transicao?.estado_final?.replace(' - P/S/P', '')}
                  </Typography>
                </Stack>
              </Stack>
              {transicao?.data_entrada ? (
                <Stack>
                  <Criado
                    caption
                    tipo="date"
                    other={ptDateTime(transicao?.data_saida)}
                    value={ptDateTime(transicao?.data_entrada)}
                  />
                  <Criado caption tipo="time" value={fDistance(transicao?.data_entrada, transicao?.data_saida)} />
                </Stack>
              ) : (
                <Criado tipo="date" value={ptDateTime(transicao?.data_saida)} />
              )}
            </Stack>
          </Paper>
          <Stack sx={{ p: 2 }}>
            {criador && (
              <ColaboradorInfo
                foto={criador?.foto_disk}
                label={criador?.uo?.label}
                nome={criador?.perfil?.displayName}
              />
            )}
            {transicao?.observacao && (
              <Typography sx={{ pt: criador && 2 }}>{newLineText(transicao.observacao)}</Typography>
            )}
            {transicao?.data_parecer && (
              <Stack sx={{ pt: 2 }}>
                <Stack spacing={0.5} direction="row" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Parecer:
                  </Typography>
                  <Label variant="ghost" color={(transicao?.parecer_favoravel && 'success') || 'error'}>
                    {transicao?.parecer_favoravel ? 'Favorável' : 'Não favorável'}
                  </Label>
                </Stack>
                <Stack spacing={0.5} direction="row" alignItems="center" justifyContent={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="caption">{ptDateTime(transicao?.data_parecer)}</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}
