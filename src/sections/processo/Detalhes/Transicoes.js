import { useMemo } from 'react';
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
import { ptDateTime, fDistance } from '../../../utils/formatTime';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// redux
import { getAnexo } from '../../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import MyAvatar from '../../../components/MyAvatar';
//
import { Info, InfoCriador } from './Estados';

// ----------------------------------------------------------------------

Transicoes.propTypes = { transicoes: PropTypes.array, assunto: PropTypes.string };

export default function Transicoes({ transicoes, assunto }) {
  const dispatch = useDispatch();
  const transicoesFiltered = useMemo(() => removeDuplicates(transicoes), [transicoes]);
  const { mail, perfilId, colaboradores, uos } = useSelector((state) => state.intranet);

  const viewAnexo = (anexo, transicaoId, parecerId) => {
    dispatch(getAnexo('fileDownload', { mail, perfilId, anexo, transicaoId, parecerId }));
  };

  return (
    <Timeline position="right" sx={{ p: { xs: 1, sm: 2 } }}>
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
  const isDesktop = useResponsive('up', 'md');
  const acao = useMemo(
    () =>
      ((transicao?.resgate || transicao?.observacao === 'Envio cancelado/fechado. Resgatar envio em paralelo.') &&
        'Resgate') ||
      ((transicao?.modo === 'Arquivamento' || transicao?.modo === 'arquivamento') && 'Arquivo') ||
      ((transicao?.modo === 'desarquivamento' || transicao?.modo === 'Desarquivamento') && 'Desarquivamento') ||
      transicao?.modo,
    [transicao?.modo, transicao?.resgate, transicao?.observacao]
  );
  const criador = useMemo(
    () =>
      transicao?.domiciliacao || acao === 'Restauro'
        ? colaboradores?.find((colab) => colab?.perfil?.mail === transicao?.perfil_id)
        : colaboradores?.find((colab) => colab?.perfil?.id === transicao?.perfil_id),
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
      (acao === 'Devolução' && 'error') ||
      ((acao === 'Resgate' || acao === 'Restauro') && 'warning') ||
      ((acao === 'Arquivo' || acao === 'Desarquivamento') && 'info') ||
      'success',
    [acao]
  );

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
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="center" spacing={1}>
                <Label color={color}>{acao}</Label>
                {acao !== 'Resgate' && acao !== 'Arquivo' && acao !== 'Restauro' && (
                  <Stack alignItems="center" justifyContent="center" spacing={0.5} direction="row">
                    {acao !== 'Desarquivamento' && <Typography variant="body2">{transicao?.estado_inicial}</Typography>}
                    <DoubleArrowIcon color={color} sx={{ width: 20 }} />
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
          <Stack direction="row" spacing={1.5} sx={{ p: { xs: 1, sm: 2 } }}>
            {!!criador && !arqSistema && isDesktop && (!temPareceres || acao === 'Resgate') && (
              <MyAvatar alt={criador?.perfil?.displayName} src={getFile('colaborador', criador?.foto_disk)} />
            )}
            <Stack sx={{ width: 1 }}>
              {!!criador && !arqSistema && (!temPareceres || acao === 'Resgate') && (
                <InfoCriador criador={criador} isDesktop={isDesktop} />
              )}
              {acao !== 'Resgate' && (
                <>
                  {transicao?.domiciliacao && !!transicao?.uo_origem_id && !!transicao?.uo_destino_id && (
                    <Stack sx={{ mt: 2 }}>
                      <Box>
                        <Label color="info">Domiciliação do processo</Label>
                      </Box>
                      <Stack alignItems="center" spacing={0.5} direction="row">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          U.O. origem:
                        </Typography>
                        <Typography>
                          {uos?.find((row) => row?.id === transicao?.uo_origem_id)?.desegnicao ||
                            transicao?.uo_origem_id}
                        </Typography>
                      </Stack>
                      <Stack alignItems="center" spacing={0.5} direction="row">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          U.O. destino:
                        </Typography>
                        <Typography>
                          {uos?.find((row) => row?.id === transicao?.uo_destino_id)?.desegnicao ||
                            transicao?.uo_destino_id}
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
                      temParecer={temParecer}
                      colaboradores={temPareceres ? colaboradores : []}
                      dados={{ ...transicao, assunto, perfil: criador?.perfil, temPareceres }}
                    />
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

// ----------------------------------------------------------------------

function removeDuplicates(arr) {
  const seen = new Map();
  return arr.filter((item) => {
    if (item.observacao === 'Envio cancelado/fechado. Resgatar envio em paralelo.' && item.data_saida) {
      const key = item.data_saida;
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    }
    return true;
  });
}
