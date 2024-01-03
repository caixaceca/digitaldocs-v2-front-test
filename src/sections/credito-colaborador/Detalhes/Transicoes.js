import { useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { ptDateTime } from '../../../utils/formatTime';
import { newLineText } from '../../../utils/normalizeText';
// redux
import { getFromCC } from '../../../redux/slices/cc';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import { SearchNotFound } from '../../../components/table';
import { ColaboradorInfo } from '../../../components/Panel';

// ----------------------------------------------------------------------

export default function Transicoes() {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { pedidoCC, transicoes } = useSelector((state) => state.cc);
  const historicoGrouped = groupBy(transicoes, 'data_transicao');

  useEffect(() => {
    if (mail && pedidoCC?.id) {
      dispatch(getFromCC('transicoes', { mail, id: pedidoCC?.id }));
    }
  }, [dispatch, pedidoCC?.id, mail]);

  return (
    <>
      {transicoes?.length === 0 ? (
        <Stack sx={{ mt: 5 }}>
          <SearchNotFound message="Não foi encontrada nenhuma transição disponível..." />
        </Stack>
      ) : (
        <Scrollbar sx={{ p: 3 }}>
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
      )}
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
          ? item?.estado_final?.replace(' - P/S/P', '')
          : `${item?.estado_final?.replace(' - P/S/P', '')} / `;
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
                <Typography variant="body2">
                  {transicao?.is_resgate ? estadoDestino() : transicao?.estado_inicial}
                </Typography>
                <ArrowRightAltIcon />
                <Typography variant="body2">
                  {transicao?.is_resgate ? transicao?.estado_inicial : estadoDestino()}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
          <Stack sx={{ p: 2 }}>
            <ColaboradorInfo
              foto={criador?.foto_disk}
              nome={`${criador?.perfil?.displayName} (${criador?.uo?.label})`}
              label={transicao?.data_transicao ? ptDateTime(transicao.data_transicao) : ''}
            />
            {transicao?.observacao && <Typography sx={{ pt: 2 }}>{newLineText(transicao.observacao)}</Typography>}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
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
