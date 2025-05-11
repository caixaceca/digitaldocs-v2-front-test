import { useMemo } from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';
// utils
import { ptDateTime, fDistance } from '../../../utils/formatTime';
// redux
import { getAnexo } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
//
import { Info, InfoCriador } from './Estados';

// ----------------------------------------------------------------------

Transicoes.propTypes = { transicoes: PropTypes.array, assunto: PropTypes.string };

export default function Transicoes({ transicoes, assunto }) {
  const dispatch = useDispatch();
  const { processo } = useSelector((state) => state.digitaldocs);
  const { colaboradores, uos } = useSelector((state) => state.intranet);
  const transicoesFiltered = useMemo(() => removeDuplicates(transicoes), [transicoes]);

  const viewAnexo = (anexo, estadoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { processoId: processo?.id, anexo, estadoId, parecerId }));
  };

  return (
    <Timeline position="right" sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
      {transicoesFiltered?.map((row, index) => (
        <Transicao
          uos={uos}
          transicao={row}
          assunto={assunto}
          viewAnexo={viewAnexo}
          key={`transicao_${index}`}
          colaboradores={colaboradores}
          addConector={index !== transicoesFiltered?.length - 1}
        />
      ))}
    </Timeline>
  );
}

// ----------------------------------------------------------------------

Transicao.propTypes = {
  uos: PropTypes.array,
  assunto: PropTypes.string,
  viewAnexo: PropTypes.func,
  transicao: PropTypes.object,
  addConector: PropTypes.bool,
  colaboradores: PropTypes.array,
};

function Transicao({ transicao, addConector, assunto, viewAnexo, uos = [], colaboradores = [] }) {
  const acao = useMemo(
    () =>
      ((transicao?.modo === 'Arquivamento' || transicao?.modo === 'arquivamento') && 'Arquivo') ||
      ((transicao?.modo === 'desarquivamento' || transicao?.modo === 'Desarquivamento') && 'Desarquivo') ||
      ((transicao?.resgate || transicao?.observacao === 'Envio cancelado/fechado. Resgatar envio em paralelo.') &&
        'Resgate') ||
      transicao?.modo,
    [transicao?.modo, transicao?.resgate, transicao?.observacao]
  );
  const criador = useMemo(
    () =>
      transicao?.domiciliacao || acao === 'Restauro'
        ? colaboradores?.find(({ perfil }) => perfil?.mail?.toLowerCase() === transicao?.perfil_id?.toLowerCase())
        : colaboradores?.find(({ perfil }) => perfil?.id === transicao?.perfil_id),
    [colaboradores, acao, transicao?.domiciliacao, transicao?.perfil_id]
  );
  const arqSistema = useMemo(
    () => transicao?.observacao?.includes('por inatividade a pelo menos 6 meses'),
    [transicao?.observacao]
  );
  const temPareceres = useMemo(() => transicao?.pareceres && transicao?.pareceres?.length > 0, [transicao?.pareceres]);
  const temParecer = useMemo(
    () => transicao?.parecer_em && (transicao?.parecer_favoravel === true || transicao?.parecer_favoravel === false),
    [transicao?.parecer_em, transicao?.parecer_favoravel]
  );
  const color = useMemo(
    () =>
      (acao === 'Arquivo' && 'info') ||
      ((acao === 'Resgate' || acao === 'Restauro') && 'warning') ||
      ((acao === 'Devolução' || acao === 'Desarquivo') && 'error') ||
      'success',
    [acao]
  );

  return (
    <TimelineItem sx={{ '&:before': { display: 'none' }, mb: addConector ? 1 : 0 }}>
      <TimelineSeparator>
        <TimelineDot sx={{ p: 0, mt: 3 }} color={color}>
          <ArrowDropUpIcon sx={{ p: 0, width: 18, height: 18, color: 'common.white' }} />
        </TimelineDot>
        {addConector && <TimelineConnector sx={{ mb: -2.5 }} />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, pl: { xs: 1, sm: 2 } }}>
        <Paper sx={{ boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Paper
            sx={{
              p: { xs: 1, md: 2 },
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'background.neutral',
            }}
          >
            <Stack
              alignItems="center"
              spacing={{ xs: 1, md: 3 }}
              justifyContent="space-between"
              direction={{ xs: 'column', md: 'row' }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="center" spacing={1}>
                <Label color={color}>{acao}</Label>
                {acao !== 'Resgate' && acao !== 'Arquivo' && acao !== 'Restauro' && (
                  <Stack alignItems="center" justifyContent="center" spacing={0.5} direction="row">
                    {acao !== 'Desarquivo' && <Typography variant="subtitle2">{transicao?.estado_inicial}</Typography>}
                    <DoubleArrowIcon color={color} sx={{ width: 20 }} />
                    <Typography variant="subtitle2">{transicao?.estado_final}</Typography>
                  </Stack>
                )}
              </Stack>
              <Stack direction="row" alignItems="center">
                {transicao?.data_saida && <Criado caption tipo="data" value={ptDateTime(transicao?.data_saida)} />}
                {transicao?.data_saida && transicao?.data_entrada && (
                  <Criado caption tipo="time" value={fDistance(transicao?.data_entrada, transicao?.data_saida)} />
                )}
              </Stack>
            </Stack>
          </Paper>
          <Stack sx={{ width: 1, p: { xs: 1, sm: 2 } }}>
            {!!criador && !arqSistema && (!temPareceres || acao === 'Resgate') && (
              <InfoCriador
                criador={criador}
                temParecer={temParecer}
                dados={{ ...transicao, assunto, perfil: criador?.perfil, temPareceres }}
              />
            )}
            {acao !== 'Resgate' && (
              <Stack sx={{ pl: { md: criador && !temPareceres && !arqSistema ? 6.5 : 0 } }}>
                {transicao?.domiciliacao && (
                  <Stack sx={{ mt: 1 }} alignItems="center" spacing={0.5} direction="row">
                    <Label color="info">Domiciliação do processo</Label>
                    <Stack alignItems="center" spacing={0.5} direction="row">
                      <Typography variant="body2">
                        {uos?.find(({ id }) => id === transicao?.uo_origem_id)?.desegnicao || transicao?.uo_origem_id}
                      </Typography>
                      <DoubleArrowIcon color="success" sx={{ width: 20, height: 20 }} />
                      <Typography variant="body2">
                        {uos?.find(({ id }) => id === transicao?.uo_destino_id)?.desegnicao || transicao?.uo_destino_id}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {arqSistema ? (
                  <Typography>
                    O processo foi arquivado automaticamente pelo sistema devido a um período de inatividade contínua
                    de, no mínimo, seis meses.
                  </Typography>
                ) : (
                  <Info
                    viewAnexo={viewAnexo}
                    dados={{ ...transicao, temPareceres }}
                    colaboradores={temPareceres ? colaboradores : []}
                  />
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

// ----------------------------------------------------------------------

function removeDuplicates(arr) {
  const seen = new Map();
  return arr.filter((item) => {
    if (item.observacao === 'Envio cancelado/fechado. Resgatar envio em paralelo.' && item.data_saida) {
      const key = item.data_saida;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    }
    return true;
  });
}
