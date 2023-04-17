import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Stack, Paper, Button, Avatar, Drawer, Divider, IconButton, Typography } from '@mui/material';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { BASEURL } from '../../utils/axios';
import { ptDateTime } from '../../utils/formatTime';
import { newLineText } from '../../utils/normalizeText';
// hooks
import useToggle from '../../hooks/useToggle';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

HistoricoProcesso.propTypes = { historico: PropTypes.array };

export default function HistoricoProcesso({ historico }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  const { colaboradores } = useSelector((state) => state.intranet);

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

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        BackdropProps={{ invisible: true }}
        PaperProps={{ sx: { width: { xs: 1, md: 800 } } }}
        sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.8) }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6">Histórico de transições</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ width: 20 }} />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Timeline position="right">
            {historico.map((row, index) => {
              const key = row.data_transicao;
              const _criador = colaboradores?.find((_row) => _row?.perfil?.id === row?.perfil_id);
              return (
                <TimelineItem key={key} sx={{ '&:before': { display: 'none' }, mt: 0.5 }}>
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
                    <Paper sx={{ bgcolor: 'background.neutral' }}>
                      <Paper
                        key={key}
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
                              (row?.is_resgate && 'warning') ||
                              (row?.modo === 'Seguimento' && 'info') ||
                              ((row?.modo === 'Devolução' || row?.modo === 'desarquivamento') && 'error') ||
                              'success'
                            }
                          >
                            {row?.is_resgate ? 'Resgate' : row?.modo}
                          </Label>
                          <Stack direction="row" justifyContent="left" alignItems="center" spacing={0.5}>
                            <Typography variant="body2">{row?.is_resgate ? row?.nomef : row?.nome}</Typography>
                            <ArrowRightAltIcon sx={{ width: 20 }} />
                            <Typography variant="body2">{row?.is_resgate ? row?.nome : row?.nomef}</Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                      <Stack sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="left" alignItems="center" spacing={1.5}>
                          <Avatar
                            alt={_criador?.perfil?.displayName || _criador?.perfil?.displayName}
                            src={`${BASEURL}/colaborador/file/colaborador/${_criador?.foto_disk}`}
                          />
                          <Box>
                            <Typography variant="body2" noWrap>
                              {_criador?.perfil?.displayName} ({_criador?.uo?.label})
                            </Typography>
                            {row.data_transicao && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', typography: 'body2' }}>
                                {ptDateTime(row.data_transicao)}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        {row?.observacao && <Typography sx={{ pt: 2 }}>{newLineText(row.observacao)}</Typography>}
                      </Stack>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </Scrollbar>
      </Drawer>
    </>
  );
}
