import React from 'react';
import { Stack, Paper, Typography } from '@mui/material';
// utils
import { ptDateTime } from '@/utils/formatTime';
// components
import Label from '@/components/Label';

// ---------------------------------------------------------------------------------------------------------------------

const FieldLabel = ({ children }) => (
  <Typography variant="subtitle2" component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
    {children}
  </Typography>
);

const Deadline = React.memo(({ label = 'intervenção', deadline, breached }) => (
  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
    <FieldLabel>Data limite de {label}:</FieldLabel>
    {ptDateTime(deadline)}
    <Label sx={{ ml: 1 }} color={breached ? 'error' : 'success'} variant="ghost">
      {breached ? 'Fora do prazo' : 'Dentro do prazo'}
    </Label>
  </Typography>
));

// ---------------------------------------------------------------------------------------------------------------------

const SLAItem = React.memo(({ departmentName, slaReport }) => (
  <Stack spacing={0.5}>
    <Typography variant="subtitle2" color="primary.main">
      {departmentName}
    </Typography>
    <Deadline deadline={slaReport?.sla_resolution_deadline} breached={slaReport?.sla_resolution_breached} />
  </Stack>
));

// ---------------------------------------------------------------------------------------------------------------------

export const SLA = React.memo(({ sla, departments = [] }) => {
  const hasDepartments = departments.length > 0;

  return (
    <Stack spacing={2}>
      {/* SLA GLOBAL */}
      <Paper sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
            SLA GLOBAL
          </Typography>

          <Typography variant="subtitle2">
            <FieldLabel>SLA:</FieldLabel>
            {sla?.sla_name || 'N/A'}
          </Typography>

          <Deadline label="resposta" deadline={sla?.sla_response_deadline} breached={sla?.sla_response_breached} />
          <Deadline label="resolução" deadline={sla?.sla_resolution_deadline} breached={sla?.sla_resolution_breached} />
        </Stack>
      </Paper>

      {/* SLA DEPARTAMENTAL */}
      {hasDepartments && (
        <Paper sx={{ bgcolor: 'background.neutral', p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: 'text.disabled', lineHeight: 1 }}>
              SLA DEPARTAMENTAL
            </Typography>

            {departments.map((row, index) => (
              <SLAItem key={row?.id || index} departmentName={row?.to_department_name} slaReport={row?.sla_report} />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
});
