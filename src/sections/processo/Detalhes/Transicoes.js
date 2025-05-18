import { add } from 'date-fns';
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
import { useSelector } from '../../../redux/store';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
//
import { Info, InfoCriador } from './Estados';

// ----------------------------------------------------------------------

Transicoes.propTypes = { transicoes: PropTypes.array, assunto: PropTypes.string };

export default function Transicoes({ transicoes, assunto }) {
  const { colaboradores, uos } = useSelector((state) => state.intranet);

  return (
    <Timeline position="right" sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
      {transicoes?.map((row, index) => (
        <Transicao
          uos={uos}
          transicao={row}
          assunto={assunto}
          key={`transicao_${index}`}
          colaboradores={colaboradores}
          addConector={index !== transicoes?.length - 1}
        />
      ))}
    </Timeline>
  );
}

// ----------------------------------------------------------------------

Transicao.propTypes = {
  uos: PropTypes.array,
  assunto: PropTypes.string,
  transicao: PropTypes.object,
  addConector: PropTypes.bool,
  colaboradores: PropTypes.array,
};

function Transicao({ transicao: t, addConector, assunto, uos = [], colaboradores = [] }) {
  const acao = useMemo(
    () =>
      ((t?.modo === 'Arquivamento' || t?.modo === 'arquivamento') && 'Arquivo') ||
      ((t?.modo === 'desarquivamento' || t?.modo === 'Desarquivamento') && 'Desarquivo') ||
      ((t?.resgate || t?.observacao === 'Envio cancelado/fechado. Resgatar envio em paralelo.') && 'Resgate') ||
      t?.modo,
    [t?.modo, t?.resgate, t?.observacao]
  );
  const { data_entrada: entrada = '', data_saida: saida = '', parecer_data_limite: limite = '' } = t;
  const criador = useMemo(
    () =>
      t?.domiciliacao || acao === 'Restauro'
        ? colaboradores?.find(({ perfil }) => perfil?.mail?.toLowerCase() === t?.perfil_id?.toLowerCase())
        : colaboradores?.find(({ perfil }) => perfil?.id === t?.perfil_id),
    [colaboradores, acao, t?.domiciliacao, t?.perfil_id]
  );
  const arqSistema = useMemo(() => t?.observacao?.includes('por inatividade a pelo menos 6 meses'), [t?.observacao]);
  const temPareceres = useMemo(() => t?.pareceres && t?.pareceres?.length > 0, [t?.pareceres]);
  const temParecer = useMemo(
    () => t?.parecer_em && (t?.parecer_favoravel === true || t?.parecer_favoravel === false),
    [t?.parecer_em, t?.parecer_favoravel]
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
              py: 1,
              px: { xs: 1, md: 2 },
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
                  <Stack>
                    <Stack
                      useFlexGap
                      flexWrap="wrap"
                      direction="row"
                      alignItems="center"
                      justifyContent={{ xs: 'center', sm: 'left' }}
                    >
                      {acao !== 'Desarquivo' && <Typography variant="subtitle2">{t?.estado_inicial}</Typography>}
                      <DoubleArrowIcon color={color} sx={{ width: 18, height: 18, mx: 0.5 }} />
                      <Typography variant="subtitle2">{t?.estado_final}</Typography>
                    </Stack>
                    {saida && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ color: 'text.secondary' }}
                        justifyContent={{ xs: 'center', sm: 'left' }}
                      >
                        <Criado caption tipo="data" value={ptDateTime(saida)} />
                        {entrada && <Criado caption tipo="time" sx={{ pr: 0.5 }} value={fDistance(entrada, saida)} />}
                        {saida && limite && new Date(saida) > new Date(add(limite, { hours: 5 })) && (
                          <Criado
                            caption
                            sx={{ color: 'error.main', pr: 0 }}
                            value={`(${fDistance(saida, limite)} de atraso)`}
                          />
                        )}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
              <Stack>
                <Criado sx={{ pr: 0 }} caption iconText="Entrada:" value={ptDateTime(entrada)} />
                <Criado
                  caption
                  sx={{ pr: 0 }}
                  value={ptDateTime(limite)}
                  iconText={<span style={{ whiteSpace: 'pre' }}>&nbsp;&nbsp;&nbsp;&nbsp;Prazo:</span>}
                />
              </Stack>
            </Stack>
          </Paper>
          <Stack sx={{ width: 1, p: { xs: 1, sm: 2 } }}>
            {!arqSistema && (!temPareceres || acao === 'Resgate') && (
              <InfoCriador
                temParecer={temParecer}
                criador={criador || { perfil_id: t?.perfil_id }}
                dados={{ ...t, assunto, perfil: criador?.perfil, temPareceres }}
              />
            )}
            {acao !== 'Resgate' && (
              <Stack sx={{ pl: { md: !temPareceres && !arqSistema ? 6.5 : 0 } }}>
                {t?.domiciliacao && (
                  <Stack sx={{ mt: 1 }} alignItems="center" spacing={0.5} direction="row">
                    <Label color="info">Domiciliação do processo</Label>
                    <Stack alignItems="center" spacing={0.5} direction="row">
                      <Typography variant="body2">
                        {uos?.find(({ id }) => id === t?.uo_origem_id)?.desegnicao || t?.uo_origem_id}
                      </Typography>
                      <DoubleArrowIcon color="success" sx={{ width: 18, height: 18 }} />
                      <Typography variant="body2">
                        {uos?.find(({ id }) => id === t?.uo_destino_id)?.desegnicao || t?.uo_destino_id}
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
                  <Info dados={{ ...t, temPareceres }} colaboradores={temPareceres ? colaboradores : []} />
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}
