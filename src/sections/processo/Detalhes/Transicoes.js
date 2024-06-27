import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { getFile } from '../../../utils/getFile';
import { newLineText } from '../../../utils/normalizeText';
import { ptDateTime, fDistance } from '../../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import MyAvatar from '../../../components/MyAvatar';

// ----------------------------------------------------------------------

Transicoes.propTypes = { transicoes: PropTypes.array };

export default function Transicoes({ transicoes }) {
  return (
    <Timeline position="right" sx={{ p: { xs: 1, sm: 2 } }}>
      {applySort(transicoes || [], getComparator('desc', 'data_saida'))?.map((row, index) => (
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
  const arqSistema = transicao?.observacao === 'Processo Arquivado por inatividade a pelo menos 6 meses';
  const acao =
    (transicao?.resgate && 'Resgate') ||
    (transicao?.transicao_paralelo && 'Seguimento em paralelo') ||
    ((transicao?.modo === 'Arquivamento' || transicao?.modo === 'arquivamento') && 'Arquivo') ||
    ((transicao?.modo === 'desarquivamento' || transicao?.modo === 'Desarquivamento') && 'Desarquivo') ||
    transicao?.modo;
  const color =
    (acao === 'Resgate' && 'warning') ||
    (acao === 'Devolução' && 'error') ||
    ((acao === 'Arquivo' || acao === 'Desarquivo') && 'info') ||
    'success';

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' }, mt: 0.5 }}>
      <TimelineSeparator>
        <TimelineDot sx={{ p: 0 }} color={color}>
          <KeyboardArrowUpIcon sx={{ width: 18, height: 18, color: 'common.white' }} />
        </TimelineDot>
        {addConector && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, pl: { xs: 1, sm: 2 } }}>
        <Paper sx={{ bgcolor: 'background.neutral' }}>
          <Paper
            sx={{
              p: { xs: 1, md: 2 },
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
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="center" spacing={0.5}>
                <Label color={color}>{acao}</Label>
                {acao !== 'Resgate' && acao !== 'Arquivo' && (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={{ xs: -0.5, sm: 0.5 }}
                    direction={{ xs: 'column', sm: 'row' }}
                  >
                    {acao !== 'Desarquivo' && <Typography variant="body2">{transicao?.estado_inicial}</Typography>}
                    <DoubleArrowIcon
                      color={color}
                      sx={{ width: 20, transform: { xs: 'rotate(90deg)', sm: 'rotate(0deg)' } }}
                    />
                    <Typography variant="body2">{transicao?.estado_final}</Typography>
                  </Stack>
                )}
              </Stack>
              <Stack spacing={1} direction="row" alignItems="center">
                {transicao?.data_saida && <Criado caption tipo="data" value={ptDateTime(transicao?.data_saida)} />}
                {transicao?.data_entrada && (
                  <Criado caption tipo="time" value={fDistance(transicao?.data_entrada, transicao?.data_saida)} />
                )}
              </Stack>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={1.5} sx={{ p: 2 }}>
            {!!criador && !arqSistema && (
              <MyAvatar alt={criador?.perfil?.displayName} src={getFile('colaborador', criador?.foto_disk)} />
            )}
            <Stack spacing={0.5}>
              {(!!criador && !arqSistema && (
                <Stack direction="row" spacing={{ xs: 1, sm: 3 }} alignItems="center" useFlexGap flexWrap="wrap">
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography noWrap variant="subtitle2">
                        {criador?.perfil?.displayName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ({criador?.uo?.label})
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {criador?.perfil?.mail}
                      {criador?.perfil?.businessPhones?.[0] ? ` | ${criador?.perfil?.businessPhones?.[0]}` : ''}
                    </Typography>
                  </Box>
                  {(transicao?.parecer_favoravel === false || transicao?.parecer_favoravel === true) && (
                    <Label color={transicao?.parecer_favoravel ? 'success' : 'error'} variant="outlined">
                      Parecer {transicao?.parecer_favoravel ? 'Favorável' : 'Não Favorável'}
                    </Label>
                  )}
                </Stack>
              )) ||
                (arqSistema && (
                  <Typography>
                    <Label>Arquivado pelo sistema</Label>
                  </Typography>
                ))}
              {acao !== 'Resgate' && (
                <>
                  {transicao?.observacao && <Typography>{newLineText(transicao.observacao)}</Typography>}
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
                      <Stack
                        spacing={0.5}
                        direction="row"
                        alignItems="center"
                        justifyContent={{ xs: 'center', sm: 'left' }}
                      >
                        <Typography variant="caption">{ptDateTime(transicao?.data_parecer)}</Typography>
                      </Stack>
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}
