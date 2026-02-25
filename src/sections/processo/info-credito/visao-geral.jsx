import { useState } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// @mui/lab
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
// utils
import { noEstado } from '@/utils/validarAcesso';
import { fCurrency } from '@/utils/formatNumber';
import { ptDate, fToNow } from '@/utils/formatTime';
// components
import Label from '@/components/Label';
import { noDados } from '@/components/Panel';
import { TextItem } from '../Detalhes/detalhes';
import { DefaultAction } from '@/components/Actions';
import { FormSituacao, EliminarDadosSituacao, FormNivelDecisao } from '../form/credito/situacao-form';
//
import Fincc from './fin/fincc';
import EnviarContratacao from './enviar-contratacao';
import ModeloCartaProposta from './carta-proposta/modelos-cartas-proposta';

const itemStyleAlt = { p: 0, mt: 0, minHeight: 20, backgroundColor: 'transparent' };

// ---------------------------------------------------------------------------------------------------------------------

export default function VisaoGeral({ dados, modificar = false }) {
  const [open, setOpen] = useState('');
  const nivel = dados?.nivel_decisao || '';
  const gerencia = noEstado(dados?.estado?.estado, ['Gerência']);
  const situacao = (dados?.situacao_final_mes || 'em análise').toLowerCase();

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }}>
      <List sx={{ width: 1, p: 0 }}>
        <TextItem title="Nº de proposta:" text={dados?.numero_proposta || 'Não definido'} />
        <TextItem title="Componente:" text={dados?.componente || 'Não definido'} />
        <TextItem title="Linha de crédito:" text={dados?.linha} />
        <TextItem title="Tipo de titular:" text={dados?.tipo_titular || 'Não definido'} />
        <TextItem title="Segmento:" text={dados?.segmento} />
        <TextItem title="Garantia:" text={dados?.garantia} />
        <TextItem title="Finalidade:" text={dados?.finalidade} />
        <TextItem title="Ent. patronal/Set. atividade:" text={dados?.setor_atividade} />
        {dados?.valor_divida && (
          <Paper sx={{ p: 1, pb: 0.5, mt: 0.5, bgcolor: 'background.neutral', flexGrow: 1 }}>
            <Label color="info" startIcon={<InfoOutlinedIcon />}>
              Entidade com crédito em dívida
            </Label>
            <TextItem title="Valor:" text={fCurrency(dados?.valor_divida)} sx={itemStyleAlt} />
            <TextItem title="Data:" text={ptDate(dados?.periodo)} sx={itemStyleAlt} />
          </Paper>
        )}
      </List>

      <List sx={{ width: 1, p: 0 }}>
        {modificar && (
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <DefaultAction small button icon="editar" label="Situação" onClick={() => setOpen('atualizar')} />
            {gerencia && (
              <>
                {situacao === 'em análise' && (
                  <DefaultAction small button icon="editar" label="Escalaão" onClick={() => setOpen('escalao')} />
                )}
                {situacao === 'aprovado' && <EnviarContratacao dados={dados} />}
              </>
            )}
          </Stack>
        )}
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Typography variant="body2">Escalão de decisão final:</Typography>
          {nivel ? (
            <Chip
              sx={{ typography: 'overline' }}
              label={`${nivel} - Comité ${(nivel === 1 && 'Base') || (nivel === 2 && 'Diretor') || (nivel === 3 && 'Superior')}`}
            />
          ) : (
            noDados('(Não definido...)')
          )}
          {dados?.enviado_para_contratacao && (
            <Chip
              color="success"
              variant="outlined"
              label="Enviado para GAJ-i9"
              sx={{ typography: 'overline' }}
              icon={<InfoOutlinedIcon sx={{ width: 22 }} />}
            />
          )}
        </Stack>

        <TextItem label={<Datas dados={dados} arquivado={dados?.estado?.estado === 'Arquivo'} />} />

        {situacao === 'em análise' && <Fincc />}
        {situacao === 'aprovado' && <ModeloCartaProposta />}
      </List>

      {open === 'eliminar' && <EliminarDadosSituacao dados={dados} onClose={() => setOpen('')} />}
      {open === 'escalao' && <FormNivelDecisao id={dados?.processoId} onClose={() => setOpen('')} />}
      {open === 'atualizar' && <FormSituacao dados={dados} onClose={() => setOpen('')} setOpen={setOpen} />}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Datas({ dados, arquivado }) {
  return (
    <Timeline sx={{ py: 0.25, px: 1 }}>
      <DataItem title="Contratado" value={dados?.data_contratacao} arquivado={arquivado} />
      <DataItem title="Desistido" value={dados?.data_desistido} color="warning" arquivado={arquivado} />
      <DataItem title="Indeferido" value={dados?.data_indeferido} color="error" arquivado={arquivado} />
      <DataItem title="Aprovado" value={dados?.data_aprovacao} arquivado={arquivado} />
      <DataItem title="Entrada" value={dados?.data_entrada} color="info" last arquivado={arquivado} />
    </Timeline>
  );
}

function DataItem({ title, value, color = 'success', last = false, arquivado }) {
  return value ? (
    <TimelineItem sx={{ minHeight: last ? '22px' : '27px', '&:before': { display: 'none' } }}>
      <TimelineOppositeContent sx={{ pl: 0, py: 0, flex: 0, minWidth: 80 }}>
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>{title}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator sx={{ mt: 0.25 }}>
        <TimelineDot variant="outlined" sx={{ m: 0.25 }} color={color} />
        {!last && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ pr: 0, py: 0, width: 1 }}>
        <Typography variant="body2">
          {ptDate(value)}
          {!arquivado && (
            <Typography variant="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {` (${fToNow(value)})`}
            </Typography>
          )}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  ) : null;
}
