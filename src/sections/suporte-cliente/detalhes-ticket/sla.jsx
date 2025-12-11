import React from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { ptDateTime } from '../../../utils/formatTime';
// components
import Label from '../../../components/Label';

// ---------------------------------------------------------------------------------------------------------------------

export const SLA = React.memo(({ sla }) => (
  <Stack spacing={1.5}>
    <Typography variant="subtitle2">
      <Typography variant="subtitle2" component="span" sx={{ color: 'text.secondary' }}>
        SLA: &nbsp;
      </Typography>
      {sla?.sla_name}
    </Typography>

    <Deadline label="resposta" deadline={sla?.sla_response_deadline} breached={sla?.sla_response_breached} />
    <Deadline label="resolução" deadline={sla?.sla_resolution_deadline} breached={sla?.sla_resolution_breached} />
  </Stack>
));

// ---------------------------------------------------------------------------------------------------------------------

function Deadline({ label, deadline, breached }) {
  return (
    <Typography variant="subtitle2">
      <Typography variant="subtitle2" component="span" sx={{ color: 'text.secondary' }}>
        Data limite de {label}: &nbsp;
      </Typography>
      {ptDateTime(deadline)}
      <Label sx={{ ml: 1 }} color={breached ? 'error' : 'success'}>
        {breached ? 'Fora do prazo' : 'Dentro do prazo'}
      </Label>
    </Typography>
  );
}
