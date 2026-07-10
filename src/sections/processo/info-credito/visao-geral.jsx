import { useState, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
// icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// utils
import { fCurrency } from '@/utils/formatNumber';
import { noEstado } from '@/utils/validarAcesso';
import { ptDate, fToNow } from '@/utils/formatTime';
// components
import Label from '@/components/Label';
import GridItem from '@/components/GridItem';
import { DefaultAction } from '@/components/Actions';
import { noDados, SemDados } from '@/components/Panel';
// sections
import Fincc from './fin/fincc';
import EnviarContratacao from './enviar-contratacao';
import ModeloCartaProposta from './carta-proposta/modelos-cartas-proposta';
import { GarantiasResumo, GarantiasList } from './garantias/resumoGarantias';
import { FormSituacao, EliminarDadosSituacao, FormNivelDecisao } from '../form/credito/situacao-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function VisaoGeral({ dados, modificar = false }) {
  const [open, setOpen] = useState('');

  const arquivado = dados?.estado?.estado === 'Arquivo';
  const gerencia = noEstado(dados?.estado?.estado, ['Gerência']);
  const situacao = (dados?.situacao_final_mes || 'em análise').toLowerCase();
  const garantiasAtivas = (dados?.garantias ?? []).filter(({ ativo }) => ativo);

  const datesVisiveis = useMemo(
    () =>
      [
        { title: 'Entrada', value: dados?.data_entrada, color: 'info' },
        { title: 'Aprovado', value: dados?.data_aprovacao, color: 'success' },
        { title: 'Contratado', value: dados?.data_contratacao, color: 'success' },
        { title: 'Indeferido', value: dados?.data_indeferido, color: 'error' },
        { title: 'Desistido', value: dados?.data_desistido, color: 'warning' },
      ].filter(({ value }) => !!value),
    [dados]
  );

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={1.5}>
        <Grid container spacing={2}>
          <Identificacao
            dados={[
              { key: 'Nome', val: dados?.titular },
              { key: 'Nº de cliente', val: dados?.cliente },
              { key: 'Tipo de titular', val: dados?.tipo_titular },
              { key: 'Setor / Ent. patronal', val: dados?.setor_atividade },
            ]}
            extra={<DividaAtiva valor={dados?.valor_divida} periodo={dados.periodo} />}
          />
          <Identificacao
            label="Produto"
            dados={[
              { key: 'Nº proposta', val: dados?.numero_proposta },
              { key: 'Linha de crédito', val: dados?.linha },
              { key: 'Componente', val: dados?.componente },
              { key: 'Segmento', val: dados?.segmento },
              { key: 'Finalidade', val: dados?.finalidade },
            ]}
          />

          <GridItem md={6}>
            <SectionCard title="Progressão" sx={{ height: '100%' }}>
              {datesVisiveis.length > 0 ? (
                <Timeline sx={{ py: 2, px: 1, m: 0 }}>
                  {datesVisiveis.map(({ title, value, color }, index) => (
                    <TimelineItem
                      key={title}
                      sx={{ minHeight: index === datesVisiveis.length - 1 ? 20 : 30, '&:before': { display: 'none' } }}
                    >
                      <TimelineOppositeContent sx={{ pl: 0, py: 0, flex: 0, minWidth: 80 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {title}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator sx={{ mt: 0.25 }}>
                        <TimelineDot variant="outlined" color={color} sx={{ m: 0.25 }} />
                        {index < datesVisiveis.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pr: 0, py: 0, width: 1 }}>
                        <Typography variant="body2">
                          {ptDate(value)}{' '}
                          {!arquivado && (
                            <Typography variant="caption" component="span" sx={{ color: 'text.disabled' }}>
                              ({fToNow(value)})
                            </Typography>
                          )}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  Sem datas registadas
                </Typography>
              )}
              {dados?.enviado_para_contratacao && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                  <Label color="success" startIcon={<InfoOutlinedIcon />}>
                    Enviado para GAJ-i9
                  </Label>
                </Stack>
              )}
              {modificar && (
                <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                  <DefaultAction small button icon="editar" label="Situação" onClick={() => setOpen('atualizar')} />
                  {gerencia && situacao === 'em análise' && (
                    <DefaultAction
                      small
                      button
                      icon="editar"
                      label="Escalão de decisão"
                      onClick={() => setOpen('escalao')}
                    />
                  )}
                  {gerencia && situacao === 'aprovado' && <EnviarContratacao dados={dados} />}
                </Stack>
              )}
              {situacao === 'em análise' && <Fincc />}
              {situacao !== 'aprovado' && <ModeloCartaProposta />}
            </SectionCard>
          </GridItem>

          <GridItem md={6}>
            <SectionCard title="Cobertura de garantias" sx={{ height: '100%' }}>
              {garantiasAtivas.length > 0 ? (
                <>
                  <GarantiasResumo dados={dados} />
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ pt: 1.5 }}>
                    <GarantiasList dados={garantiasAtivas} />
                  </Box>
                </>
              ) : (
                <SemDados message="Sem garantias registadas..." />
              )}
            </SectionCard>
          </GridItem>
        </Grid>
      </Stack>

      {open === 'eliminar' && <EliminarDadosSituacao dados={dados} onClose={() => setOpen('')} />}
      {open === 'escalao' && <FormNivelDecisao id={dados?.processoId} onClose={() => setOpen('')} />}
      {open === 'atualizar' && <FormSituacao dados={dados} onClose={() => setOpen('')} setOpen={setOpen} />}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SectionCard({ title, children, sx = {} }) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2, borderRadius: 1.5, border: `0.5px solid ${theme.palette.divider}`, ...sx }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', pb: 0.75 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
}

function Identificacao({ label = 'Proponente', dados, extra = null }) {
  return (
    <GridItem sm={6}>
      <SectionCard title={label} sx={{ height: '100%' }}>
        <Stack spacing={0.75} divider={<Divider sx={{ borderStyle: 'dotted' }} />}>
          {dados.map(({ key, val }) => (
            <Typography key={key} variant="body2">
              <Typography variant="body2" component="span" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                {key}:{' '}
              </Typography>
              {val || noDados('(Não definido)')}
            </Typography>
          ))}
          {extra}
        </Stack>
      </SectionCard>
    </GridItem>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DividaAtiva({ valor, periodo }) {
  return valor ? (
    <Alert
      severity="warning"
      sx={{ py: 0, width: '100%', '& .MuiAlert-message': { width: '100%' }, '& .MuiAlert-icon': { padding: 0 } }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
        <Box>
          <Typography variant="body2">Entidade com crédito em dívida</Typography>
          {periodo && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              Referência {ptDate(periodo)}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" sx={{ flexShrink: 0, textAlign: 'right' }}>
          {fCurrency(valor)}
        </Typography>
      </Stack>
    </Alert>
  ) : null;
}
